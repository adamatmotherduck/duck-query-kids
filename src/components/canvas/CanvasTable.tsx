import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { CanvasTable as CanvasTableType, ColumnType, Table, Column } from '../../types/query';

const TYPE_BADGE: Record<ColumnType, { label: string; cls: string }> = {
  string:  { label: 'text', cls: 'bg-blue-100 text-blue-600' },
  number:  { label: 'num',  cls: 'bg-emerald-100 text-emerald-600' },
  date:    { label: 'date', cls: 'bg-amber-100 text-amber-700' },
  boolean: { label: 'bool', cls: 'bg-purple-100 text-purple-600' },
};

const COLOR_CLASSES: Record<string, { header: string; border: string; check: string }> = {
  // Northwind
  customers:    { header: 'bg-blue-500',    border: 'border-blue-400',    check: 'accent-blue-500'    },
  orders:       { header: 'bg-green-500',   border: 'border-green-400',   check: 'accent-green-500'   },
  order_details:{ header: 'bg-orange-500',  border: 'border-orange-400',  check: 'accent-orange-500'  },
  products:     { header: 'bg-purple-500',  border: 'border-purple-400',  check: 'accent-purple-500'  },
  categories:   { header: 'bg-pink-500',    border: 'border-pink-400',    check: 'accent-pink-500'    },
  employees:    { header: 'bg-teal-500',    border: 'border-teal-400',    check: 'accent-teal-500'    },
  // Chinook
  artist:       { header: 'bg-sky-500',     border: 'border-sky-400',     check: 'accent-sky-500'     },
  album:        { header: 'bg-violet-500',  border: 'border-violet-400',  check: 'accent-violet-500'  },
  track:        { header: 'bg-emerald-500', border: 'border-emerald-400', check: 'accent-emerald-500' },
  genre:        { header: 'bg-orange-500',  border: 'border-orange-400',  check: 'accent-orange-500'  },
  customer:     { header: 'bg-blue-500',    border: 'border-blue-400',    check: 'accent-blue-500'    },
  invoice:      { header: 'bg-green-500',   border: 'border-green-400',   check: 'accent-green-500'   },
  invoice_line: { header: 'bg-amber-500',   border: 'border-amber-400',   check: 'accent-amber-500'   },
  employee:     { header: 'bg-teal-500',    border: 'border-teal-400',    check: 'accent-teal-500'    },
  // IMDB
  movies:       { header: 'bg-rose-500',    border: 'border-rose-400',    check: 'accent-rose-500'    },
  genres:       { header: 'bg-yellow-500',  border: 'border-yellow-400',  check: 'accent-yellow-500'  },
  movie_genres: { header: 'bg-lime-600',    border: 'border-lime-500',    check: 'accent-lime-600'    },
  people:       { header: 'bg-cyan-500',    border: 'border-cyan-400',    check: 'accent-cyan-500'    },
  directors:    { header: 'bg-fuchsia-500', border: 'border-fuchsia-400', check: 'accent-fuchsia-500' },
};

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
