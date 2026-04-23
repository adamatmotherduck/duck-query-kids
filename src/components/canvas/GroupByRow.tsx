import { X } from 'lucide-react';
import type { GroupByConfig, AggregateFunction, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

const AGG_OPTIONS = (Object.keys(AGG_LABELS) as AggregateFunction[]).map((k) => ({
  value: k,
  label: AGG_LABELS[k],
}));

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
    <div className="flex items-center gap-2 bg-white border border-violet-200 rounded-lg px-3 py-2 flex-wrap">
      <span className="text-xs text-violet-600 font-semibold w-16 flex-shrink-0">GROUP BY</span>
      <select
        value={config.tableId}
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
        value={config.column}
        onChange={(e) => onUpdate({ column: e.target.value })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[110px]"
      >
        <option value="">— column —</option>
        {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      <select
        value={config.aggregate ?? ''}
        onChange={(e) => onUpdate({ aggregate: (e.target.value as AggregateFunction) || undefined })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[130px]"
      >
        <option value="">(no aggregate)</option>
        {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {config.aggregate === 'STRING_AGG' && (
        <input
          type="text"
          value={config.stringAggSeparator ?? ', '}
          onChange={(e) => onUpdate({ stringAggSeparator: e.target.value })}
          placeholder="separator"
          className="text-xs border rounded px-2 py-1 w-20"
        />
      )}
      {config.aggregate && (
        <input
          type="text"
          value={config.alias ?? ''}
          onChange={(e) => onUpdate({ alias: e.target.value || undefined })}
          placeholder="alias"
          className="text-xs border rounded px-2 py-1 w-24 text-gray-500"
        />
      )}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
        <X size={14} />
      </button>
    </div>
  );
}
