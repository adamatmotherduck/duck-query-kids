import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Table } from '../../types/query';
import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { useQueryBuilder } from '../../hooks/useQueryBuilder';
import { TablePalette } from '../palette/TablePalette';
import { QueryCanvas } from '../canvas/QueryCanvas';
import { ClausesPanel } from '../canvas/ClausesPanel';
import { OutputPanel } from '../output/OutputPanel';
import { PaletteTableCard } from '../palette/PaletteTableCard';

const SCHEMA_MAP: Record<string, Table> = Object.fromEntries(
  NORTHWIND_SCHEMA.map((t) => [t.name, t]),
);

const DROP_OFFSET = 60;

export function QueryBuilderLayout() {
  const qb = useQueryBuilder();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Track the active drag item so DragOverlay can render a ghost
  const [activeTableName, setActiveTableName] = useState<string | null>(null);
  const [activeCanvasLabel, setActiveCanvasLabel] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.tableName) {
      setActiveTableName(data.tableName as string);
      setActiveCanvasLabel(null);
    } else if (data?.type === 'canvas-table') {
      const ct = qb.state.canvasTables.find((t) => t.id === data.tableId);
      setActiveCanvasLabel(ct ? (SCHEMA_MAP[ct.tableName]?.label ?? ct.tableName) : null);
      setActiveTableName(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTableName(null);
    setActiveCanvasLabel(null);

    const { over, active, delta } = event;

    // Dropping palette card onto canvas
    if (over?.id === 'canvas' && active.data.current?.tableName) {
      const tableName = active.data.current.tableName as string;
      const rect = over?.rect ?? { left: 0, top: 0 };
      const x = Math.max(10, (active.rect.current.translated?.left ?? rect.left) - rect.left);
      const y = Math.max(10, (active.rect.current.translated?.top ?? rect.top) - rect.top + DROP_OFFSET);
      qb.dropTable(tableName, { x, y });
      return;
    }

    // Moving a canvas table block
    if (active.data.current?.type === 'canvas-table') {
      const tableId = active.data.current.tableId as string;
      const ct = qb.state.canvasTables.find((t) => t.id === tableId);
      if (!ct) return;
      qb.moveTable(tableId, {
        x: Math.max(0, ct.position.x + delta.x),
        y: Math.max(0, ct.position.y + delta.y),
      });
    }
  }

  const actions = {
    removeTable: qb.removeTable,
    toggleColumn: qb.toggleColumn,
    addJoin: qb.addJoin,
    updateJoin: qb.updateJoin,
    removeJoin: qb.removeJoin,
    addFilter: qb.addFilter,
    updateFilter: qb.updateFilter,
    removeFilter: qb.removeFilter,
    addGroupBy: qb.addGroupBy,
    updateGroupBy: qb.updateGroupBy,
    removeGroupBy: qb.removeGroupBy,
    addHaving: qb.addHaving,
    updateHaving: qb.updateHaving,
    removeHaving: qb.removeHaving,
    addOrderBy: qb.addOrderBy,
    updateOrderBy: qb.updateOrderBy,
    removeOrderBy: qb.removeOrderBy,
    setDistinct: qb.setDistinct,
    setLimit: qb.setLimit,
    reset: qb.reset,
  };

  const overlayTable = activeTableName ? SCHEMA_MAP[activeTableName] : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden bg-white">
        <TablePalette />
        <div className="flex-1 flex flex-col overflow-hidden">
          <QueryCanvas state={qb.state} schemaMap={SCHEMA_MAP} actions={actions} />
          <div className="flex border-t border-gray-200 flex-shrink-0">
            <ClausesPanel state={qb.state} schemaMap={SCHEMA_MAP} actions={actions} />
            <OutputPanel state={qb.state} />
          </div>
        </div>
      </div>

      {/* DragOverlay renders in a portal above all stacking contexts */}
      <DragOverlay dropAnimation={null}>
        {overlayTable && (
          <div className="opacity-90 pointer-events-none">
            <PaletteTableCard table={overlayTable} />
          </div>
        )}
        {activeCanvasLabel && (
          <div className="bg-white border-2 border-indigo-400 rounded-xl shadow-2xl px-4 py-2 text-sm font-bold text-indigo-700 opacity-90 pointer-events-none">
            {activeCanvasLabel}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
