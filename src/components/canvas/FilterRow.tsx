import { X } from 'lucide-react';
import type { Filter, FilterOperator, CanvasTable, Table } from '../../types/query';

const OPERATORS: FilterOperator[] = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IS NULL', 'IS NOT NULL', 'IN'];

const SEL = 'text-xs border border-gray-200 rounded px-1.5 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-amber-300';

interface Props {
  filter: Filter;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  onUpdate: (patch: Partial<Omit<Filter, 'id'>>) => void;
  onRemove: () => void;
}

export function FilterRow({ filter, canvasTables, schemas, onUpdate, onRemove }: Props) {
  const currentTable = canvasTables.find((t) => t.id === filter.tableId);
  const schema = currentTable ? schemas[currentTable.tableName] : undefined;
  const noValue = filter.operator === 'IS NULL' || filter.operator === 'IS NOT NULL';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">WHERE</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <select value={filter.tableId} onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })} className={SEL}>
          {canvasTables.map((t) => (
            <option key={t.id} value={t.id}>{schemas[t.tableName]?.label ?? t.tableName}</option>
          ))}
        </select>
        <select value={filter.column} onChange={(e) => onUpdate({ column: e.target.value })} className={SEL}>
          <option value="">— column —</option>
          {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <select value={filter.operator} onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })} className={SEL}>
          {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        {!noValue && (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="value"
            className="text-xs border border-gray-200 rounded px-1.5 py-1 w-full focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
        )}
      </div>
    </div>
  );
}
