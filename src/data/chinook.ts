import type { Dataset } from '../types/dataset';
import type { ForeignKeyRelationship } from '../types/query';

const BASE = `${import.meta.env.BASE_URL}data/chinook/`;

const schema = [
  {
    name: 'artist',
    label: 'Artists',
    description: 'Music artists and bands',
    columns: [
      { name: 'ArtistId', type: 'number' as const },
      { name: 'Name',     type: 'string' as const },
    ],
  },
  {
    name: 'album',
    label: 'Albums',
    description: 'Albums released by artists',
    columns: [
      { name: 'AlbumId',  type: 'number' as const },
      { name: 'Title',    type: 'string' as const },
      { name: 'ArtistId', type: 'number' as const, foreignKey: { table: 'artist', column: 'ArtistId' } },
    ],
  },
  {
    name: 'track',
    label: 'Tracks',
    description: 'Individual songs on albums',
    columns: [
      { name: 'TrackId',      type: 'number' as const },
      { name: 'Name',         type: 'string' as const },
      { name: 'AlbumId',      type: 'number' as const, foreignKey: { table: 'album',  column: 'AlbumId'  } },
      { name: 'GenreId',      type: 'number' as const, foreignKey: { table: 'genre',  column: 'GenreId'  } },
      { name: 'Composer',     type: 'string' as const },
      { name: 'Milliseconds', type: 'number' as const },
      { name: 'UnitPrice',    type: 'number' as const },
    ],
  },
  {
    name: 'genre',
    label: 'Genres',
    description: 'Music genre categories',
    columns: [
      { name: 'GenreId', type: 'number' as const },
      { name: 'Name',    type: 'string' as const },
    ],
  },
  {
    name: 'customer',
    label: 'Customers',
    description: 'People who bought music',
    columns: [
      { name: 'CustomerId',  type: 'number' as const },
      { name: 'FirstName',   type: 'string' as const },
      { name: 'LastName',    type: 'string' as const },
      { name: 'Company',     type: 'string' as const },
      { name: 'Country',     type: 'string' as const },
      { name: 'Email',       type: 'string' as const },
      { name: 'SupportRepId',type: 'number' as const, foreignKey: { table: 'employee', column: 'EmployeeId' } },
    ],
  },
  {
    name: 'invoice',
    label: 'Invoices',
    description: 'Purchase transactions',
    columns: [
      { name: 'InvoiceId',      type: 'number' as const },
      { name: 'CustomerId',     type: 'number' as const, foreignKey: { table: 'customer', column: 'CustomerId' } },
      { name: 'InvoiceDate',    type: 'date'   as const },
      { name: 'BillingCity',    type: 'string' as const },
      { name: 'BillingCountry', type: 'string' as const },
      { name: 'Total',          type: 'number' as const },
    ],
  },
  {
    name: 'invoice_line',
    label: 'Invoice Lines',
    description: 'Individual tracks on each invoice',
    columns: [
      { name: 'InvoiceLineId', type: 'number' as const },
      { name: 'InvoiceId',     type: 'number' as const, foreignKey: { table: 'invoice', column: 'InvoiceId' } },
      { name: 'TrackId',       type: 'number' as const, foreignKey: { table: 'track',   column: 'TrackId'   } },
      { name: 'UnitPrice',     type: 'number' as const },
      { name: 'Quantity',      type: 'number' as const },
    ],
  },
  {
    name: 'employee',
    label: 'Employees',
    description: 'Support staff who assist customers',
    columns: [
      { name: 'EmployeeId', type: 'number' as const },
      { name: 'LastName',   type: 'string' as const },
      { name: 'FirstName',  type: 'string' as const },
      { name: 'Title',      type: 'string' as const },
      { name: 'ReportsTo',  type: 'number' as const, foreignKey: { table: 'employee', column: 'EmployeeId' } },
    ],
  },
];

const foreignKeys: ForeignKeyRelationship[] = schema.flatMap((t) =>
  t.columns
    .filter((c) => c.foreignKey)
    .map((c) => ({
      fromTable:  t.name,
      fromColumn: c.name,
      toTable:    c.foreignKey!.table,
      toColumn:   c.foreignKey!.column,
    })),
);

const csvFiles = [
  'artist', 'album', 'track', 'genre',
  'customer', 'invoice', 'invoice_line', 'employee',
].map((name) => ({
  tableName: name,
  filename:  `chinook_${name}.csv`,
  url:       `${BASE}${name}.csv`,
}));

