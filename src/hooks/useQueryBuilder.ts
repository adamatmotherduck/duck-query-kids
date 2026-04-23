import { useReducer, useCallback } from 'react';
import type {
  QueryState,
  CanvasTable,
  Join,
  Filter,
  GroupByConfig,
  HavingFilter,
  OrderByConfig,
  JoinType,
  FilterOperator,
  AggregateFunction,
} from '../types/query';

const initialState: QueryState = {
  canvasTables: [],
  joins: [],
  filters: [],
  groupBy: [],
  having: [],
  orderBy: [],
  distinct: false,
  limit: 100,
};

type Action =
  | { type: 'DROP_TABLE'; tableName: string; position: { x: number; y: number } }
  | { type: 'REMOVE_TABLE'; id: string }
  | { type: 'MOVE_TABLE'; id: string; position: { x: number; y: number } }
  | { type: 'TOGGLE_COLUMN'; tableId: string; column: string }
  | { type: 'ADD_JOIN'; leftTableId: string; leftColumn: string; rightTableId: string; rightColumn: string; joinType: JoinType }
  | { type: 'UPDATE_JOIN'; id: string; patch: Partial<Omit<Join, 'id'>> }
  | { type: 'REMOVE_JOIN'; id: string }
  | { type: 'ADD_FILTER' }
  | { type: 'UPDATE_FILTER'; id: string; patch: Partial<Omit<Filter, 'id'>> }
  | { type: 'REMOVE_FILTER'; id: string }
  | { type: 'ADD_GROUP_BY' }
  | { type: 'UPDATE_GROUP_BY'; id: string; patch: Partial<Omit<GroupByConfig, 'id'>> }
  | { type: 'REMOVE_GROUP_BY'; id: string }
  | { type: 'ADD_HAVING' }
  | { type: 'UPDATE_HAVING'; id: string; patch: Partial<Omit<HavingFilter, 'id'>> }
  | { type: 'REMOVE_HAVING'; id: string }
  | { type: 'ADD_ORDER_BY'; tableId: string; column: string }
  | { type: 'UPDATE_ORDER_BY'; id: string; patch: Partial<Omit<OrderByConfig, 'id'>> }
  | { type: 'REMOVE_ORDER_BY'; id: string }
  | { type: 'SET_DISTINCT'; distinct: boolean }
  | { type: 'SET_LIMIT'; limit: number | null }
  | { type: 'RESET' };

function uid(): string {
  return crypto.randomUUID();
}

