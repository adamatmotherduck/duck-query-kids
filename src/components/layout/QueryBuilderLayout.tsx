import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Table } from '../../types/query';
import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { useQueryBuilder } from '../../hooks/useQueryBuilder';
import { TablePalette } from '../palette/TablePalette';
import { QueryCanvas } from '../canvas/QueryCanvas';
import { OutputPanel } from '../output/OutputPanel';

const SCHEMA_MAP: Record<string, Table> = Object.fromEntries(
  NORTHWIND_SCHEMA.map((t) => [t.name, t]),
);

const DROP_OFFSET = 60;

export function QueryBuilderLayout() {
  const qb = useQueryBuilder();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
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
    reset: qb.reset,
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden bg-white">
        <TablePalette />
        <div className="flex-1 flex flex-col overflow-hidden">
          <QueryCanvas state={qb.state} schemaMap={SCHEMA_MAP} actions={actions} />
          <OutputPanel state={qb.state} schemaMap={SCHEMA_MAP} />
        </div>
      </div>
    </DndContext>
  );
}
