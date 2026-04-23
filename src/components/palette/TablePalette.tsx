import { NORTHWIND_SCHEMA } from '../../data/northwind';
import { PaletteTableCard } from './PaletteTableCard';

export function TablePalette() {
  return (
    <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="font-bold text-gray-700 text-sm">📦 Tables</h2>
        <p className="text-xs text-gray-400 mt-0.5">Drag onto canvas →</p>
      </div>
      <div className="p-3 flex flex-col gap-3">
        {NORTHWIND_SCHEMA.map((table) => (
          <PaletteTableCard key={table.name} table={table} />
        ))}
      </div>
    </div>
  );
}
