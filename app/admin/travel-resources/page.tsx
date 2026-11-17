"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  ListChecks,
  X,
} from "lucide-react";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";
import { AdminCardListSkeleton } from "@/app/component/ui/skeleton";
import {
  TRAVEL_RESOURCE_ICON_OPTIONS,
  type TravelResourceChecklistItem,
  type TravelResourceDTO,
} from "@/lib/travel-resources-defaults";

function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminTravelResourcesPage() {
  const [resources, setResources] = useState<TravelResourceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer & Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("FileText");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [items, setItems] = useState<TravelResourceChecklistItem[]>([]);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<TravelResourceDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/travel-resources", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setResources(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch travel resources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugManuallyEdited(false);
    setCategory("");
    setDescription("");
    setIcon("FileText");
    setLink("");
    setSortOrder(resources.length > 0 ? Math.max(...resources.map((r) => r.sortOrder)) + 1 : 1);
    setIsActive(true);
    setItems([{ title: "", desc: "", highlight: "" }]);
    setFormError(null);
  };

  const openCreateDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (resource: TravelResourceDTO) => {
    setEditingId(resource.id);
    setTitle(resource.title);
    setSlug(resource.slug);
    setSlugManuallyEdited(true);
    setCategory(resource.category);
    setDescription(resource.description);
    setIcon(resource.icon || "FileText");
    setLink(resource.link || "");
    setSortOrder(resource.sortOrder);
    setIsActive(resource.isActive);
    setItems(
      resource.items && resource.items.length > 0
        ? resource.items.map((it) => ({
            title: it.title || "",
            desc: it.desc || "",
            highlight: it.highlight || "",
          }))
        : []
    );
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleCategoryOrTitleChange = (newCategory: string, newTitle: string) => {
    if (!slugManuallyEdited && !editingId) {
      const basis = newCategory.trim() || newTitle.trim();
      setSlug(slugifyText(basis));
    }
  };

  const addChecklistItem = () => {
    setItems((prev) => [...prev, { title: "", desc: "", highlight: "" }]);
  };

  const removeChecklistItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateChecklistItem = (
    index: number,
    field: keyof TravelResourceChecklistItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!category.trim() || !title.trim() || !slug.trim() || !description.trim()) {
      setFormError("Category, title, slug, and description are required.");
      return;
    }

    const cleanedItems = items
      .filter((it) => it.title.trim() !== "" || it.desc.trim() !== "")
      .map((it) => ({
        title: it.title.trim(),
        desc: it.desc.trim(),
        ...(it.highlight && it.highlight.trim() ? { highlight: it.highlight.trim() } : {}),
      }));

    for (let i = 0; i < cleanedItems.length; i++) {
      if (!cleanedItems[i].title || !cleanedItems[i].desc) {
        setFormError(`Checklist item #${i + 1} must have both a title and a description.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        category: category.trim(),
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        icon,
        link: link.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
        items: cleanedItems,
      };

      const url = editingId
        ? `/api/admin/travel-resources/${editingId}`
        : "/api/admin/travel-resources";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save travel resource.");
      }

      setIsDrawerOpen(false);
      showToast(
        editingId
          ? "Travel resource updated and synced to homepage!"
          : "New travel resource created and published!"
      );
      await loadResources();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save travel resource.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (resource: TravelResourceDTO) => {
    try {
      const res = await fetch(`/api/admin/travel-resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !resource.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle visibility.");
      }
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, isActive: !resource.isActive } : r))
      );
      showToast(
        !resource.isActive
          ? `"${resource.category}" is now visible on homepage.`
          : `"${resource.category}" hidden from homepage.`
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/travel-resources/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete resource.");
      }
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast(`Deleted "${deleteTarget.category}".`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete travel resource.");
    } finally {
      setDeleting(false);
    }
  };

  const metrics = useMemo(() => {
    const activeCount = resources.filter((r) => r.isActive).length;
    const inactiveCount = resources.length - activeCount;
    const totalChecklistItems = resources.reduce((sum, r) => sum + (r.items?.length || 0), 0);
    return {
      total: resources.length,
      activeCount,
      inactiveCount,
      totalChecklistItems,
    };
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (statusFilter === "ACTIVE" && !r.isActive) return false;
      if (statusFilter === "INACTIVE" && r.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [resources, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminCardListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Travel Planning Resources"
        description="Manage the interactive preparation categories, checklists, and links displayed on the public homepage."
        badge={`${metrics.total} Categories`}
        breadcrumbs={[{ label: "Travel Resources" }]}
        actions={
          <button
            onClick={openCreateDrawer}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Travel Resource</span>
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Categories"
          value={metrics.total}
          icon={<FileText className="w-4 h-4" />}
          theme="amber"
          subtitle="Resource tabs"
        />
        <AdminStatsCard
          label="Active on Homepage"
          value={metrics.activeCount}
          icon={<Eye className="w-4 h-4" />}
          theme="emerald"
          subtitle="Visible to visitors"
        />
        <AdminStatsCard
          label="Hidden / Draft"
          value={metrics.inactiveCount}
          icon={<EyeOff className="w-4 h-4" />}
          theme="slate"
          subtitle="Unpublished"
        />
        <AdminStatsCard
          label="Checklist Items"
          value={metrics.totalChecklistItems}
          icon={<ListChecks className="w-4 h-4" />}
          theme="teal"
          subtitle="Across all tabs"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category, title, slug, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {status === "ALL" ? "All" : status === "ACTIVE" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className="space-y-4">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition p-5 ${
                resource.isActive
                  ? "border-slate-200 dark:border-slate-800"
                  : "border-slate-200/70 dark:border-slate-800/60 opacity-75"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                      <ArrowUpDown className="w-3 h-3" />
                      Order #{resource.sortOrder}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                      {resource.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        resource.isActive
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {resource.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      /{resource.slug}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <ListChecks className="w-3.5 h-3.5 text-amber-500" />
                      {resource.items?.length || 0} checklist items
                    </span>
                    <span>Icon: {resource.icon || "FileText"}</span>
                    {resource.link && (
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        <ExternalLink className="w-3 h-3" />
                        {resource.link}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(resource)}
                    title={resource.isActive ? "Hide from homepage" : "Show on homepage"}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      resource.isActive
                        ? "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    }`}
                  >
                    {resource.isActive ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditDrawer(resource)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(resource)}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-xs">No travel planning resources match your filter.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? "Edit Travel Resource" : "Create Travel Resource"}
        subtitle="Changes are saved to Supabase and reflected immediately on the public homepage."
        width="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? "Save Changes" : "Create Resource"}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Tab Label / Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  handleCategoryOrTitleChange(val, title);
                }}
                placeholder="e.g., Documents & Entry"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                placeholder="e.g., documents"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Display Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                handleCategoryOrTitleChange(category, val);
              }}
              placeholder="e.g., Required Documents & Permits"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview shown under the category heading..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                {TRAVEL_RESOURCE_ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                min={0}
                max={9999}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Active on Homepage
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Optional Link (Internal `/path` or External `https://...`)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g., /destinations or https://example.com/guide"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Checklist Items Editor */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Checklist Items ({items.length})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cards displayed inside this resource tab on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(idx)}
                      className="text-rose-500 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                      title="Remove item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateChecklistItem(idx, "title", e.target.value)}
                    placeholder="Item title (e.g., Medical Health Certificate)"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => updateChecklistItem(idx, "desc", e.target.value)}
                    placeholder="Item description..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={item.highlight || ""}
                    onChange={(e) => updateChecklistItem(idx, "highlight", e.target.value)}
                    placeholder="Optional highlight / tip note..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      </AdminDrawer>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Travel Resource?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {deleteTarget.category}
                  </span>{" "}
                  ({deleteTarget.title})? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

