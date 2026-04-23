import { X } from 'lucide-react';
import type { GroupByConfig, AggregateFunction, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

const AGG_OPTIONS = (Object.keys(AGG_LABELS) as AggregateFunction[]).map((k) => ({
  value: k,
  label: AGG_LABELS[k],
}));

const SEL = 'text-xs border border-gray-200 rounded px-1.5 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-violet-300';

interface Props {
  config: GroupByConfig;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  onUpdate: (patch: Partial<Omit<GroupByConfig, 'id'>>) => void;
  onRemove: () => void;
}

export function GroupByRow({ config, canvasTables, schemas, onUpdate, onRemove }: Props) {
  const currentTable = canvasTables.find((t) => t.id === config.tableId);
  const schema = currentTable ? schemas[currentTable.tableName] : undefined;

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wide">GROUP BY</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <select value={config.tableId} onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })} className={SEL}>
          {canvasTables.map((t) => (
            <option key={t.id} value={t.id}>{schemas[t.tableName]?.label ?? t.tableName}</option>
          ))}
        </select>
        <select value={config.column} onChange={(e) => onUpdate({ column: e.target.value })} className={SEL}>
          <option value="">— column —</option>
          {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <select
        value={config.aggregate ?? ''}
        onChange={(e) => onUpdate({ aggregate: (e.target.value as AggregateFunction) || undefined })}
        className={SEL}
      >
        <option value="">(no aggregate)</option>
        {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {config.aggregate && (
        <div className="grid grid-cols-2 gap-1">
          {config.aggregate === 'STRING_AGG' && (
            <input
              type="text"
              value={config.stringAggSeparator ?? ', '}
              onChange={(e) => onUpdate({ stringAggSeparator: e.target.value })}
              placeholder="separator"
              className="text-xs border border-gray-200 rounded px-1.5 py-1 w-full focus:outline-none focus:ring-1 focus:ring-violet-300"
            />
          )}
          <input
            type="text"
            value={config.alias ?? ''}
            onChange={(e) => onUpdate({ alias: e.target.value || undefined })}
            placeholder="alias (optional)"
            className="col-span-2 text-xs border border-gray-200 rounded px-1.5 py-1 w-full text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-300"
          />
        </div>
      )}
    </div>
  );
}
