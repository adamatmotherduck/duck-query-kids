import { X, ArrowUp, ArrowDown } from 'lucide-react';
import type { OrderByConfig, GroupByConfig, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

interface Props {
  order: OrderByConfig;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  groupBy: GroupByConfig[];
  onUpdate: (patch: Partial<Omit<OrderByConfig, 'id'>>) => void;
  onRemove: () => void;
}

export function OrderByRow({ order, canvasTables, schemas, groupBy, onUpdate, onRemove }: Props) {
  const currentTable = canvasTables.find((t) => t.id === order.tableId);
  const schema = currentTable ? schemas[currentTable.tableName] : undefined;

  // Aggregate aliases from groupBy are also valid sort targets
  const aggAliases = groupBy
    .filter((g) => g.aggregate)
    .map((g) => ({
      tableId: g.tableId,
      column: g.column,
      label: g.alias ?? `${AGG_LABELS[g.aggregate!] ?? g.aggregate}_${g.column}`,
    }));

  return (
    <div className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2">
      <span className="text-xs text-sky-600 font-semibold w-16 flex-shrink-0">ORDER BY</span>
      <select
        value={order.tableId}
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
        value={order.column}
        onChange={(e) => onUpdate({ column: e.target.value })}
        className="text-xs border rounded px-1.5 py-1 bg-white max-w-[120px]"
      >
        <option value="">— column —</option>
        {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        {aggAliases
          .filter((a) => a.tableId === order.tableId)
          .map((a) => (
            <option key={`agg-${a.column}`} value={a.column}>📊 {a.label}</option>
          ))}
      </select>
      <button
        onClick={() => onUpdate({ direction: order.direction === 'ASC' ? 'DESC' : 'ASC' })}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
          order.direction === 'ASC'
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : 'border-orange-300 bg-orange-50 text-orange-700'
        }`}
      >
        {order.direction === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {order.direction}
      </button>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors ml-auto">
        <X size={14} />
      </button>
    </div>
  );
}
