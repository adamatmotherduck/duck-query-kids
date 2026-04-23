import type { QueryState } from './query';

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  hints: string[];
  check: (state: QueryState) => boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  steps: ProjectStep[];
}
