import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { CanvasTable as CanvasTableType, ColumnType, Table, Column } from '../../types/query';
import { getCanvasColors } from '../../data/tableColors';

const TYPE_BADGE: Record<ColumnType, { label: string; cls: string }> = {
  string:  { label: 'text', cls: 'bg-blue-100 text-blue-600' },
  number:  { label: 'num',  cls: 'bg-emerald-100 text-emerald-600' },
  date:    { label: 'date', cls: 'bg-amber-100 text-amber-700' },
  boolean: { label: 'bool', cls: 'bg-purple-100 text-purple-600' },
};

const CANVAS_TABLE_WIDTH = 200;

function DraggableColumnRow({
  col, canvasTableId, checked, colors, onToggle, onAddOrderBy,
}: {
  col: Column; canvasTableId: string; checked: boolean;
  colors: { check: string }; onToggle: (c: string) => void; onAddOrderBy: (c: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `col:${canvasTableId}:${col.name}`,
    data: { type: 'column', tableId: canvasTableId, columnName: col.name },
  });
  return (
    <div ref={setNodeRef} className={`flex items-center gap-1.5 py-0.5 group ${isDragging ? 'opacity-30' : ''}`}>
      <span
        {...listeners}
        {...attributes}
        title="Drag to computed column"
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <GripVertical size={10} />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(col.name)}
        className={`${colors.check} cursor-pointer flex-shrink-0`}
      />
      <span
        className="text-xs font-mono text-gray-700 flex-1 cursor-pointer select-none min-w-0 truncate"
        onClick={() => onToggle(col.name)}
      >
        {col.name}
      </span>
      <span
        title={col.type}
        className={`text-[9px] px-1 py-0.5 rounded font-mono flex-shrink-0 leading-none ${TYPE_BADGE[col.type].cls}`}
      >
        {TYPE_BADGE[col.type].label}
      </span>
      <button
        onClick={() => onAddOrderBy(col.name)}
        title="Sort by this column"
        className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex-shrink-0"
      >
        ↕
      </button>
    </div>
  );
}

interface Props {
  canvasTable: CanvasTableType;
  schema: Table;
  onRemove: () => void;
  onToggleColumn: (col: string) => void;
  onAddOrderBy: (col: string) => void;
}

export function CanvasTableBlock({ canvasTable, schema, onRemove, onToggleColumn, onAddOrderBy }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: canvasTable.id,
    data: { type: 'canvas-table', tableId: canvasTable.id },
  });

  const colors = getCanvasColors(canvasTable.tableName);

  // When dragging, hide the source — DragOverlay is the ghost above all stacking contexts.
  const style: React.CSSProperties = {
    position: 'absolute',
    left: canvasTable.position.x,
    top: canvasTable.position.y,
    transform: CSS.Translate.toString(transform),
    opacity: transform ? 0 : 1,
    width: CANVAS_TABLE_WIDTH,
  };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl shadow-lg border-2 ${colors.border} bg-white overflow-hidden`}>
      <div
        {...listeners}
        {...attributes}
        className={`${colors.header} text-white px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none`}
      >
        <span className="font-bold text-sm">{schema.label}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          className="hover:bg-white/20 rounded p-0.5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-2 max-h-64 overflow-y-auto">
        {schema.columns.map((col) => (
          <DraggableColumnRow
            key={col.name}
            col={col}
            canvasTableId={canvasTable.id}
            checked={canvasTable.selectedColumns.includes(col.name)}
            colors={colors}
            onToggle={onToggleColumn}
            onAddOrderBy={onAddOrderBy}
          />
        ))}
      </div>
    </div>
  );
}
