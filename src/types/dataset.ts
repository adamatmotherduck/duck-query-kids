import type { Table, ForeignKeyRelationship } from './query';
import type { Lesson } from './lesson';
import type { Project } from './project';

export interface CsvFile {
  tableName: string;
  filename: string;
  url: string;
}

export interface Dataset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  schema: Table[];
  foreignKeys: ForeignKeyRelationship[];
  csvFiles: CsvFile[];
  lessons: Lesson[];
  projects: Project[];
}
