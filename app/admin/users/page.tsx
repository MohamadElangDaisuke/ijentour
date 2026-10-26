"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
} from "lucide-react";
import { AdminTableSkeleton } from "@/app/component/ui/skeleton";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setIsActive(true);
    setError("");
  };

  const openEditModal = (u: any) => {
    setModalMode("edit");
    setEditingUser(u);
    setName(u.name || "");
    setEmail(u.email || "");
    setPassword("");
    setPhone(u.phone || "");
    setIsActive(u.isActive ?? true);
    setError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingUser(null);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (modalMode === "create") {
        if (!name || !email || !password) {
          throw new Error("Nama, email, dan kata sandi wajib diisi.");
        }

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat akun admin.");

        setUsers((prev) => [...prev, data.user]);
        setSuccessMessage("Akun administrator baru berhasil dibuat!");
      } else if (modalMode === "edit" && editingUser) {
        const payload: any = { name, phone, isActive };
        if (password.trim()) payload.password = password.trim();

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui akun.");

        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data.user : u))
        );
        setSuccessMessage("Akun administrator berhasil diperbarui!");
      }

      closeModal();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (currentAdmin?.id === id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.");
      return;
    }

    if (!confirm(`Hapus akun admin "${userName}"? Akun ini tidak akan bisa login lagi.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun.");

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccessMessage("Akun administrator berhasil dihapus.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus akun.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Keamanan & Hak Akses
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Manajemen Akun Administrator
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Kelola staf administrator yang memiliki hak akses penuh ke panel CMS Ijen Tour.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Admin Baru</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-200/80 text-secondary-900 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Kebijakan Keamanan:</strong> Registrasi akun admin bersifat tertutup untuk publik. Akun baru hanya dapat ditambahkan oleh administrator yang sudah terautentikasi melalui panel ini. Seluruh kata sandi diamankan dengan algoritma hash modern (Bcrypt).
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <AdminTableSkeleton columns={6} rows={4} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden py-20 text-center text-xs text-secondary-500">
          Tidak ada akun admin.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nama & Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Kontak / Telepon</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6">Tanggal Dibuat</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-secondary-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-950 text-white font-black flex items-center justify-center shrink-0 text-xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-secondary-950">{u.name}</p>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-extrabold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-secondary-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-900 text-white">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-secondary-700 font-medium">
                        {u.phone || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.isActive ? "✓ Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-secondary-500">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-xl bg-primary-100 hover:bg-primary-200 text-primary-800 inline-block transition cursor-pointer"
                          title="Sunting Akun"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            title="Hapus Akun"
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
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-secondary-200 shadow-2xl relative my-8 text-secondary-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-100 mb-6">
              <h2 className="text-xl font-black text-secondary-950">
                {modalMode === "create" ? "Tambah Akun Admin Baru" : `Sunting Akun: ${editingUser?.name}`}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-secondary-100 text-secondary-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Alamat Email {modalMode === "create" && "*"}
                </label>
                <input
                  type="email"
                  required={modalMode === "create"}
                  disabled={modalMode === "edit"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin2@mountijentour.com"
                  className={`w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    modalMode === "edit" ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary-800 mb-1.5">
                  {modalMode === "create" ? "Kata Sandi *" : "Ubah Kata Sandi (Kosongkan jika tidak diganti)"}
                </label>
                <input
                  type="password"
                  required={modalMode === "create"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {modalMode === "edit" && editingUser?.id !== currentAdmin?.id && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-secondary-800 cursor-pointer">
                    Akun Aktif (Dapat Login)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-secondary-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-secondary-200 bg-white hover:bg-secondary-100 text-secondary-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Menyimpan..." : "Simpan Akun"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
