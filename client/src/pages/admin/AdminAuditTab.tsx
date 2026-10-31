import React from 'react';
import { SearchBox, PaginationBar } from './AdminUIPrimitives';
import type { PaginationData } from './AdminUsersTab';

export interface AuditLogEntry {
  _id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AdminAuditTabProps {
  auditLogs: AuditLogEntry[];
  auditSearch: string;
  setAuditSearch: (s: string) => void;
  auditPagination: PaginationData;
  setAuditPagination: React.Dispatch<React.SetStateAction<PaginationData>>;
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({
  auditLogs,
  auditSearch,
  setAuditSearch,
  auditPagination,
  setAuditPagination,
}) => {
  return (
    <section className="surface rounded-3xl p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Audit Logs{' '}
          <span className="ml-1 text-sm font-normal text-slate-400">
            ({auditPagination.total})
          </span>
        </h2>
        <SearchBox
          value={auditSearch}
          onChange={setAuditSearch}
          placeholder="Search by action, entity or actor…"
        />
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div
            key={log._id}
            className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {log.entityType} • {log.entityId || 'N/A'} • {log.actorEmail || 'system'}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {auditLogs.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No logs found for current filter.</p>
        )}
      </div>

      <PaginationBar
        page={auditPagination.page}
        totalPages={auditPagination.pages}
        onPrev={() => setAuditPagination((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
        onNext={() =>
          setAuditPagination((p) => ({
            ...p,
            page: Math.min(p.page + 1, Math.max(p.pages, 1)),
          }))
        }
      />
    </section>
  );
};

