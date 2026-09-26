"use client";

import { useState, useEffect } from "react";
import { Users, ShieldCheck, Crown, Compass, User, Search, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setMessage(`Role berhasil diperbarui menjadi ${newRole}`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert("Gagal memperbarui role.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Hapus pengguna ${name}?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Hak Akses & Otorisasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Kelola Pengguna & Peran (Roles)
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Atur permission untuk role <strong>Customer</strong>, <strong>Customer Pro</strong>, <strong>Mitra</strong>, dan <strong>Admin</strong>.
          </p>
        </div>

        <span className="text-xs font-bold bg-primary-100 text-primary-800 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          Total {users.length} Akun Terdaftar
        </span>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-secondary-200 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "Semua Role", val: "ALL" },
            { label: "Customer", val: "CUSTOMER" },
            { label: "Customer Pro", val: "CUSTOMER_PRO" },
            { label: "Mitra Guide", val: "MITRA" },
            { label: "Admin", val: "ADMIN" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setRoleFilter(tab.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                roleFilter === tab.val
                  ? "bg-secondary-950 text-white shadow-2xs"
                  : "bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-3.5 h-3.5 text-secondary-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-secondary-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-secondary-500">
            Tidak ada akun yang sesuai dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-100 text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Email & Kontak</th>
                  <th className="py-4 px-6">Peran (Role) Saat Ini</th>
                  <th className="py-4 px-6">Ubah Hak Akses</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-800 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-secondary-950">{u.name}</p>
                          <span className="text-[10px] text-secondary-500 font-mono">
                            {u.nationality || "Indonesia"} • {u._count?.bookings || 0} booking
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-secondary-900">{u.email}</p>
                      <span className="text-[11px] text-secondary-500">{u.phone || "-"}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : u.role === "CUSTOMER_PRO"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : u.role === "MITRA"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-secondary-100 text-secondary-800"
                        }`}
                      >
                        {u.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                        {u.role === "CUSTOMER_PRO" && <Crown className="w-3 h-3 text-amber-600" />}
                        {u.role === "MITRA" && <Compass className="w-3 h-3 text-blue-600" />}
                        {u.role === "CUSTOMER" && <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs font-bold text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="CUSTOMER_PRO">Customer Pro (VIP)</option>
                        <option value="MITRA">Mitra (Guide)</option>
                        <option value="ADMIN">Admin Panel</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
