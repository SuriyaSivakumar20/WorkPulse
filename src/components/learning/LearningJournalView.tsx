import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  BookOpen,
  Sparkles,
  Star,
  X,
  Save
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { LearningEntry } from '../../types';
import { CURRENT_DATE_STR } from '../../services/sampleData';

const CONFIDENCE_LEVELS = [
  '1 – Beginner (Exploratory / Concept)',
  '2 – Elementary (Basic syntax / Tutorial)',
  '3 – Intermediate (Working knowledge / Feature ready)',
  '4 – Proficient (Production ready / Best practices)',
  '5 – Mastery (Architecture / Optimization / Mentoring)'
];

export const LearningJournalView: React.FC = () => {
  const { state, saveLearningEntry, deleteLearningEntry } = useWorkPulse();

  const [searchTerm, setSearchTerm] = useState('');
  const [techFilter, setTechFilter] = useState('all');
  const [editingEntry, setEditingEntry] = useState<LearningEntry | null>(null);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // All unique technologies
  const allTechs = Array.from(new Set(state.learningEntries.map(e => e.technology)));

  // Filtered entries chronologically reverse
  const filteredEntries = state.learningEntries
    .filter(e => {
      if (techFilter !== 'all' && e.technology !== techFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          e.topic.toLowerCase().includes(q) ||
          e.technology.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.personalNotes.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.learningDate.localeCompare(a.learningDate));

  const handleDelete = (id: string, topic: string) => {
    if (window.confirm(`Delete learning record "${topic}"?`)) {
      deleteLearningEntry(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              LEARNING JOURNAL & MASTERY
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Deliberate professional growth logging, technology breakthroughs, and technical study notes.
          </p>
        </div>

        <button
          onClick={() => setIsNewEntryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
        >
          <Plus className="w-4 h-4" />
          <span>RECORD LEARNING</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-800 border border-navy-500 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search learning topics, technologies, or concepts..."
            className="w-full bg-navy-900 border border-navy-500 pl-9 pr-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={techFilter}
            onChange={e => setTechFilter(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Technology: All Stacks</option>
            {allTechs.map(tech => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Learning Timeline View */}
      {filteredEntries.length === 0 ? (
        <div className="bg-navy-800 border border-navy-500 p-12 text-center text-slate-450">
          <GraduationCap className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="font-bold text-cream-200">No learning entries found.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-500">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="relative group">
              {/* Node diamond */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 bg-navy-950 border-2 border-gold-500 transform rotate-45 group-hover:scale-125 transition-transform" />

              <div className="bg-navy-800 border border-navy-500 p-5 overflow-hidden chamfer-tr hover:border-gold-500/60 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-navy-900 border border-gold-500/60 text-gold-400 font-mono text-[10px] font-bold">
                        {entry.technology}
                      </span>
                      <span className="text-xs font-mono text-slate-450">
                        STUDIED: {entry.learningDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-cream-200 group-hover:text-gold-400 transition-colors">
                      {entry.topic}
                    </h3>

                    <p className="text-xs text-slate-350 leading-relaxed">
                      {entry.description}
                    </p>

                    {/* Resources */}
                    {entry.resources && (
                      <div className="text-xs font-mono text-slate-450 pt-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                        <span className="text-slate-450">Resources:</span>
                        <span className="text-cream-200 truncate">{entry.resources}</span>
                      </div>
                    )}

                    {/* Personal Notes */}
                    {entry.personalNotes && (
                      <div className="mt-2 text-xs text-slate-350 italic bg-navy-900/60 p-3 border-l-2 border-gold-500">
                        "{entry.personalNotes}"
                      </div>
                    )}
                  </div>

                  {/* Confidence Badge & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-450 uppercase mb-0.5">
                        CONFIDENCE
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <Star
                            key={lvl}
                            className={`w-3.5 h-3.5 ${
                              lvl <= entry.confidenceLevel
                                ? 'text-gold-500 fill-gold-500'
                                : 'text-navy-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="p-1.5 bg-navy-900 text-slate-450 hover:text-cream-200 border border-navy-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id, entry.topic)}
                        className="p-1.5 bg-navy-900 text-slate-450 hover:text-red-400 border border-navy-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {(editingEntry || isNewEntryOpen) && (
        <LearningEntryModal
          entry={editingEntry}
          onClose={() => {
            setEditingEntry(null);
            setIsNewEntryOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Learning Entry Modal
const LearningEntryModal: React.FC<{ entry?: LearningEntry | null; onClose: () => void }> = ({ entry, onClose }) => {
  const { saveLearningEntry } = useWorkPulse();

  const [topic, setTopic] = useState(entry?.topic || '');
  const [technology, setTechnology] = useState(entry?.technology || 'Modern Frontend');
  const [description, setDescription] = useState(entry?.description || '');
  const [learningDate, setLearningDate] = useState(entry?.learningDate || CURRENT_DATE_STR);
  const [resources, setResources] = useState(entry?.resources || '');
  const [personalNotes, setPersonalNotes] = useState(entry?.personalNotes || '');
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(
    entry?.confidenceLevel || 4
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    saveLearningEntry({
      id: entry?.id || `learn-${Date.now()}`,
      topic: topic.trim(),
      technology: technology.trim(),
      description: description.trim(),
      learningDate,
      resources: resources.trim(),
      personalNotes: personalNotes.trim(),
      confidenceLevel
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gold-500" />
            <h2 className="font-display text-xl tracking-wider text-cream-200">
              {entry ? 'EDIT LEARNING ENTRY' : 'RECORD LEARNING DISCOVERY'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-350 hover:text-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
              TOPIC / CONCEPT MASTERED
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. WebAssembly SIMD Vectorization in Rust..."
              className="w-full bg-navy-800 border border-navy-500 px-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                TECHNOLOGY / STACK
              </label>
              <input
                type="text"
                value={technology}
                onChange={e => setTechnology(e.target.value)}
                placeholder="e.g. Rust, CSS, TypeScript..."
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                DATE
              </label>
              <input
                type="date"
                value={learningDate}
                onChange={e => setLearningDate(e.target.value)}
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              CONFIDENCE LEVEL (1–5)
            </label>
            <div className="flex items-center gap-2 mb-1.5">
              {([1, 2, 3, 4, 5] as const).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConfidenceLevel(num)}
                  className={`w-9 h-9 font-display text-lg border transition-colors ${
                    confidenceLevel === num
                      ? 'bg-gold-500 text-navy-950 font-bold border-gold-400'
                      : 'bg-navy-800 text-slate-350 border-navy-500 hover:border-gold-500/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-mono text-gold-400">
              {CONFIDENCE_LEVELS[confidenceLevel - 1]}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              DETAILED DESCRIPTION & TAKEAWAYS
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What core architectural takeaway or mental model did you acquire?"
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              REFERENCES / LINKS
            </label>
            <input
              type="text"
              value={resources}
              onChange={e => setResources(e.target.value)}
              placeholder="e.g. MDN spec link, GitHub PR, research paper..."
              className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              PERSONAL NOTES / CAVEATS
            </label>
            <textarea
              rows={2}
              value={personalNotes}
              onChange={e => setPersonalNotes(e.target.value)}
              placeholder="Any practical caveats to keep in mind for our codebase?"
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-500">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
            >
              <Save className="w-4 h-4" />
              <span>SAVE LEARNING RECORD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

