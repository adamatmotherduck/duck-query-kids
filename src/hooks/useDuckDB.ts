import { useState, useEffect, useCallback, useRef } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import type { QueryRow } from '../types/query';
import { NORTHWIND_CSV_FILES } from '../data/northwind';

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

async function loadNorthwind(
  db: duckdb.AsyncDuckDB,
  conn: duckdb.AsyncDuckDBConnection,
): Promise<void> {
  for (const { tableName, filename, url } of NORTHWIND_CSV_FILES) {
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
  error: Error | null;
  executeQuery: (sql: string) => Promise<QueryRow[]>;
  explainQuery: (sql: string) => Promise<string>;
}

export function useDuckDB(): UseDuckDBReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    let cancelled = false;
    let conn: duckdb.AsyncDuckDBConnection | null = null;

    async function init() {
      try {
        // Use jsDelivr bundles. The blob URL trick makes the cross-origin worker
        // loadable without COOP/COEP headers.
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
        await loadNorthwind(db, conn);
        if (cancelled) { conn.close(); return; }
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

  return { isLoading, error, executeQuery, explainQuery };
}
