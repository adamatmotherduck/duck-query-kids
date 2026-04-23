import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lightbulb, ChevronRight } from 'lucide-react';
import type { QueryState } from '../../types/query';
import { PROJECTS } from '../../data/projects';

interface Props {
  state: QueryState;
}

export function ProjectPanel({ state }: Props) {
  const project = PROJECTS[0];
  const [hintIndex, setHintIndex] = useState(0);
  const [prevActiveIdx, setPrevActiveIdx] = useState(-1);

  const stepDone = project.steps.map((s) => s.check(state));
  const allDone = stepDone.every(Boolean);
  const activeIdx = stepDone.findIndex((done) => !done);
  const activeStep = activeIdx >= 0 ? project.steps[activeIdx] : null;

  // Reset hints when the active step advances
  useEffect(() => {
    if (activeIdx !== prevActiveIdx) {
      setHintIndex(0);
      setPrevActiveIdx(activeIdx);
    }
  }, [activeIdx, prevActiveIdx]);

  const completedCount = stepDone.filter(Boolean).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-white flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-700 leading-snug mb-1">{project.title}</h3>
        <p className="text-[10px] text-gray-500 leading-relaxed">{project.description}</p>
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / project.steps.length) * 100}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {completedCount} / {project.steps.length} steps
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1 min-h-0">
        {project.steps.map((step, i) => {
          const done = stepDone[i];
          const active = i === activeIdx;

          return (
            <div
              key={step.id}
              className={`rounded-lg px-3 py-2 text-xs border transition-colors ${
                done
                  ? 'bg-green-50 border-green-100'
                  : active
                  ? 'bg-violet-50 border-violet-200'
                  : 'bg-white border-gray-100 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                ) : active ? (
                  <ChevronRight size={13} className="text-violet-500 flex-shrink-0" />
                ) : (
                  <Circle size={13} className="text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`font-semibold ${
                    done ? 'text-green-700' : active ? 'text-violet-700' : 'text-gray-400'
                  }`}
                >
                  {i + 1}. {step.title}
                </span>
              </div>
              {active && (
                <p className="text-gray-600 mt-1.5 ml-5 leading-relaxed">{step.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint / completion area */}
      <div className="border-t border-gray-200 bg-gray-50 p-3 flex-shrink-0">
        {allDone ? (
          <div className="text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-bold text-violet-700">Project complete!</div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Check the Results tab — you can see each customer's order count per category. The top row for each customer is their favorite.
            </p>
          </div>
        ) : activeStep ? (
          <>
            {hintIndex < activeStep.hints.length ? (
              <button
                onClick={() => setHintIndex((i) => i + 1)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium w-fit"
              >
                <Lightbulb size={11} /> Get a hint
              </button>
            ) : null}
            {hintIndex > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {activeStep.hints.slice(0, hintIndex).map((hint, i) => (
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
        ) : null}
      </div>
    </div>
  );
}
