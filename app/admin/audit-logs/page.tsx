"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Eye,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Globe,
  Tag,
  Key,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import { format } from "date-fns";

interface AuditLogItem {
  id: string;
  userId: string | null;
  adminName: string | null;
  action: string;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; badgeBg: string }> = {
  CREATE_ADMIN: {
    label: "Create Admin",
    color: "text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  UPDATE_ADMIN: {
    label: "Update Admin",
    color: "text-sky-700 dark:text-sky-300",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
  },
  ACTIVATE_ADMIN: {
    label: "Activate Account",
    color: "text-teal-700 dark:text-teal-300",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
  },
  DEACTIVATE_ADMIN: {
    label: "Deactivate Account",
    color: "text-amber-700 dark:text-amber-300",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  DELETE_ADMIN: {
    label: "Delete Admin",
    color: "text-rose-700 dark:text-rose-300",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
  },
  PASSWORD_RESET: {
    label: "Password Reset",
    color: "text-purple-700 dark:text-purple-300",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  AUTH_FAILURE: {
    label: "Auth Failure",
    color: "text-rose-800 dark:text-rose-200",
    badgeBg: "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700",
  },
  UPDATE_SETTINGS: {
    label: "Update Settings",
    color: "text-indigo-700 dark:text-indigo-300",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
  },
  SYSTEM_CONFIG: {
    label: "System Config",
    color: "text-amber-800 dark:text-amber-200",
    badgeBg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700",
  },
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Drawer detail inspect
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
      if (selectedAction && selectedAction !== "ALL") params.set("action", selectedAction);
      if (search.trim()) params.set("search", search.trim());
      if (selectedAdmin.trim()) params.set("admin", selectedAdmin.trim());
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedAction("ALL");
    setSelectedAdmin("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const openLogDetail = (item: AuditLogItem) => {
    setSelectedLog(item);
    setIsDrawerOpen(true);
  };

  // Quick stats computed from current view
  const stats = useMemo(() => {
    const adminEvents = logs.filter((l) => l.action.includes("ADMIN")).length;
    const authEvents = logs.filter((l) => l.action.includes("AUTH") || l.action.includes("PASSWORD")).length;
    const configEvents = logs.filter((l) => l.action.includes("CONFIG") || l.action.includes("SETTINGS")).length;
    return { adminEvents, authEvents, configEvents };
  }, [logs]);

  return (
    <div className="space-y-6 pb-16">
      <AdminPageHeader
        title="Administrative Audit Trail"
        description="Immutable chronological security ledger recording administrative mutations, role escalations, and system configuration changes."
        breadcrumbs={[{ label: "System", href: "/admin/settings" }, { label: "Audit Logs" }]}
        action={
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Audit Logs"
          value={totalCount}
          icon={<ShieldCheck className="w-5 h-5" />}
          subtitle="Recorded in PostgreSQL"
          theme="gold"
        />
        <AdminStatsCard
          title="Admin Account Events"
          value={stats.adminEvents}
          icon={<User className="w-5 h-5" />}
          subtitle="Create, update, deactivate"
          theme="teal"
        />
        <AdminStatsCard
          title="Security & Password"
          value={stats.authEvents}
          icon={<Key className="w-5 h-5" />}
          subtitle="Password reset & auth events"
          theme="purple"
        />
        <AdminStatsCard
          title="Configuration Changes"
          value={stats.configEvents}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Preferences & settings"
          theme="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Text Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, target, details, or IP..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Action Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Action Types</option>
              <option value="CREATE_ADMIN">Create Admin Account</option>
              <option value="UPDATE_ADMIN">Update Admin Profile</option>
              <option value="ACTIVATE_ADMIN">Activate Admin</option>
              <option value="DEACTIVATE_ADMIN">Deactivate Admin</option>
              <option value="DELETE_ADMIN">Delete Admin</option>
              <option value="PASSWORD_RESET">Password Reset</option>
              <option value="UPDATE_SETTINGS">Update Settings</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Start Date"
            />
          </div>

          {/* Date Range End */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="End Date"
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="md:col-span-1 flex gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filter"
              className="w-full py-2 px-2 text-xs text-center font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <AdminTableSkeleton rows={7} />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Audit Logs Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedAction !== "ALL"
                ? "No log records match the current search filters."
                : "No mutation activity has been recorded yet, or the audit_logs table is awaiting synchronization."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => {
                  const meta = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "text-slate-700 dark:text-slate-300",
                    badgeBg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  };
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm:ss")}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>WIB</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                          <span>{log.adminName || "System Process"}</span>
                        </div>
                        {log.userId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            ID: {log.userId.slice(0, 14)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.badgeBg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {log.targetId ? (
                          <span className="truncate max-w-[130px] inline-block" title={log.targetId}>
                            {log.targetId}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {log.ipAddress || "127.0.0.1"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openLogDetail(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-primary-200 dark:border-primary-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && logs.length > 0 && (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {logs.length} of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> audit entries
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer: Detailed JSON Inspection */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Security Audit Log Details"
        subtitle="Complete forensic details of the administrative action recorded in the database."
        width="lg"
      >
        {selectedLog && (
          <div className="space-y-6 text-xs">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Log ID</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate">{selectedLog.id}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Action Type</span>
                <p className="font-semibold text-primary-600 dark:text-primary-400">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Actor</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedLog.adminName || "System"}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">IP Address</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.ipAddress || "127.0.0.1"}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Recorded At</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {format(new Date(selectedLog.createdAt), "dd MMMM yyyy, HH:mm:ss")} WIB
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Target ID</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate">
                  {selectedLog.targetId || "No target entity"}
                </p>
              </div>
            </div>

            {/* Detailed Payload */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary-500" />
                <span>Data Payload & Action Details (Sanitized JSON)</span>
              </label>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                <pre>
                  {selectedLog.details
                    ? JSON.stringify(JSON.parse(selectedLog.details), null, 2)
                    : "// No additional metadata"}
                </pre>
              </div>
              <p className="text-[11px] text-slate-500">
                All sensitive credential fields (passwords, hashes, tokens) are automatically stripped before recording to the database.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Integrity Guarantee:</strong> This audit log is read-only and cannot be modified or deleted by any administrator to maintain information security audit compliance.
              </span>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
