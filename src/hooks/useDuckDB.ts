import { useState, useEffect, useCallback, useRef } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import type { QueryRow } from '../types/query';
import type { Dataset } from '../types/dataset';
import { NORTHWIND_DATASET } from '../data/northwind';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function arrowToRows(table: any): QueryRow[] {
  const fields: Array<{ name: string }> = table.schema.fields;
  const rows: QueryRow[] = [];
  for (let r = 0; r < table.numRows; r++) {
    const row: QueryRow = {};
    for (const f of fields) {
      const raw = table.getChild(f.name)?.get(r);
      row[f.name] = typeof raw === 'bigint' ? Number(raw) : raw ?? null;
    }
    rows.push(row);
  }
  return rows;
}

async function loadDataset(
  db: duckdb.AsyncDuckDB,
  conn: duckdb.AsyncDuckDBConnection,
  dataset: Dataset,
): Promise<void> {
  // Drop all existing tables first so switching datasets is clean
  const existing = await conn.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'`,
  );
  const names = arrowToRows(existing).map((r) => String(r['table_name']));
  for (const name of names) {
    await conn.query(`DROP TABLE IF EXISTS "${name}"`);
  }

  for (const { tableName, filename, url } of dataset.csvFiles) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const buffer = await res.arrayBuffer();
    await db.registerFileBuffer(filename, new Uint8Array(buffer));
    await conn.query(
      `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${filename}', header=true)`,
    );
  }
}

export interface UseDuckDBReturn {
  isLoading: boolean;
  isLoadingDataset: boolean;
  error: Error | null;
  activeDataset: Dataset;
  switchDataset: (dataset: Dataset) => Promise<void>;
  executeQuery: (sql: string) => Promise<QueryRow[]>;
  explainQuery: (sql: string) => Promise<string>;
}

export function useDuckDB(): UseDuckDBReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset>(NORTHWIND_DATASET);
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null);
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    let cancelled = false;
    let conn: duckdb.AsyncDuckDBConnection | null = null;

    async function init() {
      try {
        const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
        if (!bundle.mainWorker) throw new Error('No DuckDB WASM worker available.');
        const workerUrl = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' }),
        );
        const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
        const worker = new Worker(workerUrl);
        URL.revokeObjectURL(workerUrl);
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        conn = await db.connect();
        await loadDataset(db, conn, NORTHWIND_DATASET);
        if (cancelled) { conn.close(); return; }
        dbRef.current = db;
        connRef.current = conn;
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      conn?.close().catch(() => {});
    };
  }, []);

  const switchDataset = useCallback(async (dataset: Dataset) => {
    if (!dbRef.current || !connRef.current) return;
    setIsLoadingDataset(true);
    setError(null);
    try {
      await loadDataset(dbRef.current, connRef.current, dataset);
      setActiveDataset(dataset);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingDataset(false);
    }
  }, []);

  const executeQuery = useCallback(async (sql: string): Promise<QueryRow[]> => {
    if (!connRef.current) throw new Error('DuckDB not ready.');
    const table = await connRef.current.query(sql);
    return arrowToRows(table);
  }, []);

  const explainQuery = useCallback(async (sql: string): Promise<string> => {
    if (!connRef.current) return '';
    try {
      const table = await connRef.current.query(`EXPLAIN ${sql}`);
      return arrowToRows(table)
        .map((r) => String(r['explain_value'] ?? ''))
        .join('\n');
    } catch {
      return '';
    }
  }, []);

  return { isLoading, isLoadingDataset, error, activeDataset, switchDataset, executeQuery, explainQuery };
}
