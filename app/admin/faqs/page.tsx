"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Plus, Trash2, AlertCircle } from "lucide-react";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");

  const loadFaqs = () => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.faqs) {
          setFaqs(data.faqs);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save FAQ.");

      setFaqs([...faqs, data.faq]);
      setQuestion("");
      setAnswer("");
    } catch (err: any) {
      setError(err.message || "Failed to save FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ entry?")) return;

    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaqs(faqs.filter((f) => f.id !== id));
      } else {
        alert("Failed to delete FAQ.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Help Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary-950 tracking-tight">
          Manage Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-secondary-600 mt-1">
          Questions and answers helping travelers understand tour details before booking.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100 mb-6">
          Add New Question
        </h2>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddFaq} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">Question *</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Are gas masks provided during the hike?"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary-800 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="safety">Safety</option>
                <option value="preparation">Preparation</option>
                <option value="booking">Booking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-800 mb-1.5">Full Answer *</label>
            <textarea
              required
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide an informative and friendly explanation..."
              className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-xs text-secondary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? "Saving..." : "Save FAQ"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-secondary-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-black text-secondary-950 uppercase tracking-wider pb-3 border-b border-secondary-100">
          Active FAQ List ({faqs.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary-400">
            No FAQs saved yet. Add a new question above.
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="p-4 sm:p-5 rounded-2xl bg-secondary-50 border border-secondary-200/70 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider bg-primary-100 px-2 py-0.5 rounded">
                  {faq.category}
                </span>
                <h3 className="font-bold text-sm text-secondary-950">{faq.question}</h3>
                <p className="text-xs text-secondary-600 leading-relaxed">{faq.answer}</p>
              </div>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 shrink-0 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
