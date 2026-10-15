import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  FolderTree,
  LayoutDashboard,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Sparkles,
  Users,
  Wrench,
  X,
  Youtube,
  PlayCircle,
  Eye,
  Code2,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  Trash2,
  UploadCloud,
  HardDrive,
  Settings,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import VisualizerFrame from '../components/VisualizerFrame';
import { apiUrl } from '../config';
import {
  defaultTopics,
  getTopicIcon,
  topicIconOptions,
  type TopicDefinition,
} from '../data/topics';
import {
  VISUALIZER_CATEGORIES,
  type AlgorithmCategory,
  type VisualizerAlgorithm,
} from '../data/visualizers';
import { getStoredToken, getStoredUser, updateStoredUser } from '../utils/auth';
import { getCanonicalTopicSlug } from '../utils/topics';
import {
  checkR2Status,
  replaceAdminVisualizerFile,
  fetchVisualizerCategories,
  createAdminVisualizerCategory,
  deleteAdminVisualizerCategory,
  type R2StatusResponse,
  type VisualizerCategoryItem,
} from '../utils/visualizerApi';


type AdminTab = 'overview' | 'topics' | 'problems' | 'visualizers' | 'users' | 'potd' | 'audit';

interface AdminProblem {
  id: string;
  problemNumber: number;
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tutorialLink: string;
  githubLink: string;
  videoSolutionUrl: string;
  approaches: Array<{
    id: string;
    title: string;
    algorithm: string;
    timeComplexity: string;
    spaceComplexity: string;
    codeSnippets: Array<{ language: string; code: string }>;
  }>;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  solvedProblems: string[];
  role: 'user' | 'moderator' | 'content_manager' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface AuditLogEntry {
  _id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface OverviewData {
  stats: {
    users: number;
    activeUsers: number;
    admins: number;
    problems: number;
    topics: number;
    visualizers?: number;
    totalSolved: number;
  };
  potd: {
    problemId: string;
    problemNumber: number;
    title: string;
    date: string;
  } | null;
  trends?: {
    newUsersByDay: Array<{ date: string; value: number }>;
    solvesByDay: Array<{ date: string; value: number }>;
    topTopics: Array<{ slug: string; name: string; solves: number }>;
  };
}

interface TopicFormState {
  name: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  iconKey: string;
  order: string;
  isActive: boolean;
}

interface ProblemFormState {
  problemNumber: string;
  title: string;
  link: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tutorialLink: string;
  solutionLink?: string;
  githubLink: string;
  videoSolutionUrl: string;
  approaches: Array<{
    id: string;
    title: string;
    algorithm: string;
    timeComplexity: string;
    spaceComplexity: string;
    codeSnippets: Array<{ language: string; code: string }>;
  }>;
}

const defaultTopicForm: TopicFormState = {
  name: '',
  slug: '',
  description: '',
  difficulty: 'Medium' as const,
  iconKey: 'book-open',
  order: '0',
  isActive: true,
};

const defaultProblemForm: ProblemFormState = {
  problemNumber: '',
  title: '',
  link: '',
  topic: '',
  difficulty: 'Medium' as const,
  tutorialLink: '',
  githubLink: '',
  videoSolutionUrl: '',
  approaches: [],
};

interface VisualizerFormState {
  name: string;
  slug: string;
  category: AlgorithmCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceComplexity: string;
  tags: string;
  keyConcepts: string;
  status: 'available' | 'unavailable';
  order: string;
}

const defaultVisualizerForm: VisualizerFormState = {
  name: '',
  slug: '',
  category: 'Searching',
  difficulty: 'Medium',
  description: '',
  timeBest: 'O(1)',
  timeAverage: 'O(n)',
  timeWorst: 'O(n)',
  spaceComplexity: 'O(1)',
  tags: '',
  keyConcepts: '',
  status: 'unavailable',
  order: '0',
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'topics', label: 'Topics', icon: <FolderTree size={16} /> },
  { id: 'problems', label: 'Problems', icon: <Wrench size={16} /> },
  { id: 'visualizers', label: 'Visualizers', icon: <PlayCircle size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'potd', label: 'POTD', icon: <Sparkles size={16} /> },
  { id: 'audit', label: 'Audit', icon: <Shield size={16} /> },
];

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [topics, setTopics] = useState<TopicDefinition[]>(defaultTopics);
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [topicsPagination, setTopicsPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [problemsPagination, setProblemsPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [usersPagination, setUsersPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [auditPagination, setAuditPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [selectedPotdProblemId, setSelectedPotdProblemId] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [topicStatusFilter, setTopicStatusFilter] = useState<'all' | 'active' | 'hidden' | 'deleted'>('all');
  const [isReorderingTopics, setIsReorderingTopics] = useState(false);
  const [isReorderingProblems, setIsReorderingProblems] = useState(false);
  const [problemPageSize, setProblemPageSize] = useState<number | 'all'>(20);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [problemTopicFilter, setProblemTopicFilter] = useState('');
  const [problemStatusFilter, setProblemStatusFilter] = useState<'all' | 'live' | 'deleted'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'' | 'admin' | 'user' | 'moderator' | 'content_manager'>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'' | 'active' | 'disabled'>('');
  const [auditSearch, setAuditSearch] = useState('');
  const loadRequestIdRef = useRef(0);

    const filteredTopics = useMemo(() => {
      const q = topicSearch.toLowerCase();
      if (!q) return topics;
      return topics.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
    }, [topics, topicSearch]);

    const filteredProblems = useMemo(() => {
      return problems.filter(p => {
        const q = problemSearch.toLowerCase().trim();
        if (q && !p.title.toLowerCase().includes(q) && !String(p.problemNumber).includes(q)) return false;
        if (problemDifficultyFilter && p.difficulty !== problemDifficultyFilter) return false;
        return true;
      });
    }, [problems, problemSearch, problemDifficultyFilter]);

    const filteredUsers = useMemo(() => {
      return users.filter(u => {
        const q = userSearch.toLowerCase();
        if (q && !u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
        if (userRoleFilter && u.role !== userRoleFilter) return false;
        if (userStatusFilter === 'active' && !u.isActive) return false;
        if (userStatusFilter === 'disabled' && u.isActive) return false;
        return true;
      });
    }, [users, userSearch, userRoleFilter, userStatusFilter]);
  const [topicForm, setTopicForm] = useState<TopicFormState>(defaultTopicForm);
  const [problemForm, setProblemForm] = useState<ProblemFormState>(defaultProblemForm);

  const [visualizers, setVisualizers] = useState<VisualizerAlgorithm[]>([]);
  const [visualizersPagination, setVisualizersPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [visualizerStats, setVisualizerStats] = useState({ total: 0, live: 0, awaiting: 0 });
  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [visualizerCategoryFilter, setVisualizerCategoryFilter] = useState('All');
  const [visualizerStatusFilter, setVisualizerStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [editingVisualizerId, setEditingVisualizerId] = useState<string | null>(null);
  const [visualizerForm, setVisualizerForm] = useState<VisualizerFormState>(defaultVisualizerForm);
  const [isVisualizerSettingsModalOpen, setIsVisualizerSettingsModalOpen] = useState(false);
  const [visualizerCodeModal, setVisualizerCodeModal] = useState<{
    isOpen: boolean;
    visualizer: VisualizerAlgorithm | null;
    code: string;
    filePath: string;
    saving: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    visualizer: null,
    code: '',
    filePath: '',
    saving: false,
    copied: false,
  });
  const [visualizerPreviewModal, setVisualizerPreviewModal] = useState<{
    isOpen: boolean;
    visualizer: VisualizerAlgorithm | null;
  }>({
    isOpen: false,
    visualizer: null,
  });

  const [r2Status, setR2Status] = useState<R2StatusResponse | null>(null);
  const [r2Loading, setR2Loading] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [replaceFileModal, setReplaceFileModal] = useState<{
    isOpen: boolean;
    visualizer: VisualizerAlgorithm | null;
    file: File | null;
    uploading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    visualizer: null,
    file: null,
    uploading: false,
    error: null,
  });

  const [categories, setCategories] = useState<VisualizerCategoryItem[]>([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerInput, setCategoryManagerInput] = useState('');

  // Dynamically compute all unique categories from defaults, database, and loaded visualizers
  const availableCategoryNames = useMemo(() => {
    const set = new Set<string>(VISUALIZER_CATEGORIES);
    for (const c of categories) {
      if (c.name) set.add(c.name);
    }
    for (const v of visualizers) {
      if (v.category) set.add(v.category);
    }
    return Array.from(set);
  }, [categories, visualizers]);

  const isAnyModalOpen =
    isSolutionModalOpen ||
    isVisualizerSettingsModalOpen ||
    visualizerCodeModal.isOpen ||
    replaceFileModal.isOpen ||
    visualizerPreviewModal.isOpen ||
    isCategoryManagerOpen;

  // Lock background body scrolling when any modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // Handle ESC key to dismiss topmost modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCategoryManagerOpen) {
          setIsCategoryManagerOpen(false);
        } else if (visualizerPreviewModal.isOpen) {
          setVisualizerPreviewModal({ isOpen: false, visualizer: null });
        } else if (replaceFileModal.isOpen) {
          setReplaceFileModal({ isOpen: false, visualizer: null, file: null, uploading: false, error: null });
        } else if (visualizerCodeModal.isOpen) {
          setVisualizerCodeModal((p) => ({ ...p, isOpen: false }));
        } else if (isVisualizerSettingsModalOpen) {
          setIsVisualizerSettingsModalOpen(false);
          resetVisualizerForm();
        } else if (isSolutionModalOpen) {
          setIsSolutionModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCategoryManagerOpen,
    visualizerPreviewModal.isOpen,
    replaceFileModal.isOpen,
    visualizerCodeModal.isOpen,
    isVisualizerSettingsModalOpen,
    isSolutionModalOpen,
  ]);

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategorySubmitting(true);
    try {
      const created = await createAdminVisualizerCategory(trimmed);
      setCategories((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return prev;
        return [...prev, created];
      });
      setVisualizerForm((curr) => ({ ...curr, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
      setNotice(`Category "${trimmed}" created and selected.`);
    } catch {
      // If error or already exists, still set it in form
      setVisualizerForm((curr) => ({ ...curr, category: trimmed }));
      setNewCategoryName('');
      setIsCreatingNewCategory(false);
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleCreateCategoryInManager = async () => {
    const trimmed = categoryManagerInput.trim();
    if (!trimmed) return;
    setCategorySubmitting(true);
    try {
      const created = await createAdminVisualizerCategory(trimmed);
      setCategories((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return prev;
        return [...prev, created];
      });
      setCategoryManagerInput('');
      setNotice(`Category "${trimmed}" created.`);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategoryInManager = async (id: string, name: string) => {
    try {
      await deleteAdminVisualizerCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setNotice(`Category "${name}" removed.`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const refreshR2Status = async () => {
    setR2Loading(true);
    try {
      const res = await checkR2Status();
      setR2Status(res);
    } catch {
      // Ignored
    } finally {
      setR2Loading(false);
    }
  };


  const filteredVisualizers = useMemo(() => {
    return visualizers.filter((v) => {
      const q = visualizerSearch.toLowerCase().trim();
      if (q && !v.name.toLowerCase().includes(q) && !v.slug.toLowerCase().includes(q) && !v.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (visualizerCategoryFilter !== 'All' && v.category !== visualizerCategoryFilter) return false;
      if (visualizerStatusFilter !== 'all' && v.status !== visualizerStatusFilter) return false;
      return true;
    });
  }, [visualizers, visualizerSearch, visualizerCategoryFilter, visualizerStatusFilter]);

  const authHeaders = useMemo(() => {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token || '',
    };
  }, []);

  const resetTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm(defaultTopicForm);
  };

  const resetProblemForm = () => {
    setEditingProblemId(null);
    setProblemForm(defaultProblemForm);
  };

  const resetVisualizerForm = () => {
    setEditingVisualizerId(null);
    setVisualizerForm(defaultVisualizerForm);
    setSelectedUploadFile(null);
  };

  const makeQuery = (entries: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(entries).forEach(([key, value]) => {
      if (value !== undefined && String(value).trim() !== '') {
        params.set(key, String(value));
      }
    });
    return params.toString();
  };

  const loadAdminData = async (showRefreshState = false) => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const topicsQuery = makeQuery({
        page: topicsPagination.page,
        limit: topicsPagination.limit,
        query: topicSearch,
        status: topicStatusFilter,
      });
      const effectiveProblemLimit = problemPageSize === 'all'
        ? 500
        : problemPageSize;
      const effectiveProblemPage = problemPageSize === 'all'
        ? 1
        : problemsPagination.page;

      const problemsQuery = makeQuery({
        page: effectiveProblemPage,
        limit: effectiveProblemLimit,
        query: problemSearch,
        difficulty: problemDifficultyFilter,
        topic: problemTopicFilter,
        status: problemStatusFilter,
      });
      const usersQuery = makeQuery({
        page: usersPagination.page,
        limit: usersPagination.limit,
        query: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
      });
      const auditQuery = makeQuery({
        page: auditPagination.page,
        limit: auditPagination.limit,
        query: auditSearch,
      });
      const visualizersQuery = makeQuery({
        page: visualizersPagination.page,
        limit: visualizersPagination.limit,
        query: visualizerSearch,
        category: visualizerCategoryFilter,
        status: visualizerStatusFilter,
      });

      const getJson = async (path: string, fallbackMessage: string) => {
        const response = await fetch(apiUrl(path), { headers: authHeaders });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.msg || fallbackMessage);
        }

        return payload;
      };

      const [overviewResult, topicsResult, problemsResult, usersResult, auditResult, visualizersResult, categoriesResult] = await Promise.allSettled([
        getJson('/api/admin/overview', 'Failed to load overview'),
        getJson(`/api/admin/topics?${topicsQuery}`, 'Failed to load topics'),
        getJson(`/api/admin/problems?${problemsQuery}`, 'Failed to load problems'),
        getJson(`/api/admin/users?${usersQuery}`, 'Failed to load users'),
        getJson(`/api/admin/audit-logs?${auditQuery}`, 'Failed to load audit logs'),
        getJson(`/api/admin/visualizers?${visualizersQuery}`, 'Failed to load visualizers'),
        getJson('/api/admin/visualizers/categories', 'Failed to load visualizer categories'),
      ]);

      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      const errors: string[] = [];

      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
        if (overviewResult.value?.potd?.problemId) {
          setSelectedPotdProblemId(overviewResult.value.potd.problemId);
        }
      } else {
        errors.push(overviewResult.reason instanceof Error ? overviewResult.reason.message : 'Failed to load overview');
      }

      if (topicsResult.status === 'fulfilled') {
        setTopics(Array.isArray(topicsResult.value?.items) ? topicsResult.value.items : []);
        if (topicsResult.value?.pagination) setTopicsPagination(topicsResult.value.pagination);
      } else {
        errors.push(topicsResult.reason instanceof Error ? topicsResult.reason.message : 'Failed to load topics');
      }

      if (problemsResult.status === 'fulfilled') {
        setProblems(Array.isArray(problemsResult.value?.items) ? problemsResult.value.items : []);
        if (problemsResult.value?.pagination) {
          setProblemsPagination({
            ...problemsResult.value.pagination,
            limit: typeof problemPageSize === 'number' ? problemPageSize : 20,
          });
        }
      } else {
        errors.push(problemsResult.reason instanceof Error ? problemsResult.reason.message : 'Failed to load problems');
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(Array.isArray(usersResult.value?.items) ? usersResult.value.items : []);
        if (usersResult.value?.pagination) setUsersPagination(usersResult.value.pagination);
      } else {
        errors.push(usersResult.reason instanceof Error ? usersResult.reason.message : 'Failed to load users');
      }

      if (auditResult.status === 'fulfilled') {
        setAuditLogs(Array.isArray(auditResult.value?.items) ? auditResult.value.items : []);
        if (auditResult.value?.pagination) setAuditPagination(auditResult.value.pagination);
      } else {
        errors.push(auditResult.reason instanceof Error ? auditResult.reason.message : 'Failed to load audit logs');
      }

      if (visualizersResult.status === 'fulfilled') {
        setVisualizers(Array.isArray(visualizersResult.value?.items) ? visualizersResult.value.items : []);
        if (visualizersResult.value?.pagination) setVisualizersPagination(visualizersResult.value.pagination);
        if (visualizersResult.value?.stats) setVisualizerStats(visualizersResult.value.stats);
        if (visualizersResult.value?.r2) setR2Status(visualizersResult.value.r2);
      } else {
        errors.push(visualizersResult.reason instanceof Error ? visualizersResult.reason.message : 'Failed to load visualizers');
      }

      if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
        setCategories(categoriesResult.value);
      }

      setError(errors.join(' • '));
    } catch (loadError) {
      if (loadRequestIdRef.current === requestId) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load admin data');
      }
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadAdminData();
    } else {
      loadAdminData(true);
    }
  }, [
    topicSearch,
    topicStatusFilter,
    problemSearch,
    problemDifficultyFilter,
    problemTopicFilter,
    problemStatusFilter,
    problemPageSize,
    userSearch,
    userRoleFilter,
    userStatusFilter,
    auditSearch,
    visualizerSearch,
    visualizerCategoryFilter,
    visualizerStatusFilter,
    visualizersPagination.page,
    topicsPagination.page,
    problemsPagination.page,
    usersPagination.page,
    auditPagination.page,
  ]);

  useEffect(() => {
    if (activeTab === 'visualizers') {
      refreshR2Status();
    }
  }, [activeTab]);

  useEffect(() => {
    setVisualizersPagination((p) => ({ ...p, page: 1 }));
  }, [visualizerSearch, visualizerCategoryFilter, visualizerStatusFilter]);


  useEffect(() => {
    setTopicsPagination((p) => ({ ...p, page: 1 }));
  }, [topicSearch, topicStatusFilter]);

  useEffect(() => {
    setProblemsPagination((p) => ({ ...p, page: 1 }));
  }, [problemSearch, problemDifficultyFilter, problemTopicFilter, problemStatusFilter, problemPageSize]);

  useEffect(() => {
    setUsersPagination((p) => ({ ...p, page: 1 }));
  }, [userSearch, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    setAuditPagination((p) => ({ ...p, page: 1 }));
  }, [auditSearch]);

  const withNotice = async (action: () => Promise<void>, successMessage: string) => {
    setSaving(true);
    setNotice('');
    setError('');

    try {
      await action();
      setNotice(successMessage);
      await loadAdminData(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const saveTopic = async (event: React.FormEvent) => {
    event.preventDefault();

    await withNotice(async () => {
      const response = await fetch(
        editingTopicId ? apiUrl(`/api/admin/topics/${editingTopicId}`) : apiUrl('/api/admin/topics'),
        {
          method: editingTopicId ? 'PUT' : 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            ...topicForm,
            order: Number(topicForm.order),
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to save topic');
      }

      resetTopicForm();
    }, editingTopicId ? 'Topic updated' : 'Topic created');
  };

  const saveProblem = async (event: React.FormEvent) => {
    event.preventDefault();

    await withNotice(async () => {
      const response = await fetch(
        editingProblemId ? apiUrl(`/api/admin/problems/${editingProblemId}`) : apiUrl('/api/admin/problems'),
        {
          method: editingProblemId ? 'PUT' : 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            ...problemForm,
            problemNumber: problemForm.problemNumber ? Number(problemForm.problemNumber) : undefined,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to save problem');
      }

      resetProblemForm();
      await loadAdminData(true);
    }, editingProblemId ? 'Problem updated' : 'Problem created');
  };

  const deleteTopic = async (topicId: string) => {
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/topics/${topicId}`), {
        method: 'DELETE',
        headers: authHeaders,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to delete topic');
      }

      if (editingTopicId === topicId) {
        resetTopicForm();
      }
    }, 'Topic archived');
  };

  const restoreTopic = async (topicId: string) => {
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/topics/${topicId}/restore`), {
        method: 'POST',
        headers: authHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || 'Failed to restore topic');
    }, 'Topic restored');
  };

  const moveTopic = (topicId: string, direction: 'up' | 'down') => {
    setTopics((current) => {
      const index = current.findIndex((t) => t.id === topicId || t.slug === topicId);
      if (index < 0) return current;
      if (direction === 'up' && index === 0) return current;
      if (direction === 'down' && index === current.length - 1) return current;

      const newTopics = [...current];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newTopics[index], newTopics[swapIndex]] = [newTopics[swapIndex], newTopics[index]];

      return newTopics.map((t, i) => ({ ...t, order: i }));
    });
    setIsReorderingTopics(true);
  };

  const saveTopicOrder = async () => {
    await withNotice(async () => {
      const updates = topics.map((t, i) => ({ id: t.id, order: i }));
      const response = await fetch(apiUrl('/api/admin/topics/reorder'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ updates }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || 'Failed to save order');
      setIsReorderingTopics(false);
    }, 'Topic order saved');
  };

  const moveProblem = (problemId: string, direction: 'up' | 'down') => {
    setProblems((current) => {
      const index = current.findIndex((p) => p.id === problemId);
      if (index < 0) return current;
      
      const currentProblem = current[index];
      
      // Find the adjacent problem in the same topic
      const topicProblems = current.filter(p => p.topic === currentProblem.topic);
      const topicIndex = topicProblems.findIndex(p => p.id === problemId);
      
      if (direction === 'up' && topicIndex === 0) return current;
      if (direction === 'down' && topicIndex === topicProblems.length - 1) return current;
      
      const swapProblem = direction === 'up' ? topicProblems[topicIndex - 1] : topicProblems[topicIndex + 1];
      const swapIndex = current.findIndex(p => p.id === swapProblem.id);
      
      const newProblems = [...current];
      [newProblems[index], newProblems[swapIndex]] = [newProblems[swapIndex], newProblems[index]];

      return newProblems;
    });
    setIsReorderingProblems(true);
  };

  const saveProblemOrder = async () => {
    await withNotice(async () => {
      // Create updates using the current index as order
      const updates = problems.map((p, i) => ({ id: p.id, order: i }));
      const response = await fetch(apiUrl('/api/admin/problems/reorder'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ updates }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || 'Failed to save order');
      setIsReorderingProblems(false);
    }, 'Problem order saved');
  };

  const deleteProblem = async (problemId: string) => {
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/problems/${problemId}`), {
        method: 'DELETE',
        headers: authHeaders,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to delete problem');
      }

      if (editingProblemId === problemId) {
        resetProblemForm();
      }
    }, 'Problem archived');
  };

  const restoreProblem = async (problemId: string) => {
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/problems/${problemId}/restore`), {
        method: 'POST',
        headers: authHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || 'Failed to restore problem');
    }, 'Problem restored');
  };

  const updateUserAccess = async (
    user: AdminUser,
    nextRole: 'user' | 'moderator' | 'content_manager' | 'admin',
    nextActive: boolean,
  ) => {
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/users/${user.id}`), {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ role: nextRole, isActive: nextActive }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to update user');
      }

      const currentUser = getStoredUser();
      if (currentUser?.id === payload.id) {
        updateStoredUser((storedUser) => ({
          ...storedUser,
          role: payload.role,
          isActive: payload.isActive,
        }));
      }
    }, `Updated ${user.username}`);
  };

  const assignPotd = async () => {
    if (!selectedPotdProblemId) {
      setError('Select a problem first');
      return;
    }

    await withNotice(async () => {
      const response = await fetch(apiUrl('/api/admin/potd'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ problemId: selectedPotdProblemId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to set POTD');
      }
    }, 'Problem of the day updated');
  };

  const editVisualizer = (vis: VisualizerAlgorithm) => {
    setEditingVisualizerId(vis.id);
    setVisualizerForm({
      name: vis.name,
      slug: vis.slug,
      category: vis.category,
      difficulty: vis.difficulty,
      description: vis.description,
      timeBest: vis.timeComplexity?.best || 'O(1)',
      timeAverage: vis.timeComplexity?.average || 'O(n)',
      timeWorst: vis.timeComplexity?.worst || 'O(n)',
      spaceComplexity: vis.spaceComplexity || 'O(1)',
      tags: (vis.tags || []).join(', '),
      keyConcepts: (vis.keyConcepts || []).join('\n'),
      status: vis.status,
      order: String(vis.order || 0),
    });
    setSelectedUploadFile(null);
  };

  const openVisualizerSettings = (vis: VisualizerAlgorithm) => {
    editVisualizer(vis);
    setIsVisualizerSettingsModalOpen(true);
  };

  const openCreateVisualizer = () => {
    resetVisualizerForm();
    setIsVisualizerSettingsModalOpen(true);
  };

  const handleExecuteFileReplace = async () => {
    if (!replaceFileModal.visualizer || !replaceFileModal.file) return;
    setReplaceFileModal((curr) => ({ ...curr, uploading: true, error: null }));
    try {
      const result = await replaceAdminVisualizerFile(
        replaceFileModal.visualizer.id,
        replaceFileModal.file
      );
      setNotice(result.msg || 'HTML animation uploaded to persistent storage');
      setReplaceFileModal({
        isOpen: false,
        visualizer: null,
        file: null,
        uploading: false,
        error: null,
      });
      loadAdminData(true);
    } catch (err: any) {
      setReplaceFileModal((curr) => ({
        ...curr,
        uploading: false,
        error: err.message || 'Failed to upload file',
      }));
    }
  };

  const saveVisualizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visualizerForm.name.trim()) return;

    await withNotice(async () => {
      const payload = {
        name: visualizerForm.name.trim(),
        slug: visualizerForm.slug.trim(),
        category: visualizerForm.category,
        difficulty: visualizerForm.difficulty,
        description: visualizerForm.description.trim(),
        timeComplexity: {
          best: visualizerForm.timeBest.trim(),
          average: visualizerForm.timeAverage.trim(),
          worst: visualizerForm.timeWorst.trim(),
        },
        spaceComplexity: visualizerForm.spaceComplexity.trim(),
        tags: visualizerForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        keyConcepts: visualizerForm.keyConcepts.split('\n').map((c) => c.trim()).filter(Boolean),
        status: visualizerForm.status,
        order: Number(visualizerForm.order) || 0,
      };

      let response: Response;
      if (editingVisualizerId) {
        response = await fetch(apiUrl(`/api/admin/visualizers/${editingVisualizerId}`), {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
      } else if (selectedUploadFile) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('slug', payload.slug);
        formData.append('category', payload.category);
        formData.append('difficulty', payload.difficulty);
        formData.append('description', payload.description);
        formData.append('timeBest', payload.timeComplexity.best);
        formData.append('timeAverage', payload.timeComplexity.average);
        formData.append('timeWorst', payload.timeComplexity.worst);
        formData.append('spaceComplexity', payload.spaceComplexity);
        formData.append('tags', JSON.stringify(payload.tags));
        formData.append('keyConcepts', JSON.stringify(payload.keyConcepts));
        formData.append('status', payload.status);
        formData.append('order', String(payload.order));
        formData.append('file', selectedUploadFile);

        const token = getStoredToken();
        const headers: Record<string, string> = token ? { 'x-auth-token': token } : {};
        response = await fetch(apiUrl('/api/admin/visualizers/upload'), {
          method: 'POST',
          headers,
          body: formData,
        });
      } else {
        response = await fetch(apiUrl('/api/admin/visualizers'), {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to save visualizer');
      }

      setSelectedUploadFile(null);
      resetVisualizerForm();
      setIsVisualizerSettingsModalOpen(false);
    }, editingVisualizerId ? 'Visualizer updated' : selectedUploadFile ? 'Visualizer created and HTML uploaded to storage' : 'Visualizer created with HTML skeleton');
  };


  const toggleVisualizerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/visualizers/${id}/status`), {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to update status');
    }, `Visualizer marked as ${newStatus === 'available' ? 'Live' : 'Awaiting Code'}`);
  };

