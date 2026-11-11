"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  X,
  Save,
  Check,
  Eye,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import ImageUpload from "@/app/component/ui/ImageUpload";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";
import { safeJsonParse } from "@/lib/utils";
import AdminBadge from "@/app/component/admin/AdminBadge";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isApproved, setIsApproved] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () => {
    fetch("/api/reviews?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const openCreateModal = () => {
    setEditingReview(null);
    setAuthorName("");
    setRating(5);
    setComment("");
    setPhotoUrl("");
    setIsApproved(true);
    setError("");
    setIsDrawerOpen(true);
  };

  const openEditModal = (rev: any) => {
    setEditingReview(rev);
    setAuthorName(rev.authorName || "");
    setRating(rev.rating || 5);
    setComment(rev.comment || "");
    const photos = safeJsonParse<string[]>(rev.photoUrls, []);
    setPhotoUrl(photos[0] || "");
    setIsApproved(rev.isApproved ?? true);
    setError("");
    setIsDrawerOpen(true);
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
        showToast(!currentStatus ? "Review approved and published live!" : "Review moved to pending queue.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setError("Customer name and review comment are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: any = {
        authorName: authorName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        isApproved,
        photoUrls: photoUrl ? JSON.stringify([photoUrl]) : null,
      };

      if (editingReview) {
        const res = await fetch(`/api/reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update review.");

        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? data.review : r))
        );
        showToast("Review successfully updated!");
      } else {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add review.");

        setReviews((prev) => [data.review, ...prev]);
        showToast("New review published!");
      }

      setIsDrawerOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete review from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review.");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast(`Review from "${name}" was deleted.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete review.");
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const approved = reviews.filter((r) => r.isApproved).length;
    const pending = reviews.filter((r) => !r.isApproved).length;
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
        : "5.0";
    return { total: reviews.length, approved, pending, avgRating };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterStatus === "APPROVED" && !r.isApproved) return false;
      if (filterStatus === "PENDING" && r.isApproved) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.authorName || "").toLowerCase().includes(q);
        const matchesComment = (r.comment || "").toLowerCase().includes(q);
        if (!matchesName && !matchesComment) return false;
      }
      return true;
    });
  }, [reviews, filterStatus, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Customer Reviews & Testimonials"
        description="Moderate, curate, and showcase traveler feedback and 5-star Google & TripAdvisor reviews."
        badge={`${metrics.total} Reviews`}
        breadcrumbs={[{ label: "Reviews" }]}
        actions={
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Review</span>
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatsCard
          label="Total Reviews"
          value={metrics.total}
          icon={<MessageSquare className="w-4 h-4" />}
          subtitle="All guest testimonials"
          theme="slate"
        />
        <AdminStatsCard
          label="Approved / Live"
          value={metrics.approved}
          icon={<CheckCircle2 className="w-4 h-4" />}
          subtitle="Displayed on website"
          theme="emerald"
        />
        <AdminStatsCard
          label="Pending Moderation"
          value={metrics.pending}
          icon={<AlertCircle className="w-4 h-4" />}
          subtitle="Awaiting review approval"
          theme="amber"
        />
        <AdminStatsCard
          label="Average Rating"
          value={`${metrics.avgRating} ★`}
          icon={<Star className="w-4 h-4" />}
          subtitle="Across all expeditions"
          theme="purple"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search traveler name, review content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.map((rev) => {
          const photos = safeJsonParse<string[]>(rev.photoUrls, []);
          const photo = photos[0];

          return (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Author + Star Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      {rev.authorName ? rev.authorName.substring(0, 2).toUpperCase() : "G"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {rev.authorName || "Verified Traveler"}
                        </h4>
                        {rev.emailVerified && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Verified Email
                          </span>
                        )}
                        {rev.isVerifiedCustomer && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            ★ Verified Customer
                          </span>
                        )}
                      </div>
                      {rev.authorEmail && (
                        <p className="text-[10px] text-slate-400 font-mono truncate">{rev.authorEmail}</p>
                      )}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (rev.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleApprove(rev.id, rev.isApproved)}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition ${
                      rev.isApproved
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 animate-pulse"
                    }`}
                  >
                    {rev.isApproved ? "● Live" : "○ Pending"}
                  </button>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Optional traveler photo */}
                {photo && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={photo} alt="Review attachment" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Edit Review"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id, rev.authorName)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Form for Add / Edit Review */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingReview ? "Edit Customer Review" : "Add Customer Testimonial"}
        subtitle="Manage public visitor reviews displayed across destination and package pages."
        width="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : editingReview ? "Update Review" : "Publish Review"}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Customer / Author Name *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Jessica Miller (Netherlands)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-black text-amber-600 ml-2">{rating} Stars</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              Review Comment *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the traveler's experience with the Blue Fire, guide, and transport..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Guest Photo Attachment (Optional)
            </label>
            <ImageUpload
              value={photoUrl}
              onChange={(url) => setPhotoUrl(url)}
              folder="reviews"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Approve and publish to website immediately
              </span>
            </label>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
