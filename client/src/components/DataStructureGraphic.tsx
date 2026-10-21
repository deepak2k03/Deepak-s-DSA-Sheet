import React from 'react';
import { Plus, Trash2, Search, Zap } from 'lucide-react';

/* Dynamic Minimalist Vector Graphic for Data Structures */
export const DataStructureGraphic: React.FC<{ name: string; family?: string }> = ({ name }) => {
  const lower = name.toLowerCase();

  // Linked Lists (Singly or Doubly)
  if (lower.includes('linked list')) {
    const isDoubly = lower.includes('doubly');
    return (
      <svg width="56" height="32" viewBox="0 0 56 32" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <circle cx="9" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" />
        <line x1="15" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" strokeDasharray={isDoubly ? '2 2' : 'none'} />
        <circle cx="28" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" />
        <line x1="34" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="2" strokeDasharray={isDoubly ? '2 2' : 'none'} />
        <circle cx="47" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }

  // Stack
  if (lower.includes('stack')) {
    return (
      <svg width="40" height="36" viewBox="0 0 40 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <rect x="7" y="24" width="26" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <rect x="7" y="15" width="26" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
        <rect x="7" y="6" width="26" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }

  // Queue & Deque
  if (lower.includes('queue')) {
    return (
      <svg width="48" height="30" viewBox="0 0 48 30" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <rect x="10" y="7" width="28" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="19" y1="7" x2="19" y2="23" stroke="currentColor" strokeWidth="1.5" />
        <line x1="28" y1="7" x2="28" y2="23" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 15H8M8 15L6 12M8 15L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 15H44M44 15L42 12M44 15L42 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Binary Search Tree / Trees
  if (lower.includes('tree') || lower.includes('bst')) {
    return (
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <circle cx="22" cy="7" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <line x1="18" y1="11" x2="11" y2="23" stroke="currentColor" strokeWidth="1.5" />
        <line x1="26" y1="11" x2="33" y2="23" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="27" r="4.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="35" cy="27" r="4.5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // Heap / Priority Queue
  if (lower.includes('heap')) {
    return (
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <polygon points="22,5 7,31 37,31" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="22" cy="14" r="3.5" fill="currentColor" />
        <circle cx="15" cy="24" r="3" fill="currentColor" fillOpacity="0.7" />
        <circle cx="29" cy="24" r="3" fill="currentColor" fillOpacity="0.7" />
      </svg>
    );
  }

  // Hash Table / HashMap
  if (lower.includes('hash') || lower.includes('map')) {
    return (
      <svg width="40" height="36" viewBox="0 0 40 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <rect x="6" y="5" width="28" height="26" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="18" y1="5" x2="18" y2="31" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="23" x2="34" y2="23" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  // Trie (Prefix Tree)
  if (lower.includes('trie')) {
    return (
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
        <circle cx="22" cy="6" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
        <line x1="20" y1="10" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="10" x2="32" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="23" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="33" cy="23" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="11" y1="26" x2="11" y2="31" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="33" r="2" fill="currentColor" />
      </svg>
    );
  }

  // Disjoint Set Union / Graphs / Default
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" fill="none" className="text-teal-500 dark:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
      <circle cx="10" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="34" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="22" cy="26" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <line x1="13" y1="14" x2="19" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="31" y1="12" x2="25" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="11" x2="30" y2="11" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
};

/* Helper for styling operations based on action type */
export const getOperationStyle = (opName: string, index: number) => {
  const lower = opName.toLowerCase();
  if (lower.includes('insert') || lower.includes('add') || lower.includes('push') || lower.includes('enqueue') || lower.includes('append')) {
    if (index % 2 === 0) {
      return {
        icon: <Plus size={11} className="stroke-[2.5]" />,
        containerClass: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30',
      };
    } else {
      return {
        icon: <Plus size={11} className="stroke-[2.5]" />,
        containerClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      };
    }
  }
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('pop') || lower.includes('dequeue')) {
    return {
      icon: <Trash2 size={11} />,
      containerClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    };
  }
  if (lower.includes('search') || lower.includes('find') || lower.includes('contains') || lower.includes('lookup') || lower.includes('key')) {
    return {
      icon: <Search size={11} />,
      containerClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
    };
  }
  return {
    icon: <Zap size={11} />,
    containerClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30',
  };
};
