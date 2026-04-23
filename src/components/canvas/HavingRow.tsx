import { X } from 'lucide-react';
import type { HavingFilter, AggregateFunction, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

const HAVING_OPS = ['=', '!=', '<', '>', '<=', '>='] as const;
const AGG_OPTIONS = (Object.keys(AGG_LABELS) as AggregateFunction[]).map((k) => ({
  value: k,
  label: AGG_LABELS[k],
}));

const SEL = 'text-xs border border-gray-200 rounded px-1.5 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-rose-300';

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
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wide">HAVING</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
      <select value={having.aggregate} onChange={(e) => onUpdate({ aggregate: e.target.value as AggregateFunction })} className={SEL}>
        {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {needsCol && (
        <div className="grid grid-cols-2 gap-1">
          <select value={having.tableId} onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })} className={SEL}>
            {canvasTables.map((t) => (
              <option key={t.id} value={t.id}>{schemas[t.tableName]?.label ?? t.tableName}</option>
            ))}
          </select>
          <select value={having.column} onChange={(e) => onUpdate({ column: e.target.value })} className={SEL}>
            <option value="">— column —</option>
            {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1">
        <select value={having.operator} onChange={(e) => onUpdate({ operator: e.target.value as HavingFilter['operator'] })} className={SEL}>
          {HAVING_OPS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <input
          type="text"
          value={having.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="value"
          className="text-xs border border-gray-200 rounded px-1.5 py-1 w-full focus:outline-none focus:ring-1 focus:ring-rose-300"
        />
      </div>
    </div>
  );
}
