import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Table } from '../../types/query';

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  customers:    { bg: 'bg-blue-50',   border: 'border-blue-300',  text: 'text-blue-800',   dot: 'bg-blue-400'   },
  orders:       { bg: 'bg-green-50',  border: 'border-green-300', text: 'text-green-800',  dot: 'bg-green-400'  },
  order_details:{ bg: 'bg-orange-50', border: 'border-orange-300',text: 'text-orange-800', dot: 'bg-orange-400' },
  products:     { bg: 'bg-purple-50', border: 'border-purple-300',text: 'text-purple-800', dot: 'bg-purple-400' },
  categories:   { bg: 'bg-pink-50',   border: 'border-pink-300',  text: 'text-pink-800',   dot: 'bg-pink-400'   },
  employees:    { bg: 'bg-teal-50',   border: 'border-teal-300',  text: 'text-teal-800',   dot: 'bg-teal-400'   },
};

export function PaletteTableCard({ table }: { table: Table }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${table.name}`,
    data: { tableName: table.name },
  });

  const colors = COLOR_CLASSES[table.name] ?? {
    bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800', dot: 'bg-gray-400',
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-3 select-none transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0`} />
        <span className={`font-bold text-sm ${colors.text}`}>{table.label}</span>
      </div>
      {table.description && (
        <p className="text-xs text-gray-500 mb-2 leading-tight">{table.description}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {table.columns.slice(0, 4).map((col) => (
          <span key={col.name} className="text-xs bg-white/70 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 font-mono">
            {col.name}
          </span>
        ))}
        {table.columns.length > 4 && (
          <span className="text-xs text-gray-400">+{table.columns.length - 4} more</span>
        )}
      </div>
    </div>
  );
}
