import type { QueryRow } from '../../types/query';

interface Props {
  rows: QueryRow[];
  loading: boolean;
  error: string | null;
}

export function ResultsGrid({ rows, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        <div className="animate-spin text-2xl mr-3">🦆</div>
        <span>Running query…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-3">
        <p className="text-red-700 text-sm font-semibold">Query error</p>
        <pre className="text-red-600 text-xs mt-1 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No results yet
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-gray-600 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col) => {
                const val = row[col];
                return (
                  <td key={col} className="px-3 py-1.5 border-b border-gray-100 text-gray-700 whitespace-nowrap max-w-xs truncate">
                    {val === null || val === undefined ? (
                      <span className="text-gray-300 italic">null</span>
                    ) : (
                      String(val)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
