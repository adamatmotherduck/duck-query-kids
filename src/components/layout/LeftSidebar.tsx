import { useState } from 'react';
import type { QueryState } from '../../types/query';
import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { PaletteTableCard } from '../palette/PaletteTableCard';
import { LessonPanel } from '../lessons/LessonPanel';

type Tab = 'tables' | 'lessons';

interface Props {
  state: QueryState;
}

export function LeftSidebar({ state }: Props) {
  const [tab, setTab] = useState<Tab>('tables');

  return (
    <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => setTab('tables')}
          className={`flex-1 text-xs py-2.5 font-semibold transition-colors ${
            tab === 'tables'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Tables
        </button>
        <button
          onClick={() => setTab('lessons')}
          className={`flex-1 text-xs py-2.5 font-semibold transition-colors ${
            tab === 'lessons'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎓 Lessons
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {tab === 'tables' ? (
          <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-2">
            <p className="text-xs text-gray-400 px-1 pt-1">Drag onto canvas →</p>
            {NORTHWIND_SCHEMA.map((table) => (
              <PaletteTableCard key={table.name} table={table} />
            ))}
          </div>
        ) : (
          <LessonPanel state={state} />
        )}
      </div>
    </div>
  );
}
