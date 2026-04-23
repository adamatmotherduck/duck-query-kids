export type Condition =
  | { type: 'tableOnCanvas'; tableName: string }
  | { type: 'tableCount'; min: number }
  | { type: 'columnsSelected'; min: number }
  | { type: 'filterAdded' }
  | { type: 'joinAdded' }
  | { type: 'joinBetween'; tableA: string; tableB: string }
  | { type: 'groupByAdded' }
  | { type: 'groupByWithAggregate'; aggregate: 'COUNT' | 'COUNT_STAR' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'any' }
  | { type: 'orderByAdded' }
  | { type: 'orderByDesc' };

export interface CustomLesson {
  id: string;
  datasetId: string;
  title: string;
  concept: string;
  description: string;
  hints: string[];
  condition: Condition;
}

export interface CustomProjectStep {
  id: string;
  title: string;
  description: string;
  hints: string[];
  condition: Condition;
}

export interface CustomProject {
  id: string;
  datasetId: string;
  title: string;
  description: string;
  steps: CustomProjectStep[];
}
