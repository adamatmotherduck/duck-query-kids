import type { Dataset } from '../types/dataset';
import type { Table, ForeignKeyRelationship } from '../types/query';

const BASE = `${import.meta.env.BASE_URL}data/imdb/`;

const schema: Table[] = [
  {
    name: 'movies',
    label: 'Movies',
    description: 'Top-rated films from IMDB (50k+ votes)',
    columns: [
      { name: 'movieId',        type: 'string' as const },
      { name: 'title',          type: 'string' as const },
      { name: 'year',           type: 'number' as const },
      { name: 'runtimeMinutes', type: 'number' as const },
      { name: 'averageRating',  type: 'number' as const },
      { name: 'numVotes',       type: 'number' as const },
    ],
  },
  {
    name: 'genres',
    label: 'Genres',
    description: 'Film genre categories (Action, Drama, …)',
    columns: [
      { name: 'genreId', type: 'number' as const },
      { name: 'name',    type: 'string' as const },
    ],
  },
  {
    name: 'movie_genres',
    label: 'Movie Genres',
    description: 'Links each movie to its genre(s)',
    columns: [
      { name: 'movieId', type: 'string' as const, foreignKey: { table: 'movies', column: 'movieId' } },
      { name: 'genreId', type: 'number' as const, foreignKey: { table: 'genres', column: 'genreId' } },
    ],
  },
  {
    name: 'people',
    label: 'People',
    description: 'Directors and other film professionals',
    columns: [
      { name: 'personId',           type: 'string' as const },
      { name: 'name',               type: 'string' as const },
      { name: 'birthYear',          type: 'number' as const },
      { name: 'primaryProfession',  type: 'string' as const },
    ],
  },
  {
    name: 'directors',
    label: 'Directors',
    description: 'Links each movie to its director(s)',
    columns: [
      { name: 'movieId',  type: 'string' as const, foreignKey: { table: 'movies',  column: 'movieId'  } },
      { name: 'personId', type: 'string' as const, foreignKey: { table: 'people',  column: 'personId' } },
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

const csvFiles = ['movies', 'genres', 'movie_genres', 'people', 'directors'].map((name) => ({
  tableName: name,
  filename:  `imdb_${name}.csv`,
  url:       `${BASE}${name}.csv`,
}));

export const IMDB_DATASET: Dataset = {
  id: 'imdb',
  name: 'IMDB Movies',
  emoji: '🎬',
  description: 'Top-rated films, genres, and directors from the IMDB non-commercial dataset.',
  schema,
  foreignKeys,
  csvFiles,
  lessons: [
    {
      id: 'imdb-first-table',
      title: 'Open the Catalog',
      concept: 'FROM',
      description: 'Drag any table from the movie database onto the canvas.',
      hints: ['Try the Movies table — it has ratings and runtime.'],
      check: (s) => s.canvasTables.length >= 1,
    },
    {
      id: 'imdb-pick-columns',
      title: 'Pick Your Columns',
      concept: 'SELECT',
      description: 'Check at least 2 columns to choose what appears in your results.',
      hints: ['Try title and averageRating for a quick leaderboard.'],
      check: (s) => s.canvasTables.some((t) => t.selectedColumns.length >= 2),
    },
    {
      id: 'imdb-filter',
      title: 'Filter Great Films',
      concept: 'WHERE',
      description: 'Add a WHERE filter — for example, show only movies rated above 8.',
      hints: [
        "Click 'Add WHERE filter' in the Clauses panel.",
        'Try: Movies → averageRating > 8.',
      ],
      check: (s) =>
        s.filters.some(
          (f) => f.column !== '' && (f.value !== '' || f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'),
        ),
    },
    {
      id: 'imdb-join',
      title: 'Connect Movies to Genres',
      concept: 'JOIN',
      description: 'Bring Movies, Movie Genres, and Genres together to see each film\'s genre.',
      hints: [
        'Drag Movies and Movie Genres onto the canvas.',
        "'Auto Join' links them via movieId.",
        'Then add Genres and Auto Join via genreId.',
      ],
      check: (s) => {
        const hasMG = s.canvasTables.some((t) => t.tableName === 'movie_genres');
        const joined = s.joins.some((j) => {
          const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
          const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
          return (lt === 'movies' && rt === 'movie_genres') || (lt === 'movie_genres' && rt === 'movies');
        });
        return hasMG && joined;
      },
    },
    {
      id: 'imdb-group',
      title: 'Count Movies per Genre',
      concept: 'GROUP BY + COUNT',
      description: 'Group by genre name and count how many movies belong to each.',
      hints: [
        "Add Movie Genres and Genres to the canvas and join them.",
        "Click 'Add GROUP BY / aggregate' — pick Genres → Name, then add Count All.",
      ],
      check: (s) =>
        s.groupBy.some((g) => g.aggregate === 'COUNT_STAR' || g.aggregate === 'COUNT') &&
        s.groupBy.filter((g) => !g.aggregate && g.column !== '').length >= 1,
    },
    {
      id: 'imdb-order',
      title: 'Sort Your Results',
      concept: 'ORDER BY',
      description: 'Sort so the most common genre (or highest-rated film) appears first.',
      hints: [
        "Click 'Add ORDER BY' in the Clauses panel.",
        'Pick your count or rating column and set direction to DESC.',
      ],
      check: (s) => s.orderBy.length >= 1,
    },
  ],
  projects: [
    {
      id: 'imdb-top-directors',
      title: 'Top Directors by Average Rating',
      description: 'Find which directors consistently make the best-rated movies by joining the full chain: Movies → Directors → People.',
      steps: [
        {
          id: 'id-add-movies',
          title: 'Add Movies',
          description: 'Start with the Movies table — it has ratings and vote counts.',
          hints: ['Drag the Movies table onto the canvas.'],
          check: (s) => s.canvasTables.some((t) => t.tableName === 'movies'),
        },
        {
          id: 'id-join-directors',
          title: 'Join Directors',
          description: 'Each movie has a director recorded in the Directors table. Join it via movieId.',
          hints: [
            'Drag the Directors table onto the canvas.',
            "'Auto Join' between Movies and Directors uses movieId.",
          ],
          check: (s) => {
            const hasDirs = s.canvasTables.some((t) => t.tableName === 'directors');
            const joined = s.joins.some((j) => {
              const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
              const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
              return (lt === 'movies' && rt === 'directors') || (lt === 'directors' && rt === 'movies');
            });
            return hasDirs && joined;
          },
        },
        {
          id: 'id-join-people',
          title: 'Join People',
          description: 'Directors table has personId — join People to get the director\'s name.',
          hints: [
            'Drag the People table onto the canvas.',
            "'Auto Join' between Directors and People uses personId.",
          ],
          check: (s) => {
            const hasPeople = s.canvasTables.some((t) => t.tableName === 'people');
            const joined = s.joins.some((j) => {
              const lt = s.canvasTables.find((t) => t.id === j.leftTableId)?.tableName;
              const rt = s.canvasTables.find((t) => t.id === j.rightTableId)?.tableName;
              return (lt === 'directors' && rt === 'people') || (lt === 'people' && rt === 'directors');
            });
            return hasPeople && joined;
          },
        },
        {
          id: 'id-filter-votes',
          title: 'Filter by Popularity',
          description: 'Ignore obscure films — only keep movies with at least 10,000 votes.',
          hints: [
            "Click 'Add WHERE filter'.",
            'Set Movies → numVotes, operator >=, value 10000.',
          ],
          check: (s) =>
            s.filters.some((f) => f.column === 'numVotes' && f.value !== ''),
        },
        {
          id: 'id-group-director',
          title: 'Group by Director',
          description: 'Add a GROUP BY for the director\'s name and an Average aggregate on averageRating.',
          hints: [
            "Click 'Add GROUP BY / aggregate'.",
            'Add People → name with no aggregate.',
            "Add a second row: Movies → averageRating with 'Average'.",
          ],
          check: (s) =>
            s.groupBy.some((g) => g.aggregate === 'AVG') &&
            s.groupBy.some((g) => !g.aggregate && g.column === 'name' &&
              s.canvasTables.find((t) => t.id === g.tableId)?.tableName === 'people'),
        },
        {
          id: 'id-order-desc',
          title: 'Sort by Rating',
          description: 'Sort descending so the highest-rated director appears first.',
          hints: [
            "Click 'Add ORDER BY', pick your average rating column, and set direction to DESC.",
          ],
          check: (s) => s.orderBy.some((o) => o.direction === 'DESC'),
        },
      ],
    },
  ],
};
