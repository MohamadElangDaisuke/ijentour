"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  UserCheck,
  Star,
  CheckCircle,
  Shield,
} from "lucide-react";
import { AdminCardListSkeleton } from "@/app/component/ui/skeleton";

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

  // Edit state
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Staff name is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    const payload = {
      name: name.trim(),
      role: role.trim() || "Tour Guide",
      specialty: specialty.trim() || null,
      description: description.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      experience: experience.trim() || "5+ Tahun",
      languages: languages.trim() || "Bahasa Indonesia, English",
      rating: parseFloat(rating) || 5.0,
      badge: badge.trim() || null,
      phone: phone.trim() || null,
      isFeatured,
      isActive,
      sortOrder: parseInt(sortOrder) || 1,
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

        setStaffList(
          staffList.map((s) => (s.id === editingId ? data.staff : s))
        );
        setSuccessMsg("Staff member updated successfully!");
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create staff.");

        setStaffList([...staffList, data.staff]);
        setSuccessMsg("New tour guide added successfully!");
      }

      resetForm();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, staffName: string) => {
    if (!confirm(`Delete tour guide "${staffName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStaffList(staffList.filter((s) => s.id !== id));
        if (editingId === id) resetForm();
      } else {
        alert("Failed to delete staff member.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting staff member.");
    }
  };

  const activeCount = staffList.filter((s) => s.isActive).length;
  const featuredCount = staffList.filter((s) => s.isFeatured && s.isActive).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Team & Field Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight dark:text-white">
          Manage Tour Guides & Staff
        </h1>
        <p className="text-xs sm:text-sm text-secondary-600 mt-1 dark:text-secondary-300">
          Kelola data pemandu wisata lokal, mantan penambang belerang, dan tim lapangan yang ditampilkan di section Tour Guides homepage.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-secondary-500 font-medium">Total Staff / Guides</p>
          <p className="text-2xl font-black text-secondary-950 dark:text-white mt-1">
            {staffList.length}
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-secondary-500 font-medium">Active on Site</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-secondary-500 font-medium">Featured Guides</p>
          <p className="text-2xl font-black text-primary-600 mt-1">
            {featuredCount}
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-secondary-500 font-medium">Avg Guide Rating</p>
          <p className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            5.0
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 border border-secondary-200/80 dark:border-secondary-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-secondary-100 dark:border-secondary-800 mb-6">
          <h2 className="text-base font-black text-secondary-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary-600" />
            {editingId ? "Edit Staff / Tour Guide" : "Add New Tour Guide"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-secondary-500 hover:text-secondary-800"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Pak Slamet Raharjo"
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Mountain Guide / Birding Guide"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Specialty / Expertise
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Blue Fire & Crater Specialist / Birding Ecology"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Badge / License
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="HPI Certified & Former Miner / Lisensi BNSP"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Photo URL / Avatar
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... atau /images/..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="5+ Tahun / 12 Tahun"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Bahasa Indonesia, English"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
              Bio / Experience Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan latar belakang, pengetahuan jalur, dan pengalaman unik pemandu wisata ini..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 822-6817-7188"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Rating (1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-secondary-800 dark:text-secondary-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-secondary-800 dark:text-secondary-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                Featured
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-secondary-300 text-xs font-bold text-secondary-700 hover:bg-secondary-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting
                ? "Saving..."
                : editingId
                ? "Update Tour Guide"
                : "Add Tour Guide"}
            </button>
          </div>
        </form>
      </div>

      {/* Guide List */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-secondary-950 dark:text-white uppercase tracking-wider">
          Active Team Members ({staffList.length})
        </h2>

        {loading ? (
          <AdminCardListSkeleton count={4} />
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200 dark:border-secondary-800 text-secondary-500 text-sm">
            No tour guides or staff members registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((guide) => (
              <div
                key={guide.id}
                className={`p-5 rounded-2xl border transition bg-white dark:bg-secondary-900 ${
                  guide.isActive
                    ? "border-secondary-200 dark:border-secondary-800 shadow-2xs"
                    : "border-red-200 bg-red-50/20 opacity-75"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-primary-500/40 bg-secondary-100 flex items-center justify-center">
                    {guide.avatarUrl ? (
                      <img
                        src={guide.avatarUrl}
                        alt={guide.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-8 h-8 text-secondary-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-secondary-950 dark:text-white truncate">
                        {guide.name}
                      </h3>
                      {guide.isActive ? (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                      ) : (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-red-400" title="Inactive" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-primary-600 truncate">
                      {guide.specialty || guide.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-secondary-500">
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {guide.rating}
                      </span>
                      <span>•</span>
                      <span>{guide.experience || "5+ Thn"}</span>
                    </div>
                  </div>
                </div>

                {guide.description && (
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-3 line-clamp-2 leading-relaxed">
                    {guide.description}
                  </p>
                )}

                {guide.badge && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2.5 py-1 rounded-md w-fit">
                    <Shield className="w-3 h-3 text-primary-600" />
                    <span>{guide.badge}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-secondary-400 font-medium">
                    Order #{guide.sortOrder}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(guide)}
                      className="p-1.5 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition"
                      title="Edit guide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id, guide.name)}
                      className="p-1.5 rounded-lg text-secondary-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Delete guide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
