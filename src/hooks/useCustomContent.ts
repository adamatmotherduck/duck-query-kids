import { useState, useCallback } from 'react';
import type { CustomLesson, CustomProject, Condition, ConditionGroup } from '../types/builder';

function migrateCondition(item: Record<string, unknown>): ConditionGroup {
  if (item['conditionGroup']) return item['conditionGroup'] as ConditionGroup;
  // Legacy: single `condition` field
  if (item['condition']) return { operator: 'all', conditions: [item['condition'] as Condition] };
  return { operator: 'all', conditions: [] };
}

function migrateLesson(raw: Record<string, unknown>): CustomLesson {
  return { ...(raw as unknown as CustomLesson), conditionGroup: migrateCondition(raw) };
}

function migrateStep(raw: Record<string, unknown>) {
  return { ...(raw as unknown as CustomLesson), conditionGroup: migrateCondition(raw) };
}

function migrateProject(raw: Record<string, unknown>): CustomProject {
  const steps = ((raw['steps'] ?? []) as Record<string, unknown>[]).map(migrateStep);
  return { ...(raw as unknown as CustomProject), steps } as CustomProject;
}

const LESSONS_KEY = 'duck-query-kids-custom-lessons';
const PROJECTS_KEY = 'duck-query-kids-custom-projects';

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export interface ContentBundle {
  version: number;
  exportedAt: string;
  lessons: CustomLesson[];
  projects: CustomProject[];
}

function isContentBundle(data: unknown): data is ContentBundle {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d['lessons']) && Array.isArray(d['projects']);
}

export function useCustomContent() {
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>(() =>
    load<Record<string, unknown>>(LESSONS_KEY).map(migrateLesson),
  );
  const [customProjects, setCustomProjects] = useState<CustomProject[]>(() =>
    load<Record<string, unknown>>(PROJECTS_KEY).map(migrateProject),
  );

  const saveLesson = useCallback((lesson: CustomLesson) => {
    setCustomLessons((prev) => {
      const exists = prev.findIndex((l) => l.id === lesson.id);
      const next = exists >= 0
        ? prev.map((l) => (l.id === lesson.id ? lesson : l))
        : [...prev, lesson];
      persist(LESSONS_KEY, next);
      return next;
    });
  }, []);

  const deleteLesson = useCallback((id: string) => {
    setCustomLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      persist(LESSONS_KEY, next);
      return next;
    });
  }, []);

  const saveProject = useCallback((project: CustomProject) => {
    setCustomProjects((prev) => {
      const exists = prev.findIndex((p) => p.id === project.id);
      const next = exists >= 0
        ? prev.map((p) => (p.id === project.id ? project : p))
        : [...prev, project];
      persist(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setCustomProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  // Upsert-merge imported content (matching IDs are overwritten, new IDs are added)
  const importBundle = useCallback((bundle: ContentBundle) => {
    setCustomLessons((prev) => {
      const map = new Map(prev.map((l) => [l.id, l]));
      bundle.lessons
        .map((l) => migrateLesson(l as unknown as Record<string, unknown>))
        .forEach((l) => map.set(l.id, l));
      const next = [...map.values()];
      persist(LESSONS_KEY, next);
      return next;
    });
    setCustomProjects((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      bundle.projects
        .map((p) => migrateProject(p as unknown as Record<string, unknown>))
        .forEach((p) => map.set(p.id, p));
      const next = [...map.values()];
      persist(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  return {
    customLessons, customProjects,
    saveLesson, deleteLesson,
    saveProject, deleteProject,
    importBundle, isContentBundle,
  };
}

export { isContentBundle };
