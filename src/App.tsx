import { DuckDBProvider } from './context/DuckDBContext';
import { useDuckDBContext } from './context/DuckDBContext';
import { QueryBuilderLayout } from './components/layout/QueryBuilderLayout';

function LoadingScreen({ error }: { error: Error | null }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="text-6xl mb-4 animate-bounce">🦆</div>
      {error ? (
        <>
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load DuckDB</h2>
          <pre className="text-sm text-red-500 bg-red-50 p-4 rounded-lg max-w-xl text-wrap">{error.message}</pre>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-indigo-700 mb-2">Loading DuckDB…</h2>
          <p className="text-indigo-500 text-sm">Setting up the Northwind dataset</p>
        </>
      )}
    </div>
  );
}

function AppInner() {
  const { isLoading, error } = useDuckDBContext();
  if (isLoading || error) return <LoadingScreen error={error} />;
  return <QueryBuilderLayout />;
}

export default function App() {
  return (
    <DuckDBProvider>
      <AppInner />
    </DuckDBProvider>
  );
}
