import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Boxes,
  FileCode,
  FolderTree,
  LayoutDashboard,
  RefreshCw,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import {
  defaultTopics,
  type TopicDefinition,
} from '../data/topics';
import {
  VISUALIZER_CATEGORIES,
  type VisualizerAlgorithm,
  type VisualizerType,
} from '../data/visualizers';
import { getStoredToken } from '../utils/auth';
import { getCanonicalTopicSlug } from '../utils/topics';
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
import { AdminTopicsTab, type TopicFormState } from './admin/AdminTopicsTab';
import { AdminProblemsTab, type AdminProblem, type ProblemFormState } from './admin/AdminProblemsTab';
import { AdminPOTDTab } from './admin/AdminPOTDTab';
import { AdminLeaderboardTab, type LeaderboardConfigState } from './admin/AdminLeaderboardTab';
import { AdminVisualizersTab } from './admin/AdminVisualizersTab';

import { ProblemSolutionModal } from './admin/modals/ProblemSolutionModal';
import { VisualizerSettingsModal, type VisualizerFormState } from './admin/modals/VisualizerSettingsModal';
import { VisualizerCodeModal } from './admin/modals/VisualizerCodeModal';
import { VisualizerReplaceModal } from './admin/modals/VisualizerReplaceModal';
import { VisualizerPreviewModal } from './admin/modals/VisualizerPreviewModal';
import { CategoryManagerModal } from './admin/modals/CategoryManagerModal';

