import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart2,
  Boxes,
  Calendar,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  FolderTree,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  UploadCloud,
  Users,
  Wrench,
  X,
  Youtube,
  Zap,
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
import CustomSelect from '../components/CustomSelect';
import {
  VISUALIZER_CATEGORIES,
  DATA_STRUCTURE_FAMILIES,
  type AlgorithmCategory,
  type VisualizerAlgorithm,
  type VisualizerType,
  type DataStructureOperation,
} from '../data/visualizers';
import { getStoredToken, getStoredUser, updateStoredUser } from '../utils/auth';
import {
  checkR2Status,
  replaceAdminVisualizerFile,
  createAdminVisualizerCategory,
  deleteAdminVisualizerCategory,
  type R2StatusResponse,
  type VisualizerCategoryItem,
} from '../utils/visualizerApi';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminAuditTab } from './admin/AdminAuditTab';


type AdminTab = 'overview' | 'topics' | 'problems' | 'visualizers' | 'users' | 'potd' | 'leaderboard' | 'audit';

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
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    topic?: string;
    link?: string;
    tutorialLink?: string;
    customDescription?: string;
    customEstimatedTime?: string;
    customFocusArea?: string;
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
  type: VisualizerType;
  dataStructureType: string;
  operations: DataStructureOperation[];
  problemId: string;
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
  type: 'algorithm',
  dataStructureType: 'Linear',
  operations: [],
  problemId: '',
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

interface LeaderboardConfigState {
  isLeaderboardEnabled: boolean;
  isPodiumEnabled: boolean;
  isSummaryStatsEnabled: boolean;
  showStatActiveLearners: boolean;
  showStatTotalSolved: boolean;
  showStatTopStreak: boolean;
  showStatLastUpdated: boolean;
  showWeeklyFilter: boolean;
  showMonthlyFilter: boolean;
  showStreakColumn: boolean;
  showThisWeekColumn: boolean;
  showLastSolvedColumn: boolean;
  showLevelBadge: boolean;
  isSearchEnabled: boolean;
  rowsPerPage: number;
  defaultPeriod: 'all' | 'weekly' | 'monthly';
  showZeroSolves: boolean;
  tieBreaker: 'earliest_solve' | 'account_age' | 'alphabetical';
  cacheDurationSeconds: number;
}

