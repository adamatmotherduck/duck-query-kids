import { useState } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Pencil } from 'lucide-react';
import type { Dataset } from '../../types/dataset';
import type { CustomLesson, CustomProject, CustomProjectStep, Condition } from '../../types/builder';
import { useCustomContent } from '../../hooks/useCustomContent';
import { ConditionBuilder } from './ConditionBuilder';
import { describeCondition } from '../../utils/conditionCompiler';

type Tab = 'lessons' | 'projects';

interface Props {
  datasets: Dataset[];
  activeDatasetId: string;
  onClose: () => void;
}

const FIELD_INPUT = 'border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-400';
const FIELD_TEXTAREA = `${FIELD_INPUT} resize-none`;

const DEFAULT_CONDITION: Condition = { type: 'tableOnCanvas', tableName: '' };

function newStepId() { return `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function newId()     { return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function emptyLesson(datasetId: string): CustomLesson {
  return { id: newId(), datasetId, title: '', concept: '', description: '', hints: [], condition: DEFAULT_CONDITION };
}

function emptyProject(datasetId: string): CustomProject {
  return { id: newId(), datasetId, title: '', description: '', steps: [] };
}

function emptyStep(): CustomProjectStep {
  return { id: newStepId(), title: '', description: '', hints: [], condition: DEFAULT_CONDITION };
}

// ── Hint list ────────────────────────────────────────────────────────────────

function HintList({ hints, onChange }: { hints: string[]; onChange: (h: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {hints.map((hint, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <span className="text-amber-400 text-xs flex-shrink-0">💡</span>
          <input
            className="border border-gray-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Hint text…"
            value={hint}
            onChange={(e) => {
              const next = [...hints];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button onClick={() => onChange(hints.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...hints, ''])}
        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium w-fit mt-0.5"
      >
        <Plus size={11} /> Add hint
      </button>
    </div>
  );
}

// ── Step editor (inline accordion) ───────────────────────────────────────────

function StepEditor({
  step, index, expanded, onToggle, onChange, onDelete,
}: {
  step: CustomProjectStep; index: number; expanded: boolean;
  onToggle: () => void; onChange: (s: CustomProjectStep) => void; onDelete: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-colors ${expanded ? 'bg-indigo-50' : 'bg-gray-50 hover:bg-gray-100'}`}
        onClick={onToggle}
      >
        <GripVertical size={13} className="text-gray-300 flex-shrink-0" />
        <span className="text-xs font-bold text-gray-500 w-4 flex-shrink-0">{index + 1}.</span>
        <span className={`text-xs font-semibold flex-1 truncate ${step.title ? 'text-gray-700' : 'text-gray-400 italic'}`}>
          {step.title || 'Untitled step'}
        </span>
        {step.condition && (
          <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0 hidden sm:block truncate max-w-32">
            {describeCondition(step.condition)}
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 ml-1">
          <Trash2 size={12} />
        </button>
        {expanded ? <ChevronDown size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-100 flex flex-col gap-4 bg-white">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Step title</label>
            <input className={FIELD_INPUT} placeholder="e.g. Add Customers" value={step.title}
              onChange={(e) => onChange({ ...step, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea className={FIELD_TEXTAREA} rows={2} placeholder="What should the student do in this step?"
              value={step.description} onChange={(e) => onChange({ ...step, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Hints</label>
            <HintList hints={step.hints} onChange={(h) => onChange({ ...step, hints: h })} />
          </div>
          <ConditionBuilder value={step.condition} onChange={(c) => onChange({ ...step, condition: c })} />
        </div>
      )}
    </div>
  );
}

// ── Lesson form ───────────────────────────────────────────────────────────────

function LessonForm({
  lesson, datasets, onSave, onCancel,
}: {
  lesson: CustomLesson; datasets: Dataset[];
  onSave: (l: CustomLesson) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CustomLesson>(lesson);
  const valid = draft.title.trim() !== '' && draft.concept.trim() !== '' && draft.description.trim() !== '';

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title <span className="text-red-400">*</span></label>
          <input className={FIELD_INPUT} placeholder="e.g. Your First Join" value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Concept badge <span className="text-red-400">*</span></label>
          <input className={FIELD_INPUT} placeholder="e.g. JOIN" value={draft.concept}
            onChange={(e) => setDraft({ ...draft, concept: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
        <textarea className={FIELD_TEXTAREA} rows={3} placeholder="Explain what the student needs to do…"
          value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Dataset</label>
        <select className={FIELD_INPUT + ' bg-white'} value={draft.datasetId}
          onChange={(e) => setDraft({ ...draft, datasetId: e.target.value })}>
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>{ds.emoji} {ds.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Hints</label>
        <HintList hints={draft.hints} onChange={(h) => setDraft({ ...draft, hints: h })} />
      </div>

      <ConditionBuilder value={draft.condition} onChange={(c) => setDraft({ ...draft, condition: c })} />

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          disabled={!valid}
          className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Lesson
        </button>
      </div>
    </div>
  );
}

// ── Project form ──────────────────────────────────────────────────────────────

function ProjectForm({
  project, datasets, onSave, onCancel,
}: {
  project: CustomProject; datasets: Dataset[];
  onSave: (p: CustomProject) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CustomProject>(project);
  const [expandedStep, setExpandedStep] = useState<string | null>(
    project.steps.length === 0 ? null : project.steps[0].id,
  );

  const valid = draft.title.trim() !== '' && draft.description.trim() !== '' && draft.steps.length > 0;

  function addStep() {
    const s = emptyStep();
    setDraft({ ...draft, steps: [...draft.steps, s] });
    setExpandedStep(s.id);
  }

  function updateStep(id: string, updated: CustomProjectStep) {
    setDraft({ ...draft, steps: draft.steps.map((s) => (s.id === id ? updated : s)) });
  }

  function deleteStep(id: string) {
    setDraft({ ...draft, steps: draft.steps.filter((s) => s.id !== id) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Project title <span className="text-red-400">*</span></label>
        <input className={FIELD_INPUT} placeholder="e.g. Top Products by Revenue" value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
        <textarea className={FIELD_TEXTAREA} rows={2} placeholder="What will students build in this project?"
          value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Dataset</label>
        <select className={FIELD_INPUT + ' bg-white'} value={draft.datasetId}
          onChange={(e) => setDraft({ ...draft, datasetId: e.target.value })}>
          {datasets.map((ds) => (
            <option key={ds.id} value={ds.id}>{ds.emoji} {ds.name}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">Steps <span className="text-red-400">*</span></label>
          <button onClick={addStep} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            <Plus size={11} /> Add step
          </button>
        </div>
        {draft.steps.length === 0 ? (
          <div className="text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            No steps yet — click "Add step" to start building.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {draft.steps.map((step, i) => (
              <StepEditor
                key={step.id}
                step={step}
                index={i}
                expanded={expandedStep === step.id}
                onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                onChange={(s) => updateStep(step.id, s)}
                onDelete={() => deleteStep(step.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          disabled={!valid}
          className="px-4 py-2 text-sm bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Project
        </button>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function BuilderModal({ datasets, activeDatasetId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('lessons');
  const [editingLesson, setEditingLesson] = useState<CustomLesson | null>(null);
  const [editingProject, setEditingProject] = useState<CustomProject | null>(null);
  const { customLessons, customProjects, saveLesson, deleteLesson, saveProject, deleteProject } = useCustomContent();

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) ?? datasets[0];
  const datasetLessons = customLessons.filter((l) => l.datasetId === activeDatasetId);
  const datasetProjects = customProjects.filter((p) => p.datasetId === activeDatasetId);

  function handleSaveLesson(l: CustomLesson) {
    saveLesson(l);
    setEditingLesson(null);
  }

  function handleSaveProject(p: CustomProject) {
    saveProject(p);
    setEditingProject(null);
  }

  const TAB = (t: Tab) =>
    `px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
      tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">✏️ Lesson &amp; Project Builder</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Custom content for <span className="font-semibold">{activeDataset?.emoji} {activeDataset?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
          <button className={TAB('lessons')} onClick={() => { setTab('lessons'); setEditingLesson(null); }}>
            🎓 Lessons
          </button>
          <button className={TAB('projects')} onClick={() => { setTab('projects'); setEditingProject(null); }}>
            🛠 Projects
          </button>
        </div>

        {/* Body: two-panel layout */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left: list */}
          <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex-shrink-0">
              {tab === 'lessons' ? (
                <button
                  onClick={() => setEditingLesson(emptyLesson(activeDatasetId))}
                  className="flex items-center gap-1.5 w-full justify-center text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg py-2 transition-colors"
                >
                  <Plus size={13} /> New Lesson
                </button>
              ) : (
                <button
                  onClick={() => setEditingProject(emptyProject(activeDatasetId))}
                  className="flex items-center gap-1.5 w-full justify-center text-xs font-semibold bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg py-2 transition-colors"
                >
                  <Plus size={13} /> New Project
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {tab === 'lessons' && (
                datasetLessons.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-4 px-2">No custom lessons yet for this dataset.</p>
                ) : (
                  datasetLessons.map((l) => (
                    <div
                      key={l.id}
                      className={`group rounded-lg px-3 py-2.5 border cursor-pointer transition-colors ${
                        editingLesson?.id === l.id
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                      onClick={() => setEditingLesson(l)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-1 text-xs font-semibold text-gray-700 leading-snug">{l.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteLesson(l.id); if (editingLesson?.id === l.id) setEditingLesson(null); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {l.concept}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}

              {tab === 'projects' && (
                datasetProjects.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-4 px-2">No custom projects yet for this dataset.</p>
                ) : (
                  datasetProjects.map((p) => (
                    <div
                      key={p.id}
                      className={`group rounded-lg px-3 py-2.5 border cursor-pointer transition-colors ${
                        editingProject?.id === p.id
                          ? 'bg-violet-50 border-violet-200'
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                      onClick={() => setEditingProject(p)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-1 text-xs font-semibold text-gray-700 leading-snug">{p.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id); if (editingProject?.id === p.id) setEditingProject(null); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{p.steps.length} step{p.steps.length !== 1 ? 's' : ''}</div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Right: form area */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === 'lessons' && (
              editingLesson ? (
                <LessonForm
                  lesson={editingLesson}
                  datasets={datasets}
                  onSave={handleSaveLesson}
                  onCancel={() => setEditingLesson(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Pencil size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">Select a lesson to edit</p>
                  <p className="text-xs mt-1">or click <span className="font-semibold">+ New Lesson</span></p>
                </div>
              )
            )}

            {tab === 'projects' && (
              editingProject ? (
                <ProjectForm
                  project={editingProject}
                  datasets={datasets}
                  onSave={handleSaveProject}
                  onCancel={() => setEditingProject(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Pencil size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">Select a project to edit</p>
                  <p className="text-xs mt-1">or click <span className="font-semibold">+ New Project</span></p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