export const CHINOOK_DATASET: Dataset = {
  id: 'chinook',
  name: 'Chinook Music Store',
  emoji: '🎵',
  description: 'A digital music store with artists, albums, tracks, and sales data.',
  schema,
  foreignKeys,
  csvFiles,
  lessons: [
    {
      id: 'chinook-first-table',
      title: 'Open the Catalog',
      concept: 'FROM',
      description: 'Drag any table from the music store onto the canvas to start exploring.',
      hints: ['Try dragging the Tracks table — it has all the songs.'],
      check: (s) => s.canvasTables.length >= 1,
    },
    {
      id: 'chinook-pick-columns',
      title: 'Pick Your Columns',
      concept: 'SELECT',
      description: 'Check at least 2 columns on a canvas table to choose what appears in your results.',
      hints: ['Click the checkboxes next to column names on the table card.'],
      check: (s) => s.canvasTables.some((t) => t.selectedColumns.length >= 2),
    },
    {
      id: 'chinook-filter',
      title: 'Filter the Music',
      concept: 'WHERE',
      description: "Add a WHERE filter to narrow results — for example, show only tracks from a specific genre.",
      hints: [
        "Click 'Add WHERE filter' in the Clauses panel.",
        "Try: Tracks → GenreId = 1 (Rock).",
      ],
      check: (s) =>
        s.filters.some(
          (f) => f.column !== '' && (f.value !== '' || f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'),
        ),
    },
    {
      id: 'chinook-join',
      title: 'Connect Artists to Albums',
      concept: 'JOIN',
      description: 'Bring the Artists and Albums tables together to see which artist made each album.',
      hints: [
        'Drag both Artists and Albums onto the canvas.',
        "Click 'Auto Join' — they share ArtistId.",
      ],
      check: (s) => {
        const hasBoth = s.canvasTables.some((t) => t.tableName === 'artist') &&
                        s.canvasTables.some((t) => t.tableName === 'album');
        const joined  = s.joins.some((j) => {
          const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
          const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
          return (lt === 'artist' && rt === 'album') || (lt === 'album' && rt === 'artist');
        });
        return hasBoth && joined;
      },
    },
    {
      id: 'chinook-group',
      title: 'Count Tracks per Genre',
      concept: 'GROUP BY + COUNT',
      description: 'Group by genre name and count how many tracks belong to each one.',
      hints: [
        "Add Genre to the canvas and join it to Tracks.",
        "Click 'Add GROUP BY / aggregate' — pick Genre → Name with no aggregate, then add a second row with Count All.",
      ],
      check: (s) =>
        s.groupBy.some((g) => g.aggregate === 'COUNT_STAR' || g.aggregate === 'COUNT') &&
        s.groupBy.filter((g) => !g.aggregate && g.column !== '').length >= 1,
    },
    {
      id: 'chinook-order',
      title: 'Sort Your Results',
      concept: 'ORDER BY',
      description: 'Sort the results so the most popular genre appears at the top.',
      hints: [
        "Click 'Add ORDER BY' in the Clauses panel.",
        'Choose your count column and set direction to DESC.',
      ],
      check: (s) => s.orderBy.length >= 1,
    },
  ],
  projects: [
    {
      id: 'chinook-top-genres',
      title: 'Top-Selling Genres',
      description: 'Find which music genres bring in the most revenue by joining the full sales chain: Invoice Lines → Tracks → Genres.',
      steps: [
        {
          id: 'cq-add-invoice-line',
          title: 'Add Invoice Lines',
          description: 'Every line item on a sale is a row in Invoice Lines. Start there.',
          hints: ['Drag the Invoice Lines table onto the canvas.'],
          check: (s) => s.canvasTables.some((t) => t.tableName === 'invoice_line'),
        },
        {
          id: 'cq-join-track',
          title: 'Join Tracks',
          description: 'Each invoice line has a TrackId. Join Tracks to find out what song was sold.',
          hints: [
            'Drag the Tracks table onto the canvas.',
            "Click 'Auto Join' between Invoice Lines and Tracks — they share TrackId.",
          ],
          check: (s) => {
            const hasTrack = s.canvasTables.some((t) => t.tableName === 'track');
            const joined = s.joins.some((j) => {
              const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
              const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
              return (lt === 'invoice_line' && rt === 'track') || (lt === 'track' && rt === 'invoice_line');
            });
            return hasTrack && joined;
          },
        },
        {
          id: 'cq-join-genre',
          title: 'Join Genres',
          description: 'Each track belongs to a genre. Join Genres to get the genre name.',
          hints: [
            'Drag the Genres table onto the canvas.',
            "Click 'Auto Join' between Tracks and Genres — they share GenreId.",
          ],
          check: (s) => {
            const hasGenre = s.canvasTables.some((t) => t.tableName === 'genre');
            const joined = s.joins.some((j) => {
              const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
              const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
              return (lt === 'track' && rt === 'genre') || (lt === 'genre' && rt === 'track');
            });
            return hasGenre && joined;
          },
        },
        {
          id: 'cq-group-genre',
          title: 'Group by Genre',
          description: 'Add a GROUP BY for genre name and a Count All aggregate to count sales per genre.',
          hints: [
            "Click 'Add GROUP BY / aggregate' in the Clauses panel.",
            'Add Genres → Name with no aggregate, then add a second row with Count All.',
          ],
          check: (s) =>
            s.groupBy.some((g) => g.aggregate === 'COUNT_STAR' || g.aggregate === 'COUNT') &&
            s.groupBy.some((g) => !g.aggregate && g.column === 'Name' &&
              s.canvasTables.find((t) => t.id === g.tableId)?.tableName === 'genre'),
        },
        {
          id: 'cq-order-desc',
          title: 'Sort by Sales',
          description: 'Sort descending so the top genre appears first.',
          hints: [
            "Click 'Add ORDER BY', pick your count column, and set direction to DESC.",
          ],
          check: (s) => s.orderBy.some((o) => o.direction === 'DESC'),
        },
      ],
    },
  ],
};
