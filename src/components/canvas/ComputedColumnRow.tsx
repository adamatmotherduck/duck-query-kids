import { X } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { ComputedColumn, ComputedExpr, ColumnRef, CanvasTable, Table } from '../../types/query';

const SEL = 'text-xs border border-gray-200 rounded px-1.5 py-1 bg-white w-full focus:outline-none focus:ring-1 focus:ring-indigo-300';

const EXPR_KINDS: { value: ComputedExpr['kind']; label: string }[] = [
  { value: 'arithmetic', label: 'Math (+−×÷)' },
  { value: 'concat',     label: 'Concat (||)' },
  { value: 'fn',         label: 'Function' },
  { value: 'date_extract', label: 'Date extract' },
];

const ARITH_OPS = ['+', '-', '*', '/'] as const;
const FN_OPTIONS = ['UPPER', 'LOWER', 'TRIM', 'LENGTH', 'ROUND', 'ABS'] as const;
const DATE_PARTS = ['YEAR', 'MONTH', 'DAY'] as const;

function defaultExpr(kind: ComputedExpr['kind']): ComputedExpr {
  switch (kind) {
    case 'arithmetic': return { kind, left: null, op: '+', right: null };
    case 'concat':     return { kind, left: null, sep: ' ', right: null };
    case 'fn':         return { kind, fn: 'UPPER', col: null };
    case 'date_extract': return { kind, part: 'YEAR', col: null };
  }
}

function ColumnSlot({
  slotId, ref: colRef, canvasTables, schemas, onClear,
}: {
  slotId: string;
  ref: ColumnRef | null;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  onClear: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slotId });

  if (colRef) {
    const ct = canvasTables.find((t) => t.id === colRef.tableId);
    const tableLabel = ct ? (schemas[ct.tableName]?.label ?? ct.tableName) : colRef.tableId;
    return (
      <div
        ref={setNodeRef}
        className="flex items-center gap-1 bg-indigo-100 border border-indigo-300 rounded px-1.5 py-1 text-xs font-mono text-indigo-700 min-w-0"
      >
        <span className="truncate flex-1">{tableLabel}.{colRef.columnName}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClear}
          className="text-indigo-400 hover:text-indigo-700 flex-shrink-0"
        >
          <X size={10} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center border-2 border-dashed rounded px-2 py-1.5 text-[10px] transition-colors min-w-0 ${
        isOver
          ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
          : 'border-gray-300 text-gray-400 bg-gray-50'
      }`}
    >
      drop col
    </div>
  );
}

interface Props {
  cc: ComputedColumn;
  canvasTables: CanvasTable[];
  schemas: Record<string, Table>;
  onUpdate: (patch: Partial<Omit<ComputedColumn, 'id'>>) => void;
  onRemove: () => void;
}

export function ComputedColumnRow({ cc, canvasTables, schemas, onUpdate, onRemove }: Props) {
  const slotId = (slot: string) => `comp:${cc.id}:${slot}`;

  function clearSlot(slot: 'left' | 'right' | 'col') {
    const e = cc.expr;
    if ((e.kind === 'arithmetic' || e.kind === 'concat') && (slot === 'left' || slot === 'right')) {
      onUpdate({ expr: { ...e, [slot]: null } });
    } else if ((e.kind === 'fn' || e.kind === 'date_extract') && slot === 'col') {
      onUpdate({ expr: { ...e, col: null } });
    }
  }

  function changeKind(kind: ComputedExpr['kind']) {
    onUpdate({ expr: defaultExpr(kind) });
  }

  const e = cc.expr;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">COMPUTED</span>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>

      <input
        type="text"
        value={cc.alias}
        onChange={(e) => onUpdate({ alias: e.target.value })}
        placeholder="output column name"
        className={SEL}
      />

      <select
        value={e.kind}
        onChange={(ev) => changeKind(ev.target.value as ComputedExpr['kind'])}
        className={SEL}
      >
        {EXPR_KINDS.map((k) => (
          <option key={k.value} value={k.value}>{k.label}</option>
        ))}
      </select>

      {e.kind === 'arithmetic' && (
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <ColumnSlot slotId={slotId('left')} ref={e.left} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('left')} />
          </div>
          <select
            value={e.op}
            onChange={(ev) => onUpdate({ expr: { ...e, op: ev.target.value as typeof e.op } })}
            className="text-xs border border-gray-200 rounded px-1 py-1 bg-white w-8 text-center focus:outline-none flex-shrink-0"
          >
            {ARITH_OPS.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
          <div className="flex-1 min-w-0">
            <ColumnSlot slotId={slotId('right')} ref={e.right} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('right')} />
          </div>
        </div>
      )}

      {e.kind === 'fn' && (
        <div className="flex flex-col gap-1">
          <select
            value={e.fn}
            onChange={(ev) => onUpdate({ expr: { ...e, fn: ev.target.value as typeof e.fn } })}
            className={SEL}
          >
            {FN_OPTIONS.map((fn) => <option key={fn} value={fn}>{fn}( )</option>)}
          </select>
          <ColumnSlot slotId={slotId('col')} ref={e.col} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('col')} />
        </div>
      )}

      {e.kind === 'concat' && (
        <div className="flex flex-col gap-1">
          <ColumnSlot slotId={slotId('left')} ref={e.left} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('left')} />
          <input
            type="text"
            value={e.sep}
            onChange={(ev) => onUpdate({ expr: { ...e, sep: ev.target.value } })}
            placeholder="separator"
            className={SEL}
          />
          <ColumnSlot slotId={slotId('right')} ref={e.right} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('right')} />
        </div>
      )}

      {e.kind === 'date_extract' && (
        <div className="flex flex-col gap-1">
          <select
            value={e.part}
            onChange={(ev) => onUpdate({ expr: { ...e, part: ev.target.value as typeof e.part } })}
            className={SEL}
          >
            {DATE_PARTS.map((p) => <option key={p} value={p}>EXTRACT {p}</option>)}
          </select>
          <ColumnSlot slotId={slotId('col')} ref={e.col} canvasTables={canvasTables} schemas={schemas} onClear={() => clearSlot('col')} />
        </div>
      )}
    </div>
  );
}
