# DuckQuery Kids 🦆

A Scratch-style visual SQL query builder that runs entirely in your browser — no server, no setup, no SQL experience required.

**[Try it live →](https://adammotherduckai.github.io/duck-query-kids/)**

![DuckQuery Kids screenshot](src/assets/hero.png)

## What it is

DuckQuery Kids lets you build real SQL queries by dragging and dropping — like building with blocks. Under the hood it runs [DuckDB WASM](https://duckdb.org/docs/api/wasm/overview), so queries execute locally in milliseconds against the classic [Northwind](https://github.com/graphql-compose/graphql-compose-examples/tree/master/examples/northwind/data/csv) dataset.

## Features

- **Drag-and-drop canvas** — drop tables from the sidebar onto the canvas, move them around
- **Visual column selection** — check the columns you want in your SELECT
- **JOIN builder** — auto-detect FK relationships or configure conditions manually; supports INNER, LEFT, RIGHT, FULL OUTER
- **Clause strips** — WHERE filters, GROUP BY + aggregates, HAVING, ORDER BY, DISTINCT, LIMIT — all configured without writing SQL
- **Live SQL preview** — see the SQL your blocks generate in real time, with a one-click Copy button
- **Query plan** — inspect the DuckDB execution plan for any query
- **Lessons** — six guided exercises teach FROM → SELECT → WHERE → JOIN → GROUP BY → ORDER BY, with progressive hints and localStorage-persisted progress
- **Column type badges** — colored `text` / `num` / `date` / `bool` pills on every column

## Dataset

Northwind is a sample trading-company database: customers, orders, order lines, products, categories, and employees — all pre-loaded, no download required.

## Running locally

```bash
npm install
npm run dev
```

Requires Node 18+. The app needs `Cross-Origin-Opener-Policy: same-origin` headers for SharedArrayBuffer (used by DuckDB WASM) — the dev server sets these automatically.

## Tech stack

| | |
|---|---|
| Query engine | [DuckDB WASM](https://duckdb.org/docs/api/wasm/overview) |
| UI | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Drag and drop | [@dnd-kit](https://dndkit.com) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Build | [Vite](https://vitejs.dev) |
