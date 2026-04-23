import type { QueryState } from './query';

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  description: string;
  hints: string[];
  check: (state: QueryState) => boolean;
}
