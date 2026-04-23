import type { Condition } from '../../types/builder';

interface Props {
  value: Condition;
  onChange: (c: Condition) => void;
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

const INPUT = 'border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-400';
const SELECT = `${INPUT} bg-white`;

export function ConditionBuilder({ value, onChange }: Props) {
  function handleTypeChange(t: Condition['type']) {
    onChange(DEFAULT_CONDITION[t]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">When is this complete?</label>
        <select className={SELECT} value={value.type} onChange={(e) => handleTypeChange(e.target.value as Condition['type'])}>
          {CONDITION_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {value.type === 'tableOnCanvas' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Table name <span className="font-normal text-gray-400">(leave blank for any table)</span>
          </label>
          <input
            className={INPUT}
            placeholder="e.g. customers"
            value={value.tableName}
            onChange={(e) => onChange({ ...value, tableName: e.target.value })}
          />
        </div>
      )}

      {value.type === 'tableCount' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Minimum number of tables</label>
          <input
            type="number" min={1} max={10}
            className={INPUT}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      )}

      {value.type === 'columnsSelected' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Minimum number of checked columns</label>
          <input
            type="number" min={1} max={20}
            className={INPUT}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      )}

      {value.type === 'joinBetween' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Table A</label>
            <input
              className={INPUT}
              placeholder="e.g. orders"
              value={value.tableA}
              onChange={(e) => onChange({ ...value, tableA: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Table B</label>
            <input
              className={INPUT}
              placeholder="e.g. customers"
              value={value.tableB}
              onChange={(e) => onChange({ ...value, tableB: e.target.value })}
            />
          </div>
        </div>
      )}

      {value.type === 'groupByWithAggregate' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Aggregate function</label>
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
        </div>
      )}
    </div>
  );
}
