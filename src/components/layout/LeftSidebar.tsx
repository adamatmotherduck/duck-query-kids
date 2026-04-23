import { useState } from 'react';
import type { QueryState } from '../../types/query';
import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { PaletteTableCard } from '../palette/PaletteTableCard';
import { LessonPanel } from '../lessons/LessonPanel';
import { ProjectPanel } from '../lessons/ProjectPanel';

type Tab = 'tables' | 'lessons' | 'project';

interface Props {
  state: QueryState;
}

export function LeftSidebar({ state }: Props) {
  const [tab, setTab] = useState<Tab>('tables');

  return (
    <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {(['tables', 'lessons', 'project'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-[10px] py-2.5 font-semibold transition-colors ${
              tab === t
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'tables' ? '📦 Tables' : t === 'lessons' ? '🎓 Lessons' : '🛠 Project'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {tab === 'tables' && (
          <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-2">
            <p className="text-xs text-gray-400 px-1 pt-1">Drag onto canvas →</p>
            {NORTHWIND_SCHEMA.map((table) => (
              <PaletteTableCard key={table.name} table={table} />
            ))}
          </div>
        )}
        {tab === 'lessons' && <LessonPanel state={state} />}
        {tab === 'project' && <ProjectPanel state={state} />}
      </div>
    </div>
  );
}
