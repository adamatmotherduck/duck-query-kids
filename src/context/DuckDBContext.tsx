import { createContext, useContext } from 'react';
import { useDuckDB, type UseDuckDBReturn } from '../hooks/useDuckDB';

const DuckDBContext = createContext<UseDuckDBReturn | null>(null);

export function DuckDBProvider({ children }: { children: React.ReactNode }) {
  const value = useDuckDB();
  return <DuckDBContext.Provider value={value}>{children}</DuckDBContext.Provider>;
}

export function useDuckDBContext(): UseDuckDBReturn {
  const ctx = useContext(DuckDBContext);
  if (!ctx) throw new Error('useDuckDBContext must be used inside DuckDBProvider');
  return ctx;
}
