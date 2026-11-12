import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  Search,
  Filter,
  X,
  Save,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { Blocker, Doubt, BlockerSeverity, BlockerStatus, DoubtStatus } from '../../types';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const BlockersView: React.FC = () => {
  const { state, saveBlocker, deleteBlocker, saveDoubt, deleteDoubt } = useWorkPulse();

  const [activeTab, setActiveTab] = useState<'blockers' | 'doubts'>('blockers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Modals
  const [editingBlocker, setEditingBlocker] = useState<Blocker | null>(null);
  const [isNewBlockerOpen, setIsNewBlockerOpen] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);
  const [isNewDoubtOpen, setIsNewDoubtOpen] = useState(false);

  // Filtered Blockers
  const filteredBlockers = state.blockers.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (severityFilter !== 'all' && b.severity !== severityFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.relatedTaskName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Doubts
  const filteredDoubts = state.doubts.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.question.toLowerCase().includes(q) ||
        d.topic.toLowerCase().includes(q) ||
        (d.relatedTaskName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolveBlocker = (blocker: Blocker) => {
    saveBlocker({
      ...blocker,
      status: blocker.status === 'Resolved' ? 'Open' : 'Resolved',
      resolvedDate: blocker.status === 'Resolved' ? undefined : CURRENT_DATE_STR,
      resolutionNotes: blocker.resolutionNotes || 'Marked as resolved.'
    });
  };

  const handleResolveDoubt = (doubt: Doubt) => {
    saveDoubt({
      ...doubt,
      status: doubt.status === 'Resolved' ? 'To Discuss' : 'Resolved',
      discussedDate: doubt.status === 'Resolved' ? undefined : CURRENT_DATE_STR
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              BLOCKERS & ARCHITECTURE DOUBTS
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Friction logging, critical impediments, and questions scheduled for engineering leads review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'blockers' ? (
            <button
              onClick={() => setIsNewBlockerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-cream-200 font-bold text-xs tracking-wider shadow-geometric-red"
            >
              <Plus className="w-4 h-4" />
              <span>REPORT BLOCKER</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewDoubtOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
            >
              <Plus className="w-4 h-4" />
              <span>RAISE QUESTION</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-navy-500">
        <button
          onClick={() => {
            setActiveTab('blockers');
            setStatusFilter('all');
          }}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'blockers'
              ? 'text-red-400 border-red-500 bg-navy-800'
              : 'text-slate-450 border-transparent hover:text-cream-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>CRITICAL BLOCKERS ({state.blockers.filter(b => b.status !== 'Resolved').length} ACTIVE)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('doubts');
            setStatusFilter('all');
          }}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'doubts'
              ? 'text-gold-400 border-gold-500 bg-navy-800'
              : 'text-slate-450 border-transparent hover:text-cream-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>QUESTIONS & DOUBTS ({state.doubts.filter(d => d.status !== 'Resolved').length} OPEN)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-800 border border-navy-500 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'blockers' ? 'blockers' : 'questions'}...`}
            className="w-full bg-navy-900 border border-navy-500 pl-9 pr-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Status: All</option>
            {activeTab === 'blockers' ? (
              <>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </>
            ) : (
              <>
                <option value="To Discuss">To Discuss</option>
                <option value="Discussed">Discussed</option>
                <option value="Resolved">Resolved</option>
              </>
            )}
          </select>
        </div>

        {activeTab === 'blockers' && (
          <div className="md:col-span-3">
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
            >
              <option value="all">Severity: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: BLOCKERS LIST */}
      {activeTab === 'blockers' && (
        <div className="space-y-3">
          {filteredBlockers.length === 0 ? (
            <div className="bg-navy-800 border border-navy-500 p-12 text-center text-slate-450">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-cream-200">No matching blockers found.</p>
            </div>
          ) : (
            filteredBlockers.map(blocker => (
              <div
                key={blocker.id}
                className={`p-5 bg-navy-800 border overflow-hidden chamfer-tr transition-all relative ${
                  blocker.status === 'Resolved'
                    ? 'border-navy-600/60 opacity-75'
                    : blocker.severity === 'Critical'
                    ? 'border-l-4 border-l-red-500 border-navy-500'
                    : 'border-l-4 border-l-amber-500 border-navy-500'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase ${
                          blocker.severity === 'Critical'
                            ? 'bg-red-500 text-cream-200'
                            : blocker.severity === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-navy-900 text-slate-450'
                        }`}
                      >
                        {blocker.severity} SEVERITY
                      </span>

                      <span className="text-xs font-mono text-slate-450">
                        REPORTED: {blocker.reportedDate}
                      </span>

                      {blocker.relatedTaskName && (
                        <span className="text-xs font-mono text-gold-400 truncate">
                          • TASK: {blocker.relatedTaskName}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-sm ${blocker.status === 'Resolved' ? 'text-slate-450 line-through' : 'text-cream-200'}`}>
                      {blocker.title}
                    </h3>

                    <p className="text-xs text-slate-350 leading-relaxed mt-1">
                      {blocker.description}
                    </p>

                    {blocker.resolutionNotes && (
                      <div className="mt-2 text-xs text-emerald-400/90 font-mono bg-navy-900/60 p-2.5 border-l-2 border-emerald-500">
                        RESOLUTION: {blocker.resolutionNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveBlocker(blocker)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-colors ${
                        blocker.status === 'Resolved'
                          ? 'bg-navy-900 text-slate-450 border-navy-600 hover:text-cream-200'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 hover:bg-emerald-500 hover:text-navy-950 font-bold'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{blocker.status === 'Resolved' ? 'REOPEN' : 'MARK RESOLVED'}</span>
                    </button>

                    <button
                      onClick={() => setEditingBlocker(blocker)}
                      className="p-1.5 bg-navy-900 text-slate-450 hover:text-cream-200 border border-navy-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteBlocker(blocker.id)}
                      className="p-1.5 bg-navy-900 text-slate-450 hover:text-red-400 border border-navy-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ARCHITECTURE DOUBTS & QUESTIONS */}
      {activeTab === 'doubts' && (
        <div className="space-y-3">
          {filteredDoubts.length === 0 ? (
            <div className="bg-navy-800 border border-navy-500 p-12 text-center text-slate-450">
              <CheckCircle2 className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <p className="font-bold text-cream-200">No matching questions found.</p>
            </div>
          ) : (
            filteredDoubts.map(doubt => (
              <div
                key={doubt.id}
                className={`p-5 bg-navy-800 border border-navy-500 overflow-hidden chamfer-tr transition-all relative ${
                  doubt.status === 'Resolved'
                    ? 'border-navy-600/60 opacity-75'
                    : 'border-l-4 border-l-gold-500'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-gold-500/15 border border-gold-500 text-gold-400 font-bold uppercase">
                        {doubt.topic}
                      </span>
                      <span className="text-xs font-mono text-slate-450">
                        RAISED: {doubt.dateRaised}
                      </span>
                      {doubt.relatedTaskName && (
                        <span className="text-xs font-mono text-slate-450 truncate">
                          • {doubt.relatedTaskName}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-sm ${doubt.status === 'Resolved' ? 'text-slate-450 line-through' : 'text-cream-200'}`}>
                      {doubt.question}
                    </h3>

                    {doubt.discussionNotes && (
                      <div className="mt-2 text-xs text-gold-400 font-mono bg-navy-900/60 p-2.5 border-l-2 border-gold-500">
                        DISCUSSION OUTCOME: {doubt.discussionNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveDoubt(doubt)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-colors ${
                        doubt.status === 'Resolved'
                          ? 'bg-navy-900 text-slate-450 border-navy-600 hover:text-cream-200'
                          : 'bg-gold-500/20 text-gold-400 border-gold-500/60 hover:bg-gold-500 hover:text-navy-950 font-bold'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{doubt.status === 'Resolved' ? 'REOPEN' : 'CONCLUDED'}</span>
                    </button>

                    <button
                      onClick={() => setEditingDoubt(doubt)}
                      className="p-1.5 bg-navy-900 text-slate-450 hover:text-cream-200 border border-navy-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteDoubt(doubt.id)}
                      className="p-1.5 bg-navy-900 text-slate-450 hover:text-red-400 border border-navy-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blocker Modal */}
      {(editingBlocker || isNewBlockerOpen) && (
        <BlockerModal
          blocker={editingBlocker}
          onClose={() => {
            setEditingBlocker(null);
            setIsNewBlockerOpen(false);
          }}
        />
      )}

      {/* Doubt Modal */}
      {(editingDoubt || isNewDoubtOpen) && (
        <DoubtModal
          doubt={editingDoubt}
          onClose={() => {
            setEditingDoubt(null);
            setIsNewDoubtOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Blocker Modal Component
const BlockerModal: React.FC<{ blocker?: Blocker | null; onClose: () => void }> = ({ blocker, onClose }) => {
  const { state, saveBlocker } = useWorkPulse();

  const [title, setTitle] = useState(blocker?.title || '');
  const [description, setDescription] = useState(blocker?.description || '');
  const [severity, setSeverity] = useState<BlockerSeverity>(blocker?.severity || 'High');
  const [status, setStatus] = useState<BlockerStatus>(blocker?.status || 'Open');
  const [relatedTaskId, setRelatedTaskId] = useState(blocker?.relatedTaskId || '');
  const [resolutionNotes, setResolutionNotes] = useState(blocker?.resolutionNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedTask = state.tasks.find(t => t.id === relatedTaskId);

    saveBlocker({
      id: blocker?.id || `blocker-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      severity,
      status,
      relatedTaskId: relatedTaskId || undefined,
      relatedTaskName: selectedTask?.name,
      reportedDate: blocker?.reportedDate || CURRENT_DATE_STR,
      resolutionNotes: resolutionNotes.trim() || undefined,
      resolvedDate: status === 'Resolved' ? (blocker?.resolvedDate || CURRENT_DATE_STR) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-display text-xl tracking-wider text-cream-200">
              {blocker ? 'EDIT BLOCKER' : 'REPORT NEW IMPEDIMENT'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-350 hover:text-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
              BLOCKER TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Staging CORS Preflight header failure..."
              className="w-full bg-navy-800 border border-navy-500 px-3 py-2 text-xs text-cream-200 focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                SEVERITY
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as BlockerSeverity)}
                className="w-full bg-navy-800 border border-navy-500 px-2.5 py-1.5 text-xs text-cream-200 focus:border-red-500 focus:outline-none font-mono"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                STATUS
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BlockerStatus)}
                className="w-full bg-navy-800 border border-navy-500 px-2.5 py-1.5 text-xs text-cream-200 focus:border-red-500 focus:outline-none font-mono"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              RELATED TASK (OPTIONAL)
            </label>
            <select
              value={relatedTaskId}
              onChange={e => setRelatedTaskId(e.target.value)}
              className="w-full bg-navy-800 border border-navy-500 px-2.5 py-1.5 text-xs text-slate-350 focus:border-red-500 focus:outline-none font-mono"
            >
              <option value="">-- None / General Architecture --</option>
              {state.tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              DETAILED DESCRIPTION & REPRODUCTION
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What specifically is blocked, what error messages appear, and who is needed to unblock?"
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-red-500 focus:outline-none placeholder:text-slate-600"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              RESOLUTION NOTES / PR LINKS
            </label>
            <input
              type="text"
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="e.g. Rolled out Cloudflare worker patch in PR #42..."
              className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-red-500 focus:outline-none"
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
              className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-400 text-cream-200 font-bold text-xs tracking-wider shadow-geometric-red"
            >
              <Save className="w-4 h-4" />
              <span>SAVE BLOCKER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Doubt Modal Component
const DoubtModal: React.FC<{ doubt?: Doubt | null; onClose: () => void }> = ({ doubt, onClose }) => {
  const { state, saveDoubt } = useWorkPulse();

  const [question, setQuestion] = useState(doubt?.question || '');
  const [topic, setTopic] = useState(doubt?.topic || 'Architecture');
  const [status, setStatus] = useState<DoubtStatus>(doubt?.status || 'To Discuss');
  const [relatedTaskId, setRelatedTaskId] = useState(doubt?.relatedTaskId || '');
  const [discussionNotes, setDiscussionNotes] = useState(doubt?.discussionNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const selectedTask = state.tasks.find(t => t.id === relatedTaskId);

    saveDoubt({
      id: doubt?.id || `doubt-${Date.now()}`,
      question: question.trim(),
      topic: topic.trim(),
      status,
      relatedTaskId: relatedTaskId || undefined,
      relatedTaskName: selectedTask?.name,
      dateRaised: doubt?.dateRaised || CURRENT_DATE_STR,
      discussionNotes: discussionNotes.trim() || undefined,
      discussedDate: status !== 'To Discuss' ? (doubt?.discussedDate || CURRENT_DATE_STR) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <h2 className="font-display text-xl tracking-wider text-cream-200">
              {doubt ? 'EDIT QUESTION' : 'NEW TOPIC TO DISCUSS'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-350 hover:text-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
              QUESTION / ARCHITECTURE TOPIC
            </label>
            <textarea
              rows={2}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Should we standardize on BroadcastChannel or WebSockets for multi-tab sync?"
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                TOPIC / DOMAIN
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Accessibility, Performance..."
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                STATUS
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as DoubtStatus)}
                className="w-full bg-navy-800 border border-navy-500 px-2.5 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
              >
                <option value="To Discuss">To Discuss</option>
                <option value="Discussed">Discussed</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              RELATED TASK (OPTIONAL)
            </label>
            <select
              value={relatedTaskId}
              onChange={e => setRelatedTaskId(e.target.value)}
              className="w-full bg-navy-800 border border-navy-500 px-2.5 py-1.5 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
            >
              <option value="">-- None / General Architecture --</option>
              {state.tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              DISCUSSION NOTES & DECISIONS
            </label>
            <textarea
              rows={3}
              value={discussionNotes}
              onChange={e => setDiscussionNotes(e.target.value)}
              placeholder="Record consensus reached with the team or technical lead..."
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-600"
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
              <span>SAVE QUESTION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

