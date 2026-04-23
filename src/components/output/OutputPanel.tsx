import { useState, useEffect, useRef, useCallback } from 'react';
import type { QueryState, QueryRow, Table } from '../../types/query';
import { generateSQL } from '../../utils/sqlGenerator';
import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { useDuckDBContext } from '../../context/DuckDBContext';
import { ResultsGrid } from './ResultsGrid';

type Tab = 'results' | 'sql' | 'plan';

interface Props {
  state: QueryState;
  schemaMap?: Record<string, Table>;
}

export function OutputPanel({ state }: Props) {
  const { executeQuery, explainQuery } = useDuckDBContext();
  const [tab, setTab] = useState<Tab>('results');
  const [rows, setRows] = useState<QueryRow[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sql = generateSQL(state, NORTHWIND_SCHEMA);

  const runQuery = useCallback(async (q: string) => {
    if (!q) { setRows([]); setQueryError(null); return; }
    setLoading(true);
    setQueryError(null);
    try {
      const result = await executeQuery(q);
      setRows(result);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [executeQuery]);

  const runPlan = useCallback(async (q: string) => {
    if (!q) { setPlan(''); return; }
    setPlanLoading(true);
    try {
      const p = await explainQuery(q);
      setPlan(p);
    } finally {
      setPlanLoading(false);
    }
  }, [explainQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runQuery(sql), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [sql, runQuery]);

  useEffect(() => {
    if (tab === 'plan' && sql) runPlan(sql);
  }, [tab, sql, runPlan]);

  const TAB_STYLE = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
      tab === t
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="h-64 flex flex-col border-t border-gray-200 bg-white">
      <div className="flex border-b border-gray-200">
        <button className={TAB_STYLE('results')} onClick={() => setTab('results')}>
          📊 Results {rows.length > 0 && !loading && <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{rows.length}</span>}
        </button>
        <button className={TAB_STYLE('sql')} onClick={() => setTab('sql')}>
          📝 SQL
        </button>
        <button className={TAB_STYLE('plan')} onClick={() => setTab('plan')}>
          🗺️ Query Plan
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'results' && (
          <ResultsGrid rows={rows} loading={loading} error={queryError} />
        )}
        {tab === 'sql' && (
          <div className="h-full overflow-auto p-4">
            {sql ? (
              <pre className="text-xs font-mono text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap">{sql}</pre>
            ) : (
              <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                Drag a table onto the canvas to generate SQL
              </div>
            )}
          </div>
        )}
        {tab === 'plan' && (
          <div className="h-full overflow-auto p-4">
            {planLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading plan…</div>
            ) : plan ? (
              <pre className="text-xs font-mono text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200 whitespace-pre-wrap">{plan}</pre>
            ) : (
              <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                {sql ? 'Click this tab to load the query plan' : 'No query to explain'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
