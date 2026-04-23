import { useState } from 'react';
import { X } from 'lucide-react';
import type { Join, JoinType, CanvasTable, Table } from '../../types/query';

const JOIN_TYPES: { type: JoinType; label: string; venn: string; desc: string }[] = [
  { type: 'INNER', label: 'Inner',      venn: '⬤⬤',  desc: 'Matching rows only' },
  { type: 'LEFT',  label: 'Left',       venn: '⬤○',  desc: 'All left + matching right' },
  { type: 'RIGHT', label: 'Right',      venn: '○⬤',  desc: 'Matching left + all right' },
  { type: 'FULL',  label: 'Full Outer', venn: '⬤⬤',  desc: 'All rows from both' },
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

  // Compute midpoint between two table cards (rough center of 200px wide cards)
  const lx = leftTable.position.x + 100;
  const ly = leftTable.position.y + 60;
  const rx = rightTable.position.x + 100;
  const ry = rightTable.position.y + 60;
  const mx = (lx + rx) / 2;
  const my = (ly + ry) / 2;

  const joinInfo = JOIN_TYPES.find((j) => j.type === join.joinType) ?? JOIN_TYPES[0];

  return (
    <>
      {/* SVG line drawn on a transparent overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <line
          x1={lx} y1={ly}
          x2={rx} y2={ry}
          stroke="#6366f1"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          opacity={0.7}
        />
      </svg>

      {/* Clickable badge at midpoint */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'absolute', left: mx - 28, top: my - 12, zIndex: 30 }}
        className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow hover:bg-indigo-600 transition-colors whitespace-nowrap"
      >
        {joinInfo.label} JOIN
      </button>

      {/* Join editor popover */}
      {open && (
        <div
          style={{ position: 'absolute', left: mx - 140, top: my + 20, zIndex: 100, width: 280 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-gray-700">Configure Join</span>
            <div className="flex gap-1">
              <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors text-xs px-2 py-1 rounded hover:bg-red-50">Remove</button>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">{leftSchema.label}</label>
              <select
                value={join.leftColumn}
                onChange={(e) => onUpdate({ leftColumn: e.target.value })}
                className="w-full text-xs border rounded px-2 py-1"
              >
                {leftSchema.columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1 text-gray-400 text-xs">=</div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">{rightSchema.label}</label>
              <select
                value={join.rightColumn}
                onChange={(e) => onUpdate({ rightColumn: e.target.value })}
                className="w-full text-xs border rounded px-2 py-1"
              >
                {rightSchema.columns.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

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
