import { useDroppable } from '@dnd-kit/core';
import { Plus, RotateCcw, Zap } from 'lucide-react';
import type {
  QueryState, Table, Join, Filter, GroupByConfig, HavingFilter, OrderByConfig,
} from '../../types/query';
import { suggestJoinColumns } from '../../data/northwind';
import { CanvasTableBlock } from './CanvasTable';
import { JoinConnector } from './JoinConnector';
import { FilterRow } from './FilterRow';
import { GroupByRow } from './GroupByRow';
import { HavingRow } from './HavingRow';
import { OrderByRow } from './OrderByRow';

interface Actions {
  removeTable: (id: string) => void;
  toggleColumn: (tableId: string, col: string) => void;
  addJoin: (l: string, lc: string, r: string, rc: string) => void;
  updateJoin: (id: string, patch: Partial<Omit<Join, 'id'>>) => void;
  removeJoin: (id: string) => void;
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

export function QueryCanvas({ state, schemaMap, actions }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const canvasIsEmpty = state.canvasTables.length === 0;

  function handleAutoJoin(leftId: string, rightId: string) {
    const leftTable = state.canvasTables.find((t) => t.id === leftId);
    const rightTable = state.canvasTables.find((t) => t.id === rightId);
    if (!leftTable || !rightTable) return;
    const fk = suggestJoinColumns(leftTable.tableName, rightTable.tableName);
    if (!fk) {
      // No FK found — use first column of each as placeholder
      const leftCol = schemaMap[leftTable.tableName]?.columns[0]?.name ?? '';
      const rightCol = schemaMap[rightTable.tableName]?.columns[0]?.name ?? '';
      actions.addJoin(leftId, leftCol, rightId, rightCol);
    } else {
      const fromIsLeft = fk.fromTable === leftTable.tableName;
      if (fromIsLeft) {
        actions.addJoin(leftId, fk.fromColumn, rightId, fk.toColumn);
      } else {
        actions.addJoin(leftId, fk.toColumn, rightId, fk.fromColumn);
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 relative overflow-auto transition-colors ${
          isOver ? 'bg-indigo-50' : 'bg-gray-100'
        }`}
        style={{ minHeight: 400 }}
      >
        {canvasIsEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-5xl mb-3">🦆</div>
            <div className="text-lg font-semibold">Drag a table here to start!</div>
            <div className="text-sm mt-1">Pick from the Tables list on the left</div>
          </div>
        )}

        {/* Join connector SVG lines */}
        {state.joins.map((join) => {
          const leftCT = state.canvasTables.find((t) => t.id === join.leftTableId);
          const rightCT = state.canvasTables.find((t) => t.id === join.rightTableId);
          const leftSchema = leftCT ? schemaMap[leftCT.tableName] : undefined;
          const rightSchema = rightCT ? schemaMap[rightCT.tableName] : undefined;
          if (!leftCT || !rightCT || !leftSchema || !rightSchema) return null;
          return (
            <JoinConnector
              key={join.id}
              join={join}
              leftTable={leftCT}
              rightTable={rightCT}
              leftSchema={leftSchema}
              rightSchema={rightSchema}
              onUpdate={(patch) => actions.updateJoin(join.id, patch)}
              onRemove={() => actions.removeJoin(join.id)}
            />
          );
        })}

        {/* Canvas table blocks */}
        {state.canvasTables.map((ct) => {
          const schema = schemaMap[ct.tableName];
          if (!schema) return null;
          return (
            <CanvasTableBlock
              key={ct.id}
              canvasTable={ct}
              schema={schema}
              onRemove={() => actions.removeTable(ct.id)}
              onToggleColumn={(col) => actions.toggleColumn(ct.id, col)}
              onAddOrderBy={(col) => actions.addOrderBy(ct.id, col)}
            />
          );
        })}

        {/* Join suggestion buttons (shown between each pair of tables without a join) */}
        {state.canvasTables.length >= 2 && (() => {
          const existing = new Set(state.joins.flatMap((j) => [`${j.leftTableId}|${j.rightTableId}`, `${j.rightTableId}|${j.leftTableId}`]));
          const buttons: React.ReactNode[] = [];
          for (let i = 0; i < state.canvasTables.length; i++) {
            for (let k = i + 1; k < state.canvasTables.length; k++) {
              const l = state.canvasTables[i];
              const r = state.canvasTables[k];
              if (existing.has(`${l.id}|${r.id}`)) continue;
              const fk = suggestJoinColumns(l.tableName, r.tableName);
              const lx = (l.position.x + r.position.x) / 2 + 100;
              const ly = (l.position.y + r.position.y) / 2 + 20;
              buttons.push(
                <button
                  key={`suggest-${l.id}-${r.id}`}
                  onClick={() => handleAutoJoin(l.id, r.id)}
                  style={{ position: 'absolute', left: lx - 40, top: ly, zIndex: 20 }}
                  title={fk ? `Join on ${fk.fromColumn} = ${fk.toColumn}` : 'Add join'}
                  className="bg-white border-2 border-dashed border-indigo-300 text-indigo-500 text-xs font-semibold px-2 py-1 rounded-full hover:bg-indigo-50 hover:border-indigo-400 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                >
                  <Zap size={10} />
                  {fk ? 'Auto Join' : '+ Join'}
                </button>,
              );
            }
          }
          return buttons;
        })()}
      </div>

      {/* Clause strips */}
      <div className="border-t border-gray-200 bg-white max-h-72 overflow-y-auto">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Clauses</span>
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={state.distinct}
                onChange={(e) => actions.setDistinct(e.target.checked)}
                className="accent-indigo-500"
              />
              Unique rows only (DISTINCT)
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600">
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
                className="w-16 text-xs border rounded px-1.5 py-1 text-center"
              />
            </label>
          </div>
          <button
            onClick={actions.reset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {/* Filters */}
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

          {/* Group By */}
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

          {/* Having (only if groupBy exists) */}
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

          {/* Order By */}
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
    </div>
  );
}