  const deleteVisualizer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this visualizer?')) return;
    await withNotice(async () => {
      const response = await fetch(apiUrl(`/api/admin/visualizers/${id}`), {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to delete visualizer');
      if (editingVisualizerId === id) resetVisualizerForm();
    }, 'Visualizer archived');
  };

  const openCodeModal = async (vis: VisualizerAlgorithm) => {
    try {
      const response = await fetch(apiUrl(`/api/admin/visualizers/${vis.id}/code`), {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to load code');
      setVisualizerCodeModal({
        isOpen: true,
        visualizer: vis,
        code: data.code,
        filePath: data.filePath,
        saving: false,
        copied: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visualizer code');
    }
  };

  const saveVisualizerCode = async () => {
    if (!visualizerCodeModal.visualizer) return;
    setVisualizerCodeModal((prev) => ({ ...prev, saving: true }));
    try {
      const response = await fetch(
        apiUrl(`/api/admin/visualizers/${visualizerCodeModal.visualizer.id}/code`),
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ code: visualizerCodeModal.code }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to save code');
      setNotice('HTML code updated directly on disk');
      setVisualizerCodeModal((prev) => ({ ...prev, isOpen: false, saving: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save code');
      setVisualizerCodeModal((prev) => ({ ...prev, saving: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-shell font-sans transition-colors duration-300">
      <AnimatedBackground />

      <main className="relative z-10 page-wrap py-10">
        <section className="surface mb-8 rounded-3xl p-8 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                <Shield size={14} className="text-[var(--text-primary)]" />
                <span>Control Center</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">Admin Panel</h1>
              <p className="mt-2 max-w-2xl text-lg text-[var(--text-secondary)]">
                Manage topics, curate problems, control user access, and override the daily challenge from one place.
              </p>
            </div>

            <button
              onClick={() => loadAdminData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh data
            </button>
          </div>
        </section>

        {(error || notice) && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'}`}>
            <AlertCircle size={16} />
            <span>{error || notice}</span>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[var(--text-primary)] text-[var(--text-inverted)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && overview && (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Users', overview.stats.users],
              ['Active Users', overview.stats.activeUsers],
              ['Admins', overview.stats.admins],
              ['Problems', overview.stats.problems],
              ['Topics', overview.stats.topics],
              ['Total Solves', overview.stats.totalSolved],
            ].map(([label, value]) => (
              <div key={label} className="surface rounded-3xl p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}

            <div className="surface rounded-3xl p-6 md:col-span-2 xl:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Today&apos;s POTD</p>
              {overview.potd ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">#{overview.potd.problemNumber} {overview.potd.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scheduled for {new Date(overview.potd.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('potd')}
                    className="rounded-xl bg-[#123b36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
                  >
                    Change POTD
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No problem is pinned for today yet.</p>
              )}
            </div>

            {overview.trends && (
              <div className="surface rounded-3xl p-6 md:col-span-2 xl:col-span-3">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">New Users (7d)</p>
                    <div className="mt-3 flex items-end gap-1">
                      {overview.trends.newUsersByDay.map((item) => (
                        <div key={item.date} className="flex-1 rounded-t bg-teal-500/80" style={{ height: `${Math.max(item.value * 12, 6)}px` }} title={`${item.date}: ${item.value}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Solves (7d)</p>
                    <div className="mt-3 flex items-end gap-1">
                      {overview.trends.solvesByDay.map((item) => (
                        <div key={item.date} className="flex-1 rounded-t bg-emerald-500/80" style={{ height: `${Math.max(item.value * 8, 6)}px` }} title={`${item.date}: ${item.value}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Top Solved Topics</p>
                    <div className="mt-3 space-y-2 text-sm">
                      {overview.trends.topTopics.length > 0 ? overview.trends.topTopics.map((topic) => (
                        <div key={topic.slug} className="flex items-center justify-between rounded-lg bg-[#dceee9]/50 px-3 py-1.5 dark:bg-teal-400/5">
                          <span className="text-slate-700 dark:text-slate-200">{topic.name}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{topic.solves}</span>
                        </div>
                      )) : <p className="text-slate-500 dark:text-slate-400">No solve trend data yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'topics' && (
          <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <form onSubmit={saveTopic} className="surface rounded-3xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingTopicId ? 'Edit Topic' : 'Add Topic'}</h2>
                {editingTopicId && (
                  <button type="button" onClick={resetTopicForm} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">Reset</button>
                )}
              </div>
              <div className="space-y-4">
                <Input label="Topic Name" value={topicForm.name} onChange={(value) => setTopicForm((current) => ({ ...current, name: value }))} required />
                <Input label="Slug" value={topicForm.slug} onChange={(value) => setTopicForm((current) => ({ ...current, slug: value }))} placeholder="auto-generated if empty" />
                <TextArea label="Description" value={topicForm.description} onChange={(value) => setTopicForm((current) => ({ ...current, description: value }))} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Difficulty" value={topicForm.difficulty} onChange={(value) => setTopicForm((current) => ({ ...current, difficulty: value as 'Easy' | 'Medium' | 'Hard' }))} options={[{ value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }]} />
                  <Select label="Icon" value={topicForm.iconKey} onChange={(value) => setTopicForm((current) => ({ ...current, iconKey: value }))} options={topicIconOptions} />
                </div>
                <Input label="Order" type="number" value={topicForm.order} onChange={(value) => setTopicForm((current) => ({ ...current, order: value }))} />
                <ToggleRow label="Topic Visible" checked={topicForm.isActive} onChange={(checked) => setTopicForm((current) => ({ ...current, isActive: checked }))} />
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123b36] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editingTopicId ? <Save size={16} /> : <Plus size={16} />}
                  {editingTopicId ? 'Save Topic' : 'Create Topic'}
                </button>
              </div>
            </form>

            <div className="surface rounded-3xl p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Topic Catalog <span className="ml-1 text-sm font-normal text-slate-400">({filteredTopics.length}/{topics.length})</span></h2>
                <SearchBox value={topicSearch} onChange={setTopicSearch} placeholder="Search topics…" />
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <FilterChip label="All" active={topicStatusFilter === 'all'} onClick={() => setTopicStatusFilter('all')} />
                <FilterChip label="Active" active={topicStatusFilter === 'active'} onClick={() => setTopicStatusFilter('active')} color="emerald" />
                <FilterChip label="Hidden" active={topicStatusFilter === 'hidden'} onClick={() => setTopicStatusFilter('hidden')} color="amber" />
                <FilterChip label="Deleted" active={topicStatusFilter === 'deleted'} onClick={() => setTopicStatusFilter('deleted')} color="rose" />
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
                {filteredTopics.map((topic) => (
                  <div key={topic.id || topic.slug} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-[#dceee9] p-3 text-[#123b36] dark:bg-teal-400/10 dark:text-teal-300">{getTopicIcon(topic.iconKey, 18)}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{topic.name}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-300">{topic.slug}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${topic.isDeleted ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : topic.isActive === false ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>{topic.isDeleted ? 'Deleted' : topic.isActive === false ? 'Hidden' : 'Live'}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{topic.description}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{topic.problemCount || 0} problems • {topic.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveTopic(topic.id!, 'up')} disabled={topicSearch !== '' || topicStatusFilter !== 'all'} title={topicSearch || topicStatusFilter !== 'all' ? 'Clear filters to reorder' : 'Move Up'} className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"><ArrowUp size={16} /></button>
                      <button type="button" onClick={() => moveTopic(topic.id!, 'down')} disabled={topicSearch !== '' || topicStatusFilter !== 'all'} title={topicSearch || topicStatusFilter !== 'all' ? 'Clear filters to reorder' : 'Move Down'} className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"><ArrowDown size={16} /></button>
                      <button type="button" onClick={() => { setEditingTopicId(topic.id || null); setTopicForm({ name: topic.name, slug: topic.slug, description: topic.description, difficulty: topic.difficulty, iconKey: topic.iconKey, order: String(topic.order || 0), isActive: topic.isActive !== false }); }} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Edit</button>
                      {topic.id && !topic.isDeleted && <button type="button" onClick={() => deleteTopic(topic.id!)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20">Delete</button>}
                      {topic.id && topic.isDeleted && <button type="button" onClick={() => restoreTopic(topic.id!)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20">Restore</button>}
                    </div>
                  </div>
                ))}
              </div>
              <PaginationBar
                page={topicsPagination.page}
                totalPages={topicsPagination.pages}
                onPrev={() => setTopicsPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                onNext={() => setTopicsPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))}
              />
            </div>
          </section>
        )}

        {activeTab === 'problems' && (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <form onSubmit={saveProblem} className="surface rounded-3xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingProblemId ? 'Edit Problem' : 'Add Problem'}</h2>
                {editingProblemId && <button type="button" onClick={resetProblemForm} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">Reset</button>}
              </div>
              <div className="space-y-4">
                <Input label="Problem Number" type="number" value={problemForm.problemNumber} onChange={(value) => setProblemForm((current) => ({ ...current, problemNumber: value }))} placeholder="auto-generated if empty" />
                <Input label="Title" value={problemForm.title} onChange={(value) => setProblemForm((current) => ({ ...current, title: value }))} required />
                <Input label="Problem Link" value={problemForm.link} onChange={(value) => setProblemForm((current) => ({ ...current, link: value }))} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Topic" value={problemForm.topic} onChange={(value) => setProblemForm((current) => ({ ...current, topic: value }))} options={topics.filter((topic) => topic.isActive !== false).map((topic) => ({ value: topic.slug, label: topic.name }))} required />
                  <Select label="Difficulty" value={problemForm.difficulty} onChange={(value) => setProblemForm((current) => ({ ...current, difficulty: value as 'Easy' | 'Medium' | 'Hard' }))} options={[{ value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }]} />
                </div>
                <Input label="Video Tutorial Link (General)" value={problemForm.tutorialLink} onChange={(value) => setProblemForm((current) => ({ ...current, tutorialLink: value }))} placeholder="YouTube or other video tutorial URL" />
                <Input label="GitHub Solution Link" value={problemForm.githubLink} onChange={(value) => setProblemForm((current) => ({ ...current, githubLink: value }))} />
                
                <div className="mt-8 border-t border-slate-200/80 pt-6 dark:border-white/10">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Solution Manager</h3>
                    <button type="button" onClick={() => setIsSolutionModalOpen(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
                      Manage Solutions
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">Configure embedded videos and detailed approach logic in the Solution Manager modal.</p>
                </div>
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123b36] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editingProblemId ? <Save size={16} /> : <Plus size={16} />}
                  {editingProblemId ? 'Save Problem' : 'Create Problem'}
                </button>
              </div>
            </form>

            <div className="surface rounded-3xl p-6">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Problem Bank <span className="ml-1 text-sm font-normal text-slate-400">({problemsPagination.total})</span></h2>
                  <SearchBox value={problemSearch} onChange={setProblemSearch} placeholder="Search by title or #…" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All Difficulties" active={problemDifficultyFilter === ''} onClick={() => setProblemDifficultyFilter('')} />
                  <FilterChip label="Easy" active={problemDifficultyFilter === 'Easy'} onClick={() => setProblemDifficultyFilter('Easy')} color="emerald" />
                  <FilterChip label="Medium" active={problemDifficultyFilter === 'Medium'} onClick={() => setProblemDifficultyFilter('Medium')} color="amber" />
                  <FilterChip label="Hard" active={problemDifficultyFilter === 'Hard'} onClick={() => setProblemDifficultyFilter('Hard')} color="rose" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All Status" active={problemStatusFilter === 'all'} onClick={() => setProblemStatusFilter('all')} />
                  <FilterChip label="Live" active={problemStatusFilter === 'live'} onClick={() => setProblemStatusFilter('live')} color="emerald" />
                  <FilterChip label="Deleted" active={problemStatusFilter === 'deleted'} onClick={() => setProblemStatusFilter('deleted')} color="rose" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All Topics" active={problemTopicFilter === ''} onClick={() => setProblemTopicFilter('')} />
                  {topics.map(t => (
                    <FilterChip key={t.slug} label={t.name} active={problemTopicFilter === t.slug} onClick={() => setProblemTopicFilter(t.slug)} />
                  ))}
                </div>
              </div>
              {isReorderingProblems && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      You have unsaved problem order changes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveProblemOrder}
                      className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                    >
                      Save Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReorderingProblems(false);
                        loadAdminData(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {refreshing ? (
                <div className="space-y-3 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 animate-pulse bg-slate-50/50 dark:bg-white/[0.02]">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2.5 flex-1">
                          <div className="h-3 w-32 rounded bg-slate-200/80 dark:bg-white/10" />
                          <div className="h-5 w-2/3 rounded bg-slate-200/80 dark:bg-white/10" />
                          <div className="h-3 w-16 rounded bg-slate-200/80 dark:bg-white/10" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                          <div className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                          <div className="h-9 w-14 rounded-xl bg-slate-200/80 dark:bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                  {filteredProblems.map((problem) => (
                    <div key={problem.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{problem.problemNumber} • {problem.topic}</p>
                          <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{problem.title}</h3>
                          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{problem.difficulty}</p>
                          {problem.tutorialLink && (
                            <a href={problem.tutorialLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/20">
                              <Youtube size={14} /> Tutorial
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moveProblem(problem.id, 'up')} disabled={problemTopicFilter === '' || problemSearch !== '' || problemDifficultyFilter !== '' || problemStatusFilter !== 'all'} title={problemTopicFilter === '' || problemSearch || problemDifficultyFilter || problemStatusFilter !== 'all' ? 'Filter by a specific topic to reorder' : 'Move Up'} className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"><ArrowUp size={16} /></button>
                          <button type="button" onClick={() => moveProblem(problem.id, 'down')} disabled={problemTopicFilter === '' || problemSearch !== '' || problemDifficultyFilter !== '' || problemStatusFilter !== 'all'} title={problemTopicFilter === '' || problemSearch || problemDifficultyFilter || problemStatusFilter !== 'all' ? 'Filter by a specific topic to reorder' : 'Move Down'} className="rounded-xl border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"><ArrowDown size={16} /></button>
                          <button type="button" onClick={() => { setEditingProblemId(problem.id); setProblemForm({ problemNumber: String(problem.problemNumber), title: problem.title, link: problem.link, topic: problem.topic, difficulty: problem.difficulty, tutorialLink: problem.tutorialLink || '', githubLink: problem.githubLink || '', videoSolutionUrl: problem.videoSolutionUrl || '', approaches: problem.approaches ? JSON.parse(JSON.stringify(problem.approaches)) : [] }); }} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Edit</button>
                          {!problem.isDeleted && <button type="button" onClick={() => deleteProblem(problem.id)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20">Delete</button>}
                          {problem.isDeleted && <button type="button" onClick={() => restoreProblem(problem.id)} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20">Restore</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProblems.length === 0 && (
                    <div className="py-12 text-center text-sm text-slate-400">
                      No problems found matching the selected filters.
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Per page:</span>
                  {([20, 50, 100, 'all'] as const).map((size) => (
                    <button
                      key={String(size)}
                      type="button"
                      onClick={() => {
                        setProblemPageSize(size);
                        setProblemsPagination((p) => ({ ...p, page: 1 }));
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        problemPageSize === size
                          ? 'bg-[#123b36] text-white dark:bg-teal-400 dark:text-[#08241f]'
                          : 'border border-slate-200/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      {size === 'all' ? 'All' : size}
                    </button>
                  ))}
                  <span className="ml-2">
                    Showing {problems.length > 0 ? (problemsPagination.page - 1) * (typeof problemPageSize === 'number' ? problemPageSize : problems.length) + 1 : 0}–
                    {Math.min(
                      problemsPagination.page * (typeof problemPageSize === 'number' ? problemPageSize : problems.length),
                      problemsPagination.total
                    )}{' '}
                    of {problemsPagination.total} problems
                  </span>
                </div>
                {problemPageSize !== 'all' && (
                  <PaginationBar
                    page={problemsPagination.page}
                    totalPages={problemsPagination.pages}
                    onPrev={() => setProblemsPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                    onNext={() => setProblemsPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'visualizers' && (
          <div className="space-y-6">
            {/* Cloudflare R2 Persistent Storage Status Banner */}
            <div className="surface rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  !r2Status || r2Loading
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : r2Status.configured && r2Status.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : r2Status.configured && r2Status.status === 'error'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  <UploadCloud size={22} className={r2Loading ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Cloudflare R2 Persistent Object Storage
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      !r2Status || r2Loading
                        ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                        : r2Status.configured && r2Status.status === 'connected'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : r2Status.configured && r2Status.status === 'error'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {!r2Status || r2Loading
                        ? 'Checking Status...'
                        : r2Status.configured && r2Status.status === 'connected'
                        ? 'Connected'
                        : r2Status.configured && r2Status.status === 'error'
                        ? 'Connection Error'
                        : 'Credentials Missing (Local Fallback Mode)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                    {!r2Status || r2Loading
                      ? 'Contacting server to verify Cloudflare R2 bucket connection...'
                      : r2Status.configured && r2Status.status === 'connected'
                      ? `R2 Bucket: ${r2Status.bucket} • All uploaded animations are saved to persistent S3 object storage.`
                      : r2Status.configured && r2Status.status === 'error'
                      ? `Failed connecting to R2 bucket "${r2Status.bucket}": ${r2Status.message}`
                      : 'Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in server/.env to activate Cloudflare R2.'}
                  </p>
                </div>
              </div>


              <button
                type="button"
                onClick={refreshR2Status}
                disabled={r2Loading}
                className="button-secondary text-xs font-semibold !py-2 !px-3.5 self-start md:self-auto flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw size={13} className={r2Loading ? 'animate-spin' : ''} />
                <span>Test R2 Connection</span>
              </button>
            </div>

            <section className="surface rounded-3xl p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Visualizer Catalog
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {filteredVisualizers.length} / {visualizers.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Live: {visualizerStats.live}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Awaiting Code: {visualizerStats.awaiting}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <SearchBox
                    value={visualizerSearch}
                    onChange={setVisualizerSearch}
                    placeholder="Search visualizers…"
                  />

                  <button
                    type="button"
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
                  >
                    <FolderTree size={14} className="text-teal-500 dark:text-teal-400" />
                    <span>Categories ({availableCategoryNames.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreateVisualizer}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#123b36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
                  >
                    <Plus size={15} />
                    <span>New Visualizer</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <FilterChip
                  label="All Categories"
                  active={visualizerCategoryFilter === 'All'}
                  onClick={() => setVisualizerCategoryFilter('All')}
                />
                {availableCategoryNames.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={visualizerCategoryFilter === cat}
                    onClick={() => setVisualizerCategoryFilter(cat)}
                  />
                ))}

                <span className="mx-1 self-center border-l border-slate-200/80 dark:border-white/10 h-4" />

                <FilterChip
                  label="All Status"
                  active={visualizerStatusFilter === 'all'}
                  onClick={() => setVisualizerStatusFilter('all')}
                />
                <FilterChip
                  label="Live"
                  active={visualizerStatusFilter === 'available'}
                  onClick={() => setVisualizerStatusFilter('available')}
                  color="emerald"
                />
                <FilterChip
                  label="Awaiting Code"
                  active={visualizerStatusFilter === 'unavailable'}
                  onClick={() => setVisualizerStatusFilter('unavailable')}
                  color="amber"
                />
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredVisualizers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No visualizers match your filters.
                  </div>
                ) : (
                  filteredVisualizers.map((vis) => (
                    <div
                      key={vis.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 md:flex-row md:items-center md:justify-between transition-colors hover:border-slate-300 dark:hover:border-white/20"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {vis.name}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                            {vis.category}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            vis.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                              : vis.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                          }`}>
                            {vis.difficulty}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 ${
                            vis.status === 'available'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                          }`}>
                            {vis.status === 'available' ? 'Live' : 'Awaiting Code'}
                          </span>

                          {/* Persistent Storage Badge */}
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 ${
                            vis.storageType === 'r2'
                              ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20'
                          }`}>
                            {vis.storageType === 'r2' ? (
                              <>
                                <UploadCloud size={11} />
                                <span>Cloudflare R2</span>
                              </>
                            ) : (
                              <>
                                <HardDrive size={11} />
                                <span>Local Disk</span>
                              </>
                            )}
                            {vis.fileSize ? ` (${(vis.fileSize / 1024).toFixed(1)} KB)` : ''}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {vis.description || 'No description'}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
                          <code className="rounded bg-black/5 dark:bg-white/5 px-1.5 py-0.5 text-teal-600 dark:text-teal-400">
                            {vis.r2Key || vis.htmlPath}
                          </code>
                          <span>•</span>
                          <span>Avg: {vis.timeComplexity?.average}</span>
                          <span>•</span>
                          <span>Space: {vis.spaceComplexity}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Configure Animation Settings */}
                        <button
                          type="button"
                          onClick={() => openVisualizerSettings(vis)}
                          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 flex items-center gap-1.5 transition"
                          title="Configure Animation Settings"
                        >
                          <Settings size={13} />
                          Settings
                        </button>

                        {/* Upload HTML to Cloudflare R2 */}
                        <button
                          type="button"
                          onClick={() => setReplaceFileModal({ isOpen: true, visualizer: vis, file: null, uploading: false, error: null })}
                          className="rounded-xl border border-slate-200/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 flex items-center gap-1 transition"
                          title="Upload / Replace HTML animation in Cloudflare R2"
                        >
                          <UploadCloud size={13} />
                          Upload HTML
                        </button>

                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => toggleVisualizerStatus(vis.id, vis.status)}
                          className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition ${
                            vis.status === 'available'
                              ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                              : 'border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                          }`}
                          title="Toggle Live vs Awaiting Code"
                        >
                          {vis.status === 'available' ? 'Set Awaiting' : 'Set Live'}
                        </button>

                        {/* Preview */}
                        <button
                          type="button"
                          onClick={() => setVisualizerPreviewModal({ isOpen: true, visualizer: vis })}
                          className="rounded-xl border border-slate-200/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 flex items-center gap-1 transition"
                          title="Preview Visualizer"
                        >
                          <Eye size={13} />
                          Preview
                        </button>

                        {/* Edit Code Modal */}
                        <button
                          type="button"
                          onClick={() => openCodeModal(vis)}
                          className="rounded-xl border border-slate-200/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 flex items-center gap-1 transition"
                          title="View / Edit HTML Code"
                        >
                          <Code2 size={13} />
                          Edit Code
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteVisualizer(vis.id)}
                          className="rounded-xl border border-rose-200/80 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20 transition"
                          title="Delete Visualizer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination */}
                {visualizersPagination.pages > 1 && (
                  <PaginationBar
                    page={visualizersPagination.page}
                    totalPages={visualizersPagination.pages}
                    onPrev={() => setVisualizersPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                    onNext={() => setVisualizersPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))}
                  />
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <section className="surface rounded-3xl p-6">
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Access <span className="ml-1 text-sm font-normal text-slate-400">({filteredUsers.length}/{users.length})</span></h2>
                <SearchBox value={userSearch} onChange={setUserSearch} placeholder="Search by name or email…" />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="All Roles" active={userRoleFilter === ''} onClick={() => setUserRoleFilter('')} />
                <FilterChip label="Admin" active={userRoleFilter === 'admin'} onClick={() => setUserRoleFilter('admin')} color="blue" />
                <FilterChip label="Moderator" active={userRoleFilter === 'moderator'} onClick={() => setUserRoleFilter('moderator')} color="amber" />
                <FilterChip label="Content" active={userRoleFilter === 'content_manager'} onClick={() => setUserRoleFilter('content_manager')} color="emerald" />
                <FilterChip label="User" active={userRoleFilter === 'user'} onClick={() => setUserRoleFilter('user')} />
                <span className="mx-1 self-center border-l border-slate-200/80 dark:border-white/10 h-4" />
                <FilterChip label="All Status" active={userStatusFilter === ''} onClick={() => setUserStatusFilter('')} />
                <FilterChip label="Active" active={userStatusFilter === 'active'} onClick={() => setUserStatusFilter('active')} color="emerald" />
                <FilterChip label="Disabled" active={userStatusFilter === 'disabled'} onClick={() => setUserStatusFilter('disabled')} color="rose" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{user.username}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${user.role === 'admin' ? 'bg-[#dceee9] text-teal-800 dark:bg-teal-400/10 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'}`}>{user.role}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'}`}>{user.isActive ? 'Active' : 'Disabled'}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">Solved {user.solvedProblems?.length || 0} problems</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role !== 'admin' && <button type="button" onClick={() => updateUserAccess(user, 'admin', user.isActive)} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Make Admin</button>}
                    {user.role !== 'moderator' && <button type="button" onClick={() => updateUserAccess(user, 'moderator', user.isActive)} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Make Moderator</button>}
                    {user.role !== 'content_manager' && <button type="button" onClick={() => updateUserAccess(user, 'content_manager', user.isActive)} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Make Content</button>}
                    {user.role !== 'user' && <button type="button" onClick={() => updateUserAccess(user, 'user', user.isActive)} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">Make User</button>}
                    <button type="button" onClick={() => updateUserAccess(user, user.role, !user.isActive)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${user.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20'}`}>{user.isActive ? 'Disable Account' : 'Enable Account'}</button>
                  </div>
                </div>
              ))}
            </div>
            <PaginationBar
              page={usersPagination.page}
              totalPages={usersPagination.pages}
              onPrev={() => setUsersPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
              onNext={() => setUsersPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))}
            />
          </section>
        )}

        {activeTab === 'audit' && (
          <section className="surface rounded-3xl p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Logs <span className="ml-1 text-sm font-normal text-slate-400">({auditPagination.total})</span></h2>
              <SearchBox value={auditSearch} onChange={setAuditSearch} placeholder="Search by action, entity or actor…" />
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log._id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{log.entityType} • {log.entityId || 'N/A'} • {log.actorEmail || 'system'}</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No logs found for current filter.</p>}
            </div>

            <PaginationBar
              page={auditPagination.page}
              totalPages={auditPagination.pages}
              onPrev={() => setAuditPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
              onNext={() => setAuditPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))}
            />
          </section>
        )}

        {activeTab === 'potd' && (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="surface rounded-3xl p-6">
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Pin Today&apos;s Challenge</h2>
              <div className="space-y-4">
                <Select label="Problem" value={selectedPotdProblemId} onChange={setSelectedPotdProblemId} options={problems.map((problem) => ({ value: problem.id, label: `#${problem.problemNumber} ${problem.title}` }))} required />
                <button onClick={assignPotd} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123b36] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Set Problem of the Day
                </button>
              </div>
            </div>

            <div className="surface rounded-3xl p-6">
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Current POTD</h2>
              {overview?.potd ? (
                <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Today</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">#{overview.potd.problemNumber} {overview.potd.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pinned on {new Date(overview.potd.date).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No manual POTD has been set for today.</p>
              )}
            </div>
          </section>
        )}
        {isSolutionModalOpen &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget) setIsSolutionModalOpen(false); }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solution Manager</h2>
                  <button type="button" onClick={() => setIsSolutionModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <Input label="Embedded Video Solution URL" value={problemForm.videoSolutionUrl} onChange={(value) => setProblemForm((current) => ({ ...current, videoSolutionUrl: value }))} placeholder="e.g., https://www.youtube.com/embed/..." />
                  
                  <div className="mt-6 space-y-6">
                    {problemForm.approaches.map((approach, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900 dark:text-white">Approach {index + 1}</h4>
                          <button type="button" onClick={() => setProblemForm(curr => ({ ...curr, approaches: curr.approaches.filter((_, i) => i !== index) }))} className="text-sm font-medium text-rose-500 hover:text-rose-600">Remove</button>
                        </div>
                        <div className="space-y-4">
                          <Input label="ID (e.g. brute-force, optimal)" value={approach.id} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].id = val; return { ...curr, approaches: arr }; })} />
                          <Input label="Title (e.g. 1. Brute Force Approach)" value={approach.title} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].title = val; return { ...curr, approaches: arr }; })} />
                          <TextArea label="Algorithm" value={approach.algorithm} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].algorithm = val; return { ...curr, approaches: arr }; })} />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Time Complexity" value={approach.timeComplexity} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].timeComplexity = val; return { ...curr, approaches: arr }; })} placeholder="O(N)" />
                            <Input label="Space Complexity" value={approach.spaceComplexity} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].spaceComplexity = val; return { ...curr, approaches: arr }; })} placeholder="O(1)" />
                          </div>
                          
                          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/5">
                            <h5 className="mb-3 font-medium text-slate-700 dark:text-slate-300">Code Snippets</h5>
                            {approach.codeSnippets.map((snippet, sIndex) => (
                              <div key={sIndex} className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                                <div className="mb-2 flex items-center justify-between">
                                  <Select label="Language" value={snippet.language} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].codeSnippets[sIndex].language = val; return { ...curr, approaches: arr }; })} options={[{value: 'C++', label: 'C++'}, {value: 'Java', label: 'Java'}, {value: 'Python', label: 'Python'}, {value: 'JavaScript', label: 'JavaScript'}]} />
                                  <button type="button" onClick={() => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].codeSnippets = arr[index].codeSnippets.filter((_, i) => i !== sIndex); return { ...curr, approaches: arr }; })} className="mt-6 text-xs font-semibold text-rose-500">Remove Code</button>
                                </div>
                                <TextArea label="Code" value={snippet.code} onChange={(val) => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].codeSnippets[sIndex].code = val; return { ...curr, approaches: arr }; })} />
                              </div>
                            ))}
                            <button type="button" onClick={() => setProblemForm(curr => { const arr = [...curr.approaches]; arr[index].codeSnippets.push({ language: 'C++', code: '' }); return { ...curr, approaches: arr }; })} className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                              + Add Language
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setProblemForm(curr => ({ ...curr, approaches: [...curr.approaches, { id: '', title: '', algorithm: '', timeComplexity: '', spaceComplexity: '', codeSnippets: [] }] }))} className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-700 dark:border-white/20 dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white">
                      + Add Approach
                    </button>
                  </div>
                </div>

                <div className="flex justify-end border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                  <button type="button" onClick={() => setIsSolutionModalOpen(false)} className="rounded-xl bg-[#123b36] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300">
                    Done
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Visualizer Settings & Configuration Modal */}
        {isVisualizerSettingsModalOpen &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget) { setIsVisualizerSettingsModalOpen(false); resetVisualizerForm(); } }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingVisualizerId
                          ? `Animation Settings: ${visualizerForm.name || 'Visualizer'}`
                          : 'New Animation Visualizer'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {editingVisualizerId
                          ? 'Configure algorithm parameters, runtime metrics, status, and animation file'
                          : 'Create a new algorithm visualization and upload standalone HTML animation to Cloudflare R2'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsVisualizerSettingsModalOpen(false);
                      resetVisualizerForm();
                    }}
                    className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body: Scrollable with Clean Grouped Sections */}
                <form
                  id="visualizer-settings-modal-form"
                  onSubmit={saveVisualizer}
                  className="p-6 overflow-y-auto space-y-5 flex-1 text-left"
                >
                  {/* Section 1: General Info */}
                  <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        1. General Details
                      </h4>
                      <span className="text-[11px] text-slate-400">Primary algorithm identity</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Algorithm Name"
                        value={visualizerForm.name}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, name: value }))}
                        placeholder="e.g. Quick Sort"
                        required
                      />

                      <Input
                        label="Slug"
                        value={visualizerForm.slug}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, slug: value }))}
                        placeholder="auto-derived from name if empty"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Category
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCreatingNewCategory((prev) => !prev)}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 transition"
                          >
                            <Plus size={12} />
                            {isCreatingNewCategory ? 'Pick Existing' : 'New Category'}
                          </button>
                        </div>

                        {isCreatingNewCategory ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewCategory();
                                  }
                                }}
                                placeholder="e.g. Trees, Backtracking..."
                                autoFocus
                                className="w-full rounded-xl border border-teal-500/50 bg-[#fbfcfa] px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-teal-500/40 dark:bg-[#101614] dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={handleAddNewCategory}
                                disabled={categorySubmitting || !newCategoryName.trim()}
                                className="shrink-0 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
                              >
                                {categorySubmitting ? <Loader2 size={13} className="animate-spin" /> : 'Set'}
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Creates category and assigns this algorithm.
                            </p>
                          </div>
                        ) : (
                          <select
                            value={visualizerForm.category}
                            onChange={(e) => {
                              if (e.target.value === '__NEW__') {
                                setIsCreatingNewCategory(true);
                              } else {
                                setVisualizerForm((current) => ({ ...current, category: e.target.value }));
                              }
                            }}
                            className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
                          >
                            <option value="" disabled>— Select Category —</option>
                            {availableCategoryNames.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="__NEW__" className="font-semibold text-teal-600 dark:text-teal-400">
                              + Create New Category...
                            </option>
                          </select>
                        )}
                      </div>

