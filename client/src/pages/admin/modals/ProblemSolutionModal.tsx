import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Input, TextArea, Select } from '../AdminUIPrimitives';
import type { ProblemFormState } from '../AdminProblemsTab';

export interface ProblemSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemForm: ProblemFormState;
  setProblemForm: React.Dispatch<React.SetStateAction<ProblemFormState>>;
}

export const ProblemSolutionModal: React.FC<ProblemSolutionModalProps> = ({
  isOpen,
  onClose,
  problemForm,
  setProblemForm,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="surface my-auto w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solution Manager</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <Input
            label="Embedded Video Solution URL"
            value={problemForm.videoSolutionUrl}
            onChange={(value) =>
              setProblemForm((current) => ({ ...current, videoSolutionUrl: value }))
            }
            placeholder="e.g., https://www.youtube.com/embed/..."
          />

          <div className="mt-6 space-y-6">
            {problemForm.approaches.map((approach, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Approach {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setProblemForm((curr) => ({
                        ...curr,
                        approaches: curr.approaches.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-sm font-medium text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <Input
                    label="ID (e.g. brute-force, optimal)"
                    value={approach.id}
                    onChange={(val) =>
                      setProblemForm((curr) => {
                        const arr = [...curr.approaches];
                        arr[index].id = val;
                        return { ...curr, approaches: arr };
                      })
                    }
                  />
                  <Input
                    label="Title (e.g. 1. Brute Force Approach)"
                    value={approach.title}
                    onChange={(val) =>
                      setProblemForm((curr) => {
                        const arr = [...curr.approaches];
                        arr[index].title = val;
                        return { ...curr, approaches: arr };
                      })
                    }
                  />
                  <TextArea
                    label="Algorithm"
                    value={approach.algorithm}
                    onChange={(val) =>
                      setProblemForm((curr) => {
                        const arr = [...curr.approaches];
                        arr[index].algorithm = val;
                        return { ...curr, approaches: arr };
                      })
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Time Complexity"
                      value={approach.timeComplexity}
                      onChange={(val) =>
                        setProblemForm((curr) => {
                          const arr = [...curr.approaches];
                          arr[index].timeComplexity = val;
                          return { ...curr, approaches: arr };
                        })
                      }
                      placeholder="O(N)"
                    />
                    <Input
                      label="Space Complexity"
                      value={approach.spaceComplexity}
                      onChange={(val) =>
                        setProblemForm((curr) => {
                          const arr = [...curr.approaches];
                          arr[index].spaceComplexity = val;
                          return { ...curr, approaches: arr };
                        })
                      }
                      placeholder="O(1)"
                    />
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/5">
                    <h5 className="mb-3 font-medium text-slate-700 dark:text-slate-300">
                      Code Snippets
                    </h5>
                    {approach.codeSnippets.map((snippet, sIndex) => (
                      <div
                        key={sIndex}
                        className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-white/5"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Select
                            label="Language"
                            value={snippet.language}
                            onChange={(val) =>
                              setProblemForm((curr) => {
                                const arr = [...curr.approaches];
                                arr[index].codeSnippets[sIndex].language = val;
                                return { ...curr, approaches: arr };
                              })
                            }
                            options={[
                              { value: 'C++', label: 'C++' },
                              { value: 'Java', label: 'Java' },
                              { value: 'Python', label: 'Python' },
                              { value: 'JavaScript', label: 'JavaScript' },
                            ]}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProblemForm((curr) => {
                                const arr = [...curr.approaches];
                                arr[index].codeSnippets = arr[index].codeSnippets.filter(
                                  (_, i) => i !== sIndex
                                );
                                return { ...curr, approaches: arr };
                              })
                            }
                            className="mt-6 text-xs font-semibold text-rose-500"
                          >
                            Remove Code
                          </button>
                        </div>
                        <TextArea
                          label="Code"
                          value={snippet.code}
                          onChange={(val) =>
                            setProblemForm((curr) => {
                              const arr = [...curr.approaches];
                              arr[index].codeSnippets[sIndex].code = val;
                              return { ...curr, approaches: arr };
                            })
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setProblemForm((curr) => {
                          const arr = [...curr.approaches];
                          arr[index].codeSnippets.push({ language: 'C++', code: '' });
                          return { ...curr, approaches: arr };
                        })
                      }
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    >
                      + Add Language
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setProblemForm((curr) => ({
                  ...curr,
                  approaches: [
                    ...curr.approaches,
                    {
                      id: '',
                      title: '',
                      algorithm: '',
                      timeComplexity: '',
                      spaceComplexity: '',
                      codeSnippets: [],
                    },
                  ],
                }))
              }
              className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-700 dark:border-white/20 dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
            >
              + Add Approach
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#123b36] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

