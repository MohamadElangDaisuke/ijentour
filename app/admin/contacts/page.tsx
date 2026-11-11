"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Eye,
  ExternalLink,
  Phone,
  Send,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { AdminCardListSkeleton } from "@/app/component/ui/skeleton";
import AdminPageHeader from "@/app/component/admin/AdminPageHeader";
import AdminStatsCard from "@/app/component/admin/AdminStatsCard";
import AdminDrawer from "@/app/component/admin/AdminDrawer";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadContacts = () => {
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContacts(data.contacts || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete contact message from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (selectedContact?.id === id) setSelectedContact(null);
        showToast(`Message from "${name}" deleted.`);
      } else {
        alert("Failed to delete contact message.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    return { total: contacts.length };
  }, [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || "").toLowerCase().includes(q);
        const matchesEmail = (c.email || "").toLowerCase().includes(q);
        const matchesSubj = (c.subject || "").toLowerCase().includes(q);
        const matchesMsg = (c.message || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubj && !matchesMsg) return false;
      }
      return true;
    });
  }, [contacts, searchQuery]);

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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title="Inbox & Inbound Inquiries"
        description="Review traveler questions, booking assistance inquiries, and partnership messages sent from the website contact desk."
        badge={`${metrics.total} Messages`}
        breadcrumbs={[{ label: "Inbox Messages" }]}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminStatsCard
          label="Total Inbound Messages"
          value={metrics.total}
          icon={<Mail className="w-4 h-4" />}
          subtitle="All inquiries received via contact form"
          theme="slate"
        />
        <AdminStatsCard
          label="Response Channels"
          value="WhatsApp & Email"
          icon={<MessageSquare className="w-4 h-4" />}
          subtitle="Direct one-click reply buttons"
          theme="teal"
        />
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sender name, email, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-900 dark:text-white">{filteredContacts.length}</strong> messages
        </span>
      </div>

      {/* Contacts List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContact(c)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      {c.name ? c.name.substring(0, 2).toUpperCase() : "IN"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {c.name || "Anonymous Sender"}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Recent"}
                  </span>
                </div>

                {/* Subject */}
                {c.subject && (
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Subject: {c.subject}
                  </p>
                )}

                {/* Message Excerpt */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  {c.message}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  #{c.id.substring(0, 8)}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || "Mount Ijen Tour Inquiry")}`}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    title="Reply via Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-xs">No inquiries matching your search.</p>
          </div>
        )}
      </div>

      {/* Message Detail Drawer */}
      <AdminDrawer
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact ? `Inquiry from ${selectedContact.name}` : ""}
        subtitle={selectedContact?.subject || "Website Contact Form Submission"}
        width="md"
        footer={
          selectedContact && (
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(
                  selectedContact.subject || "Mount Ijen Tour Inquiry"
                )}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply by Email</span>
              </a>
              <button
                type="button"
                onClick={() => handleDelete(selectedContact.id, selectedContact.name)}
                className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 font-bold text-xs"
              >
                Delete
              </button>
            </div>
          )
        }
      >
        {selectedContact && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Sender Name</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedContact.name || "Traveler"}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Address</span>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="font-bold text-amber-600 hover:underline block"
                >
                  {selectedContact.email || "-"}
                </a>
              </div>

              {selectedContact.phone && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone / WhatsApp</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedContact.phone}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Submission Date</span>
                <p className="font-medium text-slate-600 dark:text-slate-400">
                  {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString("en-US") : "Recent"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Full Message Content
              </span>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {selectedContact.message}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
