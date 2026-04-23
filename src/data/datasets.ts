import type { Dataset } from '../types/dataset';
import type { ForeignKeyRelationship } from '../types/query';
import { NORTHWIND_DATASET } from './northwind';
import { CHINOOK_DATASET } from './chinook';
import { IMDB_DATASET } from './imdb';

export const ALL_DATASETS: Dataset[] = [
  NORTHWIND_DATASET,
  CHINOOK_DATASET,
  IMDB_DATASET,
];

export function getDataset(id: string): Dataset {
  return ALL_DATASETS.find((d) => d.id === id) ?? ALL_DATASETS[0];
}

export function suggestJoin(
  foreignKeys: ForeignKeyRelationship[],
  tableA: string,
  tableB: string,
): ForeignKeyRelationship | undefined {
  return foreignKeys.find(
    (fk) =>
      (fk.fromTable === tableA && fk.toTable === tableB) ||
      (fk.fromTable === tableB && fk.toTable === tableA),
  );
}
