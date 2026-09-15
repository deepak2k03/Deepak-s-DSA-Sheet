import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Code2, ArrowLeft, PlayCircle, Clock, Database, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { apiUrl } from '../config';

type Language = 'C++' | 'Java' | 'Python' | 'JavaScript' | string;

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

interface ProblemDetail {
  id: number;
  title: string;
  videoSolutionUrl?: string;
  approaches?: Approach[];
}

const getEmbedUrl = (url?: string) => {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) return url;
    
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    return url;
  }
  return url;
};

const SolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, Language>>({});

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl(`/api/problems/single/${id}`));
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblem(data);
        
        if (data.approaches && data.approaches.length > 0) {
          setExpandedSection(data.approaches[0].id);
          const defaultTabs: Record<string, Language> = {};
          data.approaches.forEach((app: Approach) => {
            if (app.codeSnippets && app.codeSnippets.length > 0) {
              defaultTabs[app.id] = app.codeSnippets[0].language;
            }
          });
          setActiveTabs(defaultTabs);
        }
      } catch (err) {
        setError('Failed to load problem details. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const setTab = (sectionId: string, lang: Language) => {
    setActiveTabs(prev => ({ ...prev, [sectionId]: lang }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <AnimatedBackground />
        <Loader2 className="animate-spin h-8 w-8 text-teal-500 z-10" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <AnimatedBackground />
        <div className="z-10 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-500 hover:underline">
            <ArrowLeft size={16} className="mr-1" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  const approaches = problem.approaches || [];
  const hasApproaches = approaches.length > 0;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />
      
      <div className="z-10 mx-auto max-w-5xl relative">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-2">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Solution: {problem.title}</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm">
            <Code2 size={24} />
          </div>
        </div>

        <div className="space-y-4">
          {!hasApproaches && !problem.videoSolutionUrl && (
            <div className="p-8 text-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
              <p className="text-[var(--text-secondary)] text-lg">No detailed solution has been provided for this problem yet.</p>
            </div>
          )}

          {/* Approaches */}
          {approaches.map((approach) => (
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
                  {approach.algorithm && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                        <ChevronRight size={18} className="mr-1 text-blue-500" />
                        1. Algorithm
                      </h3>
                      <div className="rounded-lg bg-[var(--bg-base)] p-4 text-[var(--text-secondary)] border border-[var(--border-subtle)] leading-relaxed whitespace-pre-wrap">
                        {approach.algorithm}
                      </div>
                    </div>
                  )}

                  {/* Code Snippets */}
                  {approach.codeSnippets && approach.codeSnippets.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                        <ChevronRight size={18} className="mr-1 text-emerald-500" />
                        2. Code
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-[var(--border-strong)]">
                        <div className="flex overflow-x-auto bg-[var(--bg-surface-muted)] border-b border-[var(--border-strong)] hide-scrollbar">
                          {approach.codeSnippets.map((snippet) => (
                            <button
                              key={snippet.language}
                              onClick={() => setTab(approach.id, snippet.language)}
                              className={`px-4 py-2.5 text-sm whitespace-nowrap font-medium transition-colors ${
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
                  )}

                  {/* Complexity */}
                  {(approach.timeComplexity || approach.spaceComplexity) && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold flex items-center text-[var(--text-primary)]">
                        <ChevronRight size={18} className="mr-1 text-purple-500" />
                        3. Complexity Analysis
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {approach.timeComplexity && (
                          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-start gap-3">
                            <Clock className="mt-0.5 text-rose-500" size={20} />
                            <div>
                              <div className="font-semibold text-[var(--text-primary)]">Time Complexity</div>
                              <div className="text-sm text-[var(--text-secondary)] mt-1 font-mono bg-[var(--bg-surface-muted)] px-2 py-0.5 rounded inline-block border border-[var(--border-subtle)]">
                                {approach.timeComplexity}
                              </div>
                            </div>
                          </div>
                        )}
                        {approach.spaceComplexity && (
                          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 flex items-start gap-3">
                            <Database className="mt-0.5 text-indigo-500" size={20} />
                            <div>
                              <div className="font-semibold text-[var(--text-primary)]">Space Complexity</div>
                              <div className="text-sm text-[var(--text-secondary)] mt-1 font-mono bg-[var(--bg-surface-muted)] px-2 py-0.5 rounded inline-block border border-[var(--border-subtle)]">
                                {approach.spaceComplexity}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          ))}

          {/* Video Solution */}
          {problem.videoSolutionUrl && (
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
                      src={getEmbedUrl(problem.videoSolutionUrl)}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;
