import type {
  QueryState,
  Table,
  CanvasTable,
  Join,
  Filter,
  GroupByConfig,
  HavingFilter,
  OrderByConfig,
  FilterOperator,
  AggregateFunction,
  ColumnType,
} from '../types/query';


function buildAliasMap(canvasTables: CanvasTable[]): Map<string, string> {
  const aliasMap = new Map<string, string>();
  const usedAliases = new Map<string, number>();

  for (const ct of canvasTables) {
    const words = ct.tableName.split('_');
    const baseAlias = words.map((w) => w[0]).join('').toLowerCase();
    const count = usedAliases.get(baseAlias) ?? 0;
    usedAliases.set(baseAlias, count + 1);
    aliasMap.set(ct.id, count === 0 ? baseAlias : `${baseAlias}${count + 1}`);
  }
  return aliasMap;
}

function getColumnType(
  tableId: string,
  columnName: string,
  canvasTables: CanvasTable[],
  tablesByName: Map<string, Table>,
): ColumnType {
  const ct = canvasTables.find((t) => t.id === tableId);
  if (!ct) return 'string';
  const col = tablesByName.get(ct.tableName)?.columns.find((c) => c.name === columnName);
  return col?.type ?? 'string';
}

function renderFilterValue(
  operator: FilterOperator,
  value: string,
  colType: ColumnType,
): string {
  if (operator === 'IS NULL' || operator === 'IS NOT NULL') return '';
  if (operator === 'IN') {
    const parts = value.split(',').map((v) => v.trim()).filter(Boolean);
    const rendered = parts.map((p) => (colType === 'number' ? p : `'${p.replace(/'/g, "''")}'`));
    return `(${rendered.join(', ')})`;
  }
  if (colType === 'number') return value;
  return `'${value.replace(/'/g, "''")}'`;
}

export function renderAggregate(
  agg: AggregateFunction,
  qualifiedCol: string,
  separator = ', ',
): string {
  switch (agg) {
    case 'COUNT_STAR':     return 'COUNT(*)';
    case 'COUNT_DISTINCT': return `COUNT(DISTINCT ${qualifiedCol})`;
    case 'STRING_AGG':     return `STRING_AGG(${qualifiedCol}, '${separator}')`;
    default:               return `${agg}(${qualifiedCol})`;
  }
}

function buildSelectClause(
  canvasTables: CanvasTable[],
  groupBy: GroupByConfig[],
  distinct: boolean,
  aliasMap: Map<string, string>,
): string {
  const prefix = distinct ? 'SELECT DISTINCT' : 'SELECT';
  const terms: string[] = [];

  if (groupBy.length > 0) {
    for (const g of groupBy) {
      const alias = aliasMap.get(g.tableId) ?? g.tableId;
      const qcol = `${alias}.${g.column}`;
      if (g.aggregate) {
        const expr = renderAggregate(g.aggregate, qcol, g.stringAggSeparator);
        const outAlias = g.alias ?? `${g.aggregate.toLowerCase()}_${g.column}`;
        terms.push(`${expr} AS ${outAlias}`);
      } else {
        terms.push(g.alias ? `${qcol} AS ${g.alias}` : qcol);
      }
    }
  } else {
    for (const ct of canvasTables) {
      if (ct.selectedColumns.length === 0) continue;
      const alias = aliasMap.get(ct.id) ?? ct.id;
      for (const col of ct.selectedColumns) {
        terms.push(`${alias}.${col}`);
      }
    }
    if (terms.length === 0) {
      for (const ct of canvasTables) {
        terms.push(`${aliasMap.get(ct.id) ?? ct.id}.*`);
      }
    }
  }

  return `${prefix}\n  ${terms.join(',\n  ')}`;
}

