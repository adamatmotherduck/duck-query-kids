import { useState, useCallback } from 'react';
import type { CustomLesson, CustomProject } from '../types/builder';

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

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function useCustomContent() {
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>(() => load<CustomLesson>(LESSONS_KEY));
  const [customProjects, setCustomProjects] = useState<CustomProject[]>(() => load<CustomProject>(PROJECTS_KEY));

  const saveLesson = useCallback((lesson: CustomLesson) => {
    setCustomLessons((prev) => {
      const exists = prev.findIndex((l) => l.id === lesson.id);
      const next = exists >= 0
        ? prev.map((l) => (l.id === lesson.id ? lesson : l))
        : [...prev, lesson];
      save(LESSONS_KEY, next);
      return next;
    });
  }, []);

  const deleteLesson = useCallback((id: string) => {
    setCustomLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      save(LESSONS_KEY, next);
      return next;
    });
  }, []);

  const saveProject = useCallback((project: CustomProject) => {
    setCustomProjects((prev) => {
      const exists = prev.findIndex((p) => p.id === project.id);
      const next = exists >= 0
        ? prev.map((p) => (p.id === project.id ? project : p))
        : [...prev, project];
      save(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setCustomProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(PROJECTS_KEY, next);
      return next;
    });
  }, []);

  return { customLessons, customProjects, saveLesson, deleteLesson, saveProject, deleteProject };
}
