import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import type { CanvasTable as CanvasTableType, Table } from '../../types/query';

const COLOR_CLASSES: Record<string, { header: string; border: string; check: string }> = {
  customers:    { header: 'bg-blue-500',   border: 'border-blue-400',  check: 'accent-blue-500'   },
  orders:       { header: 'bg-green-500',  border: 'border-green-400', check: 'accent-green-500'  },
  order_details:{ header: 'bg-orange-500', border: 'border-orange-400',check: 'accent-orange-500' },
  products:     { header: 'bg-purple-500', border: 'border-purple-400',check: 'accent-purple-500' },
  categories:   { header: 'bg-pink-500',   border: 'border-pink-400',  check: 'accent-pink-500'   },
  employees:    { header: 'bg-teal-500',   border: 'border-teal-400',  check: 'accent-teal-500'   },
};

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

  const colors = COLOR_CLASSES[canvasTable.tableName] ?? {
    header: 'bg-gray-500', border: 'border-gray-400', check: 'accent-gray-500',
  };

  // When dragging, hide the source — DragOverlay is the ghost above all stacking contexts.
  const style: React.CSSProperties = {
    position: 'absolute',
    left: canvasTable.position.x,
    top: canvasTable.position.y,
    transform: CSS.Translate.toString(transform),
    opacity: transform ? 0 : 1,
    width: 200,
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
        {schema.columns.map((col) => {
          const checked = canvasTable.selectedColumns.includes(col.name);
          return (
            <div key={col.name} className="flex items-center gap-2 py-0.5 group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleColumn(col.name)}
                className={`${colors.check} cursor-pointer`}
              />
              <span
                className="text-xs font-mono text-gray-700 flex-1 cursor-pointer select-none"
                onClick={() => onToggleColumn(col.name)}
              >
                {col.name}
              </span>
              <span className="text-xs text-gray-300 group-hover:text-gray-400 font-mono">{col.type[0]}</span>
              <button
                onClick={() => onAddOrderBy(col.name)}
                title="Sort by this column"
                className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ↕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
