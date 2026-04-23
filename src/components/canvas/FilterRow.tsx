import { X } from 'lucide-react';
import type { Filter, FilterOperator, CanvasTable, Table } from '../../types/query';

const OPERATORS: FilterOperator[] = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IS NULL', 'IS NOT NULL', 'IN'];

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
    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
      <span className="text-xs text-amber-600 font-semibold w-10 flex-shrink-0">WHERE</span>
      <select
        value={filter.tableId}
        onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[90px]"
      >
        {canvasTables.map((t) => (
          <option key={t.id} value={t.id}>
            {schemas[t.tableName]?.label ?? t.tableName}
          </option>
        ))}
      </select>
      <select
        value={filter.column}
        onChange={(e) => onUpdate({ column: e.target.value })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[110px]"
      >
        <option value="">— column —</option>
        {schema?.columns.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </select>
      <select
        value={filter.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as FilterOperator })}
        className="text-xs border rounded px-1.5 py-1 bg-white"
      >
        {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>
      {!noValue && (
        <input
          type="text"
          value={filter.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="value"
          className="text-xs border rounded px-2 py-1 w-28"
        />
      )}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
        <X size={14} />
      </button>
    </div>
  );
}
