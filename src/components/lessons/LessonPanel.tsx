import { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight, Lightbulb } from 'lucide-react';
import type { QueryState } from '../../types/query';
import type { Lesson } from '../../types/lesson';

function loadCompleted(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(storageKey: string, ids: Set<string>) {
  localStorage.setItem(storageKey, JSON.stringify([...ids]));
}

interface Props {
  state: QueryState;
  lessons: Lesson[];
  storageKey: string;
}

export function LessonPanel({ state, lessons, storageKey }: Props) {
  const [activeLessonId, setActiveLessonId] = useState<string>(lessons[0]?.id ?? '');
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted(storageKey));
  const [hintIndex, setHintIndex] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  // Reset when switching datasets (lessons array changes)
  useEffect(() => {
    setActiveLessonId(lessons[0]?.id ?? '');
    setCompleted(loadCompleted(storageKey));
    setHintIndex(0);
    setJustCompleted(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
  const completedCount = lessons.filter((l) => completed.has(l.id)).length;

  useEffect(() => {
    if (!activeLesson || completed.has(activeLesson.id)) return;
    if (activeLesson.check(state)) {
      const next = new Set(completed);
      next.add(activeLesson.id);
      setCompleted(next);
      saveCompleted(storageKey, next);
      setJustCompleted(true);
    }
  }, [state, activeLesson, completed, storageKey]);

  useEffect(() => {
    setHintIndex(0);
    setJustCompleted(false);
  }, [activeLessonId]);

  function goNext() {
    const idx = lessons.findIndex((l) => l.id === activeLessonId);
    const next = lessons[idx + 1];
    if (next) setActiveLessonId(next.id);
  }

  const activeLessonIdx = lessons.findIndex((l) => l.id === activeLessonId);
  const hasNext = activeLessonIdx < lessons.length - 1;

  if (!activeLesson) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No lessons available.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">Progress</span>
          <span className="text-xs text-gray-400">{completedCount} / {lessons.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1 min-h-0">
        {lessons.map((lesson) => {
          const done = completed.has(lesson.id);
          const active = lesson.id === activeLessonId;
          return (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
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
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${active ? 'border-indigo-400' : 'border-gray-300'}`} />
                )}
                <span className={`font-semibold leading-tight ${done ? 'text-green-700' : active ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {lesson.title}
                </span>
              </div>
              <div className={`text-[9px] mt-0.5 ml-5 font-mono font-bold uppercase tracking-wide ${active ? 'text-indigo-400' : 'text-gray-300'}`}>
                {lesson.concept}
              </div>
            </button>
          );
        })}
      </div>

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
                  <div key={i} className="text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1.5 text-amber-700 leading-relaxed">
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