function buildFromClause(
  canvasTables: CanvasTable[],
  joins: Join[],
  aliasMap: Map<string, string>,
): string {
  if (canvasTables.length === 0) return '';
  const [anchor, ...rest] = canvasTables;
  const anchorAlias = aliasMap.get(anchor.id) ?? anchor.id;
  let sql = `FROM ${anchor.tableName} AS ${anchorAlias}`;

  const introduced = new Set<string>([anchor.id]);
  const pending = [...joins];
  let stall = 0;

  while (pending.length > 0) {
    const before = pending.length;
    for (let i = pending.length - 1; i >= 0; i--) {
      const j = pending[i];
      const leftIn = introduced.has(j.leftTableId);
      const rightIn = introduced.has(j.rightTableId);
      if (!leftIn && !rightIn) continue;

      const newId = leftIn ? j.rightTableId : j.leftTableId;
      const newTable = canvasTables.find((ct) => ct.id === newId);
      if (!newTable) { pending.splice(i, 1); continue; }

      const newAlias = aliasMap.get(newId) ?? newId;
      const lAlias = aliasMap.get(j.leftTableId) ?? j.leftTableId;
      const rAlias = aliasMap.get(j.rightTableId) ?? j.rightTableId;
      const kw = j.joinType === 'INNER' ? 'INNER JOIN'
               : j.joinType === 'LEFT'  ? 'LEFT JOIN'
               : j.joinType === 'RIGHT' ? 'RIGHT JOIN'
               : 'FULL OUTER JOIN';

      sql += `\n${kw} ${newTable.tableName} AS ${newAlias}\n  ON ${lAlias}.${j.leftColumn} = ${rAlias}.${j.rightColumn}`;
      introduced.add(newId);
      pending.splice(i, 1);
    }
    if (pending.length === before && ++stall > 2) break;
    else if (pending.length < before) stall = 0;
  }

  for (const ct of rest) {
    if (!introduced.has(ct.id)) {
      sql += `\nCROSS JOIN ${ct.tableName} AS ${aliasMap.get(ct.id) ?? ct.id}`;
    }
  }
  return sql;
}

function buildWhereClause(
  filters: Filter[],
  canvasTables: CanvasTable[],
  tablesByName: Map<string, Table>,
  aliasMap: Map<string, string>,
): string {
  if (filters.length === 0) return '';
  const predicates = filters.map((f) => {
    const alias = aliasMap.get(f.tableId) ?? f.tableId;
    const colType = getColumnType(f.tableId, f.column, canvasTables, tablesByName);
    const lhs = `${alias}.${f.column}`;
    if (f.operator === 'IS NULL' || f.operator === 'IS NOT NULL') return `${lhs} ${f.operator}`;
    const rhs = renderFilterValue(f.operator, f.value, colType);
    return f.operator === 'IN' ? `${lhs} IN ${rhs}` : `${lhs} ${f.operator} ${rhs}`;
  });
  return predicates.length === 1
    ? `WHERE ${predicates[0]}`
    : `WHERE\n  ${predicates.join('\n  AND ')}`;
}

function buildGroupByClause(
  groupBy: GroupByConfig[],
  aliasMap: Map<string, string>,
): string {
  const keys = groupBy
    .filter((g) => !g.aggregate)
    .map((g) => `${aliasMap.get(g.tableId) ?? g.tableId}.${g.column}`);
  return keys.length ? `GROUP BY\n  ${keys.join(',\n  ')}` : '';
}

function buildHavingClause(
  having: HavingFilter[],
  aliasMap: Map<string, string>,
): string {
  if (having.length === 0) return '';
  const predicates = having.map((h) => {
    const alias = aliasMap.get(h.tableId) ?? h.tableId;
    const qcol = `${alias}.${h.column}`;
    const expr = renderAggregate(h.aggregate, qcol);
    return `${expr} ${h.operator} ${h.value}`;
  });
  return predicates.length === 1
    ? `HAVING ${predicates[0]}`
    : `HAVING\n  ${predicates.join('\n  AND ')}`;
}

function buildOrderByClause(
  orderBy: OrderByConfig[],
  groupBy: GroupByConfig[],
  aliasMap: Map<string, string>,
): string {
  if (orderBy.length === 0) return '';
  const terms = orderBy.map((o) => {
    // If this column is an aggregate output, use its alias
    const aggConfig = groupBy.find((g) => g.tableId === o.tableId && g.column === o.column && g.aggregate);
    if (aggConfig) {
      const outAlias = aggConfig.alias ?? `${aggConfig.aggregate!.toLowerCase()}_${aggConfig.column}`;
      return `${outAlias} ${o.direction}`;
    }
    const alias = aliasMap.get(o.tableId) ?? o.tableId;
    return `${alias}.${o.column} ${o.direction}`;
  });
  return `ORDER BY\n  ${terms.join(',\n  ')}`;
}

export function generateSQL(state: QueryState, schema: Table[]): string {
  const { canvasTables, joins, filters, groupBy, having, orderBy, distinct, limit } = state;
  if (canvasTables.length === 0) return '';

  const tablesByName = new Map(schema.map((t) => [t.name, t]));
  const aliasMap = buildAliasMap(canvasTables);

  const clauses = [
    buildSelectClause(canvasTables, groupBy, distinct, aliasMap),
    buildFromClause(canvasTables, joins, aliasMap),
    buildWhereClause(filters, canvasTables, tablesByName, aliasMap),
    buildGroupByClause(groupBy, aliasMap),
    buildHavingClause(having, aliasMap),
    buildOrderByClause(orderBy, groupBy, aliasMap),
    limit !== null ? `LIMIT ${limit}` : 'LIMIT 100',
  ].filter(Boolean);

  return clauses.join('\n');
}
