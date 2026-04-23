import { useDroppable } from '@dnd-kit/core';
import { Zap } from 'lucide-react';
import type { QueryState, Table, Join } from '../../types/query';
import { suggestJoinColumns } from '../../data/northwind';
import { CanvasTableBlock } from './CanvasTable';
import { JoinConnector } from './JoinConnector';

interface Actions {
  removeTable: (id: string) => void;
  toggleColumn: (tableId: string, col: string) => void;
  addJoin: (l: string, lc: string, r: string, rc: string) => void;
  updateJoin: (id: string, patch: Partial<Omit<Join, 'id'>>) => void;
  removeJoin: (id: string) => void;
  addOrderBy: (tableId: string, col: string) => void;
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

    </div>
  );
}
