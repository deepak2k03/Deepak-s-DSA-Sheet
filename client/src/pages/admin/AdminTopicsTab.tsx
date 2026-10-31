import React, { useState, useMemo } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Save, FolderTree } from 'lucide-react';
import {
  Input,
  TextArea,
  Select,
  ToggleRow,
  SearchBox,
  FilterChip,
  PaginationBar,
} from './AdminUIPrimitives';
import {
  TOPIC_PILLARS,
  getPillarForTopicSlug,
  getTopicIcon,
  topicIconOptions,
  type TopicDefinition,
} from '../../data/topics';
import { getCanonicalTopicSlug } from '../../utils/topics';
import type { PaginationData } from './AdminUsersTab';

export interface TopicFormState {
  name: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  iconKey: string;
  order: string;
  isActive: boolean;
}

interface AdminTopicsTabProps {
  topics: TopicDefinition[];
  filteredTopics: TopicDefinition[];
  topicForm: TopicFormState;
  setTopicForm: React.Dispatch<React.SetStateAction<TopicFormState>>;
  editingTopicId: string | null;
  setEditingTopicId: (id: string | null) => void;
  resetTopicForm: () => void;
  saveTopic: (e: React.FormEvent) => void;
  saving: boolean;
  topicSearch: string;
  setTopicSearch: (s: string) => void;
  topicStatusFilter: string;
  setTopicStatusFilter: (s: string) => void;
  isReorderingTopics: boolean;
  setIsReorderingTopics: (b: boolean) => void;
  saveTopicOrder: () => void;
  loadAdminData: (refresh?: boolean) => void;
  moveTopic: (id: string, direction: 'up' | 'down') => void;
  deleteTopic: (id: string) => void;
  restoreTopic: (id: string) => void;
  topicsPagination: PaginationData;
  setTopicsPagination: React.Dispatch<React.SetStateAction<PaginationData>>;
  onSelectTopicForProblems?: (slug: string) => void;
}