function reducer(state: QueryState, action: Action): QueryState {
  switch (action.type) {
    case 'DROP_TABLE': {
      const newTable: CanvasTable = {
        id: uid(),
        tableName: action.tableName,
        position: action.position,
        selectedColumns: [],
      };
      return { ...state, canvasTables: [...state.canvasTables, newTable] };
    }
    case 'REMOVE_TABLE': {
      const id = action.id;
      return {
        ...state,
        canvasTables: state.canvasTables.filter((t) => t.id !== id),
        joins: state.joins.filter((j) => j.leftTableId !== id && j.rightTableId !== id),
        filters: state.filters.filter((f) => f.tableId !== id),
        groupBy: state.groupBy.filter((g) => g.tableId !== id),
        having: state.having.filter((h) => h.tableId !== id),
        orderBy: state.orderBy.filter((o) => o.tableId !== id),
      };
    }
    case 'MOVE_TABLE':
      return {
        ...state,
        canvasTables: state.canvasTables.map((t) =>
          t.id === action.id ? { ...t, position: action.position } : t,
        ),
      };
    case 'TOGGLE_COLUMN':
      return {
        ...state,
        canvasTables: state.canvasTables.map((t) => {
          if (t.id !== action.tableId) return t;
          const has = t.selectedColumns.includes(action.column);
          return {
            ...t,
            selectedColumns: has
              ? t.selectedColumns.filter((c) => c !== action.column)
              : [...t.selectedColumns, action.column],
          };
        }),
      };
    case 'ADD_JOIN': {
      const existing = state.joins.find(
        (j) =>
          (j.leftTableId === action.leftTableId && j.rightTableId === action.rightTableId) ||
          (j.leftTableId === action.rightTableId && j.rightTableId === action.leftTableId),
      );
      if (existing) return state;
      const newJoin: Join = {
        id: uid(),
        leftTableId: action.leftTableId,
        leftColumn: action.leftColumn,
        rightTableId: action.rightTableId,
        rightColumn: action.rightColumn,
        joinType: action.joinType,
      };
      return { ...state, joins: [...state.joins, newJoin] };
    }
    case 'UPDATE_JOIN':
      return {
        ...state,
        joins: state.joins.map((j) => (j.id === action.id ? { ...j, ...action.patch } : j)),
      };
    case 'REMOVE_JOIN':
      return { ...state, joins: state.joins.filter((j) => j.id !== action.id) };
    case 'ADD_FILTER': {
      const firstTable = state.canvasTables[0];
      if (!firstTable) return state;
      const newFilter: Filter = {
        id: uid(),
        tableId: firstTable.id,
        column: '',
        operator: '=' as FilterOperator,
        value: '',
      };
      return { ...state, filters: [...state.filters, newFilter] };
    }
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: state.filters.map((f) => (f.id === action.id ? { ...f, ...action.patch } : f)),
      };
    case 'REMOVE_FILTER':
      return { ...state, filters: state.filters.filter((f) => f.id !== action.id) };
    case 'ADD_GROUP_BY': {
      const firstTable = state.canvasTables[0];
      if (!firstTable) return state;
      const newG: GroupByConfig = { id: uid(), tableId: firstTable.id, column: '' };
      return { ...state, groupBy: [...state.groupBy, newG] };
    }
    case 'UPDATE_GROUP_BY':
      return {
        ...state,
        groupBy: state.groupBy.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)),
      };
    case 'REMOVE_GROUP_BY':
      return { ...state, groupBy: state.groupBy.filter((g) => g.id !== action.id) };
    case 'ADD_HAVING': {
      const firstTable = state.canvasTables[0];
      if (!firstTable) return state;
      const newH: HavingFilter = {
        id: uid(),
        aggregate: 'COUNT_STAR' as AggregateFunction,
        tableId: firstTable.id,
        column: '',
        operator: '>',
        value: '0',
      };
      return { ...state, having: [...state.having, newH] };
    }
    case 'UPDATE_HAVING':
      return {
        ...state,
        having: state.having.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)),
      };
    case 'REMOVE_HAVING':
      return { ...state, having: state.having.filter((h) => h.id !== action.id) };
    case 'ADD_ORDER_BY': {
      const newO: OrderByConfig = { id: uid(), tableId: action.tableId, column: action.column, direction: 'ASC' };
      return { ...state, orderBy: [...state.orderBy, newO] };
    }
    case 'UPDATE_ORDER_BY':
      return {
        ...state,
        orderBy: state.orderBy.map((o) => (o.id === action.id ? { ...o, ...action.patch } : o)),
      };
    case 'REMOVE_ORDER_BY':
      return { ...state, orderBy: state.orderBy.filter((o) => o.id !== action.id) };
    case 'SET_DISTINCT':
      return { ...state, distinct: action.distinct };
    case 'SET_LIMIT':
      return { ...state, limit: action.limit };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useQueryBuilder() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dropTable = useCallback((tableName: string, position: { x: number; y: number }) =>
    dispatch({ type: 'DROP_TABLE', tableName, position }), []);
  const removeTable = useCallback((id: string) => dispatch({ type: 'REMOVE_TABLE', id }), []);
  const moveTable = useCallback((id: string, position: { x: number; y: number }) =>
    dispatch({ type: 'MOVE_TABLE', id, position }), []);
  const toggleColumn = useCallback((tableId: string, column: string) =>
    dispatch({ type: 'TOGGLE_COLUMN', tableId, column }), []);
  const addJoin = useCallback((
    leftTableId: string, leftColumn: string,
    rightTableId: string, rightColumn: string,
    joinType: JoinType = 'INNER',
  ) => dispatch({ type: 'ADD_JOIN', leftTableId, leftColumn, rightTableId, rightColumn, joinType }), []);
  const updateJoin = useCallback((id: string, patch: Partial<Omit<Join, 'id'>>) =>
    dispatch({ type: 'UPDATE_JOIN', id, patch }), []);
  const removeJoin = useCallback((id: string) => dispatch({ type: 'REMOVE_JOIN', id }), []);
  const addFilter = useCallback(() => dispatch({ type: 'ADD_FILTER' }), []);
  const updateFilter = useCallback((id: string, patch: Partial<Omit<Filter, 'id'>>) =>
    dispatch({ type: 'UPDATE_FILTER', id, patch }), []);
  const removeFilter = useCallback((id: string) => dispatch({ type: 'REMOVE_FILTER', id }), []);
  const addGroupBy = useCallback(() => dispatch({ type: 'ADD_GROUP_BY' }), []);
  const updateGroupBy = useCallback((id: string, patch: Partial<Omit<GroupByConfig, 'id'>>) =>
    dispatch({ type: 'UPDATE_GROUP_BY', id, patch }), []);
  const removeGroupBy = useCallback((id: string) => dispatch({ type: 'REMOVE_GROUP_BY', id }), []);
  const addHaving = useCallback(() => dispatch({ type: 'ADD_HAVING' }), []);
  const updateHaving = useCallback((id: string, patch: Partial<Omit<HavingFilter, 'id'>>) =>
    dispatch({ type: 'UPDATE_HAVING', id, patch }), []);
  const removeHaving = useCallback((id: string) => dispatch({ type: 'REMOVE_HAVING', id }), []);
  const addOrderBy = useCallback((tableId: string, column: string) =>
    dispatch({ type: 'ADD_ORDER_BY', tableId, column }), []);
  const updateOrderBy = useCallback((id: string, patch: Partial<Omit<OrderByConfig, 'id'>>) =>
    dispatch({ type: 'UPDATE_ORDER_BY', id, patch }), []);
  const removeOrderBy = useCallback((id: string) => dispatch({ type: 'REMOVE_ORDER_BY', id }), []);
  const setDistinct = useCallback((distinct: boolean) => dispatch({ type: 'SET_DISTINCT', distinct }), []);
  const setLimit = useCallback((limit: number | null) => dispatch({ type: 'SET_LIMIT', limit }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    dropTable, removeTable, moveTable, toggleColumn,
    addJoin, updateJoin, removeJoin,
    addFilter, updateFilter, removeFilter,
    addGroupBy, updateGroupBy, removeGroupBy,
    addHaving, updateHaving, removeHaving,
    addOrderBy, updateOrderBy, removeOrderBy,
    setDistinct, setLimit, reset,
  };
}