type AdminTab = 'overview' | 'topics' | 'problems' | 'visualizers' | 'users' | 'potd' | 'leaderboard' | 'audit';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pages: number;
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
  rowsPerPage: 20,
  defaultPeriod: 'all',
  showZeroSolves: false,
  tieBreaker: 'earliest_solve',
  cacheDurationSeconds: 30,
};

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [topics, setTopics] = useState<TopicDefinition[]>([]);
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [visualizers, setVisualizers] = useState<VisualizerAlgorithm[]>([]);
  const [categories, setCategories] = useState<VisualizerCategoryItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Filtering states
  const [topicSearch, setTopicSearch] = useState('');
  const [topicStatusFilter, setTopicStatusFilter] = useState('all');
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState('all');
  const [problemStatusFilter, setProblemStatusFilter] = useState('all');
  const [problemTopicFilter, setProblemTopicFilter] = useState('all');
  const [problemPageSize, setProblemPageSize] = useState<number | 'all'>(20);

  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [visualizerPillarFilter, setVisualizerPillarFilter] = useState<'all' | 'algorithm' | 'data-structure' | 'problem'>('all');
  const [visualizerCategoryFilter, setVisualizerCategoryFilter] = useState('All');
  const [visualizerStatusFilter, setVisualizerStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userPageSize, setUserPageSize] = useState<number | 'all'>(10);
  const [auditSearch, setAuditSearch] = useState('');

  // Reordering states
  const [isReorderingTopics, setIsReorderingTopics] = useState(false);
  const [isReorderingProblems, setIsReorderingProblems] = useState(false);

  // Paginations
  const [topicsPagination, setTopicsPagination] = useState<PaginationData>({ page: 1, limit: 100, total: 0, totalPages: 1, pages: 1 });
  const [problemsPagination, setProblemsPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 1, pages: 1 });
  const [visualizersPagination, setVisualizersPagination] = useState<PaginationData>({ page: 1, limit: 100, total: 0, totalPages: 1, pages: 1 });
  const [usersPagination, setUsersPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, totalPages: 1, pages: 1 });
  const [auditPagination, setAuditPagination] = useState<PaginationData>({ page: 1, limit: 15, total: 0, totalPages: 1, pages: 1 });

  // Form states
  const [topicForm, setTopicForm] = useState<TopicFormState>({
    name: '',
    slug: '',
    description: '',
    difficulty: 'Medium',
    iconKey: 'book-open',
    order: '0',
    isActive: true,
  });
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const [problemForm, setProblemForm] = useState<ProblemFormState>({
    problemNumber: '',
    title: '',
    link: '',
    difficulty: 'Medium',
    topic: defaultTopics[0]?.name || '',
    tutorialLink: '',
    githubLink: '',
    videoSolutionUrl: '',
    approaches: [],
    visualizerSlug: '',
  });
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);

  // POTD states
  const [selectedPotdProblemId, setSelectedPotdProblemId] = useState('');
  const [potdScheduledDate, setPotdScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [potdCustomDescription, setPotdCustomDescription] = useState('');
  const [potdCustomEstimatedTime, setPotdCustomEstimatedTime] = useState('');
  const [potdCustomFocusArea, setPotdCustomFocusArea] = useState('');

  // Leaderboard states
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfigState>(defaultLeaderboardConfig);
  const [savingLeaderboard, setSavingLeaderboard] = useState(false);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);
  const [leaderboardLastCache, setLeaderboardLastCache] = useState<string | null>(null);
  const [leaderboardSummary, setLeaderboardSummary] = useState<{ totalLearners: number; totalSolved: number; topStreak: number; lastUpdated?: string } | null>(null);

  // Visualizer states & modals
  const [visualizerForm, setVisualizerForm] = useState<VisualizerFormState>(defaultVisualizerForm);
  const [editingVisualizerId, setEditingVisualizerId] = useState<string | null>(null);
  const [isVisualizerSettingsModalOpen, setIsVisualizerSettingsModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

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

  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerInput, setCategoryManagerInput] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Cloudflare R2 Persistent Storage
  const [r2Status, setR2Status] = useState<R2StatusResponse | null>(null);
  const [r2Loading, setR2Loading] = useState(false);

  const refreshR2Status = useCallback(async () => {
    setR2Loading(true);
    try {
      const status = await checkR2Status();
      setR2Status(status);
    } catch {
      setR2Status({ configured: false, status: 'error', message: 'Failed to contact R2 health check API' });
    } finally {
      setR2Loading(false);
    }
  }, []);

  const resetTopicForm = () => {
    setTopicForm({
      name: '',
      slug: '',
      description: '',
      difficulty: 'Medium',
      iconKey: 'book-open',
      order: '0',
      isActive: true,
    });
    setEditingTopicId(null);
  };

  const resetProblemForm = () => {
    setProblemForm({
      problemNumber: '',
      title: '',
      link: '',
      difficulty: 'Medium',
      topic: topics[0]?.name || defaultTopics[0]?.name || '',
      tutorialLink: '',
      githubLink: '',
      videoSolutionUrl: '',
      approaches: [],
      visualizerSlug: '',
    });
    setEditingProblemId(null);
  };

  const resetVisualizerForm = () => {
    setVisualizerForm(defaultVisualizerForm);
    setEditingVisualizerId(null);
    setSelectedUploadFile(null);
  };

  const withNotice = (message: string | null) => {
    setNotice(message);
    if (message) setTimeout(() => setNotice(null), 4000);
  };

  const makeQuery = (entries: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(entries).forEach(([key, value]) => {
      if (value !== undefined && String(value).trim() !== '') {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const getAuthHeaders = useCallback((extra: Record<string, string> = {}): Record<string, string> => {
    const token = getStoredToken() || '';
    return {
      'x-auth-token': token,
      Authorization: `Bearer ${token}`,
      ...extra,
    };
  }, []);

  const loadAdminData = useCallback(async (isRefresh = false) => {
    const token = getStoredToken();
    if (!token) {
      setError('No authentication token found. Please sign in to access the administration panel.');
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      const getJson = async (url: string) => {
        const res = await fetch(apiUrl(url), { headers });
        if (!res.ok) {
          let errorText = `HTTP ${res.status} from ${url}`;
          try {
            const body = await res.json();
            if (body?.msg || body?.message || body?.error) {
              errorText = `${body.msg || body.message || body.error} (${res.status})`;
            }
          } catch {}
          throw new Error(errorText);
        }
        return res.json();
      };

      const topicsQuery = makeQuery({
        page: topicsPagination.page,
        limit: topicsPagination.limit,
        query: topicSearch,
        status: topicStatusFilter !== 'all' ? topicStatusFilter : undefined,
      });
      const problemsQuery = makeQuery({
        page: 1,
        limit: 5000,
        status: 'all',
      });
      const visualizersQuery = makeQuery({
        page: visualizersPagination.page,
        limit: visualizersPagination.limit,
        query: visualizerSearch,
        category: visualizerCategoryFilter !== 'All' ? visualizerCategoryFilter : undefined,
        status: visualizerStatusFilter !== 'all' ? visualizerStatusFilter : undefined,
        type: visualizerPillarFilter !== 'all' ? visualizerPillarFilter : undefined,
      });
      const usersQuery = makeQuery({
        page: usersPagination.page,
        limit: usersPagination.limit,
        query: userSearch,
        role: userRoleFilter && userRoleFilter !== 'all' ? userRoleFilter : undefined,
        status: userStatusFilter && userStatusFilter !== 'all' ? userStatusFilter : undefined,
      });
      const auditQuery = makeQuery({
        page: auditPagination.page,
        limit: auditPagination.limit,
        query: auditSearch,
      });

      const [overviewData, topicsData, problemsData, visualizersData, usersData, auditData] = await Promise.all([
        getJson('/api/admin/overview'),
        getJson(`/api/admin/topics${topicsQuery}`),
        getJson(`/api/admin/problems${problemsQuery}`),
        getJson(`/api/admin/visualizers${visualizersQuery}`),
        getJson(`/api/admin/users${usersQuery}`),
        getJson(`/api/admin/audit-logs${auditQuery}`),
      ]);

      setOverview(overviewData);
      setTopics(topicsData?.items || (Array.isArray(topicsData) ? topicsData : []));
      const topicTotal = Number(topicsData?.pagination?.total ?? topicsData?.total ?? 0);
      const topicPages = Math.max(Number(topicsData?.pagination?.pages ?? topicsData?.totalPages ?? 1), 1);
      setTopicsPagination((p) => ({
        ...p,
        total: topicTotal,
        totalPages: topicPages,
        pages: topicPages,
      }));

      setProblems(problemsData?.items || (Array.isArray(problemsData) ? problemsData : []));
      const problemTotal = Number(problemsData?.pagination?.total ?? problemsData?.total ?? 0);
      const problemPages = Math.max(Number(problemsData?.pagination?.pages ?? problemsData?.totalPages ?? 1), 1);
      setProblemsPagination((p) => ({
        ...p,
        total: problemTotal,
        totalPages: problemPages,
        pages: problemPages,
      }));

      setVisualizers(visualizersData?.items || (Array.isArray(visualizersData) ? visualizersData : []));
      const visTotal = Number(visualizersData?.pagination?.total ?? visualizersData?.total ?? 0);
      const visPages = Math.max(Number(visualizersData?.pagination?.pages ?? visualizersData?.totalPages ?? 1), 1);
      setVisualizersPagination((p) => ({
        ...p,
        total: visTotal,
        totalPages: visPages,
        pages: visPages,
      }));

      setUsers(usersData?.items || (Array.isArray(usersData) ? usersData : []));
      const userTotal = Number(usersData?.pagination?.total ?? usersData?.total ?? 0);
      const userPages = Math.max(Number(usersData?.pagination?.pages ?? usersData?.totalPages ?? 1), 1);
      setUsersPagination((p) => ({
        ...p,
        total: userTotal,
        totalPages: userPages,
        pages: userPages,
      }));

      setAuditLogs(auditData?.items || (Array.isArray(auditData) ? auditData : []));
      const auditTotal = Number(auditData?.pagination?.total ?? auditData?.total ?? 0);
      const auditPages = Math.max(Number(auditData?.pagination?.pages ?? auditData?.totalPages ?? 1), 1);
      setAuditPagination((p) => ({
        ...p,
        total: auditTotal,
        totalPages: auditPages,
        pages: auditPages,
      }));

      if (overviewData?.potd?.problemId) {
        setSelectedPotdProblemId(String(overviewData.potd.problemId));
        if (overviewData.potd.date) setPotdScheduledDate(overviewData.potd.date);
        setPotdCustomDescription(overviewData.potd.customDescription || '');
        setPotdCustomEstimatedTime(overviewData.potd.customEstimatedTime || '');
        setPotdCustomFocusArea(overviewData.potd.customFocusArea || '');
      }

      // Fetch dynamic categories
      try {
        const catRes = await getJson('/api/visualizers/categories');
        setCategories(catRes.categories || []);
      } catch {
        // Fallback
      }

      // Fetch leaderboard config and live metrics
      try {
        const lbRes = await getJson('/api/admin/leaderboard/settings');
        if (lbRes) {
          const cfg = lbRes.settings || lbRes;
          setLeaderboardConfig({
            ...defaultLeaderboardConfig,
            ...cfg,
          });
          if (lbRes.lastCacheTime || lbRes.lastCacheInvalidation) {
            setLeaderboardLastCache(lbRes.lastCacheTime || lbRes.lastCacheInvalidation);
          }
          if (lbRes.summary) {
            setLeaderboardSummary(lbRes.summary);
          }
        }
      } catch (err) {
        console.warn('Leaderboard settings fetch error:', err);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    topicSearch,
    topicStatusFilter,
    problemSearch,
    problemDifficultyFilter,
    problemTopicFilter,
    problemStatusFilter,
    problemPageSize,
    visualizerSearch,
    visualizerCategoryFilter,
    visualizerStatusFilter,
    visualizerPillarFilter,
    userSearch,
    userRoleFilter,
    userStatusFilter,
    auditSearch,
    topicsPagination.page,
    topicsPagination.limit,
    problemsPagination.page,
    problemsPagination.limit,
    visualizersPagination.page,
    visualizersPagination.limit,
    usersPagination.page,
    usersPagination.limit,
    auditPagination.page,
    auditPagination.limit,
  ]);

  useEffect(() => {
    loadAdminData();
    refreshR2Status();
  }, []);

  // Filtered in-memory derivations
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (!t) return false;
      if (topicStatusFilter === 'featured' && !t.isFeatured) return false;
      if (topicSearch && topicSearch.trim()) {
        const q = topicSearch.toLowerCase();
        if (!(t.name || '').toLowerCase().includes(q) && !(t.description || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [topics, topicSearch, topicStatusFilter]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (!p) return false;
      if (
        problemDifficultyFilter &&
        problemDifficultyFilter !== 'all' &&
        p.difficulty?.toLowerCase() !== problemDifficultyFilter.toLowerCase()
      ) {
        return false;
      }
      if (problemStatusFilter && problemStatusFilter !== 'all') {
        if (problemStatusFilter === 'deleted' && !p.isDeleted) return false;
        if (problemStatusFilter === 'live' && p.isDeleted) return false;
      }
      if (problemTopicFilter && problemTopicFilter !== 'all') {
        const top = (p.topic || '').toLowerCase().trim();
        const filt = problemTopicFilter.toLowerCase().trim();
        const canonP = getCanonicalTopicSlug(top);
        const canonF = getCanonicalTopicSlug(filt);
        const match =
          (canonP && canonF && canonP === canonF) ||
          top === filt ||
          top.replace(/\s+/g, '-') === filt.replace(/\s+/g, '-') ||
          top.includes(filt) ||
          filt.includes(top);
        if (!match) return false;
      }
      if (problemSearch && problemSearch.trim()) {
        const q = problemSearch.toLowerCase().trim();
        const title = (p.title || '').toLowerCase();
        const num = String(p.problemNumber || p.id || '');
        if (!title.includes(q) && !num.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [problems, problemDifficultyFilter, problemTopicFilter, problemStatusFilter, problemSearch]);

  const availableCategoryNames = useMemo(() => {
    const list = [...VISUALIZER_CATEGORIES];
    categories.forEach((cat) => {
      if (!list.includes(cat.name as any)) list.push(cat.name as any);
    });
    return list;
  }, [categories]);

  const pillarCategoryNames = useMemo(() => {
    if (visualizerPillarFilter === 'algorithm') {
      const dynamicCats = categories.filter((c) => !c.pillar || c.pillar === 'algorithm').map((c) => c.name);
      return Array.from(new Set([...VISUALIZER_CATEGORIES, ...dynamicCats]));
    }
    if (visualizerPillarFilter === 'data-structure') {
      const dynamicFamilies = categories.filter((c) => c.pillar === 'data-structure').map((c) => c.name);
      const builtInFamilies = ['Linear', 'Trees & Hierarchical', 'Hash & Key-Value', 'Graphs & Networks'];
      return Array.from(new Set([...builtInFamilies, ...dynamicFamilies]));
    }
    if (visualizerPillarFilter === 'problem') {
      const problemTopics = Array.from(
        new Set(
          visualizers
            .filter((v) => v.type === 'problem' && (v.problemTopic || v.category))
            .map((v) => v.problemTopic || v.category)
        )
      ).sort();
      return problemTopics.length > 0 ? problemTopics : ['Array', 'Two Pointers', 'Binary Search', 'Dynamic Programming', 'Graph'];
    }
    return availableCategoryNames;
  }, [visualizerPillarFilter, categories, visualizers, availableCategoryNames]);

  const filteredVisualizers = useMemo(() => {
    return visualizers.filter((vis) => {
      const visType = vis.type || 'algorithm';
      if (visualizerPillarFilter !== 'all' && visType !== visualizerPillarFilter) return false;
      if (visualizerCategoryFilter !== 'All') {
        if (visType === 'data-structure') {
          if (vis.dataStructureType !== visualizerCategoryFilter) return false;
        } else if (visType === 'problem') {
          if ((vis.problemTopic || vis.category) !== visualizerCategoryFilter) return false;
        } else {
          if (vis.category !== visualizerCategoryFilter) return false;
        }
      }
      if (visualizerStatusFilter !== 'all') {
        if (visualizerStatusFilter === 'available' && vis.status !== 'available') return false;
        if (visualizerStatusFilter === 'unavailable' && vis.status === 'available') return false;
      }
      if (visualizerSearch.trim()) {
        const q = visualizerSearch.toLowerCase();
        const matchesName = vis.name.toLowerCase().includes(q);
        const matchesSlug = vis.slug.toLowerCase().includes(q);
        const matchesCategory = (vis.category || '').toLowerCase().includes(q);
        const matchesTopic = (vis.problemTopic || '').toLowerCase().includes(q);
        const matchesTags = (vis.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSlug && !matchesCategory && !matchesTopic && !matchesTags) return false;
      }
      return true;
    });
  }, [visualizers, visualizerPillarFilter, visualizerCategoryFilter, visualizerStatusFilter, visualizerSearch]);

  const visualizerStats = useMemo(() => {
    return {
      live: visualizers.filter((v) => v.status === 'available').length,
      awaiting: visualizers.filter((v) => v.status !== 'available').length,
    };
  }, [visualizers]);

  const algorithmVisualizers = useMemo(() => {
    return filteredVisualizers.filter((v) => !v.type || v.type === 'algorithm');
  }, [filteredVisualizers]);

  const dataStructureVisualizers = useMemo(() => {
    return filteredVisualizers.filter((v) => v.type === 'data-structure');
  }, [filteredVisualizers]);

  const problemVisualizers = useMemo(() => {
    return filteredVisualizers.filter((v) => v.type === 'problem');
  }, [filteredVisualizers]);

  const groupedAlgorithms = useMemo(() => {
    const groups = new Map<string, VisualizerAlgorithm[]>();
    algorithmVisualizers.forEach((v) => {
      const cat = v.category || 'Other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(v);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [algorithmVisualizers]);

  const groupedDataStructures = useMemo(() => {
    const groups = new Map<string, VisualizerAlgorithm[]>();
    dataStructureVisualizers.forEach((v) => {
      const fam = v.dataStructureType || 'Linear';
      if (!groups.has(fam)) groups.set(fam, []);
      groups.get(fam)!.push(v);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [dataStructureVisualizers]);

  const groupedProblems = useMemo(() => {
    const groups = new Map<string, VisualizerAlgorithm[]>();
    problemVisualizers.forEach((v) => {
      const top = v.problemTopic || v.category || 'General';
      if (!groups.has(top)) groups.set(top, []);
      groups.get(top)!.push(v);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [problemVisualizers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter && userRoleFilter !== 'all' && u.role?.toLowerCase() !== userRoleFilter.toLowerCase()) {
        return false;
      }
      if (userStatusFilter === 'active' && u.isActive === false) return false;
      if (userStatusFilter === 'disabled' && u.isActive !== false) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase().trim();
        const username = (u.username || u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (!username.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [users, userRoleFilter, userStatusFilter, userSearch]);

  const potdProblemOptions = useMemo(() => {
    return problems.map((p) => ({
      value: String(p.id),
      label: `#${p.problemNumber || p.id} ${p.title} (${p.difficulty}) - ${p.topic}`,
      hint: p.topic,
    }));
  }, [problems]);

  const selectedPotdProblem = useMemo(() => {
    return problems.find((p) => String(p.id) === String(selectedPotdProblemId));
  }, [problems, selectedPotdProblemId]);

  // Topic CRUD
  const saveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    setSaving(true);
    try {
      const method = editingTopicId ? 'PUT' : 'POST';
      const url = editingTopicId ? `/api/admin/topics/${editingTopicId}` : '/api/admin/topics';

      const res = await fetch(apiUrl(url), {
        method,
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...topicForm, order: Number(topicForm.order) || 0 }),
      });
      if (!res.ok) throw new Error(await res.text());

      withNotice(editingTopicId ? 'Topic updated successfully!' : 'Topic added successfully!');
      resetTopicForm();
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic? Associated problems will remain intact.')) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/topics/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Topic archived/deleted.');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete topic.');
    }
  };

  const restoreTopic = async (id: string) => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/topics/${id}/restore`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Topic restored.');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to restore topic.');
    }
  };

  const moveTopic = (id: string, direction: 'up' | 'down') => {
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const list = [...topics];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setTopics(list);
  };

  const saveTopicOrder = async () => {
    const token = getStoredToken();
    if (!token) return;
    setSaving(true);
    try {
      const orders = topics.map((t, idx) => ({ id: t.id, order: idx + 1 }));
      const res = await fetch(apiUrl('/api/admin/topics/reorder'), {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Topic order saved!');
      setIsReorderingTopics(false);
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder topics.');
    } finally {
      setSaving(false);
    }
  };

  // Problem CRUD
  const saveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    setSaving(true);
    try {
      const method = editingProblemId ? 'PUT' : 'POST';
      const url = editingProblemId ? `/api/admin/problems/${editingProblemId}` : '/api/admin/problems';

      const payload = {
        ...problemForm,
        problemNumber: problemForm.problemNumber ? Number(problemForm.problemNumber) : undefined,
        visualizerSlug: problemForm.visualizerSlug || undefined,
        hasVisualizer: Boolean(problemForm.visualizerSlug),
      };

      const res = await fetch(apiUrl(url), {
        method,
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      withNotice(editingProblemId ? 'Problem updated successfully!' : 'Problem added successfully!');
      resetProblemForm();
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save problem.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/problems/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Problem archived/deleted.');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete problem.');
    }
  };

  const restoreProblem = async (id: string) => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/problems/${id}/restore`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Problem restored.');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to restore problem.');
    }
  };

  const moveProblem = (id: string, direction: 'up' | 'down') => {
    const index = problems.findIndex((p) => p.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= problems.length) return;

    const list = [...problems];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setProblems(list);
  };

  const saveProblemOrder = async () => {
    const token = getStoredToken();
    if (!token) return;
    setSaving(true);
    try {
      const orders = problems.map((p, idx) => ({ id: p.id, order: idx + 1 }));
      const res = await fetch(apiUrl('/api/admin/problems/reorder'), {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Problem order saved!');
      setIsReorderingProblems(false);
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder problems.');
    } finally {
      setSaving(false);
    }
  };

  // POTD assignment
  const assignPotd = async () => {
    if (!selectedPotdProblemId) return;
    const token = getStoredToken();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/potd'), {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          problemId: Number(selectedPotdProblemId),
          scheduledDate: potdScheduledDate,
          customDescription: potdCustomDescription || undefined,
          customEstimatedTime: potdCustomEstimatedTime || undefined,
          customFocusArea: potdCustomFocusArea || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Problem of the Day assigned successfully!');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to assign POTD.');
    } finally {
      setSaving(false);
    }
  };

  // Leaderboard config & cache
  const saveLeaderboardSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    setSavingLeaderboard(true);
    try {
      const res = await fetch(apiUrl('/api/admin/leaderboard/settings'), {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(leaderboardConfig),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Leaderboard configuration updated!');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save leaderboard configuration.');
    } finally {
      setSavingLeaderboard(false);
    }
  };

  const handleRefreshLeaderboardCache = async () => {
    const token = getStoredToken();
    if (!token) return;

    setRefreshingLeaderboard(true);
    try {
      const res = await fetch(apiUrl('/api/admin/leaderboard/refresh'), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      setLeaderboardLastCache(new Date().toISOString());
      withNotice('Leaderboard cache recalculated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to refresh leaderboard cache.');
    } finally {
      setRefreshingLeaderboard(false);
    }
  };

  // User access
  const updateUserAccess = async (
    user: any,
    nextRole: 'user' | 'moderator' | 'content_manager' | 'admin',
    nextActive: boolean
  ) => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/users/${user.id || user._id}`), {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role: nextRole, isActive: nextActive }),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice(`User access updated for ${user.username || user.email}.`);
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update user access.');
    }
  };

  // Visualizer actions
  const openVisualizerSettings = (vis: VisualizerAlgorithm) => {
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
    setIsVisualizerSettingsModalOpen(true);
  };

  const openCreateVisualizer = (pillar?: VisualizerType) => {
    resetVisualizerForm();
    const targetType = pillar || (visualizerPillarFilter !== 'all' ? visualizerPillarFilter : 'algorithm');
    setVisualizerForm((prev) => ({ ...prev, type: targetType }));
    setIsVisualizerSettingsModalOpen(true);
  };

  const saveVisualizer = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', visualizerForm.name.trim());
      formData.append('slug', visualizerForm.slug.trim());
      formData.append('type', visualizerForm.type);
      formData.append('dataStructureType', visualizerForm.dataStructureType);
      formData.append('operations', JSON.stringify(visualizerForm.operations || []));
      formData.append('problemId', visualizerForm.problemId || '');
      formData.append('category', visualizerForm.category);
      formData.append('difficulty', visualizerForm.difficulty);
      formData.append('description', visualizerForm.description.trim());
      formData.append('timeBest', visualizerForm.timeBest.trim());
      formData.append('timeAverage', visualizerForm.timeAverage.trim());
      formData.append('timeWorst', visualizerForm.timeWorst.trim());
      formData.append('spaceComplexity', visualizerForm.spaceComplexity.trim());
      formData.append('tags', visualizerForm.tags);
      formData.append('keyConcepts', visualizerForm.keyConcepts);
      formData.append('status', visualizerForm.status);
      formData.append('order', visualizerForm.order);

      if (selectedUploadFile) {
        formData.append('file', selectedUploadFile);
      }

      const method = editingVisualizerId ? 'PUT' : 'POST';
      const url = editingVisualizerId
        ? `/api/admin/visualizers/${editingVisualizerId}`
        : '/api/admin/visualizers';

      const res = await fetch(apiUrl(url), {
        method,
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());

      withNotice(editingVisualizerId ? 'Visualizer updated!' : 'Visualizer created!');
      setIsVisualizerSettingsModalOpen(false);
      resetVisualizerForm();
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save visualizer.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisualizerStatus = async (id: string, currentStatus: string) => {
    const token = getStoredToken();
    if (!token) return;

    const nextStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    try {
      const res = await fetch(apiUrl(`/api/admin/visualizers/${id}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice(`Visualizer marked as ${nextStatus === 'available' ? 'Live' : 'Awaiting Code'}.`);
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update visualizer status.');
    }
  };

  const deleteVisualizer = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this visualizer?')) return;
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/visualizers/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      withNotice('Visualizer deleted.');
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete visualizer.');
    }
  };

  const openCodeModal = async (vis: VisualizerAlgorithm) => {
    setVisualizerCodeModal({
      isOpen: true,
      visualizer: vis,
      code: 'Loading code...',
      filePath: vis.r2Key || vis.htmlPath || `${vis.slug}.html`,
      saving: false,
      copied: false,
    });

    try {
      const res = await fetch(apiUrl(`/api/admin/visualizers/${vis.id}/code`), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load code from server');
      const data = await res.json();
      setVisualizerCodeModal((prev) => ({
        ...prev,
        code: data.code || '',
        filePath: data.filePath || prev.filePath,
      }));
    } catch (err: any) {
      setVisualizerCodeModal((prev) => ({
        ...prev,
        code: `<!-- Failed to load code: ${err.message} -->`,
      }));
    }
  };

  const saveVisualizerCode = async () => {
    const token = getStoredToken();
    if (!token || !visualizerCodeModal.visualizer) return;

    setVisualizerCodeModal((p) => ({ ...p, saving: true }));
    try {
      const res = await fetch(
        apiUrl(`/api/admin/visualizers/${visualizerCodeModal.visualizer.id}/code`),
        {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ code: visualizerCodeModal.code }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      withNotice('HTML code updated and deployed!');
      setVisualizerCodeModal((p) => ({ ...p, isOpen: false }));
      loadAdminData(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save code.');
    } finally {
      setVisualizerCodeModal((p) => ({ ...p, saving: false }));
    }
  };

  const handleExecuteFileReplace = async () => {
    if (!replaceFileModal.visualizer || !replaceFileModal.file) return;

    setReplaceFileModal((curr) => ({ ...curr, uploading: true, error: null }));
    try {
      await replaceAdminVisualizerFile(replaceFileModal.visualizer.id, replaceFileModal.file);
      withNotice(`File "${replaceFileModal.file.name}" uploaded successfully!`);
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
        error: err.message || 'File replacement failed',
      }));
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
      withNotice(`Category "${trimmed}" added.`);
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategoryInManager = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteAdminVisualizerCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      withNotice(`Category "${name}" removed.`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  // Cross-component shortcuts
  const onOpenCreateVisualizerForProblem = (prob: { id: number; title: string; topic: string; difficulty: string }) => {
    resetVisualizerForm();
    const slugName = prob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const derivedSlug = `problem-${prob.id}-${slugName}`;
    setVisualizerForm((prev) => ({
      ...prev,
      type: 'problem',
      problemId: String(prob.id),
      name: `${prob.title} Visualization`,
      slug: derivedSlug,
      category: prob.topic,
      difficulty: (prob.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      description: `Interactive step-by-step visual solution for sheet problem #${prob.id}: ${prob.title}.`,
    }));
    setIsVisualizerSettingsModalOpen(true);
  };

  const onPreviewVisualizer = (slug: string) => {
    const vis = visualizers.find((v) => v.slug === slug);
    if (vis) {
      setVisualizerPreviewModal({ isOpen: true, visualizer: vis });
    } else {
      setError(`Visualizer "${slug}" not found in current catalog.`);
    }
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'topics', label: 'Topics', icon: <FolderTree size={16} />, badge: topicsPagination.total || topics.length },
    { id: 'problems', label: 'Sheet Problems', icon: <FileCode size={16} />, badge: problemsPagination.total || problems.length },
    { id: 'visualizers', label: 'Visualizers', icon: <Boxes size={16} />, badge: visualizersPagination.total || visualizers.length },
    { id: 'users', label: 'Users & Access', icon: <Users size={16} />, badge: usersPagination.total || users.length },
    { id: 'potd', label: 'POTD Control', icon: <Sparkles size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    { id: 'audit', label: 'Audit Log', icon: <Shield size={16} /> },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      <AnimatedBackground />

      <main className="relative z-10 mx-auto max-w-[1720px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-300">
              <Wrench size={12} />
              <span>Administration &amp; Content Management</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Platform Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage sheet problems, topics, interactive visualizers, daily challenge, leaderboard rules, and platform access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAdminData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101614] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition shadow-sm disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Global Notices / Alerts */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)} className="rounded-lg p-1 hover:bg-rose-500/20">
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="shrink-0" />
              <span>{notice}</span>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="rounded-lg p-1 hover:bg-emerald-500/20">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-slate-200/80 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#123b36] text-white shadow-sm dark:bg-teal-400 dark:text-[#08241f]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#08241f]'
                      : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Tab View */}
        {loading && !refreshing ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw size={28} className="animate-spin text-teal-500 mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Control Center data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverviewTab overview={overview} onNavigateToPOTD={() => setActiveTab('potd')} />
            )}

        {activeTab === 'topics' && (
          <AdminTopicsTab
            topics={topics}
            filteredTopics={filteredTopics}
            topicForm={topicForm}
            setTopicForm={setTopicForm}
            editingTopicId={editingTopicId}
            setEditingTopicId={setEditingTopicId}
            resetTopicForm={resetTopicForm}
            saveTopic={saveTopic}
            saving={saving}
            topicSearch={topicSearch}
            setTopicSearch={setTopicSearch}
            topicStatusFilter={topicStatusFilter}
            setTopicStatusFilter={setTopicStatusFilter}
            isReorderingTopics={isReorderingTopics}
            setIsReorderingTopics={setIsReorderingTopics}
            saveTopicOrder={saveTopicOrder}
            loadAdminData={loadAdminData}
            moveTopic={moveTopic}
            deleteTopic={deleteTopic}
            restoreTopic={restoreTopic}
            topicsPagination={topicsPagination}
            setTopicsPagination={setTopicsPagination}
            onSelectTopicForProblems={(slug) => {
              setProblemTopicFilter(slug);
              setActiveTab('problems');
            }}
          />
        )}

        {activeTab === 'problems' && (
          <AdminProblemsTab
            problems={problems}
            filteredProblems={filteredProblems}
            topics={topics}
            visualizers={visualizers}
            problemForm={problemForm}
            setProblemForm={setProblemForm}
            editingProblemId={editingProblemId}
            setEditingProblemId={setEditingProblemId}
            resetProblemForm={resetProblemForm}
            saveProblem={saveProblem}
            saving={saving}
            setIsSolutionModalOpen={setIsSolutionModalOpen}
            problemSearch={problemSearch}
            setProblemSearch={setProblemSearch}
            problemDifficultyFilter={problemDifficultyFilter}
            setProblemDifficultyFilter={setProblemDifficultyFilter}
            problemStatusFilter={problemStatusFilter}
            setProblemStatusFilter={setProblemStatusFilter}
            problemTopicFilter={problemTopicFilter}
            setProblemTopicFilter={setProblemTopicFilter}
            problemPageSize={problemPageSize}
            setProblemPageSize={setProblemPageSize}
            problemsPagination={problemsPagination}
            setProblemsPagination={setProblemsPagination}
            isReorderingProblems={isReorderingProblems}
            setIsReorderingProblems={setIsReorderingProblems}
            saveProblemOrder={saveProblemOrder}
            moveProblem={moveProblem}
            deleteProblem={deleteProblem}
            restoreProblem={restoreProblem}
            refreshing={refreshing}
            loadAdminData={loadAdminData}
            onOpenCreateVisualizerForProblem={onOpenCreateVisualizerForProblem}
            onPreviewVisualizer={onPreviewVisualizer}
          />
        )}

        {activeTab === 'visualizers' && (
          <AdminVisualizersTab
            r2Status={r2Status}
            r2Loading={r2Loading}
            refreshR2Status={refreshR2Status}
            visualizers={visualizers}
            filteredVisualizers={filteredVisualizers}
            visualizerSearch={visualizerSearch}
            setVisualizerSearch={setVisualizerSearch}
            setIsCategoryManagerOpen={setIsCategoryManagerOpen}
            openCreateVisualizer={openCreateVisualizer}
            visualizerPillarFilter={visualizerPillarFilter}
            setVisualizerPillarFilter={setVisualizerPillarFilter}
            visualizerCategoryFilter={visualizerCategoryFilter}
            setVisualizerCategoryFilter={setVisualizerCategoryFilter}
            availableCategoryNames={availableCategoryNames}
            pillarCategoryNames={pillarCategoryNames}
            visualizerStats={visualizerStats}
            visualizerStatusFilter={visualizerStatusFilter}
            setVisualizerStatusFilter={setVisualizerStatusFilter}
            algorithmVisualizers={algorithmVisualizers}
            dataStructureVisualizers={dataStructureVisualizers}
            problemVisualizers={problemVisualizers}
            groupedAlgorithms={groupedAlgorithms}
            groupedDataStructures={groupedDataStructures}
            groupedProblems={groupedProblems}
            onOpenReplaceFile={(vis) =>
              setReplaceFileModal({
                isOpen: true,
                visualizer: vis,
                file: null,
                uploading: false,
                error: null,
              })
            }
            onOpenPreview={(vis) => setVisualizerPreviewModal({ isOpen: true, visualizer: vis })}
            onOpenSettings={openVisualizerSettings}
            onOpenCode={openCodeModal}
            onToggleStatus={toggleVisualizerStatus}
            onDelete={deleteVisualizer}
          />
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
            userPageSize={userPageSize}
            setUserPageSize={setUserPageSize}
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
          <AdminPOTDTab
            potdScheduledDate={potdScheduledDate}
            setPotdScheduledDate={setPotdScheduledDate}
            selectedPotdProblemId={selectedPotdProblemId}
            setSelectedPotdProblemId={setSelectedPotdProblemId}
            potdProblemOptions={potdProblemOptions}
            selectedPotdProblem={selectedPotdProblem}
            potdCustomFocusArea={potdCustomFocusArea}
            setPotdCustomFocusArea={setPotdCustomFocusArea}
            potdCustomEstimatedTime={potdCustomEstimatedTime}
            setPotdCustomEstimatedTime={setPotdCustomEstimatedTime}
            potdCustomDescription={potdCustomDescription}
            setPotdCustomDescription={setPotdCustomDescription}
            assignPotd={assignPotd}
            saving={saving}
            overview={overview}
          />
        )}

        {activeTab === 'leaderboard' && (
          <AdminLeaderboardTab
            leaderboardConfig={leaderboardConfig}
            setLeaderboardConfig={setLeaderboardConfig}
            saveLeaderboardSettings={saveLeaderboardSettings}
            savingLeaderboard={savingLeaderboard}
            handleRefreshLeaderboardCache={handleRefreshLeaderboardCache}
            refreshingLeaderboard={refreshingLeaderboard}
            leaderboardLastCache={leaderboardLastCache}
            leaderboardSummary={leaderboardSummary}
          />
        )}
          </>
        )}

        {/* Modals */}
        <ProblemSolutionModal
          isOpen={isSolutionModalOpen}
          onClose={() => setIsSolutionModalOpen(false)}
          problemForm={problemForm}
          setProblemForm={setProblemForm}
        />

        <VisualizerSettingsModal
          isOpen={isVisualizerSettingsModalOpen}
          onClose={() => {
            setIsVisualizerSettingsModalOpen(false);
            resetVisualizerForm();
          }}
          editingVisualizerId={editingVisualizerId}
          visualizerForm={visualizerForm}
          setVisualizerForm={setVisualizerForm}
          saveVisualizer={saveVisualizer}
          availableCategoryNames={availableCategoryNames}
          setCategories={setCategories}
          problems={problems}
          visualizers={visualizers}
          saving={saving}
          selectedUploadFile={selectedUploadFile}
          setSelectedUploadFile={setSelectedUploadFile}
          onOpenReplaceFile={(vis) =>
            setReplaceFileModal({
              isOpen: true,
              visualizer: vis,
              file: null,
              uploading: false,
              error: null,
            })
          }
          onOpenCode={openCodeModal}
          setNotice={withNotice}
        />

        <VisualizerCodeModal
          isOpen={visualizerCodeModal.isOpen}
          visualizer={visualizerCodeModal.visualizer}
          filePath={visualizerCodeModal.filePath}
          code={visualizerCodeModal.code}
          setCode={(code) => setVisualizerCodeModal((p) => ({ ...p, code }))}
          saving={visualizerCodeModal.saving}
          copied={visualizerCodeModal.copied}
          setCopied={(copied) => setVisualizerCodeModal((p) => ({ ...p, copied }))}
          onClose={() => setVisualizerCodeModal((p) => ({ ...p, isOpen: false }))}
          onSave={saveVisualizerCode}
        />

        <VisualizerReplaceModal
          isOpen={replaceFileModal.isOpen}
          visualizer={replaceFileModal.visualizer}
          file={replaceFileModal.file}
          uploading={replaceFileModal.uploading}
          error={replaceFileModal.error}
          r2Status={r2Status}
          fileInputRef={replaceFileInputRef}
          onFileSelect={(file) => setReplaceFileModal((curr) => ({ ...curr, file, error: null }))}
          onClose={() =>
            setReplaceFileModal({
              isOpen: false,
              visualizer: null,
              file: null,
              uploading: false,
              error: null,
            })
          }
          onExecuteReplace={handleExecuteFileReplace}
        />

        <VisualizerPreviewModal
          isOpen={visualizerPreviewModal.isOpen}
          visualizer={visualizerPreviewModal.visualizer}
          onClose={() => setVisualizerPreviewModal({ isOpen: false, visualizer: null })}
        />

        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categoryManagerInput={categoryManagerInput}
          setCategoryManagerInput={setCategoryManagerInput}
          handleCreateCategoryInManager={handleCreateCategoryInManager}
          handleDeleteCategoryInManager={handleDeleteCategoryInManager}
          categorySubmitting={categorySubmitting}
          availableCategoryNames={availableCategoryNames}
          categories={categories}
          visualizers={visualizers}
        />
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
