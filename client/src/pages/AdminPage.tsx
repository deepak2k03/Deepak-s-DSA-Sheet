import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
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
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { apiUrl } from '../config';
import {
  defaultTopics,
  getTopicIcon,
  topicIconOptions,
  type TopicDefinition,
} from '../data/topics';
import { getStoredToken, getStoredUser, updateStoredUser } from '../utils/auth';

type AdminTab = 'overview' | 'topics' | 'problems' | 'users' | 'potd';

interface AdminProblem {
  id: string;
  problemNumber: number;
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solutionLink: string;
  codeLink: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  solvedProblems: string[];
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

interface OverviewData {
  stats: {
    users: number;
    activeUsers: number;
    admins: number;
    problems: number;
    topics: number;
    totalSolved: number;
  };
  potd: {
    problemId: string;
    problemNumber: number;
    title: string;
    date: string;
  } | null;
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
  solutionLink: string;
  codeLink: string;
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
  solutionLink: '',
  codeLink: '',
};

const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'topics', label: 'Topics', icon: <FolderTree size={16} /> },
  { id: 'problems', label: 'Problems', icon: <Wrench size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'potd', label: 'POTD', icon: <Sparkles size={16} /> },
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
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [selectedPotdProblemId, setSelectedPotdProblemId] = useState('');
    const [topicSearch, setTopicSearch] = useState('');
    const [problemSearch, setProblemSearch] = useState('');
    const [problemDifficultyFilter, setProblemDifficultyFilter] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
    const [problemTopicFilter, setProblemTopicFilter] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<'' | 'admin' | 'user'>('');
    const [userStatusFilter, setUserStatusFilter] = useState<'' | 'active' | 'disabled'>('');

    const filteredTopics = useMemo(() => {
      const q = topicSearch.toLowerCase();
      if (!q) return topics;
      return topics.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
    }, [topics, topicSearch]);

    const filteredProblems = useMemo(() => {
      return problems.filter(p => {
        const q = problemSearch.toLowerCase();
        if (q && !p.title.toLowerCase().includes(q) && !String(p.problemNumber).includes(q)) return false;
        if (problemDifficultyFilter && p.difficulty !== problemDifficultyFilter) return false;
        if (problemTopicFilter && p.topic !== problemTopicFilter) return false;
        return true;
      });
    }, [problems, problemSearch, problemDifficultyFilter, problemTopicFilter]);

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

  const loadAdminData = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [overviewRes, topicsRes, problemsRes, usersRes] = await Promise.all([
        fetch(apiUrl('/api/admin/overview'), { headers: authHeaders }),
        fetch(apiUrl('/api/admin/topics'), { headers: authHeaders }),
        fetch(apiUrl('/api/admin/problems'), { headers: authHeaders }),
        fetch(apiUrl('/api/admin/users'), { headers: authHeaders }),
      ]);

      if ([overviewRes, topicsRes, problemsRes, usersRes].some((response) => !response.ok)) {
        throw new Error('Failed to load admin data');
      }

      const [overviewData, topicsData, problemsData, usersData] = await Promise.all([
        overviewRes.json(),
        topicsRes.json(),
        problemsRes.json(),
        usersRes.json(),
      ]);

      setOverview(overviewData);
      setTopics(Array.isArray(topicsData) && topicsData.length > 0 ? topicsData : defaultTopics);
      setProblems(Array.isArray(problemsData) ? problemsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      if (overviewData?.potd?.problemId) {
        setSelectedPotdProblemId(overviewData.potd.problemId);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

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
    }, 'Topic deleted');
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
    }, 'Problem deleted');
  };

  const updateUserAccess = async (user: AdminUser, nextRole: 'user' | 'admin', nextActive: boolean) => {
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <AnimatedBackground />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Shield size={14} /> Control Center
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Manage topics, curate problems, control user access, and override the daily challenge from one place.
              </p>
            </div>

            <button
              onClick={() => loadAdminData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
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
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2 xl:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Today&apos;s POTD</p>
              {overview.potd ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">#{overview.potd.problemNumber} {overview.potd.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scheduled for {new Date(overview.potd.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('potd')}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Change POTD
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No problem is pinned for today yet.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'topics' && (
          <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <form onSubmit={saveTopic} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editingTopicId ? <Save size={16} /> : <Plus size={16} />}
                  {editingTopicId ? 'Save Topic' : 'Create Topic'}
                </button>
              </div>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Topic Catalog <span className="ml-1 text-sm font-normal text-slate-400">({filteredTopics.length}/{topics.length})</span></h2>
                <SearchBox value={topicSearch} onChange={setTopicSearch} placeholder="Search topics…" />
              </div>
              <div className="space-y-3">
                {filteredTopics.map((topic) => (
                  <div key={topic.id || topic.slug} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{getTopicIcon(topic.iconKey, 18)}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{topic.name}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">{topic.slug}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${topic.isActive === false ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>{topic.isActive === false ? 'Hidden' : 'Live'}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{topic.description}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{topic.problemCount || 0} problems • {topic.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingTopicId(topic.id || null); setTopicForm({ name: topic.name, slug: topic.slug, description: topic.description, difficulty: topic.difficulty, iconKey: topic.iconKey, order: String(topic.order || 0), isActive: topic.isActive !== false }); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button>
                      {topic.id && <button type="button" onClick={() => deleteTopic(topic.id!)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20">Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'problems' && (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <form onSubmit={saveProblem} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                <Input label="Solution Link" value={problemForm.solutionLink} onChange={(value) => setProblemForm((current) => ({ ...current, solutionLink: value }))} />
                <Input label="Code Link" value={problemForm.codeLink} onChange={(value) => setProblemForm((current) => ({ ...current, codeLink: value }))} />
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editingProblemId ? <Save size={16} /> : <Plus size={16} />}
                  {editingProblemId ? 'Save Problem' : 'Create Problem'}
                </button>
              </div>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Problem Bank <span className="ml-1 text-sm font-normal text-slate-400">({filteredProblems.length}/{problems.length})</span></h2>
                  <SearchBox value={problemSearch} onChange={setProblemSearch} placeholder="Search by title or #…" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All Difficulties" active={problemDifficultyFilter === ''} onClick={() => setProblemDifficultyFilter('')} />
                  <FilterChip label="Easy" active={problemDifficultyFilter === 'Easy'} onClick={() => setProblemDifficultyFilter('Easy')} color="emerald" />
                  <FilterChip label="Medium" active={problemDifficultyFilter === 'Medium'} onClick={() => setProblemDifficultyFilter('Medium')} color="amber" />
                  <FilterChip label="Hard" active={problemDifficultyFilter === 'Hard'} onClick={() => setProblemDifficultyFilter('Hard')} color="rose" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="All Topics" active={problemTopicFilter === ''} onClick={() => setProblemTopicFilter('')} />
                  {topics.map(t => (
                    <FilterChip key={t.slug} label={t.name} active={problemTopicFilter === t.slug} onClick={() => setProblemTopicFilter(t.slug)} />
                  ))}
                </div>
              </div>
              <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                {filteredProblems.map((problem) => (
                  <div key={problem.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{problem.problemNumber} • {problem.topic}</p>
                        <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{problem.title}</h3>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{problem.difficulty}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingProblemId(problem.id); setProblemForm({ problemNumber: String(problem.problemNumber), title: problem.title, link: problem.link, topic: problem.topic, difficulty: problem.difficulty, solutionLink: problem.solutionLink || '', codeLink: problem.codeLink || '' }); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Edit</button>
                        <button type="button" onClick={() => deleteProblem(problem.id)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Access <span className="ml-1 text-sm font-normal text-slate-400">({filteredUsers.length}/{users.length})</span></h2>
                <SearchBox value={userSearch} onChange={setUserSearch} placeholder="Search by name or email…" />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="All Roles" active={userRoleFilter === ''} onClick={() => setUserRoleFilter('')} />
                <FilterChip label="Admin" active={userRoleFilter === 'admin'} onClick={() => setUserRoleFilter('admin')} color="blue" />
                <FilterChip label="User" active={userRoleFilter === 'user'} onClick={() => setUserRoleFilter('user')} />
                <span className="mx-1 self-center border-l border-slate-200 dark:border-slate-700 h-4" />
                <FilterChip label="All Status" active={userStatusFilter === ''} onClick={() => setUserStatusFilter('')} />
                <FilterChip label="Active" active={userStatusFilter === 'active'} onClick={() => setUserStatusFilter('active')} color="emerald" />
                <FilterChip label="Disabled" active={userStatusFilter === 'disabled'} onClick={() => setUserStatusFilter('disabled')} color="rose" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{user.username}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${user.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{user.role}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'}`}>{user.isActive ? 'Active' : 'Disabled'}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">Solved {user.solvedProblems?.length || 0} problems</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateUserAccess(user, user.role === 'admin' ? 'user' : 'admin', user.isActive)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</button>
                    <button type="button" onClick={() => updateUserAccess(user, user.role, !user.isActive)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${user.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20'}`}>{user.isActive ? 'Disable Account' : 'Enable Account'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'potd' && (
          <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Pin Today&apos;s Challenge</h2>
              <div className="space-y-4">
                <Select label="Problem" value={selectedPotdProblemId} onChange={setSelectedPotdProblemId} options={problems.map((problem) => ({ value: problem.id, label: `#${problem.problemNumber} ${problem.title}` }))} required />
                <button onClick={assignPotd} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Set Problem of the Day
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Current POTD</h2>
              {overview?.potd ? (
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
    >
      <option value="" disabled={required}>— Select —</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void; }) => (
  <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-56"
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
          ? colored || 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
};

export default AdminPage;
