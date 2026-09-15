import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Code2, ArrowLeft, PlayCircle, Clock, Database, ChevronRight } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

// Types
type Language = 'C++' | 'Java' | 'Python' | 'JavaScript';

interface CodeSnippet {
  language: Language;
  code: string;
}

interface Approach {
  id: string;
  title: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeSnippets: CodeSnippet[];
}

// Dummy Data
const dummyApproaches: Approach[] = [
  {
    id: 'brute-force',
    title: '1. Brute Force Approach',
    algorithm: 'The most straightforward way to solve this is to check every possible combination or iterate through all elements. This usually involves nested loops.',
    timeComplexity: 'O(N^2)',
    spaceComplexity: 'O(1)',
    codeSnippets: [
      { language: 'C++', code: 'class Solution {\npublic:\n    void bruteForce() {\n        // Iterate over everything\n    }\n};' },
      { language: 'Java', code: 'class Solution {\n    public void bruteForce() {\n        // Iterate over everything\n    }\n}' },
      { language: 'Python', code: 'class Solution:\n    def bruteForce(self):\n        # Iterate over everything\n        pass' },
      { language: 'JavaScript', code: 'var bruteForce = function() {\n    // Iterate over everything\n};' },
    ]
  },
  {
    id: 'better',
    title: '2. Better Approach',
    algorithm: 'We can optimize the brute force by using a hash map or sorting the array first. This trades some space for better time complexity.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    codeSnippets: [
      { language: 'C++', code: 'class Solution {\npublic:\n    void betterApproach() {\n        // Use a hash map\n    }\n};' },
      { language: 'Java', code: 'class Solution {\n    public void betterApproach() {\n        // Use a hash map\n    }\n}' },
      { language: 'Python', code: 'class Solution:\n    def betterApproach(self):\n        # Use a hash map\n        pass' },
      { language: 'JavaScript', code: 'var betterApproach = function() {\n    // Use a hash map\n};' },
    ]
  },
  {
    id: 'best',
    title: '3. Best Approach (Optimal)',
    algorithm: 'The optimal approach usually involves an advanced technique like sliding window, two pointers, or dynamic programming to achieve linear time.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    codeSnippets: [
      { language: 'C++', code: 'class Solution {\npublic:\n    void optimalApproach() {\n        // Two pointers\n    }\n};' },
      { language: 'Java', code: 'class Solution {\n    public void optimalApproach() {\n        // Two pointers\n    }\n}' },
      { language: 'Python', code: 'class Solution:\n    def optimalApproach(self):\n        # Two pointers\n        pass' },
      { language: 'JavaScript', code: 'var optimalApproach = function() {\n    // Two pointers\n};' },
    ]
  }
];

const dummyVideoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Replace with real video ID

const SolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expandedSection, setExpandedSection] = useState<string | null>('brute-force');
  const [activeTabs, setActiveTabs] = useState<Record<string, Language>>({
    'brute-force': 'C++',
    'better': 'C++',
    'best': 'C++'
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const setTab = (sectionId: string, lang: Language) => {
    setActiveTabs(prev => ({ ...prev, [sectionId]: lang }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />
      
      <div className="z-10 mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Solution: Problem {id}</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm">
            <Code2 size={24} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Approaches */}
          {dummyApproaches.map((approach) => (
            <div key={approach.id} className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-all">
              <button
                onClick={() => toggleSection(approach.id)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--bg-surface-hover)] focus:outline-none"
              >
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{approach.title}</h2>
                {expandedSection === approach.id ? (
                  <ChevronUp className="text-[var(--text-muted)]" size={24} />
                ) : (
                  <ChevronDown className="text-[var(--text-muted)]" size={24} />
                )}
              </button>

              {expandedSection === approach.id && (
                <div className="border-t border-[var(--border-subtle)] p-5 space-y-6">
                  
                  {/* Algorithm */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                      <ChevronRight size={18} className="mr-1 text-blue-500" />
                      1. Algorithm
                    </h3>
                    <div className="rounded-lg bg-[var(--bg-base)] p-4 text-[var(--text-secondary)] border border-[var(--border-subtle)] leading-relaxed">
                      {approach.algorithm}
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                      <ChevronRight size={18} className="mr-1 text-emerald-500" />
                      2. Code
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-[var(--border-strong)]">
                      <div className="flex bg-[var(--bg-surface-muted)] border-b border-[var(--border-strong)]">
                        {approach.codeSnippets.map((snippet) => (
                          <button
                            key={snippet.language}
                            onClick={() => setTab(approach.id, snippet.language)}
                            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                              activeTabs[approach.id] === snippet.language
                                ? 'bg-[var(--bg-surface)] text-blue-500 border-b-2 border-blue-500'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {snippet.language}
                          </button>
                        ))}
                      </div>
                      <div className="bg-[#0d1117] p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300 font-mono">
                          <code>
                            {approach.codeSnippets.find(s => s.language === activeTabs[approach.id])?.code}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Complexity */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                      <ChevronRight size={18} className="mr-1 text-purple-500" />
                      3. Complexity Analysis
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-start gap-3">
                        <Clock className="mt-0.5 text-rose-500" size={20} />
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">Time Complexity</div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1 font-mono bg-[var(--bg-surface-muted)] px-2 py-0.5 rounded inline-block border border-[var(--border-subtle)]">
                            {approach.timeComplexity}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-start gap-3">
                        <Database className="mt-0.5 text-indigo-500" size={20} />
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">Space Complexity</div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1 font-mono bg-[var(--bg-surface-muted)] px-2 py-0.5 rounded inline-block border border-[var(--border-subtle)]">
                            {approach.spaceComplexity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          ))}

          {/* Video Solution */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-all">
            <button
              onClick={() => toggleSection('video')}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--bg-surface-hover)] focus:outline-none"
            >
              <h2 className="text-xl font-bold flex items-center text-[var(--text-primary)]">
                <PlayCircle className="mr-2 text-red-500" size={24} />
                Video Solution
              </h2>
              {expandedSection === 'video' ? (
                <ChevronUp className="text-[var(--text-muted)]" size={24} />
              ) : (
                <ChevronDown className="text-[var(--text-muted)]" size={24} />
              )}
            </button>
            {expandedSection === 'video' && (
              <div className="border-t border-[var(--border-subtle)] p-5">
                <div className="relative w-full overflow-hidden rounded-lg pb-[56.25%] shadow-md">
                  <iframe
                    className="absolute left-0 top-0 h-full w-full border-0"
                    src={dummyVideoUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;
