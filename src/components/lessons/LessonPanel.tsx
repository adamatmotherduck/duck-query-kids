import { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight, Lightbulb } from 'lucide-react';
import type { QueryState } from '../../types/query';
import { LESSONS } from '../../data/lessons';

const STORAGE_KEY = 'duck-query-kids-completed';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface Props {
  state: QueryState;
}

export function LessonPanel({ state }: Props) {
  const [activeLessonId, setActiveLessonId] = useState<string>(LESSONS[0].id);
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);
  const [hintIndex, setHintIndex] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) ?? LESSONS[0];
  const completedCount = LESSONS.filter((l) => completed.has(l.id)).length;

  // Auto-check whenever query state changes
  useEffect(() => {
    if (completed.has(activeLesson.id)) return;
    if (activeLesson.check(state)) {
      const next = new Set(completed);
      next.add(activeLesson.id);
      setCompleted(next);
      saveCompleted(next);
      setJustCompleted(true);
    }
  }, [state, activeLesson, completed]);

  // Reset per-lesson UI when switching lessons
  useEffect(() => {
    setHintIndex(0);
    setJustCompleted(false);
  }, [activeLessonId]);

  function selectLesson(id: string) {
    setActiveLessonId(id);
  }

  function goNext() {
    const idx = LESSONS.findIndex((l) => l.id === activeLessonId);
    const next = LESSONS[idx + 1];
    if (next) {
      setActiveLessonId(next.id);
    }
  }

  const activeLessonIdx = LESSONS.findIndex((l) => l.id === activeLessonId);
  const hasNext = activeLessonIdx < LESSONS.length - 1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Progress */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">Progress</span>
          <span className="text-xs text-gray-400">{completedCount} / {LESSONS.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / LESSONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1 min-h-0">
        {LESSONS.map((lesson) => {
          const done = completed.has(lesson.id);
          const active = lesson.id === activeLessonId;
          return (
            <button
              key={lesson.id}
              onClick={() => selectLesson(lesson.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                active
                  ? 'bg-indigo-50 border border-indigo-200'
                  : done
                  ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                  : 'bg-white border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                ) : (
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                      active ? 'border-indigo-400' : 'border-gray-300'
                    }`}
                  />
                )}
                <span
                  className={`font-semibold leading-tight ${
                    done ? 'text-green-700' : active ? 'text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  {lesson.title}
                </span>
              </div>
              <div
                className={`text-[9px] mt-0.5 ml-5 font-mono font-bold uppercase tracking-wide ${
                  active ? 'text-indigo-400' : 'text-gray-300'
                }`}
              >
                {lesson.concept}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active lesson detail card */}
      <div className="border-t border-gray-200 bg-gray-50 p-3 flex flex-col gap-2 flex-shrink-0">
        {justCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-xl mb-1">🎉</div>
            <div className="text-sm font-bold text-green-700">Nice work!</div>
            <div className="text-xs text-green-600 mb-2">{activeLesson.title} complete</div>
            {hasNext && (
              <button
                onClick={goNext}
                className="flex items-center gap-1 mx-auto text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                Next lesson <ChevronRight size={11} />
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-700 leading-relaxed">{activeLesson.description}</p>
            {hintIndex < activeLesson.hints.length ? (
              <button
                onClick={() => setHintIndex((i) => i + 1)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 w-fit font-medium"
              >
                <Lightbulb size={11} /> Get a hint
              </button>
            ) : null}
            {hintIndex > 0 && (
              <div className="flex flex-col gap-1">
                {activeLesson.hints.slice(0, hintIndex).map((hint, i) => (
                  <div
                    key={i}
                    className="text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1.5 text-amber-700 leading-relaxed"
                  >
                    💡 {hint}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
