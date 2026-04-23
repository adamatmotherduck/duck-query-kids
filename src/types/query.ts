export type ColumnType = 'string' | 'number' | 'date' | 'boolean';
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
export type FilterOperator =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'LIKE'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'IN';
export type AggregateFunction =
  | 'COUNT'
  | 'COUNT_STAR'
  | 'COUNT_DISTINCT'
  | 'SUM'
  | 'AVG'
  | 'MEDIAN'
  | 'MIN'
  | 'MAX'
  | 'MODE'
  | 'STDDEV'
  | 'STRING_AGG';

export interface Column {
  name: string;
  type: ColumnType;
  foreignKey?: { table: string; column: string };
}

export interface Table {
  name: string;
  label: string;
  description?: string;
  columns: Column[];
}

export interface CanvasTable {
  id: string;
  tableName: string;
  position: { x: number; y: number };
  selectedColumns: string[];
}

export interface JoinCondition {
  leftColumn: string;
  rightColumn: string;
}

export interface Join {
  id: string;
  leftTableId: string;
  rightTableId: string;
  conditions: JoinCondition[];
  joinType: JoinType;
}

export interface Filter {
  id: string;
  tableId: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface GroupByConfig {
  id: string;
  tableId: string;
  column: string;
  aggregate?: AggregateFunction;
  alias?: string;
  stringAggSeparator?: string;
}

export interface OrderByConfig {
  id: string;
  tableId: string;
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface HavingFilter {
  id: string;
  aggregate: AggregateFunction;
  tableId: string;
  column: string;
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
  value: string;
}

export interface QueryState {
  canvasTables: CanvasTable[];
  joins: Join[];
  filters: Filter[];
  groupBy: GroupByConfig[];
  having: HavingFilter[];
  orderBy: OrderByConfig[];
  distinct: boolean;
  limit: number | null;
}

export interface ForeignKeyRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export type QueryRow = Record<string, unknown>;
