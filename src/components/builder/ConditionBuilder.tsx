import { X, Plus } from 'lucide-react';
import type { Condition, ConditionGroup } from '../../types/builder';

// ── Single condition row ──────────────────────────────────────────────────────

interface RowProps {
  value: Condition;
  onChange: (c: Condition) => void;
  onRemove?: () => void;
  showRemove: boolean;
}

const CONDITION_TYPES: { value: Condition['type']; label: string }[] = [
  { value: 'tableOnCanvas',        label: 'A table is dragged onto the canvas' },
  { value: 'tableCount',           label: 'N or more tables are on the canvas' },
  { value: 'columnsSelected',      label: 'N or more columns are checked' },
  { value: 'filterAdded',          label: 'A WHERE filter is filled in' },
  { value: 'joinAdded',            label: 'Any two tables are joined' },
  { value: 'joinBetween',          label: 'Two specific tables are joined' },
  { value: 'groupByAdded',         label: 'A GROUP BY column is added' },
  { value: 'groupByWithAggregate', label: 'A GROUP BY with an aggregate is added' },
  { value: 'orderByAdded',         label: 'An ORDER BY is added' },
  { value: 'orderByDesc',          label: 'An ORDER BY DESC is added' },
];

const DEFAULT_CONDITION: Record<Condition['type'], Condition> = {
  tableOnCanvas:        { type: 'tableOnCanvas', tableName: '' },
  tableCount:           { type: 'tableCount', min: 2 },
  columnsSelected:      { type: 'columnsSelected', min: 2 },
  filterAdded:          { type: 'filterAdded' },
  joinAdded:            { type: 'joinAdded' },
  joinBetween:          { type: 'joinBetween', tableA: '', tableB: '' },
  groupByAdded:         { type: 'groupByAdded' },
  groupByWithAggregate: { type: 'groupByWithAggregate', aggregate: 'any' },
  orderByAdded:         { type: 'orderByAdded' },
  orderByDesc:          { type: 'orderByDesc' },
};

const INPUT = 'border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400';
const SELECT = `${INPUT} bg-white`;

function ConditionRow({ value, onChange, onRemove, showRemove }: RowProps) {
  function handleTypeChange(t: Condition['type']) {
    onChange(DEFAULT_CONDITION[t]);
  }

  return (
    <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2">
        <select
          className={`${SELECT} flex-1`}
          value={value.type}
          onChange={(e) => handleTypeChange(e.target.value as Condition['type'])}
        >
          {CONDITION_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {showRemove && (
          <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        )}
      </div>

      {value.type === 'tableOnCanvas' && (
        <input
          className={INPUT}
          placeholder="Table name (blank = any table)"
          value={value.tableName}
          onChange={(e) => onChange({ ...value, tableName: e.target.value })}
        />
      )}

      {value.type === 'tableCount' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Minimum tables:</span>
          <input
            type="number" min={1} max={10}
            className={`${INPUT} w-16`}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      )}

      {value.type === 'columnsSelected' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Minimum columns:</span>
          <input
            type="number" min={1} max={20}
            className={`${INPUT} w-16`}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      )}

      {value.type === 'joinBetween' && (
        <div className="flex gap-2">
          <input
            className={`${INPUT} flex-1`}
            placeholder="Table A (e.g. orders)"
            value={value.tableA}
            onChange={(e) => onChange({ ...value, tableA: e.target.value })}
          />
          <input
            className={`${INPUT} flex-1`}
            placeholder="Table B (e.g. customers)"
            value={value.tableB}
            onChange={(e) => onChange({ ...value, tableB: e.target.value })}
          />
        </div>
      )}

      {value.type === 'groupByWithAggregate' && (
        <select
          className={SELECT}
          value={value.aggregate}
          onChange={(e) => onChange({ ...value, aggregate: e.target.value as typeof value.aggregate })}
        >
          <option value="any">Any aggregate</option>
          <option value="COUNT_STAR">Count All</option>
          <option value="COUNT">Count (non-null)</option>
          <option value="SUM">Sum</option>
          <option value="AVG">Average</option>
          <option value="MIN">Min</option>
          <option value="MAX">Max</option>
        </select>
      )}
    </div>
  );
}

// ── Group editor (exported) ───────────────────────────────────────────────────

interface GroupProps {
  value: ConditionGroup;
  onChange: (g: ConditionGroup) => void;
}

const DEFAULT_NEW_CONDITION: Condition = { type: 'tableOnCanvas', tableName: '' };

export function ConditionGroupBuilder({ value, onChange }: GroupProps) {
  function updateCondition(i: number, c: Condition) {
    const next = [...value.conditions];
    next[i] = c;
    onChange({ ...value, conditions: next });
  }

  function removeCondition(i: number) {
    onChange({ ...value, conditions: value.conditions.filter((_, j) => j !== i) });
  }

  function addCondition() {
    onChange({ ...value, conditions: [...value.conditions, DEFAULT_NEW_CONDITION] });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600">Completion condition</label>
        {value.conditions.length > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400">Complete when</span>
            <select
              className="border border-gray-200 rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-semibold text-indigo-700"
              value={value.operator}
              onChange={(e) => onChange({ ...value, operator: e.target.value as 'all' | 'any' })}
            >
              <option value="all">all are met</option>
              <option value="any">any is met</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {value.conditions.map((c, i) => (
          <ConditionRow
            key={i}
            value={c}
            onChange={(updated) => updateCondition(i, updated)}
            onRemove={() => removeCondition(i)}
            showRemove={value.conditions.length > 1}
          />
        ))}
      </div>

      <button
        onClick={addCondition}
        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium w-fit"
      >
        <Plus size={11} /> Add condition
      </button>
    </div>
  );
}
