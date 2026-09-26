"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Clock, MessageSquare, Check, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Inbox Masuk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
            Pesan Kontak & Pertanyaan
          </h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Pesan pertanyaan yang dikirimkan oleh pengunjung melalui formulir kontak website.
          </p>
        </div>

        <span className="text-xs font-bold bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full self-start sm:self-auto">
          {contacts.length} Pesan Masuk
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-20 text-center text-xs text-secondary-400">
            Belum ada pesan kontak yang diterima.
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-5 sm:p-6 rounded-2xl bg-secondary-50 border border-secondary-200/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-secondary-200/60 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-secondary-950">{c.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-secondary-500 mt-0.5">
                      <span>Email: {c.email}</span>
                      {c.phone && <span>• Telp: {c.phone}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary-400">
                    {new Date(c.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-primary-700 block mb-1">
                    Subjek: {c.subject}
                  </span>
                  <p className="text-xs sm:text-sm text-secondary-700 leading-relaxed bg-white p-4 rounded-xl border border-secondary-200/60">
                    "{c.message}"
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <a
                    href={`mailto:${c.email}?subject=Balasan:%20${encodeURIComponent(c.subject)}`}
                    className="px-4 py-2 rounded-xl bg-secondary-950 hover:bg-secondary-900 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Balas via Email</span>
                  </a>
                  {c.phone && (
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