export const AdminTopicsTab: React.FC<AdminTopicsTabProps> = ({
  topics,
  filteredTopics,
  topicForm,
  setTopicForm,
  editingTopicId,
  setEditingTopicId,
  resetTopicForm,
  saveTopic,
  saving,
  topicSearch,
  setTopicSearch,
  topicStatusFilter,
  setTopicStatusFilter,
  isReorderingTopics,
  setIsReorderingTopics,
  saveTopicOrder,
  loadAdminData,
  moveTopic,
  deleteTopic,
  restoreTopic,
  topicsPagination,
  setTopicsPagination,
  onSelectTopicForProblems,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string>('all');

  const displayTopics = useMemo(() => {
    if (selectedPillar === 'all') return filteredTopics;
    const pillar = TOPIC_PILLARS.find((p) => p.id === selectedPillar);
    if (!pillar) return filteredTopics;
    return filteredTopics.filter((t) => {
      const canonical = getCanonicalTopicSlug(t.slug || t.name);
      return pillar.topicSlugs.includes(canonical);
    });
  }, [filteredTopics, selectedPillar]);

  const totalPages = Math.max(
    topicsPagination.totalPages || topicsPagination.pages || 1,
    1
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* Topic Create/Edit Form */}
      <form onSubmit={saveTopic} className="surface rounded-3xl p-6 h-fit border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <FolderTree size={18} />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingTopicId ? 'Edit Topic' : 'Add Topic'}
            </h2>
          </div>
          {editingTopicId && (
            <button
              type="button"
              onClick={resetTopicForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-4">
          <Input
            label="Topic Name"
            value={topicForm.name}
            onChange={(value) => setTopicForm((current) => ({ ...current, name: value }))}
            placeholder="e.g. Dynamic Programming"
            required
          />
          <Input
            label="Slug"
            value={topicForm.slug}
            onChange={(value) => setTopicForm((current) => ({ ...current, slug: value }))}
            placeholder="auto-generated if empty"
          />
          <TextArea
            label="Description"
            value={topicForm.description}
            onChange={(value) => setTopicForm((current) => ({ ...current, description: value }))}
            placeholder="Topic summary and concepts covered..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Difficulty"
              value={topicForm.difficulty}
              onChange={(value) =>
                setTopicForm((current) => ({
                  ...current,
                  difficulty: value as 'Easy' | 'Medium' | 'Hard',
                }))
              }
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' },
              ]}
            />
            <Select
              label="Icon"
              value={topicForm.iconKey}
              onChange={(value) => setTopicForm((current) => ({ ...current, iconKey: value }))}
              options={topicIconOptions}
            />
          </div>
          <Input
            label="Order"
            type="number"
            value={topicForm.order}
            onChange={(value) => setTopicForm((current) => ({ ...current, order: value }))}
          />
          <ToggleRow
            label="Topic Visible"
            checked={topicForm.isActive}
            onChange={(checked) => setTopicForm((current) => ({ ...current, isActive: checked }))}
          />
          <button
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123b36] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : editingTopicId ? (
              <Save size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editingTopicId ? 'Save Topic' : 'Create Topic'}
          </button>
        </div>
      </form>

      {/* Topic List Table */}
      <div className="surface rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Topic Catalog</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {displayTopics.length} of {topicsPagination.total || topics.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curriculum categories and problem distribution across all 4 DSA pillars.
            </p>
          </div>
          <SearchBox value={topicSearch} onChange={setTopicSearch} placeholder="Search topics…" />
        </div>

        {/* Pillar Filter Bar */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-200/60 dark:border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Pillars:</span>
          <FilterChip
            label="All Pillars"
            active={selectedPillar === 'all'}
            onClick={() => setSelectedPillar('all')}
          />
          {TOPIC_PILLARS.map((p) => {
            const count = filteredTopics.filter((t) =>
              p.topicSlugs.includes(getCanonicalTopicSlug(t.slug || t.name))
            ).length;
            return (
              <FilterChip
                key={p.id}
                label={`${p.name} (${count})`}
                active={selectedPillar === p.id}
                onClick={() => setSelectedPillar(p.id)}
              />
            );
          })}
        </div>

        {/* Status Filter Bar */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
          <FilterChip
            label="All"
            active={topicStatusFilter === 'all'}
            onClick={() => setTopicStatusFilter('all')}
          />
          <FilterChip
            label="Active"
            active={topicStatusFilter === 'active'}
            onClick={() => setTopicStatusFilter('active')}
            color="emerald"
          />
          <FilterChip
            label="Hidden"
            active={topicStatusFilter === 'hidden'}
            onClick={() => setTopicStatusFilter('hidden')}
            color="amber"
          />
          <FilterChip
            label="Deleted"
            active={topicStatusFilter === 'deleted'}
            onClick={() => setTopicStatusFilter('deleted')}
            color="rose"
          />
        </div>

        {isReorderingTopics && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                You have unsaved topic order changes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveTopicOrder}
                className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition"
              >
                Save Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReorderingTopics(false);
                  loadAdminData(true);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {displayTopics.map((topic) => {
            const pillar = getPillarForTopicSlug(topic.slug || topic.name);
            return (
              <div
                key={topic.id || topic.slug}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 p-4 transition hover:border-teal-500/30 dark:border-white/10 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#dceee9] p-3 text-[#123b36] dark:bg-teal-400/10 dark:text-teal-300">
                    {getTopicIcon(topic.iconKey, 20)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{topic.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-300">
                        {topic.slug}
                      </span>
                      {pillar && (
                        <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          {pillar.name}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          topic.isDeleted
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                            : topic.isActive === false
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                        }`}
                      >
                        {topic.isDeleted ? 'Deleted' : topic.isActive === false ? 'Hidden' : 'Live'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{topic.description}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {topic.problemCount || 0} problems • {topic.difficulty}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveTopic(topic.id!, 'up')}
                    disabled={topicSearch !== '' || topicStatusFilter !== 'all'}
                    title={topicSearch || topicStatusFilter !== 'all' ? 'Clear filters to reorder' : 'Move Up'}
                    className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTopic(topic.id!, 'down')}
                    disabled={topicSearch !== '' || topicStatusFilter !== 'all'}
                    title={topicSearch || topicStatusFilter !== 'all' ? 'Clear filters to reorder' : 'Move Down'}
                    className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTopicId(topic.id || null);
                      setTopicForm({
                        name: topic.name,
                        slug: topic.slug,
                        description: topic.description,
                        difficulty: topic.difficulty,
                        iconKey: topic.iconKey,
                        order: String(topic.order || 0),
                        isActive: topic.isActive !== false,
                      });
                    }}
                    className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
                  >
                    Edit
                  </button>
                  {onSelectTopicForProblems && (
                    <button
                      type="button"
                      onClick={() => onSelectTopicForProblems(topic.slug || topic.name)}
                      className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/20 transition"
                      title="View all problems for this topic"
                    >
                      View Problems
                    </button>
                  )}
                  {topic.id && !topic.isDeleted && (
                    <button
                      type="button"
                      onClick={() => deleteTopic(topic.id!)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20 transition"
                    >
                      Delete
                    </button>
                  )}
                  {topic.id && topic.isDeleted && (
                    <button
                      type="button"
                      onClick={() => restoreTopic(topic.id!)}
                      className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20 transition"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {displayTopics.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              No topics match the selected filters.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <PaginationBar
            page={topicsPagination.page}
            totalPages={totalPages}
            onPrev={() => setTopicsPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
            onNext={() =>
              setTopicsPagination((p) => ({ ...p, page: Math.min(p.page + 1, totalPages) }))
            }
          />
        )}
      </div>
    </section>
  );
};