                      <Select
                        label="Difficulty"
                        value={visualizerForm.difficulty}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, difficulty: value as 'Easy' | 'Medium' | 'Hard' }))}
                        options={[
                          { value: 'Easy', label: 'Easy' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Hard', label: 'Hard' },
                        ]}
                      />

                      <Select
                        label="Runtime Status"
                        value={visualizerForm.status}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, status: value as 'available' | 'unavailable' }))}
                        options={[
                          { value: 'available', label: 'Live (Ready)' },
                          { value: 'unavailable', label: 'Awaiting Code (Draft)' },
                        ]}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Display Order"
                        type="number"
                        value={visualizerForm.order}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, order: value }))}
                      />
                      <Input
                        label="Tags (comma-separated)"
                        value={visualizerForm.tags}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, tags: value }))}
                        placeholder="Sorting, Divide and Conquer, Pivot"
                      />
                    </div>

                    <TextArea
                      label="Description"
                      value={visualizerForm.description}
                      onChange={(value) => setVisualizerForm((current) => ({ ...current, description: value }))}
                    />
                  </div>

                  {/* Section 2: Complexity Metrics */}
                  <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        2. Complexity Analysis
                      </h4>
                      <span className="text-[11px] text-slate-400">Time & space complexity values</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Best Time</span>
                        <input
                          type="text"
                          value={visualizerForm.timeBest}
                          onChange={(e) => setVisualizerForm((curr) => ({ ...curr, timeBest: e.target.value }))}
                          placeholder="O(n log n)"
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Average Time</span>
                        <input
                          type="text"
                          value={visualizerForm.timeAverage}
                          onChange={(e) => setVisualizerForm((curr) => ({ ...curr, timeAverage: e.target.value }))}
                          placeholder="O(n log n)"
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Worst Time</span>
                        <input
                          type="text"
                          value={visualizerForm.timeWorst}
                          onChange={(e) => setVisualizerForm((curr) => ({ ...curr, timeWorst: e.target.value }))}
                          placeholder="O(n²)"
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Space Complexity</span>
                        <input
                          type="text"
                          value={visualizerForm.spaceComplexity}
                          onChange={(e) => setVisualizerForm((curr) => ({ ...curr, spaceComplexity: e.target.value }))}
                          placeholder="O(log n)"
                          className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Standalone Animation File & Storage */}
                  <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        3. Animation File & Storage
                      </h4>
                      <span className="text-[11px] text-slate-400">Standalone HTML document</span>
                    </div>

                    {editingVisualizerId ? (
                      <div className="space-y-3">
                        {(() => {
                          const targetVis = visualizers.find((v) => v.id === editingVisualizerId);
                          if (!targetVis) return null;
                          return (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Current File:</span>
                                  <code className="font-mono text-xs text-teal-600 dark:text-teal-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                    {targetVis.r2Key || targetVis.htmlPath}
                                  </code>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Storage: {targetVis.storageType === 'r2' ? 'Cloudflare R2 Bucket' : 'Local Disk'}
                                  {targetVis.fileSize ? ` • ${(targetVis.fileSize / 1024).toFixed(1)} KB` : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsVisualizerSettingsModalOpen(false);
                                    setReplaceFileModal({
                                      isOpen: true,
                                      visualizer: targetVis,
                                      file: null,
                                      uploading: false,
                                      error: null,
                                    });
                                  }}
                                  className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 flex items-center gap-1.5 transition"
                                >
                                  <UploadCloud size={13} />
                                  Replace HTML File
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsVisualizerSettingsModalOpen(false);
                                    openCodeModal(targetVis);
                                  }}
                                  className="rounded-xl border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 flex items-center gap-1.5 transition"
                                >
                                  <Code2 size={13} />
                                  Edit Code
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div>
                        <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                          Attach Standalone HTML Animation File (Optional)
                        </span>
                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-4 text-center hover:border-teal-500 dark:hover:border-teal-400 transition-colors">
                          <input
                            type="file"
                            accept=".html,.htm"
                            id="visualizer-create-file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setSelectedUploadFile(file);
                            }}
                          />
                          {selectedUploadFile ? (
                            <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileCode size={20} className="text-teal-400 shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {selectedUploadFile.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                  {(selectedUploadFile.size / 1024).toFixed(1)} KB • HTML document
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedUploadFile(null)}
                              className="text-slate-400 hover:text-rose-400 p-1 rounded-md"
                              title="Remove file"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="visualizer-create-file"
                            className="cursor-pointer flex flex-col items-center gap-1.5 py-2"
                          >
                            <UploadCloud size={24} className="text-teal-500 dark:text-teal-400" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              Attach standalone .html animation
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Uploads directly to Cloudflare R2 (creates empty skeleton if omitted)
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Key Concepts */}
                <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      4. Educational Concepts
                    </h4>
                    <span className="text-[11px] text-slate-400">Key takeaway points for students</span>
                  </div>

                  <TextArea
                    label="Key Concepts (one concept per line)"
                    value={visualizerForm.keyConcepts}
                    onChange={(value) => setVisualizerForm((current) => ({ ...current, keyConcepts: value }))}
                  />
                </div>
              </form>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                <span className="text-xs text-slate-400">
                  {editingVisualizerId ? 'Changes will be saved immediately to the database.' : 'New visualizer will appear in the catalog.'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisualizerSettingsModalOpen(false);
                      resetVisualizerForm();
                    }}
                    className="rounded-xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    form="visualizer-settings-modal-form"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123b36] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : editingVisualizerId ? (
                      <Save size={16} />
                    ) : selectedUploadFile ? (
                      <UploadCloud size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {editingVisualizerId
                      ? 'Save Settings'
                      : selectedUploadFile
                      ? 'Create & Upload to Cloudflare R2'
                      : 'Create Visualizer'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Visualizer Code Editor Modal */}
        {visualizerCodeModal.isOpen && visualizerCodeModal.visualizer &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget) setVisualizerCodeModal((p) => ({ ...p, isOpen: false })); }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Edit HTML Code: {visualizerCodeModal.visualizer.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Saves directly to{' '}
                        <code className="font-mono text-teal-500">
                          {visualizerCodeModal.filePath}
                        </code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(visualizerCodeModal.filePath);
                        setVisualizerCodeModal((p) => ({ ...p, copied: true }));
                        setTimeout(() => setVisualizerCodeModal((p) => ({ ...p, copied: false })), 2000);
                      }}
                      className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-surface-hover)] flex items-center gap-1"
                    >
                      {visualizerCodeModal.copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {visualizerCodeModal.copied ? 'Copied Path' : 'Copy File Path'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisualizerCodeModal((p) => ({ ...p, isOpen: false }))}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body: Textarea Editor */}
                <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-3 min-h-0">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between shrink-0">
                    <span>
                      💡 Paste your HTML markup, CSS styles, and JS animation code directly below.
                    </span>
                    {(() => {
                      const token = getStoredToken();
                      const rawUrl = visualizerCodeModal.visualizer.renderUrl
                        ? apiUrl(visualizerCodeModal.visualizer.renderUrl)
                        : apiUrl(`/api/visualizers/render/${visualizerCodeModal.visualizer.slug}`);
                      const streamUrl = token ? `${rawUrl}?token=${encodeURIComponent(token)}` : rawUrl;
                      return (
                        <a
                          href={streamUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold underline hover:text-amber-200 flex items-center gap-1"
                        >
                          Open Animation <ExternalLink size={11} />
                        </a>
                      );
                    })()}
                  </div>

                  <textarea
                    value={visualizerCodeModal.code}
                    onChange={(e) => setVisualizerCodeModal((p) => ({ ...p, code: e.target.value }))}
                    spellCheck={false}
                    className="w-full flex-1 rounded-xl border border-slate-700 bg-[#09090b] p-4 font-mono text-xs leading-relaxed text-[#fafafa] outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none overflow-y-auto"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-4 shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {visualizerCodeModal.code.length} characters
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setVisualizerCodeModal((p) => ({ ...p, isOpen: false }))}
                      className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-surface-hover)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveVisualizerCode}
                      disabled={visualizerCodeModal.saving}
                      className="rounded-xl bg-[#123b36] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-70 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 flex items-center gap-1.5"
                    >
                      {visualizerCodeModal.saving ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      Save Code
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Upload / Replace Standalone HTML File Modal */}
        {replaceFileModal.isOpen && replaceFileModal.visualizer &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget && !replaceFileModal.uploading) setReplaceFileModal({ isOpen: false, visualizer: null, file: null, uploading: false, error: null }); }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl border border-[var(--border-strong)] flex flex-col">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <UploadCloud size={18} className="text-teal-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Upload HTML: {replaceFileModal.visualizer.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplaceFileModal({ isOpen: false, visualizer: null, file: null, uploading: false, error: null })}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a standalone <code className="text-teal-400">.html</code> animation file for this algorithm. It will be stored persistently in {r2Status?.configured && r2Status.status === 'connected' ? <strong className="text-white">Cloudflare R2</strong> : 'storage'}.
                  </p>

                  {replaceFileModal.error && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                      {replaceFileModal.error}
                    </div>
                  )}

                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-6 text-center hover:border-teal-500 transition-colors">
                    <input
                      type="file"
                      accept=".html,.htm"
                      id="replace-file-picker"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setReplaceFileModal((curr) => ({ ...curr, file: f, error: null }));
                      }}
                    />
                    {replaceFileModal.file ? (
                      <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileCode size={20} className="text-teal-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {replaceFileModal.file.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(replaceFileModal.file.size / 1024).toFixed(1)} KB • HTML file
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplaceFileModal((curr) => ({ ...curr, file: null }))}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="replace-file-picker" className="cursor-pointer flex flex-col items-center gap-2">
                        <UploadCloud size={28} className="text-teal-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Choose standalone HTML animation file
                        </span>
                        <span className="text-xs text-slate-400">
                          .html or .htm up to 5MB
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] shrink-0">
                  <button
                    type="button"
                    onClick={() => setReplaceFileModal({ isOpen: false, visualizer: null, file: null, uploading: false, error: null })}
                    className="button-secondary text-xs font-semibold !py-2 !px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!replaceFileModal.file || replaceFileModal.uploading}
                    onClick={handleExecuteFileReplace}
                    className="button-primary text-xs font-semibold !py-2 !px-4 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {replaceFileModal.uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={14} />
                        <span>Upload & Replace</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Visualizer Preview Modal */}
        {visualizerPreviewModal.isOpen && visualizerPreviewModal.visualizer &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget) setVisualizerPreviewModal({ isOpen: false, visualizer: null }); }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl flex flex-col shadow-2xl border border-[var(--border-strong)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-6 py-3.5 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <PlayCircle size={18} className="text-teal-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Preview: {visualizerPreviewModal.visualizer.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisualizerPreviewModal({ isOpen: false, visualizer: null })}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 overflow-hidden flex-1 flex flex-col min-h-0">
                  {(() => {
                    const token = getStoredToken();
                    const rawRenderUrl = visualizerPreviewModal.visualizer.renderUrl
                      ? apiUrl(visualizerPreviewModal.visualizer.renderUrl)
                      : apiUrl(`/api/visualizers/render/${visualizerPreviewModal.visualizer.slug}`);
                    const previewSrc = token ? `${rawRenderUrl}?token=${encodeURIComponent(token)}` : rawRenderUrl;

                    return (
                      <VisualizerFrame
                        src={previewSrc}
                        title={visualizerPreviewModal.visualizer.name}
                        status={visualizerPreviewModal.visualizer.status}
                        aspectRatio="video"
                      />
                    );
                  })()}
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Category Manager Modal */}
        {isCategoryManagerOpen &&
          createPortal(
            <div
              onClick={(e) => { if (e.target === e.currentTarget) setIsCategoryManagerOpen(false); }}
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
                    onClick={() => setIsCategoryManagerOpen(false)}
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
                    onClick={() => setIsCategoryManagerOpen(false)}
                    className="button-secondary text-xs font-semibold !py-2 !px-4"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

      </main>

      <Footer />
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text', placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean; }) => (
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
  </label>
);

const TextArea = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void; }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
    />
  </label>
);

const Select = ({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; required?: boolean; }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
    >
      <option value="" disabled={required}>— Select —</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void; }) => (
  <label className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#fbfcfa] px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-[#101614] dark:text-slate-200">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600 focus:ring-teal-600" />
  </label>
);

const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search…'}
      className="w-full rounded-xl border border-slate-200/80 bg-[#fbfcfa] py-2 pl-8 pr-8 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-white/10 dark:bg-[#101614] dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-400/20 sm:w-56"
    />
    {value && (
      <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
        <X size={14} />
      </button>
    )}
  </div>
);

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-emerald-500',
  amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-amber-500',
  rose:    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 ring-rose-500',
  blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-blue-500',
};

const FilterChip = ({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) => {
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

const PaginationBar = ({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="mt-4 flex items-center justify-end gap-2">
    <button type="button" onClick={onPrev} disabled={page <= 1} className="rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
      Prev
    </button>
    <span className="text-xs text-slate-500 dark:text-slate-400">Page {page} / {Math.max(totalPages, 1)}</span>
    <button type="button" onClick={onNext} disabled={page >= Math.max(totalPages, 1)} className="rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
      Next
    </button>
  </div>
);

export default AdminPage;
