import type { QueryState } from '../types/query';
import type { Condition } from '../types/builder';

export function compileCondition(c: Condition): (state: QueryState) => boolean {
  switch (c.type) {
    case 'tableOnCanvas':
      return (s) => c.tableName
        ? s.canvasTables.some((t) => t.tableName === c.tableName)
        : s.canvasTables.length >= 1;

    case 'tableCount':
      return (s) => s.canvasTables.length >= c.min;

    case 'columnsSelected':
      return (s) => s.canvasTables.some((t) => t.selectedColumns.length >= c.min);

    case 'filterAdded':
      return (s) => s.filters.some(
        (f) => f.column !== '' && (f.value !== '' || f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'),
      );

    case 'joinAdded':
      return (s) => s.joins.length >= 1;

    case 'joinBetween':
      return (s) => s.joins.some((j) => {
        const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
        const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
        return (lt === c.tableA && rt === c.tableB) || (lt === c.tableB && rt === c.tableA);
      });

    case 'groupByAdded':
      return (s) => s.groupBy.some((g) => g.column !== '');

    case 'groupByWithAggregate':
      if (c.aggregate === 'any') return (s) => s.groupBy.some((g) => !!g.aggregate);
      if (c.aggregate === 'COUNT' || c.aggregate === 'COUNT_STAR')
        return (s) => s.groupBy.some((g) => g.aggregate === 'COUNT' || g.aggregate === 'COUNT_STAR');
      return (s) => s.groupBy.some((g) => g.aggregate === c.aggregate);

    case 'orderByAdded':
      return (s) => s.orderBy.length >= 1;

    case 'orderByDesc':
      return (s) => s.orderBy.some((o) => o.direction === 'DESC');
  }
}

export function describeCondition(c: Condition): string {
  switch (c.type) {
    case 'tableOnCanvas':
      return c.tableName ? `Table "${c.tableName}" is on the canvas` : 'Any table is dragged onto the canvas';
    case 'tableCount':
      return `At least ${c.min} table${c.min > 1 ? 's' : ''} on the canvas`;
    case 'columnsSelected':
      return `At least ${c.min} column${c.min > 1 ? 's' : ''} checked on a table`;
    case 'filterAdded':
      return 'A WHERE filter is added and filled in';
    case 'joinAdded':
      return 'Any two tables are joined';
    case 'joinBetween':
      return `Tables "${c.tableA}" and "${c.tableB}" are joined`;
    case 'groupByAdded':
      return 'A GROUP BY column is added';
    case 'groupByWithAggregate':
      return c.aggregate === 'any'
        ? 'A GROUP BY with any aggregate is added'
        : `A GROUP BY with ${c.aggregate} aggregate is added`;
    case 'orderByAdded':
      return 'An ORDER BY is added';
    case 'orderByDesc':
      return 'An ORDER BY DESC is added';
  }
}
