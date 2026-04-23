import { X } from 'lucide-react';
import type { HavingFilter, AggregateFunction, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

const HAVING_OPS = ['=', '!=', '<', '>', '<=', '>='] as const;
const AGG_OPTIONS = (Object.keys(AGG_LABELS) as AggregateFunction[]).map((k) => ({
  value: k,
  label: AGG_LABELS[k],
}));

interface Props {
  having: HavingFilter;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  onUpdate: (patch: Partial<Omit<HavingFilter, 'id'>>) => void;
  onRemove: () => void;
}

export function HavingRow({ having, canvasTables, schemas, onUpdate, onRemove }: Props) {
  const currentTable = canvasTables.find((t) => t.id === having.tableId);
  const schema = currentTable ? schemas[currentTable.tableName] : undefined;
  const needsCol = having.aggregate !== 'COUNT_STAR';

  return (
    <div className="flex items-center gap-2 bg-white border border-rose-200 rounded-lg px-3 py-2 flex-wrap">
      <span className="text-xs text-rose-600 font-semibold w-14 flex-shrink-0">HAVING</span>
      <select
        value={having.aggregate}
        onChange={(e) => onUpdate({ aggregate: e.target.value as AggregateFunction })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[130px]"
      >
        {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {needsCol && (
        <>
          <select
            value={having.tableId}
            onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })}
            className="text-xs border rounded px-1.5 py-1 bg-white max-w-[80px]"
          >
            {canvasTables.map((t) => (
              <option key={t.id} value={t.id}>
                {schemas[t.tableName]?.label ?? t.tableName}
              </option>
            ))}
          </select>
          <select
            value={having.column}
            onChange={(e) => onUpdate({ column: e.target.value })}
            className="text-xs border rounded px-1.5 py-1 bg-white max-w-[110px]"
          >
            <option value="">— column —</option>
            {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </>
      )}
      <select
        value={having.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as HavingFilter['operator'] })}
        className="text-xs border rounded px-1.5 py-1 bg-white w-14"
      >
        {HAVING_OPS.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>
      <input
        type="text"
        value={having.value}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="value"
        className="text-xs border rounded px-2 py-1 w-24"
      />
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
        <X size={14} />
      </button>
    </div>
  );
}