const defaultLeaderboardConfig: LeaderboardConfigState = {
  isLeaderboardEnabled: true,
  isPodiumEnabled: true,
  isSummaryStatsEnabled: true,
  showStatActiveLearners: true,
  showStatTotalSolved: true,
  showStatTopStreak: true,
  showStatLastUpdated: true,
  showWeeklyFilter: true,
  showMonthlyFilter: true,
  showStreakColumn: true,
  showThisWeekColumn: true,
  showLastSolvedColumn: true,
  showLevelBadge: true,
  isSearchEnabled: true,
  rowsPerPage: 15,
  defaultPeriod: 'all',
  showZeroSolves: true,
  tieBreaker: 'earliest_solve',
  cacheDurationSeconds: 30,
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'topics', label: 'Topics', icon: <FolderTree size={16} /> },
  { id: 'problems', label: 'Problems', icon: <Wrench size={16} /> },
  { id: 'visualizers', label: 'Visualizers', icon: <PlayCircle size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'potd', label: 'POTD', icon: <Sparkles size={16} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
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
  const [potdCustomDescription, setPotdCustomDescription] = useState('');
  const [potdCustomEstimatedTime, setPotdCustomEstimatedTime] = useState('');
  const [potdCustomFocusArea, setPotdCustomFocusArea] = useState('');
  const [potdScheduledDate, setPotdScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfigState>(defaultLeaderboardConfig);
  const [leaderboardSummary, setLeaderboardSummary] = useState<{ totalLearners: number; totalSolved: number; topStreak: number; lastUpdated?: string } | null>(null);
  const [leaderboardLastCache, setLeaderboardLastCache] = useState<string | null>(null);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);
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
      return topics.filter(t => (t.name || '').toLowerCase().includes(q) || (t.slug || '').toLowerCase().includes(q));
    }, [topics, topicSearch]);

    const filteredProblems = useMemo(() => {
      return problems.filter(p => {
        const q = problemSearch.toLowerCase().trim();
        if (q && !(p.title || '').toLowerCase().includes(q) && !String(p.problemNumber || '').includes(q)) return false;
        if (problemDifficultyFilter && p.difficulty !== problemDifficultyFilter) return false;
        return true;
      });
    }, [problems, problemSearch, problemDifficultyFilter]);

    const filteredUsers = useMemo(() => {
      return users.filter(u => {
        const q = userSearch.toLowerCase();
        if (q && !(u.username || '').toLowerCase().includes(q) && !(u.email || '').toLowerCase().includes(q)) return false;
        if (userRoleFilter && u.role !== userRoleFilter) return false;
        if (userStatusFilter === 'active' && !u.isActive) return false;
        if (userStatusFilter === 'disabled' && u.isActive) return false;
        return true;
      });
    }, [users, userSearch, userRoleFilter, userStatusFilter]);
  const [topicForm, setTopicForm] = useState<TopicFormState>(defaultTopicForm);
  const [problemForm, setProblemForm] = useState<ProblemFormState>(defaultProblemForm);

  const [visualizers, setVisualizers] = useState<VisualizerAlgorithm[]>([]);
  const [visualizersPagination, setVisualizersPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 100, pages: 1 });
  const [visualizerStats, setVisualizerStats] = useState({ total: 0, live: 0, awaiting: 0 });
  const [visualizerPillarFilter, setVisualizerPillarFilter] = useState<'algorithm' | 'data-structure' | 'problem' | 'all'>('algorithm');
  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [visualizerCategoryFilter, setVisualizerCategoryFilter] = useState('All');
  const [visualizerStatusFilter, setVisualizerStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [minimalProblems, setMinimalProblems] = useState<Array<{ id: number; title: string; difficulty: string; topic: string; link: string }>>([]);
  const [problemPickerSearch, setProblemPickerSearch] = useState('');
  const [problemPickerTopic, setProblemPickerTopic] = useState('All');
  const [problemPickerDifficulty, setProblemPickerDifficulty] = useState('All');
  const [isChangingProblem, setIsChangingProblem] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpTime, setNewOpTime] = useState('O(1)');
  const [newOpSpace, setNewOpSpace] = useState('O(1)');
  const [newOpDesc, setNewOpDesc] = useState('');
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
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

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
      if (
        q &&
        !v.name.toLowerCase().includes(q) &&
        !v.slug.toLowerCase().includes(q) &&
        !v.problemTitle?.toLowerCase().includes(q) &&
        !v.tags?.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (visualizerPillarFilter !== 'all' && (v.type || 'algorithm') !== visualizerPillarFilter) {
        return false;
      }
      if (visualizerCategoryFilter !== 'All') {
        if (visualizerPillarFilter === 'data-structure') {
          if (v.dataStructureType !== visualizerCategoryFilter && v.category !== visualizerCategoryFilter) return false;
        } else if (visualizerPillarFilter === 'problem') {
          if (v.problemTopic !== visualizerCategoryFilter && v.category !== visualizerCategoryFilter) return false;
        } else if (v.category !== visualizerCategoryFilter) {
          return false;
        }
      }
      if (visualizerStatusFilter !== 'all' && v.status !== visualizerStatusFilter) return false;
      return true;
    });
  }, [visualizers, visualizerSearch, visualizerPillarFilter, visualizerCategoryFilter, visualizerStatusFilter]);

  const pillarCategoryNames = useMemo(() => {
    if (visualizerPillarFilter === 'data-structure') {
      return DATA_STRUCTURE_FAMILIES;
    }
    if (visualizerPillarFilter === 'problem') {
      const set = new Set<string>();
      visualizers.filter((v) => v.type === 'problem').forEach((v) => {
        if (v.problemTopic) set.add(v.problemTopic);
        else if (v.category) set.add(v.category);
      });
      return Array.from(set);
    }
    const set = new Set<string>();
    visualizers.filter((v) => !v.type || v.type === 'algorithm').forEach((v) => {
      if (v.category) set.add(v.category);
    });
    for (const cat of availableCategoryNames) {
      set.add(cat);
    }
    return Array.from(set);
  }, [visualizerPillarFilter, visualizers, availableCategoryNames]);

  const algorithmVisualizers = useMemo(
    () => filteredVisualizers.filter((v) => !v.type || v.type === 'algorithm'),
    [filteredVisualizers]
  );
  const dataStructureVisualizers = useMemo(
    () => filteredVisualizers.filter((v) => v.type === 'data-structure'),
    [filteredVisualizers]
  );
  const problemVisualizers = useMemo(
    () => filteredVisualizers.filter((v) => v.type === 'problem'),
    [filteredVisualizers]
  );

  const groupedAlgorithms = useMemo(() => {
    const map = new Map<string, VisualizerAlgorithm[]>();
    for (const vis of algorithmVisualizers) {
      const cat = vis.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(vis);
    }
    return Array.from(map.entries());
  }, [algorithmVisualizers]);

  const groupedDataStructures = useMemo(() => {
    const map = new Map<string, VisualizerAlgorithm[]>();
    for (const vis of dataStructureVisualizers) {
      const family = vis.dataStructureType || 'Linear';
      if (!map.has(family)) map.set(family, []);
      map.get(family)!.push(vis);
    }
    return Array.from(map.entries());
  }, [dataStructureVisualizers]);

  const groupedProblems = useMemo(() => {
    const map = new Map<string, VisualizerAlgorithm[]>();
    for (const vis of problemVisualizers) {
      const topic = vis.problemTopic || vis.category || 'General';
      if (!map.has(topic)) map.set(topic, []);
      map.get(topic)!.push(vis);
    }
    return Array.from(map.entries());
  }, [problemVisualizers]);

  const minimalProblemTopics = useMemo(() => {
    const set = new Set<string>();
    for (const p of minimalProblems) {
      if (p.topic) set.add(p.topic);
    }
    return Array.from(set).sort();
  }, [minimalProblems]);

  const topicProblemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of minimalProblems) {
      if (p.topic) counts[p.topic] = (counts[p.topic] || 0) + 1;
    }
    return counts;
  }, [minimalProblems]);

  const filteredMinimalProblems = useMemo(() => {
    const query = problemPickerSearch.toLowerCase().trim();
    return minimalProblems.filter((p) => {
      if (query) {
        const matchId = String(p.id).includes(query);
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchTopic = p.topic?.toLowerCase().includes(query);
        if (!matchId && !matchTitle && !matchTopic) return false;
      }
      if (problemPickerTopic !== 'All' && p.topic !== problemPickerTopic) {
        return false;
      }
      if (problemPickerDifficulty !== 'All' && p.difficulty !== problemPickerDifficulty) {
        return false;
      }
      return true;
    });
  }, [minimalProblems, problemPickerSearch, problemPickerTopic, problemPickerDifficulty]);

  const currentlyLinkedProblem = useMemo(() => {
    if (!visualizerForm.problemId) return null;
    return minimalProblems.find((p) => String(p.id) === String(visualizerForm.problemId));
  }, [visualizerForm.problemId, minimalProblems]);

  const selectedPotdProblem = useMemo(() => {
    if (!selectedPotdProblemId) return null;
    const foundMinimal = minimalProblems.find(
      (p) => String((p as any)._id) === String(selectedPotdProblemId) || String(p.id) === String(selectedPotdProblemId)
    );
    if (foundMinimal) return foundMinimal;
    const foundProblem = problems.find(
      (p) => String(p.id) === String(selectedPotdProblemId) || String(p.problemNumber) === String(selectedPotdProblemId)
    );
    if (foundProblem) {
      return {
        _id: foundProblem.id,
        id: foundProblem.problemNumber,
        title: foundProblem.title,
        difficulty: foundProblem.difficulty,
        topic: foundProblem.topic,
        link: foundProblem.link,
      };
    }
    if (
      overview?.potd &&
      (String(overview.potd.problemId) === String(selectedPotdProblemId) ||
        String(overview.potd.problemNumber) === String(selectedPotdProblemId))
    ) {
      return {
        _id: overview.potd.problemId,
        id: overview.potd.problemNumber,
        title: overview.potd.title,
        difficulty: overview.potd.difficulty || 'Medium',
        topic: overview.potd.topic || 'General',
        link: overview.potd.link || '#',
      };
    }
    return null;
  }, [selectedPotdProblemId, minimalProblems, problems, overview?.potd]);

  const potdProblemOptions = useMemo(() => {
    if (minimalProblems.length > 0) {
      return minimalProblems.map((p) => ({
        value: (p as any)._id || String(p.id),
        label: `#${p.id} ${p.title} (${p.topic})`,
        badge: p.difficulty,
        badgeColor: (p.difficulty === 'Easy' ? 'emerald' : p.difficulty === 'Medium' ? 'amber' : 'rose') as any,
      }));
    }
    return problems.map((p) => ({
      value: p.id,
      label: `#${p.problemNumber} ${p.title} (${p.topic})`,
      badge: p.difficulty,
      badgeColor: (p.difficulty === 'Easy' ? 'emerald' : p.difficulty === 'Medium' ? 'amber' : 'rose') as any,
    }));
  }, [minimalProblems, problems]);

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
    setNewOpName('');
    setNewOpTime('O(1)');
    setNewOpSpace('O(1)');
    setNewOpDesc('');
    setProblemPickerSearch('');
    setProblemPickerTopic('All');
    setProblemPickerDifficulty('All');
    setIsChangingProblem(false);
  };

  const handleAddOperation = () => {
    if (!newOpName.trim()) return;
    setVisualizerForm((prev) => ({
      ...prev,
      operations: [
        ...(prev.operations || []),
        {
          name: newOpName.trim(),
          timeComplexity: newOpTime.trim() || 'O(1)',
          spaceComplexity: newOpSpace.trim() || 'O(1)',
          description: newOpDesc.trim(),
        },
      ],
    }));
    setNewOpName('');
    setNewOpTime('O(1)');
    setNewOpSpace('O(1)');
    setNewOpDesc('');
  };

  const handleRemoveOperation = (index: number) => {
    setVisualizerForm((prev) => ({
      ...prev,
      operations: (prev.operations || []).filter((_, i) => i !== index),
    }));
  };

  const handleSelectProblemForVisualizer = (selectedProblemId: string) => {
    const prob = minimalProblems.find((p) => String(p.id) === selectedProblemId);
    if (!prob) {
      setVisualizerForm((curr) => ({ ...curr, problemId: '' }));
      setIsChangingProblem(false);
      return;
    }
    const slugName = prob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const derivedSlug = `problem-${prob.id}-${slugName}`;
    setVisualizerForm((curr) => ({
      ...curr,
      problemId: String(prob.id),
      name: curr.name ? curr.name : prob.title,
      slug: curr.slug ? curr.slug : derivedSlug,
      category: curr.category || prob.topic,
      difficulty: (prob.difficulty as 'Easy' | 'Medium' | 'Hard') || curr.difficulty,
    }));
    setIsChangingProblem(false);
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
        type: visualizerPillarFilter !== 'all' ? visualizerPillarFilter : undefined,
      });

      const getJson = async (path: string, fallbackMessage: string) => {
        const response = await fetch(apiUrl(path), { headers: authHeaders });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.msg || fallbackMessage);
        }

        return payload;
      };

      const [overviewResult, topicsResult, problemsResult, usersResult, auditResult, visualizersResult, categoriesResult, minimalProblemsResult] = await Promise.allSettled([
        getJson('/api/admin/overview', 'Failed to load overview'),
        getJson(`/api/admin/topics?${topicsQuery}`, 'Failed to load topics'),
        getJson(`/api/admin/problems?${problemsQuery}`, 'Failed to load problems'),
        getJson(`/api/admin/users?${usersQuery}`, 'Failed to load users'),
        getJson(`/api/admin/audit-logs?${auditQuery}`, 'Failed to load audit logs'),
        getJson(`/api/admin/visualizers?${visualizersQuery}`, 'Failed to load visualizers'),
        getJson('/api/admin/visualizers/categories', 'Failed to load visualizer categories'),
        getJson('/api/admin/problems/list-minimal', 'Failed to load minimal problems'),
      ]);

      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      const errors: string[] = [];

      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
        if (overviewResult.value?.potd?.problemId) {
          setSelectedPotdProblemId(overviewResult.value.potd.problemId);
          setPotdCustomDescription(overviewResult.value.potd.customDescription || '');
          setPotdCustomEstimatedTime(overviewResult.value.potd.customEstimatedTime || '');
          setPotdCustomFocusArea(overviewResult.value.potd.customFocusArea || '');
          if (overviewResult.value.potd.date) {
            setPotdScheduledDate(overviewResult.value.potd.date);
          }
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

      if (minimalProblemsResult.status === 'fulfilled' && Array.isArray(minimalProblemsResult.value)) {
        setMinimalProblems(minimalProblemsResult.value);
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
    visualizerPillarFilter,
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
  }, [visualizerSearch, visualizerCategoryFilter, visualizerStatusFilter, visualizerPillarFilter]);


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
        body: JSON.stringify({
          problemId: selectedPotdProblemId,
          customDescription: potdCustomDescription.trim(),
          customEstimatedTime: potdCustomEstimatedTime.trim(),
          customFocusArea: potdCustomFocusArea.trim(),
          date: potdScheduledDate,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.msg || 'Failed to set POTD');
      }

      if (payload.potd) {
        setOverview((prev) => (prev ? { ...prev, potd: payload.potd } : prev));
      }
    }, 'Problem of the day updated successfully');
  };

  const loadLeaderboardSettings = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/leaderboard/settings'), { headers: authHeaders });
      if (res.ok) {
        const payload = await res.json();
        if (payload.settings) {
          setLeaderboardConfig({ ...defaultLeaderboardConfig, ...payload.settings });
        }
        if (payload.summary) {
          setLeaderboardSummary(payload.summary);
        }
        if (payload.lastCacheTime) {
          setLeaderboardLastCache(payload.lastCacheTime);
        }
      }
    } catch (e) {
      console.error('Failed to load leaderboard settings:', e);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboardSettings();
    }
  }, [activeTab, loadLeaderboardSettings]);

  const saveLeaderboardConfig = async () => {
    await withNotice(async () => {
      const res = await fetch(apiUrl('/api/admin/leaderboard/settings'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(leaderboardConfig),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.msg || 'Failed to update leaderboard settings');
      }
      if (payload.settings) {
        setLeaderboardConfig({ ...defaultLeaderboardConfig, ...payload.settings });
      }
    }, 'Leaderboard settings saved successfully');
  };

  const handleRefreshLeaderboardCache = async () => {
    try {
      setRefreshingLeaderboard(true);
      const res = await fetch(apiUrl('/api/admin/leaderboard/refresh'), {
        method: 'POST',
        headers: authHeaders,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.msg || 'Failed to refresh cache');
      if (payload.summary) setLeaderboardSummary(payload.summary);
      if (payload.lastCacheTime) setLeaderboardLastCache(payload.lastCacheTime);
      setNotice('Leaderboard cache refreshed & recalculated successfully');
    } catch (e: any) {
      setError(e.message || 'Failed to refresh leaderboard cache');
    } finally {
      setRefreshingLeaderboard(false);
    }
  };

  const resetLeaderboardConfigToDefaults = () => {
    setLeaderboardConfig(defaultLeaderboardConfig);
  };

  const editVisualizer = (vis: VisualizerAlgorithm) => {
    setEditingVisualizerId(vis.id);
    setVisualizerForm({
      name: vis.name,
      slug: vis.slug,
      type: vis.type || 'algorithm',
      dataStructureType: vis.dataStructureType || 'Linear',
      operations: vis.operations || [],
      problemId: vis.problemId ? String(vis.problemId) : '',
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
    setProblemPickerSearch('');
    setProblemPickerTopic('All');
    setProblemPickerDifficulty('All');
    setIsChangingProblem(false);
  };

  const openVisualizerSettings = (vis: VisualizerAlgorithm) => {
    editVisualizer(vis);
    setIsVisualizerSettingsModalOpen(true);
  };

  const openCreateVisualizer = (pillar?: VisualizerType) => {
    resetVisualizerForm();
    const targetType = pillar || (visualizerPillarFilter !== 'all' ? visualizerPillarFilter : 'algorithm');
    setVisualizerForm((prev) => ({ ...prev, type: targetType }));
    setIsVisualizerSettingsModalOpen(true);
  };

  const closeReplaceFileModal = () => {
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
    }
    setReplaceFileModal({
      isOpen: false,
      visualizer: null,
      file: null,
      uploading: false,
      error: null,
    });
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
      closeReplaceFileModal();
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
        type: visualizerForm.type || 'algorithm',
        dataStructureType: visualizerForm.dataStructureType,
        operations: visualizerForm.operations,
        problemId: visualizerForm.problemId ? Number(visualizerForm.problemId) : null,
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
        formData.append('type', payload.type);
        formData.append('dataStructureType', payload.dataStructureType || '');
        formData.append('operations', JSON.stringify(payload.operations || []));
        if (payload.problemId) {
          formData.append('problemId', String(payload.problemId));
        }
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

  const renderVisualizerCard = (vis: VisualizerAlgorithm) => {
    const isDataStructure = vis.type === 'data-structure';
    const isProblem = vis.type === 'problem';
    const isLive = vis.status === 'available';

    return (
      <div
        key={vis.id}
        className="flex flex-col justify-between rounded-2xl border border-l-4 border-l-teal-500 border-slate-200/80 dark:border-white/10 hover:border-teal-500/50 bg-white dark:bg-[#111715] p-4 sm:p-5 transition-all duration-200 hover:shadow-lg gap-4"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-xl shrink-0 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {isDataStructure ? <Boxes size={18} /> : isProblem ? <Lightbulb size={18} /> : <Zap size={18} />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {isDataStructure ? 'Data Structure' : isProblem ? `Sheet Problem #${vis.problemId || ''}` : 'Algorithm'}
                </span>

                <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {vis.dataStructureType || vis.category}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    vis.difficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : vis.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                  }`}
                >
                  {vis.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate" title={vis.name}>
                {vis.name}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex items-center gap-1.5 ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isLive ? 'Live in R2' : 'Awaiting HTML'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {vis.fileSize ? `${(vis.fileSize / 1024).toFixed(1)} KB` : 'No file'}
            </span>
          </div>
        </div>

        {/* Pillar Specific Body */}
        <div className="space-y-2.5">
          {isProblem && (
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                <span className="flex items-center gap-1.5">
                  <Lightbulb size={13} />
                  Linked Sheet Problem #{vis.problemId}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  {vis.problemTopic || vis.category}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {vis.problemTitle || vis.name}
              </p>
            </div>
          )}

          {!isDataStructure && !isProblem && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl px-3 py-1.5">
              <span>Avg: <strong className="text-teal-600 dark:text-teal-400">{vis.timeComplexity?.average || 'O(n)'}</strong></span>
              <span>•</span>
              <span>Worst: <strong className="text-slate-700 dark:text-slate-300">{vis.timeComplexity?.worst || 'O(n²)'}</strong></span>
              <span>•</span>
              <span>Space: <strong className="text-slate-700 dark:text-slate-300">{vis.spaceComplexity || 'O(1)'}</strong></span>
            </div>
          )}

          {/* Description Snippet */}
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {vis.description || 'No description provided.'}
          </p>

          {/* Storage / File Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="flex items-center gap-1.5 truncate max-w-[280px] font-mono text-[10px]">
              <FileCode size={12} className="text-teal-500 shrink-0" />
              <span className="truncate">{vis.originalFileName || vis.r2Key || vis.htmlPath}</span>
            </span>
            <span className="shrink-0 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {vis.storageType === 'r2' ? 'Cloudflare R2' : 'Local'}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          {/* Main Upload / Replace Action */}
          <button
            type="button"
            onClick={() => setReplaceFileModal({ isOpen: true, visualizer: vis, file: null, uploading: false, error: null })}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              !isLive
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                : 'border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20'
            }`}
            title="Upload / Replace standalone HTML animation"
          >
            <UploadCloud size={13} />
            <span>{!isLive ? 'Upload HTML' : 'Replace HTML'}</span>
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVisualizerPreviewModal({ isOpen: true, visualizer: vis })}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Preview animation"
            >
              <Eye size={14} />
            </button>

            <button
              type="button"
              onClick={() => openVisualizerSettings(vis)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Edit configuration & parameters"
            >
              <Settings size={14} />
            </button>

            <button
              type="button"
              onClick={() => openCodeModal(vis)}
              className="rounded-xl border border-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 transition"
              title="Inspect HTML code"
            >
              <Code2 size={14} />
            </button>

            <button
              type="button"
              onClick={() => toggleVisualizerStatus(vis.id, vis.status)}
              className={`rounded-xl p-1.5 border transition ${
                isLive
                  ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                  : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
              }`}
              title={isLive ? 'Mark as Awaiting Code' : 'Mark as Live'}
            >
              <Check size={14} className={isLive ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              type="button"
              onClick={() => deleteVisualizer(vis.id)}
              className="rounded-xl border border-rose-200/80 p-1.5 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20 transition"
              title="Delete visualizer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
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

        {activeTab === 'overview' && (
          <AdminOverviewTab
            overview={overview}
            onNavigateToPOTD={() => setActiveTab('potd')}
          />
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
              {/* Master Header */}
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Visualizer Hub & Animations
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {filteredVisualizers.length} / {visualizers.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage 3-pillar visualizers and upload standalone HTML animations to Cloudflare R2
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <SearchBox
                    value={visualizerSearch}
                    onChange={setVisualizerSearch}
                    placeholder="Search by name, tags, topic..."
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
                    onClick={() => openCreateVisualizer()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#123b36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 shadow-sm"
                  >
                    <Plus size={15} />
                    <span>
                      {visualizerPillarFilter === 'algorithm'
                        ? 'New Algorithm'
                        : visualizerPillarFilter === 'data-structure'
                        ? 'New Data Structure'
                        : visualizerPillarFilter === 'problem'
                        ? 'New Sheet Problem'
                        : 'New Visualizer'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3-Pillar Master Sub-Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* Pillar 1: Algorithms */}
                <button
                  type="button"
                  onClick={() => {
                    setVisualizerPillarFilter('algorithm');
                    setVisualizerCategoryFilter('All');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visualizerPillarFilter === 'algorithm'
                      ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/[0.08] shadow-md ring-1 ring-teal-500/50'
                      : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${visualizerPillarFilter === 'algorithm' ? 'bg-teal-500 text-white' : 'bg-slate-200/60 dark:bg-white/10 text-teal-600 dark:text-teal-400'}`}>
                        <Zap size={16} />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">1. Algorithms</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      {visualizers.filter((v) => !v.type || v.type === 'algorithm').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                    Sorting, Searching, Graphs, DP
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {visualizers.filter((v) => (!v.type || v.type === 'algorithm') && v.status === 'available').length} Live
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {visualizers.filter((v) => (!v.type || v.type === 'algorithm') && v.status !== 'available').length} Awaiting
                    </span>
                  </div>
                </button>

                {/* Pillar 2: Data Structures */}
                <button
                  type="button"
                  onClick={() => {
                    setVisualizerPillarFilter('data-structure');
                    setVisualizerCategoryFilter('All');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visualizerPillarFilter === 'data-structure'
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/[0.08] shadow-md ring-1 ring-indigo-500/50'
                      : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${visualizerPillarFilter === 'data-structure' ? 'bg-indigo-500 text-white' : 'bg-slate-200/60 dark:bg-white/10 text-indigo-600 dark:text-indigo-400'}`}>
                        <Boxes size={16} />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">2. Data Structures</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                      {visualizers.filter((v) => v.type === 'data-structure').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                    Structures & operations matrix
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {visualizers.filter((v) => v.type === 'data-structure' && v.status === 'available').length} Live
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {visualizers.filter((v) => v.type === 'data-structure' && v.status !== 'available').length} Awaiting
                    </span>
                  </div>
                </button>

                {/* Pillar 3: Sheet Problems */}
                <button
                  type="button"
                  onClick={() => {
                    setVisualizerPillarFilter('problem');
                    setVisualizerCategoryFilter('All');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visualizerPillarFilter === 'problem'
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/[0.08] shadow-md ring-1 ring-amber-500/50'
                      : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${visualizerPillarFilter === 'problem' ? 'bg-amber-500 text-white' : 'bg-slate-200/60 dark:bg-white/10 text-amber-600 dark:text-amber-400'}`}>
                        <Lightbulb size={16} />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">3. Sheet Problems</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      {visualizers.filter((v) => v.type === 'problem').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                    Solutions linked to sheet problems
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {visualizers.filter((v) => v.type === 'problem' && v.status === 'available').length} Live
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {visualizers.filter((v) => v.type === 'problem' && v.status !== 'available').length} Awaiting
                    </span>
                  </div>
                </button>

                {/* Pillar 4: All Visualizers (Divided Overview) */}
                <button
                  type="button"
                  onClick={() => {
                    setVisualizerPillarFilter('all');
                    setVisualizerCategoryFilter('All');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visualizerPillarFilter === 'all'
                      ? 'border-slate-500 bg-slate-500/10 dark:bg-white/[0.06] shadow-md ring-1 ring-slate-400/50'
                      : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${visualizerPillarFilter === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
                        <LayoutDashboard size={16} />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">All (Grouped)</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {visualizers.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                    Master view separated by pillar
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {visualizerStats.live} Live
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {visualizerStats.awaiting} Awaiting
                    </span>
                  </div>
                </button>
              </div>

              {/* Context Filters */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                  {visualizerPillarFilter === 'data-structure' ? 'Family:' : 'Category:'}
                </span>

                <FilterChip
                  label="All"
                  active={visualizerCategoryFilter === 'All'}
                  onClick={() => setVisualizerCategoryFilter('All')}
                />
                {pillarCategoryNames.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={visualizerCategoryFilter === cat}
                    onClick={() => setVisualizerCategoryFilter(cat)}
                  />
                ))}

                <span className="mx-1 self-center border-l border-slate-200/80 dark:border-white/10 h-4" />

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Status:
                </span>
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

              {/* Main Content Area */}
              {filteredVisualizers.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <PlayCircle size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No visualizers match your filters
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting search keywords or click "+ New Visualizer" to add one.
                  </p>
                </div>
              ) : visualizerPillarFilter === 'all' ? (
                /* Master All View: Explicitly Divided into 3 Distinct Sections */
                <div className="space-y-8">
                  {/* Section 1: Algorithms */}
                  {algorithmVisualizers.length > 0 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-teal-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            <Zap size={16} />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Pillar 1: Algorithm Visualizations
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold">
                            {algorithmVisualizers.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVisualizerPillarFilter('algorithm')}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          View Only Algorithms →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {algorithmVisualizers.map(renderVisualizerCard)}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Data Structures */}
                  {dataStructureVisualizers.length > 0 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Boxes size={16} />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Pillar 2: Data Structures & Operations
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                            {dataStructureVisualizers.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVisualizerPillarFilter('data-structure')}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Only Data Structures →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {dataStructureVisualizers.map(renderVisualizerCard)}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Sheet Problems */}
                  {problemVisualizers.length > 0 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Lightbulb size={16} />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Pillar 3: Sheet Problem Visual Solutions
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            {problemVisualizers.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVisualizerPillarFilter('problem')}
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          View Only Sheet Problems →
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {problemVisualizers.map(renderVisualizerCard)}
                      </div>
                    </div>
                  )}
                </div>
              ) : visualizerPillarFilter === 'algorithm' ? (
                /* Dedicated Algorithms View: Grouped by Category */
                <div className="space-y-6">
                  {groupedAlgorithms.map(([categoryName, items]) => (
                    <div key={categoryName} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                        <Zap size={15} className="text-teal-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          {categoryName}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                          {items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {items.map(renderVisualizerCard)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : visualizerPillarFilter === 'data-structure' ? (
                /* Dedicated Data Structures View: Grouped by Family */
                <div className="space-y-6">
                  {groupedDataStructures.map(([familyName, items]) => (
                    <div key={familyName} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                        <Boxes size={15} className="text-indigo-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          {familyName} Data Structures
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                          {items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {items.map(renderVisualizerCard)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Dedicated Sheet Problems View: Grouped by Topic */
                <div className="space-y-6">
                  {groupedProblems.map(([topicName, items]) => (
                    <div key={topicName} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2">
                        <Lightbulb size={15} className="text-amber-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          {topicName}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                          {items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {items.map(renderVisualizerCard)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            users={users}
            filteredUsers={filteredUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            userStatusFilter={userStatusFilter}
            setUserStatusFilter={setUserStatusFilter}
            usersPagination={usersPagination}
            setUsersPagination={setUsersPagination}
            updateUserAccess={updateUserAccess}
          />
        )}

        {activeTab === 'audit' && (
          <AdminAuditTab
            auditLogs={auditLogs}
            auditSearch={auditSearch}
            setAuditSearch={setAuditSearch}
            auditPagination={auditPagination}
            setAuditPagination={setAuditPagination}
          />
        )}

        {activeTab === 'potd' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Sparkles className="text-emerald-500" size={24} />
                  Problem of the Day Control Center
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select the featured problem, customize challenge guidance, override focus area tags, and schedule dates with live preview.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/potd"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm"
                >
                  <Eye size={15} />
                  <span>View Public POTD</span>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)] items-start">
              {/* Left Column: Form Controls */}
              <div className="surface rounded-3xl p-6 space-y-5">
                <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">POTD Configuration</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure every student-facing element of the daily challenge card.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Scheduled Date (YYYY-MM-DD)"
                    type="date"
                    value={potdScheduledDate}
                    onChange={setPotdScheduledDate}
                    required
                    helperText="Which calendar day this POTD is active for."
                  />

                  <Select
                    label="Featured Sheet Problem"
                    value={selectedPotdProblemId}
                    onChange={setSelectedPotdProblemId}
                    options={potdProblemOptions}
                    searchable={true}
                    searchPlaceholder="Search all problems by name, topic..."
                    required
                    helperText={
                      selectedPotdProblem
                        ? `Selected: #${(selectedPotdProblem as any).problemNumber || selectedPotdProblem.id} ${selectedPotdProblem.title} (${selectedPotdProblem.difficulty})`
                        : 'Pick a problem from the entire DSA sheet.'
                    }
                  />

                  <Input
                    label="Custom Focus Area Title (Optional Override)"
                    value={potdCustomFocusArea}
                    onChange={setPotdCustomFocusArea}
                    placeholder={
                      selectedPotdProblem
                        ? `Default: ${selectedPotdProblem.topic}`
                        : 'e.g., Dynamic Programming, Sliding Window'
                    }
                    helperText="Controls both the pill badge (e.g., DYNAMIC-PROGRAMMING) and the Focus Area card. Defaults to problem topic if empty."
                  />

                  <Input
                    label="Custom Estimated Time (Optional Override)"
                    value={potdCustomEstimatedTime}
                    onChange={setPotdCustomEstimatedTime}
                    placeholder={
                      selectedPotdProblem
                        ? `Default: ${
                            selectedPotdProblem.difficulty === 'Hard'
                              ? '45–60 minutes'
                              : selectedPotdProblem.difficulty === 'Medium'
                              ? '20–30 minutes'
                              : '10–15 minutes'
                          }`
                        : 'e.g., 25–35 minutes'
                    }
                    helperText="Controls the Estimated Time stat card. Defaults to auto-calculation based on difficulty if empty."
                  />

                  <TextArea
                    label="Custom Challenge Guidance / Description (Optional)"
                    value={potdCustomDescription}
                    onChange={setPotdCustomDescription}
                    rows={3}
                    placeholder="Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark."
                    helperText="Custom motivation, hints, or instructions displayed prominently under the title. Defaults to standard quote if empty."
                  />

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={assignPotd}
                      disabled={saving || !selectedPotdProblemId}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#123b36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-60 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save & Set POTD
                    </button>

                    {(potdCustomDescription || potdCustomEstimatedTime || potdCustomFocusArea) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPotdCustomDescription('');
                          setPotdCustomEstimatedTime('');
                          setPotdCustomFocusArea('');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                      >
                        Reset Overrides
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview Matching /potd */}
              <div className="space-y-6">
                <div className="surface rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Eye size={18} className="text-teal-500" />
                        Live Student Card Preview
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time visualization of what students see on /potd
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <Sparkles size={12} />
                      Live Preview
                    </span>
                  </div>

                  {/* Card mockup */}
                  <div className="rounded-2xl border border-white/10 bg-[#090d0b] p-6 text-white shadow-2xl relative">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-stretch">
                      {/* Left: badges + title + description */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="mb-5 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                                selectedPotdProblem?.difficulty === 'Hard'
                                  ? 'text-rose-400 bg-rose-950/50 border-rose-800/60'
                                  : selectedPotdProblem?.difficulty === 'Medium'
                                  ? 'text-amber-400 bg-amber-950/50 border-amber-800/60'
                                  : 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60'
                              }`}
                            >
                              {selectedPotdProblem?.difficulty || 'Medium'}
                            </span>

                            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-300">
                              <Calendar size={12} className="text-slate-400" />
                              {new Date(potdScheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>

                            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                              {(potdCustomFocusArea || selectedPotdProblem?.topic || 'GENERAL')
                                .trim()
                                .toUpperCase()
                                .replace(/\s+/g, '-')}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
                            {selectedPotdProblem
                              ? `#${(selectedPotdProblem as any).problemNumber || selectedPotdProblem.id} ${selectedPotdProblem.title}`
                              : 'Select a problem from the dropdown'}
                          </h3>

                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            {potdCustomDescription ||
                              'Set aside a focused block, understand the pattern, then solve it cleanly. The aim is durable thinking—not just another checkmark.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white pointer-events-none"
                          >
                            <Play size={11} className="fill-current text-white" />
                            <span>Tutorial</span>
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white pointer-events-none"
                          >
                            <Code2 size={13} className="text-white" />
                            <span>Code</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: metadata sidebar */}
                      <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-4">
                        <div className="space-y-4">
                          {/* Focus Area */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                              <Target size={16} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                FOCUS AREA
                              </p>
                              <p className="text-xs font-bold text-white mt-0.5">
                                {potdCustomFocusArea || selectedPotdProblem?.topic || 'General Practice'}
                              </p>
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                              <BarChart2 size={16} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                DIFFICULTY
                              </p>
                              <p
                                className={`text-xs font-bold mt-0.5 ${
                                  selectedPotdProblem?.difficulty === 'Hard'
                                    ? 'text-rose-400'
                                    : selectedPotdProblem?.difficulty === 'Medium'
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {selectedPotdProblem?.difficulty || 'Medium'}
                              </p>
                            </div>
                          </div>

                          {/* Estimated Time */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                ESTIMATED TIME
                              </p>
                              <p className="text-xs font-bold text-white mt-0.5">
                                {potdCustomEstimatedTime ||
                                  (selectedPotdProblem?.difficulty === 'Hard'
                                    ? '45–60 minutes'
                                    : selectedPotdProblem?.difficulty === 'Medium'
                                    ? '20–30 minutes'
                                    : '10–15 minutes')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-black font-bold text-xs py-2 px-3 shadow-sm pointer-events-none">
                            <span>Solve on platform</span>
                            <ExternalLink size={12} className="text-black" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Pinned Status */}
                {overview?.potd && (
                  <div className="surface rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/[0.03]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                          Active Database Record
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          #{overview.potd.problemNumber} {overview.potd.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Assigned for {overview.potd.date} • Topic: {overview.potd.topic || 'General'} • Difficulty: {overview.potd.difficulty || 'Medium'}
                        </p>
                        {overview.potd.customFocusArea && (
                          <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                            Custom Focus Area: &ldquo;{overview.potd.customFocusArea}&rdquo;
                          </p>
                        )}
                        {overview.potd.customEstimatedTime && (
                          <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">
                            Custom Estimated Time: &ldquo;{overview.potd.customEstimatedTime}&rdquo;
                          </p>
                        )}
                        {overview.potd.customDescription && (
                          <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">
                            Custom Guidance: &ldquo;{overview.potd.customDescription}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'leaderboard' && (
          <section className="space-y-6">
            {/* Header with Title & Quick Links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Trophy className="text-amber-500" size={24} />
                  Leaderboard Control &amp; Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage platform-wide leaderboard visibility, podium display, column metrics, deterministic ranking rules, and cache performance.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefreshLeaderboardCache}
                  disabled={refreshingLeaderboard}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm disabled:opacity-60"
                >
                  <RefreshCw size={14} className={refreshingLeaderboard ? 'animate-spin' : ''} />
                  <span>{refreshingLeaderboard ? 'Recalculating...' : 'Force Refresh Cache'}</span>
                </button>
                <a
                  href="/leaderboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm"
                >
                  <Eye size={15} />
                  <span>View Public Leaderboard</span>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] items-start">
              {/* Left Column: Settings Configuration Forms */}
              <div className="space-y-6">
                {/* 1. Display Settings */}
                <div className="surface rounded-3xl p-6 space-y-5">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <LayoutDashboard size={18} className="text-teal-500" />
                      Display &amp; Visibility Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Toggle student-facing sections, filters, podium, and table columns.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <ToggleRow
                      label="Enable Community Leaderboard Page"
                      checked={leaderboardConfig.isLeaderboardEnabled}
                      onChange={(checked) =>
                        setLeaderboardConfig((c) => ({ ...c, isLeaderboardEnabled: checked }))
                      }
                    />

                    <ToggleRow
                      label="Show Top-3 Podium Showcase"
                      checked={leaderboardConfig.isPodiumEnabled}
                      onChange={(checked) =>
                        setLeaderboardConfig((c) => ({ ...c, isPodiumEnabled: checked }))
                      }
                    />

                    <ToggleRow
                      label="Show Summary Statistics Header Cards"
                      checked={leaderboardConfig.isSummaryStatsEnabled}
                      onChange={(checked) =>
                        setLeaderboardConfig((c) => ({ ...c, isSummaryStatsEnabled: checked }))
                      }
                    />

                    {leaderboardConfig.isSummaryStatsEnabled && (
                      <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-2.5 pt-1">
                        <ToggleRow
                          label="Show Active Learners Count"
                          checked={leaderboardConfig.showStatActiveLearners}
                          onChange={(checked) =>
                            setLeaderboardConfig((c) => ({ ...c, showStatActiveLearners: checked }))
                          }
                        />
                        <ToggleRow
                          label="Show Total Problems Solved"
                          checked={leaderboardConfig.showStatTotalSolved}
                          onChange={(checked) =>
                            setLeaderboardConfig((c) => ({ ...c, showStatTotalSolved: checked }))
                          }
                        />
                        <ToggleRow
                          label="Show Day Streak (Top)"
                          checked={leaderboardConfig.showStatTopStreak}
                          onChange={(checked) =>
                            setLeaderboardConfig((c) => ({ ...c, showStatTopStreak: checked }))
                          }
                        />
                        <ToggleRow
                          label="Show Last Updated Timestamp"
                          checked={leaderboardConfig.showStatLastUpdated}
                          onChange={(checked) =>
                            setLeaderboardConfig((c) => ({ ...c, showStatLastUpdated: checked }))
                          }
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
                      <ToggleRow
                        label="Show 'This Week' Filter Tab"
                        checked={leaderboardConfig.showWeeklyFilter}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showWeeklyFilter: checked }))
                        }
                      />

                      <ToggleRow
                        label="Show 'This Month' Filter Tab"
                        checked={leaderboardConfig.showMonthlyFilter}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showMonthlyFilter: checked }))
                        }
                      />

                      <ToggleRow
                        label="Show 'Max Streak' Table Column"
                        checked={leaderboardConfig.showStreakColumn}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showStreakColumn: checked }))
                        }
                      />

                      <ToggleRow
                        label="Show 'This Week' Solves Table Column"
                        checked={leaderboardConfig.showThisWeekColumn}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showThisWeekColumn: checked }))
                        }
                      />

                      <ToggleRow
                        label="Show 'Last Solved' Timestamp Column"
                        checked={leaderboardConfig.showLastSolvedColumn}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showLastSolvedColumn: checked }))
                        }
                      />

                      <ToggleRow
                        label="Show Gamified Level Badges (Lv. X)"
                        checked={leaderboardConfig.showLevelBadge}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, showLevelBadge: checked }))
                        }
                      />

                      <ToggleRow
                        label="Enable Username Search Filter"
                        checked={leaderboardConfig.isSearchEnabled}
                        onChange={(checked) =>
                          setLeaderboardConfig((c) => ({ ...c, isSearchEnabled: checked }))
                        }
                      />
                    </div>

                    <div className="pt-2">
                      <Select
                        label="Default Rows Per Page"
                        value={String(leaderboardConfig.rowsPerPage)}
                        onChange={(val) =>
                          setLeaderboardConfig((c) => ({ ...c, rowsPerPage: Number(val) || 15 }))
                        }
                        options={[
                          { value: '10', label: '10 Learners per page' },
                          { value: '15', label: '15 Learners per page (Default)' },
                          { value: '25', label: '25 Learners per page' },
                          { value: '50', label: '50 Learners per page' },
                          { value: '100', label: '100 Learners per page' },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ranking & Calculation Rules */}
                <div className="surface rounded-3xl p-6 space-y-5">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target size={18} className="text-amber-500" />
                      Ranking &amp; Tie-Breaker Rules
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Define deterministic ranking calculations and tie-breaking algorithms.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Select
                      label="Default Ranking Period"
                      value={leaderboardConfig.defaultPeriod}
                      onChange={(val) =>
                        setLeaderboardConfig((c) => ({
                          ...c,
                          defaultPeriod: val as 'all' | 'weekly' | 'monthly',
                        }))
                      }
                      options={[
                        { value: 'all', label: 'All Time Solves (Default)' },
                        { value: 'weekly', label: 'This Week Solves' },
                        { value: 'monthly', label: 'This Month Solves' },
                      ]}
                      helperText="Which time period is active when a student first visits /leaderboard."
                    />

                    <Select
                      label="Deterministic Tie-Breaker Rule"
                      value={leaderboardConfig.tieBreaker}
                      onChange={(val) =>
                        setLeaderboardConfig((c) => ({
                          ...c,
                          tieBreaker: val as 'earliest_solve' | 'account_age' | 'alphabetical',
                        }))
                      }
                      options={[
                        {
                          value: 'earliest_solve',
                          label: 'Earliest Solve Timestamp (Fastest Solver First - Recommended)',
                        },
                        {
                          value: 'account_age',
                          label: 'Account Creation Date (Seniority First)',
                        },
                        {
                          value: 'alphabetical',
                          label: 'Alphabetical by Username (A to Z)',
                        },
                      ]}
                      helperText="Used when multiple learners have solved the exact same number of problems."
                    />

                    <ToggleRow
                      label="Display Zero-Solve Learners"
                      checked={leaderboardConfig.showZeroSolves}
                      onChange={(checked) =>
                        setLeaderboardConfig((c) => ({ ...c, showZeroSolves: checked }))
                      }
                    />
                  </div>
                </div>

                {/* 3. Cache & Performance Settings */}
                <div className="surface rounded-3xl p-6 space-y-5">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap size={18} className="text-sky-500" />
                      Cache &amp; Performance
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure in-memory caching to optimize database aggregation throughput.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Cache TTL Duration (Seconds)"
                      type="number"
                      value={String(leaderboardConfig.cacheDurationSeconds)}
                      onChange={(val) =>
                        setLeaderboardConfig((c) => ({
                          ...c,
                          cacheDurationSeconds: Math.max(5, Math.min(3600, Number(val) || 30)),
                        }))
                      }
                      helperText="Controls how long user scores and streaks are cached in memory (minimum 5s, default 30s)."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveLeaderboardConfig}
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#123b36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b2d29] disabled:opacity-60 dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Leaderboard Settings
                  </button>

                  <button
                    type="button"
                    onClick={resetLeaderboardConfigToDefaults}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Right Column: Live Status & Cache Monitor */}
              <div className="space-y-6">
                <div className="surface rounded-3xl p-6 space-y-4">
                  <div className="border-b border-slate-100 dark:border-white/10 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-500" />
                        Live Platform Summary
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Current data aggregated from MongoDB
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        leaderboardConfig.isLeaderboardEnabled
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {leaderboardConfig.isLeaderboardEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Learners
                      </p>
                      <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
                        {leaderboardSummary?.totalLearners ?? '—'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Solves
                      </p>
                      <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
                        {leaderboardSummary?.totalSolved ?? '—'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Top Day Streak
                      </p>
                      <p className="mt-1 font-mono text-xl font-black text-amber-500">
                        {leaderboardSummary?.topStreak ?? '—'} days
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-slate-50 dark:bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Cache TTL
                      </p>
                      <p className="mt-1 font-mono text-xl font-black text-slate-900 dark:text-white">
                        {leaderboardConfig.cacheDurationSeconds}s
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center justify-between">
                      <span>Last Cache Recalculation:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {leaderboardLastCache ? new Date(leaderboardLastCache).toLocaleTimeString() : 'Fresh'}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Active Tie-Breaker:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {leaderboardConfig.tieBreaker.replace('_', ' ')}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRefreshLeaderboardCache}
                      disabled={refreshingLeaderboard}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold py-2.5 px-4 transition disabled:opacity-60"
                    >
                      <RefreshCw size={13} className={refreshingLeaderboard ? 'animate-spin' : ''} />
                      <span>{refreshingLeaderboard ? 'Recalculating...' : 'Force Refresh Cache Now'}</span>
                    </button>
                  </div>
                </div>

                {/* Configuration Impact Guide */}
                <div className="surface rounded-3xl p-6 text-xs text-slate-500 dark:text-slate-400 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Shield size={16} className="text-teal-500" />
                    Administrative Guardrails
                  </h3>
                  <ul className="space-y-2 list-disc pl-4 text-[11px] leading-relaxed">
                    <li>
                      <strong>Derived Integrity:</strong> Scores and streaks are derived from actual solve histories in MongoDB. Administrators configure display and ranking parameters without manually forging scores.
                    </li>
                    <li>
                      <strong>Dynamic Tie-Breakers:</strong> The selected tie-breaker rule applies deterministically across both the podium and table.
                    </li>
                    <li>
                      <strong>Real-Time Sync:</strong> Saving settings automatically invalidates the leaderboard cache so changes propagate to users instantly.
                    </li>
                  </ul>
                </div>
              </div>
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
                          ? `Visualizer Configuration: ${visualizerForm.name || 'Visualizer'}`
                          : 'New Visualizer'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {editingVisualizerId
                          ? 'Configure parameters, operations, sheet problem links, status, and animation file'
                          : 'Create a new visualization (Algorithm, Data Structure, or Sheet Problem) and upload standalone HTML animation to Cloudflare R2'}
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
                  {/* Pillar Selection Segment */}
                  <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                          Visualization Pillar
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Select which of the 3 DSA pillars this visualizer belongs to
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 uppercase tracking-wider border border-teal-500/20">
                        {visualizerForm.type === 'data-structure' ? 'Data Structure' : visualizerForm.type === 'problem' ? 'Sheet Problem' : 'Algorithm'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setVisualizerForm((c) => ({ ...c, type: 'algorithm' }))}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                          visualizerForm.type === 'algorithm'
                            ? 'border-teal-500 bg-teal-500/10 shadow-sm'
                            : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${visualizerForm.type === 'algorithm' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                          <Zap size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">1. Algorithm</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Sorting, Searching, Graphs, DP</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisualizerForm((c) => ({ ...c, type: 'data-structure' }))}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                          visualizerForm.type === 'data-structure'
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                            : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${visualizerForm.type === 'data-structure' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                          <Boxes size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">2. Data Structure</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">DS & all operations (Push, Pop, Insert...)</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisualizerForm((c) => ({ ...c, type: 'problem' }))}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                          visualizerForm.type === 'problem'
                            ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                            : 'border-slate-200/70 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10 bg-white dark:bg-white/[0.01]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${visualizerForm.type === 'problem' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                          <Lightbulb size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">3. Sheet Problem</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Solution animation for sheet problem</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* If Sheet Problem: Problem Picker (Searchable & Filterable) */}
                  {visualizerForm.type === 'problem' && (
                    <div className="rounded-2xl border border-teal-500/30 bg-teal-500/[0.03] dark:bg-teal-500/5 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-teal-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-teal-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                            Linked Sheet Problem
                          </h4>
                        </div>
                        <span className="text-[11px] text-teal-600/80 dark:text-teal-400/80">
                          Connects directly to sheet problem & solution page
                        </span>
                      </div>

                      {/* Case 1: A problem is currently selected and admin is not in 'changing' mode */}
                      {currentlyLinkedProblem && !isChangingProblem ? (
                        <div className="rounded-2xl border border-teal-500/30 bg-white dark:bg-[#121917] p-4 shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="shrink-0 font-mono text-xs font-extrabold rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-2.5 py-1.5 shadow-2xs">
                                #{currentlyLinkedProblem.id}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                    {currentlyLinkedProblem.topic}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      currentlyLinkedProblem.difficulty === 'Easy'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                        : currentlyLinkedProblem.difficulty === 'Medium'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                                    }`}
                                  >
                                    {currentlyLinkedProblem.difficulty}
                                  </span>
                                </div>
                                <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                  {currentlyLinkedProblem.title}
                                </h5>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setIsChangingProblem(true)}
                                className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 flex items-center gap-1.5 transition"
                              >
                                <Search size={13} />
                                <span>Change Problem</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectProblemForVisualizer('')}
                                className="rounded-xl border border-slate-200/80 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:hover:bg-rose-950/20 transition"
                                title="Unlink problem"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-teal-700/80 dark:text-teal-300/80 pt-2 border-t border-teal-500/15">
                            <span className="flex items-center gap-1">
                              <Check size={13} className="text-teal-500" />
                              Auto-populates title, slug, and topic from sheet
                            </span>
                            {currentlyLinkedProblem.link && (
                              <a
                                href={currentlyLinkedProblem.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:underline text-teal-600 dark:text-teal-400 font-medium"
                              >
                                <span>View Problem Link</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Case 2: Interactive Search & Filter Box to pick a problem */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                              Search & Select Problem from Sheet ({minimalProblems.length} available)
                            </label>
                            {currentlyLinkedProblem && (
                              <button
                                type="button"
                                onClick={() => setIsChangingProblem(false)}
                                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium"
                              >
                                Cancel (Keep #{currentlyLinkedProblem.id})
                              </button>
                            )}
                          </div>

                          {/* Search Input Bar */}
                          <div className="relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={problemPickerSearch}
                              onChange={(e) => setProblemPickerSearch(e.target.value)}
                              placeholder="Search by problem name (e.g. 2Sum, LRU, Search...) or #ID..."
                              autoFocus={isChangingProblem}
                              className="w-full rounded-xl border border-teal-500/40 bg-white dark:bg-[#101614] pl-9 pr-9 py-2 text-sm text-slate-900 dark:text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                            {problemPickerSearch && (
                              <button
                                type="button"
                                onClick={() => setProblemPickerSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Quick Filter Row: Topics Dropdown + Difficulty Pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Topic Select */}
                            <CustomSelect
                              size="sm"
                              value={problemPickerTopic}
                              onChange={setProblemPickerTopic}
                              options={[
                                {
                                  value: 'All',
                                  label: `All Topics (${minimalProblems.length})`,
                                },
                                ...minimalProblemTopics.map((top) => ({
                                  value: top,
                                  label: top,
                                  badge: `${topicProblemCounts[top] || 0}`,
                                  badgeColor: 'teal' as const,
                                })),
                              ]}
                              className="w-48 sm:w-56"
                            />

                            {/* Difficulty Pills */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                                <button
                                  key={diff}
                                  type="button"
                                  onClick={() => setProblemPickerDifficulty(diff)}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                    problemPickerDifficulty === diff
                                      ? 'bg-white dark:bg-teal-500 text-slate-900 dark:text-[#08241f] shadow-xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {diff}
                                </button>
                              ))}
                            </div>

                            <span className="text-[11px] text-slate-400 ml-auto font-medium">
                              Found {filteredMinimalProblems.length} problem{filteredMinimalProblems.length === 1 ? '' : 's'}
                            </span>
                          </div>

                          {/* Scrollable Results List */}
                          <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-2">
                            {filteredMinimalProblems.length > 0 ? (
                              filteredMinimalProblems.map((prob) => {
                                const isSelected = String(prob.id) === String(visualizerForm.problemId);
                                return (
                                  <button
                                    key={prob.id}
                                    type="button"
                                    onClick={() => handleSelectProblemForVisualizer(String(prob.id))}
                                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all ${
                                      isSelected
                                        ? 'bg-teal-500/15 border border-teal-500/40 text-teal-900 dark:text-teal-100 shadow-2xs'
                                        : 'bg-white dark:bg-[#121917] border border-slate-200/60 dark:border-white/5 hover:border-teal-500/40 hover:bg-teal-500/[0.04]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="shrink-0 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                        #{prob.id}
                                      </span>
                                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                        {prob.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                        {prob.topic}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                          prob.difficulty === 'Easy'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                            : prob.difficulty === 'Medium'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                                        }`}
                                      >
                                        {prob.difficulty}
                                      </span>
                                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md transition ${
                                        isSelected
                                          ? 'bg-teal-600 text-white'
                                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                      }`}>
                                        {isSelected ? 'Selected' : 'Link'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                                <p>No sheet problems found matching &quot;{problemPickerSearch}&quot;.</p>
                                {(problemPickerSearch || problemPickerTopic !== 'All' || problemPickerDifficulty !== 'All') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProblemPickerSearch('');
                                      setProblemPickerTopic('All');
                                      setProblemPickerDifficulty('All');
                                    }}
                                    className="button-secondary text-xs !py-1 !px-3 font-semibold"
                                  >
                                    Reset Filters
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Data Structure: Family and Operations Matrix */}
                  {visualizerForm.type === 'data-structure' && (
                    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Boxes size={16} className="text-indigo-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Data Structure Classification & Operations
                          </h4>
                        </div>
                        <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">Operations matrix for this DS</span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <CustomSelect
                            label="Data Structure Family"
                            value={visualizerForm.dataStructureType || 'Linear'}
                            onChange={(val) => setVisualizerForm((c) => ({ ...c, dataStructureType: val }))}
                            options={DATA_STRUCTURE_FAMILIES.map((family) => ({
                              value: family,
                              label: family,
                            }))}
                          />
                        </div>
                      </div>

                      {/* Operations Table / Editor */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            Supported Operations ({visualizerForm.operations?.length || 0})
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Actions users can visualize in your HTML animation
                          </span>
                        </div>

                        {/* Existing Operations List */}
                        {visualizerForm.operations && visualizerForm.operations.length > 0 ? (
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {visualizerForm.operations.map((op, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121917] text-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{op.name}</span>
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                      Time: {op.timeComplexity}
                                    </span>
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                      Space: {op.spaceComplexity || 'O(1)'}
                                    </span>
                                  </div>
                                  {op.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                      {op.description}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOperation(idx)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                                  title="Remove operation"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-400">
                            No operations configured yet. Add operations below to show in the complexity matrix.
                          </div>
                        )}

                        {/* Add Operation Form */}
                        <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] space-y-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                            + Add Operation
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={newOpName}
                              onChange={(e) => setNewOpName(e.target.value)}
                              placeholder="Operation (e.g. Insert, Pop)"
                              className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                            />
                            <input
                              type="text"
                              value={newOpTime}
                              onChange={(e) => setNewOpTime(e.target.value)}
                              placeholder="Time (e.g. O(1))"
                              className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                            />
                            <input
                              type="text"
                              value={newOpSpace}
                              onChange={(e) => setNewOpSpace(e.target.value)}
                              placeholder="Space (e.g. O(1))"
                              className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddOperation}
                              disabled={!newOpName.trim()}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Plus size={13} />
                              Add Op
                            </button>
                          </div>
                          <input
                            type="text"
                            value={newOpDesc}
                            onChange={(e) => setNewOpDesc(e.target.value)}
                            placeholder="Operation description (e.g. Inserts element at head or tail)"
                            className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600 dark:border-white/10 dark:bg-[#101614] dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 1: General Info */}
                  <div className="rounded-2xl border border-slate-200/80 p-5 dark:border-white/10 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {visualizerForm.type === 'data-structure' ? 'Data Structure Details' : visualizerForm.type === 'problem' ? 'Problem Solution Details' : '1. General Details'}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {visualizerForm.type === 'data-structure' ? 'Structure identity & naming' : visualizerForm.type === 'problem' ? 'Problem solution identity' : 'Primary algorithm identity'}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label={visualizerForm.type === 'data-structure' ? 'Data Structure Name' : visualizerForm.type === 'problem' ? 'Problem Solution Title' : 'Algorithm Name'}
                        value={visualizerForm.name}
                        onChange={(value) => setVisualizerForm((current) => ({ ...current, name: value }))}
                        placeholder={visualizerForm.type === 'data-structure' ? 'e.g. Singly Linked List' : visualizerForm.type === 'problem' ? 'e.g. Largest Element Solution' : 'e.g. Quick Sort'}
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
                          <CustomSelect
                            placeholder="— Select Category —"
                            value={visualizerForm.category}
                            onChange={(val) => {
                              if (val === '__NEW__') {
                                setIsCreatingNewCategory(true);
                              } else {
                                setVisualizerForm((current) => ({ ...current, category: val }));
                              }
                            }}
                            options={[
                              ...availableCategoryNames.map((cat) => ({
                                value: cat,
                                label: cat,
                              })),
                              {
                                value: '__NEW__',
                                label: '+ Create New Category...',
                                isAction: true,
                              },
                            ]}
                          />
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
              onClick={(e) => { if (e.target === e.currentTarget && !replaceFileModal.uploading) closeReplaceFileModal(); }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            >
              <div className="surface my-auto w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl border border-[var(--border-strong)] flex flex-col">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <UploadCloud size={18} className="text-teal-400" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Upload HTML: {replaceFileModal.visualizer.name}
                      </h3>
                      <p className="text-[11px] font-mono text-teal-400">
                        Target slug: {replaceFileModal.visualizer.slug}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeReplaceFileModal}
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
                      ref={replaceFileInputRef}
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
                      <div className="space-y-3">
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
                            onClick={() => {
                              if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
                              setReplaceFileModal((curr) => ({ ...curr, file: null }));
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1"
                            title="Remove file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-xs text-teal-300 text-left">
                          Ready to deploy <strong>{replaceFileModal.file.name}</strong> as the active animation for <strong>{replaceFileModal.visualizer.name}</strong>.
                        </div>
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
                    onClick={closeReplaceFileModal}
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
                    const cacheKey = visualizerPreviewModal.visualizer.updatedAt
                      ? new Date(visualizerPreviewModal.visualizer.updatedAt).getTime()
                      : (visualizerPreviewModal.visualizer.fileChecksum || Date.now());
                    const separator = rawRenderUrl.includes('?') ? '&' : '?';
                    const withCacheBuster = `${rawRenderUrl}${separator}v=${cacheKey}`;
                    const previewSrc = token ? `${withCacheBuster}&token=${encodeURIComponent(token)}` : withCacheBuster;

                    return (
                      <VisualizerFrame
                        key={`${visualizerPreviewModal.visualizer.slug}-${cacheKey}`}
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

const Input = ({
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

const TextArea = ({
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

const Select = CustomSelect;

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
