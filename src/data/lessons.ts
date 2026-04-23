import type { Lesson } from '../types/lesson';

export const LESSONS: Lesson[] = [
  {
    id: 'first-table',
    title: 'Your First Table',
    concept: 'FROM',
    description: 'Every SQL query starts with a table. Drag any table from the panel on the left onto the canvas.',
    hints: [
      'Look at the Tables panel on the left.',
      'Click and hold a table card, then drag it into the large canvas area.',
    ],
    check: (s) => s.canvasTables.length >= 1,
  },
  {
    id: 'pick-columns',
    title: 'Pick Your Columns',
    concept: 'SELECT',
    description: 'SELECT controls which columns appear in your results. Check at least 2 columns on a canvas table.',
    hints: [
      'Click the checkboxes next to column names on the table card on the canvas.',
      'Try selecting companyName and country from Customers.',
    ],
    check: (s) => s.canvasTables.some((t) => t.selectedColumns.length >= 2),
  },
  {
    id: 'filter-rows',
    title: 'Filter Your Data',
    concept: 'WHERE',
    description: 'WHERE lets you keep only rows that match a condition. Add a filter in the Clauses panel.',
    hints: [
      'Click "Add WHERE filter" at the bottom of the screen.',
      "Try: Customers → country = Germany (use a string column and the = operator).",
    ],
    check: (s) =>
      s.filters.some(
        (f) =>
          f.column !== '' &&
          (f.value !== '' || f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'),
      ),
  },
  {
    id: 'join-tables',
    title: 'Join Two Tables',
    concept: 'JOIN',
    description: 'A JOIN combines rows from two tables using a shared column. Put two tables on the canvas and connect them.',
    hints: [
      'Drag a second table onto the canvas.',
      'Click the "Auto Join" button that appears between the two tables.',
    ],
    check: (s) => s.joins.length >= 1 && s.canvasTables.length >= 2,
  },
  {
    id: 'group-count',
    title: 'Count Your Groups',
    concept: 'GROUP BY + COUNT',
    description: 'GROUP BY collapses rows that share the same value into one row. Add a GROUP BY with a COUNT aggregate.',
    hints: [
      'Click "Add GROUP BY / aggregate" in the Clauses panel.',
      'Pick a column to group by, then choose "Count All" as the aggregate function.',
    ],
    check: (s) =>
      s.groupBy.some(
        (g) => g.aggregate === 'COUNT_STAR' || g.aggregate === 'COUNT' || g.aggregate === 'COUNT_DISTINCT',
      ),
  },
  {
    id: 'order-results',
    title: 'Sort Your Results',
    concept: 'ORDER BY',
    description: 'ORDER BY sorts your results — largest to smallest, newest to oldest, or A to Z.',
    hints: [
      'Hover a column name on a canvas table and click the ↕ button that appears.',
      'Or click "Add ORDER BY" in the Clauses panel.',
    ],
    check: (s) => s.orderBy.length >= 1,
  },
];
