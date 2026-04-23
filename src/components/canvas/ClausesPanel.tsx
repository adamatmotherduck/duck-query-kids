import { Plus, RotateCcw } from 'lucide-react';
import type {
  QueryState, Table, Filter, GroupByConfig, HavingFilter, OrderByConfig,
} from '../../types/query';
import { FilterRow } from './FilterRow';
import { GroupByRow } from './GroupByRow';
import { HavingRow } from './HavingRow';
import { OrderByRow } from './OrderByRow';

interface Actions {
  addFilter: () => void;
  updateFilter: (id: string, patch: Partial<Omit<Filter, 'id'>>) => void;
  removeFilter: (id: string) => void;
  addGroupBy: () => void;
  updateGroupBy: (id: string, patch: Partial<Omit<GroupByConfig, 'id'>>) => void;
  removeGroupBy: (id: string) => void;
  addHaving: () => void;
  updateHaving: (id: string, patch: Partial<Omit<HavingFilter, 'id'>>) => void;
  removeHaving: (id: string) => void;
  addOrderBy: (tableId: string, col: string) => void;
  updateOrderBy: (id: string, patch: Partial<Omit<OrderByConfig, 'id'>>) => void;
  removeOrderBy: (id: string) => void;
  setDistinct: (v: boolean) => void;
  setLimit: (limit: number | null) => void;
  reset: () => void;
}

interface Props {
  state: QueryState;
  schemaMap: Record<string, Table>;
  actions: Actions;
}

export function ClausesPanel({ state, schemaMap, actions }: Props) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Clauses</span>
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={state.distinct}
              onChange={(e) => actions.setDistinct(e.target.checked)}
              className="accent-indigo-500"
            />
            DISTINCT
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <span className="font-medium">LIMIT</span>
            <input
              type="number"
              min={1}
              value={state.limit ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                actions.setLimit(v === '' ? null : Math.max(1, parseInt(v, 10)));
              }}
              placeholder="∞"
              className="w-12 text-xs border rounded px-1 py-0.5 text-center"
            />
          </label>
          <button
            onClick={actions.reset}
            title="Reset query"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Scrollable clause rows */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-0">
        {state.filters.map((f) => (
          <FilterRow
            key={f.id}
            filter={f}
            canvasTables={state.canvasTables}
            schemas={schemaMap}
            onUpdate={(patch) => actions.updateFilter(f.id, patch)}
            onRemove={() => actions.removeFilter(f.id)}
          />
        ))}
        <button
          disabled={state.canvasTables.length === 0}
          onClick={actions.addFilter}
          className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed w-fit"
        >
          <Plus size={12} /> Add WHERE filter
        </button>

        {state.groupBy.map((g) => (
          <GroupByRow
            key={g.id}
            config={g}
            canvasTables={state.canvasTables}
            schemas={schemaMap}
            onUpdate={(patch) => actions.updateGroupBy(g.id, patch)}
            onRemove={() => actions.removeGroupBy(g.id)}
          />
        ))}
        <button
          disabled={state.canvasTables.length === 0}
          onClick={actions.addGroupBy}
          className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed w-fit"
        >
          <Plus size={12} /> Add GROUP BY / aggregate
        </button>

        {state.groupBy.length > 0 && (
          <>
            {state.having.map((h) => (
              <HavingRow
                key={h.id}
                having={h}
                canvasTables={state.canvasTables}
                schemas={schemaMap}
                onUpdate={(patch) => actions.updateHaving(h.id, patch)}
                onRemove={() => actions.removeHaving(h.id)}
              />
            ))}
            <button
              onClick={actions.addHaving}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 w-fit"
            >
              <Plus size={12} /> Add HAVING condition
            </button>
          </>
        )}

        {state.orderBy.map((o) => (
          <OrderByRow
            key={o.id}
            order={o}
            canvasTables={state.canvasTables}
            schemas={schemaMap}
            groupBy={state.groupBy}
            onUpdate={(patch) => actions.updateOrderBy(o.id, patch)}
            onRemove={() => actions.removeOrderBy(o.id)}
          />
        ))}
        <button
          disabled={state.canvasTables.length === 0}
          onClick={() => {
            const first = state.canvasTables[0];
            const firstCol = first ? (schemaMap[first.tableName]?.columns[0]?.name ?? '') : '';
            if (first) actions.addOrderBy(first.id, firstCol);
          }}
          className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed w-fit"
        >
          <Plus size={12} /> Add ORDER BY
        </button>
      </div>
    </div>
  );
}
