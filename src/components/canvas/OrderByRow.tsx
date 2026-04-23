import { X, ArrowUp, ArrowDown } from 'lucide-react';
import type { OrderByConfig, GroupByConfig, CanvasTable, Table } from '../../types/query';
import { AGG_LABELS } from '../../data/northwind';

const SEL = 'text-xs border border-gray-200 rounded px-1.5 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-sky-300';

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

  const aggAliases = groupBy
    .filter((g) => g.aggregate)
    .map((g) => ({
      tableId: g.tableId,
      column: g.column,
      label: g.alias ?? `${AGG_LABELS[g.aggregate!] ?? g.aggregate}_${g.column}`,
    }));

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wide">ORDER BY</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <select value={order.tableId} onChange={(e) => onUpdate({ tableId: e.target.value, column: '' })} className={SEL}>
          {canvasTables.map((t) => (
            <option key={t.id} value={t.id}>{schemas[t.tableName]?.label ?? t.tableName}</option>
          ))}
        </select>
        <select value={order.column} onChange={(e) => onUpdate({ column: e.target.value })} className={SEL}>
          <option value="">— column —</option>
          {schema?.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          {aggAliases
            .filter((a) => a.tableId === order.tableId)
            .map((a) => (
              <option key={`agg-${a.column}`} value={a.column}>📊 {a.label}</option>
            ))}
        </select>
      </div>
      <button
        onClick={() => onUpdate({ direction: order.direction === 'ASC' ? 'DESC' : 'ASC' })}
        className={`flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded border w-full font-semibold transition-colors ${
          order.direction === 'ASC'
            ? 'border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200'
            : 'border-orange-300 bg-orange-100 text-orange-700 hover:bg-orange-200'
        }`}
      >
        {order.direction === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {order.direction}
      </button>
    </div>
  );
}
