import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Table } from '../../types/query';
import { getPaletteColors } from '../../data/tableColors';

export function PaletteTableCard({ table }: { table: Table }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${table.name}`,
    data: { tableName: table.name },
  });

  const colors = getPaletteColors(table.name);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group ${colors.bg} ${colors.border} border rounded-xl px-3 py-2.5 select-none transition-shadow hover:shadow-md`}
    >
      {/* Always-visible: name + description */}
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
        <span className={`font-bold text-sm leading-tight ${colors.text}`}>{table.label}</span>
      </div>
      {table.description && (
        <p className="text-xs text-gray-500 mt-0.5 leading-tight pl-[18px]">
          {table.description}
        </p>
      )}

      {/* Column pills — hidden by default, slide in on hover */}
      <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-200 ease-out">
        <div className="flex flex-wrap gap-1 pt-2 pl-[18px]">
          {table.columns.slice(0, 4).map((col) => (
            <span
              key={col.name}
              className="text-xs bg-white/70 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 font-mono"
            >
              {col.name}
            </span>
          ))}
          {table.columns.length > 4 && (
            <span className="text-xs text-gray-400">+{table.columns.length - 4} more</span>
          )}
        </div>
      </div>
    </div>
  );
}
