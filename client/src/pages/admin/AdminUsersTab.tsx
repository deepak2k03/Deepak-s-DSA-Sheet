import React from 'react';
import { SearchBox, FilterChip, PaginationBar } from './AdminUIPrimitives';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  solvedProblems: string[];
  role: 'user' | 'moderator' | 'content_manager' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
  totalPages: number;
}

interface AdminUsersTabProps {
  users: AdminUser[];
  filteredUsers: AdminUser[];
  userSearch: string;
  setUserSearch: (s: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (r: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (s: string) => void;
  userPageSize: number | 'all';
  setUserPageSize: (size: number | 'all') => void;
  usersPagination: PaginationData;
  setUsersPagination: React.Dispatch<React.SetStateAction<PaginationData>>;
  updateUserAccess: (
    user: AdminUser,
    nextRole: 'user' | 'moderator' | 'content_manager' | 'admin',
    nextActive: boolean
  ) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  userPageSize,
  setUserPageSize,
  usersPagination,
  setUsersPagination,
  updateUserAccess,
}) => {
  return (
    <section className="surface rounded-3xl p-6">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            User Access{' '}
            <span className="ml-1 text-sm font-normal text-slate-400">
              ({usersPagination.total})
            </span>
          </h2>
          <SearchBox
            value={userSearch}
            onChange={(val) => {
              setUserSearch(val);
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search by name or email…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All Roles"
            active={!userRoleFilter || userRoleFilter === 'all'}
            onClick={() => {
              setUserRoleFilter('all');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
          />
          <FilterChip
            label="Admin"
            active={userRoleFilter === 'admin'}
            onClick={() => {
              setUserRoleFilter('admin');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            color="blue"
          />
          <FilterChip
            label="Moderator"
            active={userRoleFilter === 'moderator'}
            onClick={() => {
              setUserRoleFilter('moderator');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            color="amber"
          />
          <FilterChip
            label="Content"
            active={userRoleFilter === 'content_manager'}
            onClick={() => {
              setUserRoleFilter('content_manager');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            color="emerald"
          />
          <FilterChip
            label="User"
            active={userRoleFilter === 'user'}
            onClick={() => {
              setUserRoleFilter('user');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
          />
          <span className="mx-1 self-center border-l border-slate-200/80 dark:border-white/10 h-4" />
          <FilterChip
            label="All Status"
            active={!userStatusFilter || userStatusFilter === 'all'}
            onClick={() => {
              setUserStatusFilter('all');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
          />
          <FilterChip
            label="Active"
            active={userStatusFilter === 'active'}
            onClick={() => {
              setUserStatusFilter('active');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            color="emerald"
          />
          <FilterChip
            label="Disabled"
            active={userStatusFilter === 'disabled'}
            onClick={() => {
              setUserStatusFilter('disabled');
              setUsersPagination((p) => ({ ...p, page: 1 }));
            }}
            color="rose"
          />
        </div>
      </div>
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 p-4 dark:border-white/10 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{user.username}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    user.role === 'admin'
                      ? 'bg-[#dceee9] text-teal-800 dark:bg-teal-400/10 dark:text-teal-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    user.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Solved {user.solvedProblems?.length || 0} problems
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => updateUserAccess(user, 'admin', user.isActive)}
                  className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Make Admin
                </button>
              )}
              {user.role !== 'moderator' && (
                <button
                  type="button"
                  onClick={() => updateUserAccess(user, 'moderator', user.isActive)}
                  className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Make Moderator
                </button>
              )}
              {user.role !== 'content_manager' && (
                <button
                  type="button"
                  onClick={() => updateUserAccess(user, 'content_manager', user.isActive)}
                  className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Make Content
                </button>
              )}
              {user.role !== 'user' && (
                <button
                  type="button"
                  onClick={() => updateUserAccess(user, 'user', user.isActive)}
                  className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Make User
                </button>
              )}
              <button
                type="button"
                onClick={() => updateUserAccess(user, user.role, !user.isActive)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  user.isActive
                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20'
                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20'
                }`}
              >
                {user.isActive ? 'Disable Account' : 'Enable Account'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Per page:</span>
          {([10, 25, 50, 100, 'all'] as const).map((size) => (
            <button
              key={String(size)}
              type="button"
              onClick={() => {
                setUserPageSize(size);
                setUsersPagination((p) => ({
                  ...p,
                  page: 1,
                  limit: size === 'all' ? 5000 : size,
                }));
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                userPageSize === size
                  ? 'bg-[#123b36] text-white dark:bg-teal-400 dark:text-[#08241f]'
                  : 'border border-slate-200/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              {size === 'all' ? 'All' : size}
            </button>
          ))}
        </div>

        {userPageSize !== 'all' && (
          <PaginationBar
            page={usersPagination.page}
            totalPages={usersPagination.pages}
            onPrev={() => setUsersPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
            onNext={() =>
              setUsersPagination((p) => ({ ...p, page: Math.min(p.page + 1, Math.max(p.pages, 1)) }))
            }
          />
        )}
      </div>
    </section>
  );
};

