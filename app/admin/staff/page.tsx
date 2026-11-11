"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Star,
  CheckCircle,
  Shield,
  Phone,
  Mail,
  Award,
  Search,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { AdminCardListSkeleton } from "@/app/component/ui/skeleton";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  experience?: string | null;
  languages?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Drawer / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("Tour Guide");
  const [specialty, setSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [experience, setExperience] = useState("5+ Tahun");
  const [languages, setLanguages] = useState("Bahasa Indonesia, English");
  const [rating, setRating] = useState("5.0");
  const [badge, setBadge] = useState("Lisensi HPI");
  const [phone, setPhone] = useState("+62 822-6817-7188");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("1");

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadStaff = () => {
    fetch("/api/staff?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.staff) {
          setStaffList(data.staff);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRole("Tour Guide");
    setSpecialty("");
    setDescription("");
    setAvatarUrl("");
    setExperience("5+ Tahun");
    setLanguages("Bahasa Indonesia, English");
    setRating("5.0");
    setBadge("Lisensi HPI");
    setPhone("+62 822-6817-7188");
    setIsFeatured(true);
    setIsActive(true);
    setSortOrder(String(staffList.length + 1));
    setError("");
  };

  const startEdit = (staff: StaffMember) => {
    setEditingId(staff.id);
    setName(staff.name);
    setRole(staff.role || "Tour Guide");
    setSpecialty(staff.specialty || "");
    setDescription(staff.description || "");
    setAvatarUrl(staff.avatarUrl || "");
    setExperience(staff.experience || "5+ Tahun");
    setLanguages(staff.languages || "Bahasa Indonesia, English");
    setRating(String(staff.rating || 5.0));
    setBadge(staff.badge || "");
    setPhone(staff.phone || "");
    setIsFeatured(staff.isFeatured);
    setIsActive(staff.isActive);
    setSortOrder(String(staff.sortOrder || 1));
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Staff / Guide name is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    const payload = {
      name: name.trim(),
      role: role.trim(),
      specialty: specialty.trim() || null,
      description: description.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      experience: experience.trim() || null,
      languages: languages.trim() || null,
      rating: parseFloat(rating) || 5.0,
      badge: badge.trim() || null,
      phone: phone.trim() || null,
      isFeatured,
      isActive,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/staff/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update staff.");
        setSuccessMsg(`Guide "${name}" successfully updated!`);
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create staff.");
        setSuccessMsg(`Guide "${name}" successfully registered!`);
      }

      setIsFormOpen(false);
      resetForm();
      loadStaff();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, staffName: string) => {
    if (!confirm(`Are you sure you want to remove "${staffName}" from staff directory?`)) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete staff.");
      setSuccessMsg(`Staff member "${staffName}" deleted.`);
      loadStaff();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to delete staff.");
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const active = staffList.filter((s) => s.isActive).length;
    const featured = staffList.filter((s) => s.isFeatured).length;
    const licensed = staffList.filter((s) => s.badge && s.badge.toLowerCase().includes("hpi")).length;
    return { total: staffList.length, active, featured, licensed };
  }, [staffList]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (roleFilter !== "ALL" && s.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (s.name || "").toLowerCase().includes(q);
        const matchesRole = (s.role || "").toLowerCase().includes(q);
        const matchesSpecialty = (s.specialty || "").toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesSpecialty) return false;
      }
      return true;
    });
  }, [staffList, roleFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminCardListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Staff & Tour Guides Management"
        description="Organize certified local guides, mountain porters, and expedition leaders featured on the website."
        badge={`${metrics.total} Guides`}
        breadcrumbs={[{ label: "Staff & Guides" }]}
        actions={
          <button
            onClick={openCreateForm}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Guide</span>
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatsCard
          label="Total Team"
          value={metrics.total}
          icon={<UserCheck className="w-4 h-4" />}
          subtitle="All registered staff"
          theme="slate"
        />
        <AdminStatsCard
          label="Active Guides"
          value={metrics.active}
          icon={<CheckCircle className="w-4 h-4" />}
          subtitle="Available for trips"
          theme="emerald"
        />
        <AdminStatsCard
          label="Featured on Homepage"
          value={metrics.featured}
          icon={<Star className="w-4 h-4" />}
          subtitle="Promoted publicly"
          theme="amber"
        />
        <AdminStatsCard
          label="HPI Licensed"
          value={metrics.licensed}
          icon={<Award className="w-4 h-4" />}
          subtitle="Certified Indonesian guides"
          theme="teal"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guide name, specialty, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Tour Guide">Tour Guide</option>
            <option value="Senior Mountain Guide">Senior Mountain Guide</option>
            <option value="Lead Porter / Safety">Lead Porter / Safety</option>
            <option value="Expedition Lead">Expedition Lead</option>
          </select>
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Profile Avatar & Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-amber-500/30 shrink-0">
                  <img
                    src={staff.avatarUrl || "/images/HeroSection.webp"}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      staff.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {staff.isActive ? "● Active" : "○ Inactive"}
                  </span>

                  {staff.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      {staff.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Name & Role */}
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {staff.name}
                </h3>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {staff.role}
                </p>
                {staff.specialty && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {staff.specialty}
                  </p>
                )}
              </div>

              {/* Stats pill */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                  <span className="font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{staff.rating || 5.0}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {staff.experience || "5+ Thn"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Order #{staff.sortOrder}</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startEdit(staff)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(staff.id, staff.name)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Remove staff member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer Form for Add / Edit Guide */}
      <AdminDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Guide: ${name}` : "Register New Staff / Tour Guide"}
        subtitle="Ensure guide information and credentials match official regional tourism standards."
        width="lg"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : editingId ? "Update Guide" : "Save Guide"}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Profile Photo / Avatar
            </label>
            <ImageUpload
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              folder="avatars"
            />
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Supriyadi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Role / Title *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Tour Guide">Tour Guide</option>
                <option value="Senior Mountain Guide">Senior Mountain Guide</option>
                <option value="Lead Porter / Safety">Lead Porter / Safety</option>
                <option value="Expedition Lead">Expedition Lead</option>
              </select>
            </div>
          </div>

          {/* Specialty & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Specialty / Expertise
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Blue Fire Specialist, Former Sulfur Miner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Badge / Certification
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Lisensi HPI, Certified Mountaineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Experience, Rating, Sort Order */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="5+ Tahun"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Phone & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                WhatsApp Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 822-xxxx-xxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Bahasa Indonesia, English"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Short Bio / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief biography and background on Mount Ijen trails..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">Active Guide</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">Featured on Homepage</span>
            </label>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
