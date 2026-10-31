import React from 'react';
import { Search, X } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';

export const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
    />
    {helperText && <span className="mt-1 block text-xs text-slate-400">{helperText}</span>}
  </label>
);

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  helperText?: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
    />
    {helperText && <span className="mt-1 block text-xs text-slate-400">{helperText}</span>}
  </label>
);

export const Select = CustomSelect;

export const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-[#101614] dark:text-slate-200">
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600 focus:ring-teal-600"
    />
  </label>
);

export const SearchBox = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search…'}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] py-2 pl-8 pr-8 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20 sm:w-56"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-emerald-500',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-amber-500',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-rose-500',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-blue-500',
};

export const FilterChip = ({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) => {
  const colored = color ? colorMap[color] : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
        active
          ? colored || 'bg-[#123b36] text-white dark:bg-teal-400 dark:text-[#08241f]'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
};

export const PaginationBar = ({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const safeTotal = Math.max(Number.isFinite(totalPages) && totalPages > 0 ? Math.floor(totalPages) : 1, 1);
  const safePage = Math.max(Number.isFinite(page) && page > 0 ? Math.floor(page) : 1, 1);

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={safePage <= 1}
        className="rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
      >
        Prev
      </button>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Page {safePage} / {safeTotal}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={safePage >= safeTotal}
        className="rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
      >
        Next
      </button>
    </div>
  );
};

