import { useState, useMemo } from 'react';
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
import type { Lesson } from '../../types/lesson';
import type { Project } from '../../types/project';
import { ALL_DATASETS } from '../../data/datasets';
import { useDuckDBContext } from '../../context/DuckDBContext';
import { useQueryBuilder } from '../../hooks/useQueryBuilder';
import { useCustomContent } from '../../hooks/useCustomContent';
import { compileConditionGroup } from '../../utils/conditionCompiler';
import { TablePalette } from '../palette/TablePalette';
import { QueryCanvas } from '../canvas/QueryCanvas';
import { ClausesPanel } from '../canvas/ClausesPanel';
import { OutputPanel } from '../output/OutputPanel';
import { PaletteTableCard } from '../palette/PaletteTableCard';
import { BuilderModal } from '../builder/BuilderModal';

const DROP_OFFSET = 60;

export function QueryBuilderLayout() {
  const { activeDataset, switchDataset, isLoadingDataset } = useDuckDBContext();
  const qb = useQueryBuilder();
  const { customLessons, customProjects } = useCustomContent();
  const [builderOpen, setBuilderOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const schemaMap: Record<string, Table> = Object.fromEntries(
    activeDataset.schema.map((t) => [t.name, t]),
  );

  // Merge dataset lessons/projects with compiled custom content
  const lessons: Lesson[] = useMemo(() => {
    const custom = customLessons
      .filter((l) => l.datasetId === activeDataset.id)
      .map((l): Lesson => ({
        id: l.id,
        title: l.title,
        concept: l.concept,
        description: l.description,
        hints: l.hints,
        check: compileConditionGroup(l.conditionGroup),
      }));
    return [...activeDataset.lessons, ...custom];
  }, [activeDataset, customLessons]);

  const projects: Project[] = useMemo(() => {
    const custom = customProjects
      .filter((p) => p.datasetId === activeDataset.id)
      .map((p): Project => ({
        id: p.id,
        title: p.title,
        description: p.description,
        steps: p.steps.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          hints: s.hints,
          check: compileConditionGroup(s.conditionGroup),
        })),
      }));
    return [...activeDataset.projects, ...custom];
  }, [activeDataset, customProjects]);

  const [activeTableName, setActiveTableName] = useState<string | null>(null);
  const [activeCanvasLabel, setActiveCanvasLabel] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.tableName) {
      setActiveTableName(data.tableName as string);
      setActiveCanvasLabel(null);
    } else if (data?.type === 'canvas-table') {
      const ct = qb.state.canvasTables.find((t) => t.id === data.tableId);
      setActiveCanvasLabel(ct ? (schemaMap[ct.tableName]?.label ?? ct.tableName) : null);
      setActiveTableName(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTableName(null);
    setActiveCanvasLabel(null);

    const { over, active, delta } = event;

    if (over?.id === 'canvas' && active.data.current?.tableName) {
      const tableName = active.data.current.tableName as string;
      const rect = over?.rect ?? { left: 0, top: 0 };
      const x = Math.max(10, (active.rect.current.translated?.left ?? rect.left) - rect.left);
      const y = Math.max(10, (active.rect.current.translated?.top ?? rect.top) - rect.top + DROP_OFFSET);
      qb.dropTable(tableName, { x, y });
      return;
    }

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

  const overlayTable = activeTableName ? schemaMap[activeTableName] : null;

  async function handleSwitchDataset(id: string) {
    const ds = ALL_DATASETS.find((d) => d.id === id);
    if (!ds || ds.id === activeDataset.id) return;
    qb.reset();
    await switchDataset(ds);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-screen overflow-hidden bg-white">
          <TablePalette
            schema={activeDataset.schema}
            datasets={ALL_DATASETS}
            activeDatasetId={activeDataset.id}
            isLoadingDataset={isLoadingDataset}
            onSwitchDataset={handleSwitchDataset}
            onOpenBuilder={() => setBuilderOpen(true)}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <QueryCanvas
              state={qb.state}
              schemaMap={schemaMap}
              foreignKeys={activeDataset.foreignKeys}
              actions={actions}
            />
            <div className="flex border-t border-gray-200 flex-shrink-0">
              <ClausesPanel state={qb.state} schemaMap={schemaMap} actions={actions} />
              <OutputPanel
                state={qb.state}
                activeDataset={activeDataset}
                lessons={lessons}
                projects={projects}
              />
            </div>
          </div>
        </div>

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

      {builderOpen && (
        <BuilderModal
          datasets={ALL_DATASETS}
          activeDatasetId={activeDataset.id}
          onClose={() => setBuilderOpen(false)}
        />
      )}
    </>
  );
}
