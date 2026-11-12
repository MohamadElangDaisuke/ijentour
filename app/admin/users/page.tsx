"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Search,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Lock,
  Calendar,
  KeyRound,
  Shield,
  Send,
  Loader2,
  Check,
  AtSign,
  BellRing,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";
import AdminBadge from "@/app/component/admin/AdminBadge";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import { safeJsonParse } from "@/lib/utils";

interface NotificationPrefs {
  booking: boolean;
  customTrip: boolean;
  review: boolean;
  contact: boolean;
}

interface AdminUser {
  id: string;
  username?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "SUPER_ADMIN" | string;
  isActive: boolean;
  emailVerified?: string | null;
  notificationPreferences?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "SUPER_ADMIN" | "ADMIN">("all");

  // Drawer / Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [isActive, setIsActive] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    booking: true,
    customTrip: true,
    review: true,
    contact: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP Verification Modal State
  const [otpModalUser, setOtpModalUser] = useState<AdminUser | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  const loadData = async () => {
    try {
      const [resUsers, resMe] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/auth/me"),
      ]);

      const dataUsers = await resUsers.json();
      const dataMe = await resMe.json();

      if (dataUsers.success) setUsers(dataUsers.users || []);
      if (dataMe.success) setCurrentAdmin(dataMe.user);
    } catch (e) {
      console.error("Failed to load admin users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  const openCreateDrawer = () => {
    setFormMode("create");
    setEditingUserId(null);
    setUsername("");
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("ADMIN");
    setIsActive(true);
    setNotifPrefs({ booking: true, customTrip: true, review: true, contact: true });
    setFormError("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (u: AdminUser) => {
    setFormMode("edit");
    setEditingUserId(u.id);
    setUsername(u.username || "");
    setName(u.name || "");
    setEmail(u.email || "");
    setPassword("");
    setPhone(u.phone || "");
    setRole(u.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN");
    setIsActive(u.isActive ?? true);
    const parsedPrefs = safeJsonParse<NotificationPrefs>(u.notificationPreferences, {
      booking: true,
      customTrip: true,
      review: true,
      contact: true,
    });
    setNotifPrefs(parsedPrefs);
    setFormError("");
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      if (formMode === "create") {
        if (!username.trim() || !name.trim() || !email.trim() || !password) {
          throw new Error("Username, full name, email, and temporary password are required.");
        }

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            role,
            notificationPreferences: notifPrefs,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create administrator account.");

        setUsers((prev) => [...prev, data.user]);
        showToast(`Administrator '${data.user.name}' (@${data.user.username}) successfully created.`);
      } else if (formMode === "edit" && editingUserId) {
        const payload: any = {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          isActive,
          notificationPreferences: notifPrefs,
        };
        if (password.trim()) payload.password = password.trim();

        const res = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update administrator account.");

        setUsers((prev) =>
          prev.map((u) => (u.id === editingUserId ? data.user : u))
        );
        showToast("Administrator profile successfully updated.");
      }

      setIsDrawerOpen(false);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (currentAdmin?.id === u.id) {
      alert("You cannot delete your own administrator account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete administrator "${u.name}" (@${u.username || u.email})? This action will be recorded in the audit log.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account.");

      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      showToast(`Administrator '${u.name}' has been deleted.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete account.");
    }
  };

  // OTP Verification Handlers
  const openOtpModal = (u: AdminUser) => {
    setOtpModalUser(u);
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
  };

  const handleSendOtp = async () => {
    if (!otpModalUser) return;
    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch("/api/users/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          userId: otpModalUser.id,
          email: otpModalUser.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP code.");

      setOtpSuccess(
        data.devCode
          ? `[Simulation Code: ${data.devCode}] 6-digit OTP code generated. Valid for 10 minutes.`
          : `Verification OTP code has been sent to ${otpModalUser.email}.`
      );
      setOtpCooldown(60);
    } catch (e: any) {
      setOtpError(e.message || "Failed to send OTP code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalUser || !otpCode.trim()) return;

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/users/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          userId: otpModalUser.id,
          email: otpModalUser.email,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code.");

      // Update state
      setUsers((prev) =>
        prev.map((item) =>
          item.id === otpModalUser.id ? { ...item, emailVerified: new Date().toISOString() } : item
        )
      );

      showToast(`Email ${otpModalUser.email} has been officially verified!`);
      setOtpModalUser(null);
    } catch (e: any) {
      setOtpError(e.message || "Failed to verify OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? u.isActive
          : !u.isActive;

      const matchesRole =
        roleFilter === "all" ? true : u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Metrics
  const totalCount = users.length;
  const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const activeCount = users.filter((u) => u.isActive).length;

  if (!loading && !isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-lg mx-auto mt-12">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Super Admin Access Only
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The administrator account and role management page can only be accessed by an authorized Super Admin account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14 w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border text-xs flex items-center gap-3 shadow-xl animate-in fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-red-900 text-white border-red-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff & Admins" },
        ]}
        categoryTag="System & Security"
        title="Admin Accounts & Roles Management"
        description="Manage Super Admin & Admin accounts, role permissions, email OTP verification, and system security policies."
        action={
          <button
            onClick={openCreateDrawer}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm hover:shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Administrator</span>
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Administrators"
          value={totalCount}
          subtitle="Super Admin & Admin"
          theme="slate"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Super Admin"
          value={superAdminCount}
          subtitle="Full system authority"
          theme="amber"
          icon={<Shield className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Operational Admin"
          value={adminCount}
          subtitle="Catalog, tours, & moderation"
          theme="teal"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <AdminStatsCard
          title="Active Accounts"
          value={activeCount}
          subtitle={`${users.filter((u) => !u.isActive).length} accounts deactivated`}
          theme="emerald"
          icon={<KeyRound className="w-5 h-5" />}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin Only</option>
            <option value="ADMIN">Admin Only</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ].map((tab) => {
              const isActiveTab = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActiveTab
                      ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <AdminTableSkeleton columns={6} rows={4} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No administrator accounts match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Email Verification</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Created</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "AD";

                  const isVerified = Boolean(u.emailVerified);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs border ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-amber-500 text-slate-950 border-amber-400"
                                : "bg-slate-900 text-amber-400 border-slate-800 dark:bg-slate-800 dark:text-white"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
                                  Your Account
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {u.username && (
                                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-0.5">
                                  <AtSign className="w-2.5 h-2.5" />
                                  {u.username}
                                </span>
                              )}
                              <span>•</span>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                              : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {u.role === "SUPER_ADMIN" ? (
                            <>
                              <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Super Admin</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3 text-slate-500" />
                              <span>Admin</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold">
                              Unverified
                            </span>
                            <button
                              onClick={() => openOtpModal(u)}
                              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline cursor-pointer"
                            >
                              Verify OTP
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <AdminBadge status={u.isActive ? "ACTIVE" : "CANCELLED"} label={u.isActive ? "Active" : "Inactive"} />
                      </td>

                      <td className="py-4 px-5 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(u.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditDrawer(u)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 inline-block transition cursor-pointer"
                          title="Edit administrator"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 inline-block transition cursor-pointer"
                            title="Delete administrator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Account Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={formMode === "create" ? "Add New Administrator" : "Edit Administrator Account"}
        subtitle={
          formMode === "create"
            ? "Create official login credentials for a new admin or super admin staff member."
            : `Update profile details and permissions for ${name || "administrator"}.`
        }
        width="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-user-form"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving..." : formMode === "create" ? "Create Account" : "Save Changes"}</span>
            </button>
          </div>
        }
      >
        <form id="admin-user-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Administrator Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="e.g. admin_ijen"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Used to sign in to the admin panel. Lowercase letters, numbers, and underscores (_) only.
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@mountijentour.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Used for receiving system notifications & OTP verification.
            </span>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Administrator Role
            </label>
            {formMode === "create" ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Admin (Operational)</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    New accounts are automatically assigned the Admin role. Creating additional Super Admins through this form is restricted.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Fixed ADMIN
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition ${
                    role === "ADMIN"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">Admin</span>
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={role === "ADMIN"}
                      onChange={() => setRole("ADMIN")}
                      className="text-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Tour operations, bookings, reviews, & messages.
                  </span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition ${
                    role === "SUPER_ADMIN"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Super Admin</span>
                    <input
                      type="radio"
                      name="role"
                      value="SUPER_ADMIN"
                      checked={role === "SUPER_ADMIN"}
                      onChange={() => setRole("SUPER_ADMIN")}
                      className="text-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Full authority, manage admin accounts, & audit logs.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              WhatsApp / Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 6281234567890"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {formMode === "create" ? (
                <>
                  Password <span className="text-red-500">*</span>
                </>
              ) : (
                "Change Password (Optional)"
              )}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required={formMode === "create"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={formMode === "create" ? "Min. 6 characters" : "Leave blank to keep current password"}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {formMode === "create"
                ? "Minimum 6 characters required."
                : "Fill in only if you want to reset this account's password."}
            </span>
          </div>

          {/* Notification Preferences */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <BellRing className="w-3.5 h-3.5 text-amber-500" />
              <span>Email Notification Preferences (Super Admin Only)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.booking}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, booking: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Tour Bookings</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.customTrip}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, customTrip: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Custom Trip Request</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.review}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, review: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Customer Reviews</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.contact}
                  onChange={(e) => setNotifPrefs({ ...notifPrefs, contact: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Incoming Inquiries</span>
              </label>
            </div>
          </div>

          {/* Active status */}
          {formMode === "edit" && editingUserId !== currentAdmin?.id && (
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Active Account Status</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    If deactivated, this account cannot sign in to the admin panel.
                  </span>
                </div>
              </label>
            </div>
          )}
        </form>
      </AdminDrawer>

      {/* OTP Verification Modal */}
      {otpModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Administrator Email Verification
                  </h3>
                  <p className="text-[11px] text-slate-400">{otpModalUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setOtpModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                {otpSuccess}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-lg font-black py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={otpLoading || otpCooldown > 0}
                  onClick={handleSendOtp}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{otpCooldown > 0 ? `Resend (${otpCooldown}s)` : "Send OTP Code"}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Verify Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
