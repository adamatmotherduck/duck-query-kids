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

const ADD_BTN = 'flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-dashed whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export function ClausesPanel({ state, schemaMap, actions }: Props) {
  const disabled = state.canvasTables.length === 0;

  const firstTable = state.canvasTables[0];
  const firstCol = firstTable ? (schemaMap[firstTable.tableName]?.columns[0]?.name ?? '') : '';

  return (
    <div className="w-full flex-shrink-0 bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex flex-wrap items-start gap-2 px-3 py-2 min-w-0">

        {/* Controls: DISTINCT, LIMIT, Reset */}
        <div className="flex items-center gap-2 flex-shrink-0 border-r border-gray-200 pr-3 self-center">
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={state.distinct}
              onChange={(e) => actions.setDistinct(e.target.checked)}
              className="accent-indigo-500"
            />
            DISTINCT
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
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

        {/* WHERE group */}
        <div className="flex flex-wrap items-start gap-1.5">
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
            disabled={disabled}
            onClick={actions.addFilter}
            className={`${ADD_BTN} text-amber-600 border-amber-300 hover:bg-amber-50`}
          >
            <Plus size={12} /> WHERE
          </button>
        </div>

        {/* GROUP BY / HAVING group */}
        <div className="flex flex-wrap items-start gap-1.5">
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
          {state.groupBy.length > 0 && state.having.map((h) => (
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
            disabled={disabled}
            onClick={actions.addGroupBy}
            className={`${ADD_BTN} text-violet-600 border-violet-300 hover:bg-violet-50`}
          >
            <Plus size={12} /> GROUP BY
          </button>
          {state.groupBy.length > 0 && (
            <button
              onClick={actions.addHaving}
              className={`${ADD_BTN} text-rose-600 border-rose-300 hover:bg-rose-50`}
            >
              <Plus size={12} /> HAVING
            </button>
          )}
        </div>

        {/* ORDER BY group */}
        <div className="flex flex-wrap items-start gap-1.5">
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
            disabled={disabled}
            onClick={() => { if (firstTable) actions.addOrderBy(firstTable.id, firstCol); }}
            className={`${ADD_BTN} text-sky-600 border-sky-300 hover:bg-sky-50`}
          >
            <Plus size={12} /> ORDER BY
          </button>
        </div>

      </div>
    </div>
  );
}
