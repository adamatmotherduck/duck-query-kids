import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Join, JoinType, JoinCondition, CanvasTable, Table } from '../../types/query';

const JOIN_TYPES: { type: JoinType; label: string; desc: string }[] = [
  { type: 'INNER', label: 'Inner',      desc: 'Matching rows only' },
  { type: 'LEFT',  label: 'Left',       desc: 'All left + matching right' },
  { type: 'RIGHT', label: 'Right',      desc: 'Matching left + all right' },
  { type: 'FULL',  label: 'Full Outer', desc: 'All rows from both' },
];

interface Props {
  join: Join;
  leftTable: CanvasTable;
  rightTable: CanvasTable;
  leftSchema: Table;
  rightSchema: Table;
  onUpdate: (patch: Partial<Omit<Join, 'id'>>) => void;
  onRemove: () => void;
}

export function JoinConnector({ join, leftTable, rightTable, leftSchema, rightSchema, onUpdate, onRemove }: Props) {
  const [open, setOpen] = useState(false);

  const lx = leftTable.position.x + 100;
  const ly = leftTable.position.y + 60;
  const rx = rightTable.position.x + 100;
  const ry = rightTable.position.y + 60;
  const mx = (lx + rx) / 2;
  const my = (ly + ry) / 2;

  const joinInfo = JOIN_TYPES.find((j) => j.type === join.joinType) ?? JOIN_TYPES[0];
  const conditionCount = join.conditions.length;

  function updateCondition(index: number, patch: Partial<JoinCondition>) {
    const updated = join.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onUpdate({ conditions: updated });
  }

  function addCondition() {
    onUpdate({ conditions: [...join.conditions, { leftColumn: '', rightColumn: '' }] });
  }

  function removeCondition(index: number) {
    if (join.conditions.length <= 1) return; // keep at least one
    onUpdate({ conditions: join.conditions.filter((_, i) => i !== index) });
  }

  const badgeLabel = conditionCount > 1
    ? `${joinInfo.label} JOIN (${conditionCount})`
    : `${joinInfo.label} JOIN`;

  return (
    <>
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <line
          x1={lx} y1={ly} x2={rx} y2={ry}
          stroke="#6366f1" strokeWidth={2.5} strokeDasharray="6 3" opacity={0.7}
        />
      </svg>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'absolute', left: mx - 44, top: my - 12, zIndex: 30 }}
        className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow hover:bg-indigo-600 transition-colors whitespace-nowrap"
      >
        {badgeLabel}
      </button>

      {open && (
        <div
          style={{ position: 'absolute', left: mx - 150, top: my + 20, zIndex: 100, width: 310 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-gray-700">Configure Join</span>
            <div className="flex gap-1">
              <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50">Remove</button>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
          </div>

          {/* Condition rows */}
          <div className="flex flex-col gap-2 mb-3">
            {join.conditions.map((cond, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">AND</span>
                )}
                {i === 0 && <span className="w-6 flex-shrink-0" />}
                <select
                  value={cond.leftColumn}
                  onChange={(e) => updateCondition(i, { leftColumn: e.target.value })}
                  className="flex-1 text-xs border rounded px-1.5 py-1 min-w-0"
                >
                  <option value="">({leftSchema.label})</option>
                  {leftSchema.columns.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <span className="text-gray-400 text-xs flex-shrink-0">=</span>
                <select
                  value={cond.rightColumn}
                  onChange={(e) => updateCondition(i, { rightColumn: e.target.value })}
                  className="flex-1 text-xs border rounded px-1.5 py-1 min-w-0"
                >
                  <option value="">({rightSchema.label})</option>
                  {rightSchema.columns.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeCondition(i)}
                  disabled={join.conditions.length <= 1}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-30 flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCondition}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mb-4"
          >
            <Plus size={12} /> Add condition
          </button>

          {/* Join type picker */}
          <div className="grid grid-cols-2 gap-1.5">
            {JOIN_TYPES.map((jt) => (
              <button
                key={jt.type}
                onClick={() => onUpdate({ joinType: jt.type })}
                className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                  join.joinType === jt.type
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="font-bold">{jt.label}</div>
                <div className="text-gray-400">{jt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
