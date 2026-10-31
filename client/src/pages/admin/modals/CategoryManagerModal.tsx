import React from 'react';
import { createPortal } from 'react-dom';
import { FolderTree, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { VisualizerAlgorithm } from '../../../data/visualizers';
import type { VisualizerCategoryItem } from '../../../utils/visualizerApi';

export interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryManagerInput: string;
  setCategoryManagerInput: (input: string) => void;
  handleCreateCategoryInManager: () => void;
  handleDeleteCategoryInManager: (id: string, name: string) => void;
  categorySubmitting: boolean;
  availableCategoryNames: string[];
  categories: VisualizerCategoryItem[];
  visualizers: VisualizerAlgorithm[];
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categoryManagerInput,
  setCategoryManagerInput,
  handleCreateCategoryInManager,
  handleDeleteCategoryInManager,
  categorySubmitting,
  availableCategoryNames,
  categories,
  visualizers,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl border border-[var(--border-strong)] flex flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <FolderTree size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Algorithm Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create, inspect, and organize algorithm categories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Create New Category Card */}
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
              Add New Category
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryManagerInput}
                onChange={(e) => setCategoryManagerInput(e.target.value)}
                placeholder="e.g. Trees, Backtracking, Trie, Heaps..."
                className="flex-1 rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategoryInManager();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCreateCategoryInManager}
                disabled={categorySubmitting || !categoryManagerInput.trim()}
                className="rounded-xl bg-[#123b36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-50 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {categorySubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* List of Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Categories ({availableCategoryNames.length})
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {availableCategoryNames.map((catName) => {
                const matchingCat = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
                const count = visualizers.filter((v) => v.category === catName).length;
                const canDelete = matchingCat && !matchingCat.isDefault && count === 0;

                return (
                  <div
                    key={catName}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {catName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {count} {count === 1 ? 'algo' : 'algos'}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryInManager(matchingCat.id, matchingCat.name)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded"
                          title="Delete unused category"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="button-secondary text-xs font-semibold !py-2 !px-4"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

