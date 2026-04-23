import { Pencil } from 'lucide-react';
import type { Table } from '../../types/query';
import type { Dataset } from '../../types/dataset';
import { PaletteTableCard } from './PaletteTableCard';

interface Props {
  schema: Table[];
  datasets: Dataset[];
  activeDatasetId: string;
  isLoadingDataset: boolean;
  onSwitchDataset: (id: string) => void;
  onOpenBuilder: () => void;
}

export function TablePalette({ schema, datasets, activeDatasetId, isLoadingDataset, onSwitchDataset, onOpenBuilder }: Props) {
  return (
    <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700 text-sm">📦 Tables</h2>
          <button
            onClick={onOpenBuilder}
            title="Open lesson & project builder"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors px-1.5 py-1 rounded hover:bg-indigo-50"
          >
            <Pencil size={12} /> Build
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Drag onto canvas →</p>
        <select
          value={activeDatasetId}
          onChange={(e) => onSwitchDataset(e.target.value)}
          disabled={isLoadingDataset}
          className="mt-2 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
        >
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.emoji} {ds.name}
            </option>
          ))}
        </select>
        {isLoadingDataset && (
          <p className="text-xs text-indigo-500 mt-1.5 animate-pulse">Loading dataset…</p>
        )}
      </div>
      <div className="p-3 flex flex-col gap-3">
        {schema.map((table) => (
          <PaletteTableCard key={table.name} table={table} />
        ))}
      </div>
    </div>
  );
}
