import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Check, Search, X, Plus } from 'lucide-react';
import { getTopicIcon } from '../data/topics';

export interface SelectOption {
  value: string | number;
  label: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'teal' | 'slate' | 'blue' | 'purple';
  icon?: React.ReactNode;
  iconKey?: string;
  description?: string;
  disabled?: boolean;
  isAction?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: (SelectOption | { value: string | number; label: string })[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: 'sm' | 'md';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  placement?: 'auto' | 'bottom' | 'top';
  error?: string;
  helperText?: string;
  id?: string;
  name?: string;
}

const TOPIC_ICON_KEYS = new Set([
  'bar-chart-3',
  'binary',
  'book-open',
  'code-2',
  'cpu',
  'database',
  'file-text',
  'git-branch',
  'grid-3x3',
  'hash',
  'layers',
  'mouse-pointer',
  'network',
  'search',
  'shuffle',
  'target',
  'tree-pine',
  'zap',
]);

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '— Select —',
  required = false,
  disabled = false,
  searchable,
  searchPlaceholder = 'Search options…',
  size = 'md',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  placement = 'auto',
  error,
  helperText,
  id,
  name,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actualPlacement, setActualPlacement] = useState<'bottom' | 'top'>('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Normalize options
  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
      badge: 'badge' in opt ? opt.badge : undefined,
      badgeColor: 'badgeColor' in opt ? opt.badgeColor : undefined,
      icon: 'icon' in opt ? opt.icon : undefined,
      iconKey: 'iconKey' in opt ? opt.iconKey : undefined,
      description: 'description' in opt ? opt.description : undefined,
      disabled: 'disabled' in opt ? opt.disabled : false,
      isAction: 'isAction' in opt ? opt.isAction : false,
    }));
  }, [options]);

  // Current selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        String(opt.value).toLowerCase().includes(q) ||
        (opt.badge && opt.badge.toLowerCase().includes(q)) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  // Determine whether search bar should be shown
  const showSearch = searchable !== undefined ? searchable : normalizedOptions.length > 7;

  // Auto placement detection
  useEffect(() => {
    if (!isOpen) return;

    if (placement === 'top') {
      setActualPlacement('top');
      return;
    }
    if (placement === 'bottom') {
      setActualPlacement('bottom');
      return;
    }

    // Auto calculate space
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If space below is less than 240px and space above is larger, flip up
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setActualPlacement('top');
      } else {
        setActualPlacement('bottom');
      }
    }
  }, [isOpen, placement]);

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input or scroll selected into view when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      if (showSearch) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
    } else {
      setSearchQuery('');
    }
  }, [isOpen, showSearch]);

  const handleSelect = (optionValue: string | number) => {
    onChange(String(optionValue));
    setIsOpen(false);
  };

  // Keyboard navigation inside list
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const target = filteredOptions[highlightedIndex];
        if (!target.disabled) {
          handleSelect(target.value);
        }
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Helper to render icon for option
  const renderOptionIcon = (opt: SelectOption, iconSize = size === 'sm' ? 14 : 16) => {
    if (opt.icon) return opt.icon;
    if (opt.iconKey) return getTopicIcon(opt.iconKey, iconSize);
    if (TOPIC_ICON_KEYS.has(String(opt.value))) return getTopicIcon(String(opt.value), iconSize);
    if (opt.isAction) return <Plus size={iconSize} className="text-teal-500" />;
    return null;
  };

  // Helper to render badges (difficulty, status, custom)
  const renderBadge = (opt: SelectOption) => {
    const val = String(opt.value);
    const labelText = opt.label;

    let badgeText = opt.badge;
    let color = opt.badgeColor;

    if (!badgeText && !color) {
      if (val === 'Easy' || labelText === 'Easy') {
        badgeText = 'Easy';
        color = 'emerald';
      } else if (val === 'Medium' || labelText === 'Medium') {
        badgeText = 'Medium';
        color = 'amber';
      } else if (val === 'Hard' || labelText === 'Hard') {
        badgeText = 'Hard';
        color = 'rose';
      } else if (val === 'available' || labelText.includes('Live')) {
        badgeText = 'Live';
        color = 'emerald';
      } else if (val === 'unavailable' || labelText.includes('Awaiting') || labelText.includes('Draft')) {
        badgeText = 'Draft';
        color = 'amber';
      }
    }

    if (!badgeText) return null;

    const colorClasses: Record<string, string> = {
      emerald:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      amber:
        'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      rose:
        'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      teal:
        'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
      blue:
        'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      purple:
        'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      slate:
        'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10',
    };

    const finalClass = colorClasses[color || 'slate'] || colorClasses.slate;

    return (
      <span
        className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${finalClass}`}
      >
        {badgeText}
      </span>
    );
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      onKeyDown={handleContainerKeyDown}
      className={`relative ${isOpen ? 'z-[95]' : 'z-auto'} ${className}`}
    >
      {/* Hidden input for HTML form requirement */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value !== undefined ? String(value) : ''}
          required={required}
        />
      )}

      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="mb-1.5 block cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-2 text-left transition-all duration-150 outline-none ${
          isSmall
            ? 'min-h-[32px] rounded-xl px-3 py-1.5 text-xs font-semibold'
            : 'min-h-[42px] rounded-xl px-3.5 py-2.5 text-sm font-medium'
        } ${
          disabled
            ? 'cursor-not-allowed bg-slate-100/60 opacity-60 dark:bg-white/[0.02]'
            : 'cursor-pointer border border-slate-300 bg-white hover:border-slate-400 dark:border-white/10 dark:bg-[#101614] dark:hover:border-white/20'
        } ${
          isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/20 dark:border-teal-400 dark:ring-teal-400/20 shadow-xs'
            : ''
        } ${
          error ? 'border-rose-500 ring-1 ring-rose-500/30' : ''
        } ${triggerClassName}`}
      >
        {/* Selected Value / Placeholder Display */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {selectedOption ? (
            <>
              {renderOptionIcon(selectedOption) && (
                <span className="shrink-0 text-teal-600 dark:text-teal-400">
                  {renderOptionIcon(selectedOption)}
                </span>
              )}
              <span className="truncate text-slate-900 dark:text-white">
                {selectedOption.label}
              </span>
              {renderBadge(selectedOption)}
            </>
          ) : (
            <span className="truncate text-slate-400 dark:text-slate-500">
              {placeholder}
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          size={isSmall ? 13 : 16}
          className={`shrink-0 transition-transform duration-200 ease-out ${
            isOpen
              ? 'rotate-180 text-teal-600 dark:text-teal-400'
              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
          }`}
        />
      </button>

      {/* Helper text or error */}
      {error ? (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}

      {/* Popover Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 w-full min-w-[210px] rounded-2xl border border-slate-300 bg-white p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-teal-500/20 dark:bg-[#101614]/95 dark:shadow-black/70 animate-in fade-in-0 zoom-in-95 duration-150 z-[140] ${
            actualPlacement === 'top'
              ? 'bottom-full mb-1.5 origin-bottom'
              : 'top-full mt-1.5 origin-top'
          } ${menuClassName}`}
        >
          {/* Quick Search inside menu */}
          {showSearch && (
            <div className="sticky top-0 z-10 mb-1 border-b border-slate-100 bg-white/95 px-1 pb-1.5 pt-0.5 backdrop-blur-md dark:border-white/5 dark:bg-[#101614]/95">
              <div className="relative">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-slate-200/70 bg-slate-100/70 py-1.5 pl-7 pr-7 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:bg-[#121917]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scrollable Container */}
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <p>No matching options</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-1.5 font-semibold text-teal-600 hover:underline dark:text-teal-400"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;
                const icon = renderOptionIcon(opt);
                const badge = renderBadge(opt);

                if (opt.isAction) {
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className="group flex w-full items-center gap-2 rounded-xl border-t border-dashed border-slate-200 px-3 py-2 text-left text-xs font-semibold text-teal-600 transition hover:bg-teal-500/10 dark:border-white/10 dark:text-teal-400 dark:hover:bg-teal-500/15"
                    >
                      <Plus size={14} className="shrink-0" />
                      <span>{opt.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`group flex w-full items-center justify-between gap-2.5 rounded-xl text-left transition-colors cursor-pointer select-none ${
                      isSmall ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                    } ${
                      opt.disabled
                        ? 'cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'bg-teal-500/10 font-semibold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 dark:bg-white/5 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                  >
                    {/* Left: Icon + Label + Description */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {icon && (
                        <span
                          className={`shrink-0 ${
                            isSelected
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        >
                          {icon}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="truncate text-[11px] font-normal text-slate-400 dark:text-slate-500">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Badge + Checkmark */}
                    <div className="flex shrink-0 items-center gap-2">
                      {badge}
                      {isSelected ? (
                        <Check
                          size={isSmall ? 13 : 15}
                          className="text-teal-600 dark:text-teal-400"
                        />
                      ) : (
                        <div className={isSmall ? 'w-3.5' : 'w-4'} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
