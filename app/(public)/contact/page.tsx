"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, ChevronDown, Sparkles
} from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { OFFICIAL_SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // FAQ state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
      })
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: subject || "Travel Inquiry",
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "An error occurred, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-secondary-950 bg-secondary-50 min-h-screen flex flex-col">
      {/* HERO SECTION */}
      <section className="relative h-[40vh] min-h-75 flex items-center justify-center text-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/the-best-view-of-kawah.webp')" }}
        >
          <div className="absolute inset-0 bg-secondary-950/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Contact Us
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Have questions about tour packages, custom itineraries, or need assistance? Our team is here to help your adventure.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden">
          {/* LEFT COLUMN - CONTACT INFORMATION */}
          <div className="bg-secondary-950 text-white p-8 md:p-12">
            <h2 className="text-3xl font-black text-white mb-6">Contact Information</h2>
            <p className="text-secondary-200 mb-10 leading-relaxed">
              Reach out via the form or through our direct channels below. We will respond promptly.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <MapPin size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Office Address</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">
                    Jl. Raya Ijen No. 45, Licin<br />
                    <span translate="no" className="notranslate">Banyuwangi</span>, East Java 68454, Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <Phone size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Phone / WhatsApp</h4>
                  <a
                    href={getWhatsAppLink(WhatsAppTemplates.generalInquiry())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-200 hover:text-primary-400 text-sm leading-relaxed block transition"
                  >
                    +{getAdminWhatsAppNumber()} (24/7 Support)
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <Mail size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Email</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">info@ijentour.com<br />booking@ijentour.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <Clock size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Operating Hours</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">Monday - Sunday: 08:00 - 22:00 WIB<br />Emergency Support: 24/7</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mr-4 border border-primary-500/40 text-primary-400">
                  <Sparkles size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Ijen Tour Assistant</h4>
                  <p className="text-secondary-300 text-xs mb-2">Instant answers to tour prices, departure hours, and equipment questions.</p>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-secondary-950 text-xs font-black transition cursor-pointer"
                  >
                    <span>Open Chat Assistant</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-secondary-800">
              <h4 className="font-bold text-white mb-4">Official Social Media</h4>
              <div className="flex space-x-4">
                <a
                  href={OFFICIAL_SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition"
                >
                  <FaFacebook size={18} />
                </a>
                <a
                  href={OFFICIAL_SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition"
                >
                  <FaYoutube size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - CONTACT FORM WITH BACKEND INTEGRATION */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-secondary-950 mb-6">Send a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Message Sent Successfully!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Thank you for contacting Ijen Tour. Our travel specialists will get in touch with you via WhatsApp/Email shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Select Package (Optional)</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  >
                    <option value="">Select Subject / Tour Package...</option>
                    <option value="Midnight Expedition Blue Fire Ijen">Midnight Expedition Blue Fire Ijen</option>
                    <option value="Bromo & Ijen Crater Sunrise Combo">Bromo & Ijen Crater Sunrise Combo</option>
                    <option value="Private Crater Lake & Waterfall Tour">Private Crater Lake & Waterfall Tour</option>
                    <option value="Kawah Wurung & Djawatan Green Escape">Kawah Wurung & Djawatan Green Escape</option>
                    <option value="Bali to Ijen Overnight Overland">Bali to Ijen Overnight Overland</option>
                    <option value="Custom / Special Private Tour">Custom / Special Private Tour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-800 mb-2">Message or Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your questions or specific travel requirements here..."
                  className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-secondary-950 font-extrabold py-4 rounded-xl shadow-xs hover:shadow transition duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>SENDING MESSAGE...</span>
                  </>
                ) : (
                  <>
                    <span>SEND MESSAGE NOW</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ ACCORDION SECTION */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-secondary-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 block mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-secondary-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-secondary-600 mt-2">
              Quick answers to essential questions regarding the hike, tickets, and safety.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {(faqs.length > 0 ? faqs : [
              {
                id: "faq-1",
                question: "Is the Blue Fire phenomenon visible every night?",
                answer: "The Blue Fire is an active natural phenomenon present year-round, provided the crater is not temporarily closed by authorities for volcanic activity or heavy rains. Our guides monitor official PVMBG volcanic status before every departure.",
                category: "general"
              },
              {
                id: "faq-2",
                question: "Is hiking Mount Ijen safe for children or seniors?",
                answer: "It is very safe with appropriate preparation. The main trail is wide and well-trodden. Licensed local trolley taxis (gerobak dorong) are also available if walking is difficult.",
                category: "safety"
              },
              {
                id: "faq-3",
                question: "What time is pickup and what should we bring?",
                answer: "Midnight Blue Fire pickups take place between 12:00 AM and 12:30 AM from Banyuwangi hotels. Bring a warm jacket, trekking/running shoes, and an ID card or passport. Certified gas respirators and headlamps are provided.",
                category: "preparation"
              },
              {
                id: "faq-4",
                question: "How do I book and confirm payment?",
                answer: "Select your preferred package on our Tour Packages page and click book via WhatsApp or submit our online booking form. Our team will send an official confirmation invoice and digital voucher.",
                category: "booking"
              }
            ]).map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="rounded-2xl border border-secondary-200/80 overflow-hidden bg-secondary-50/50 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-secondary-950 hover:text-primary-600 transition cursor-pointer"
                  >
                    <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-secondary-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary-600" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-secondary-700 leading-relaxed border-t border-secondary-100/60 pt-3 bg-white/70">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* EMBED GOOGLE MAPS */}
        <div className="mt-16 bg-white rounded-3xl p-4 shadow-sm border border-secondary-100 overflow-hidden h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126388.94828135892!2d114.28654874457497!3d-8.23249051833513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd154fb4a654c67%3A0xb6146c86720f4c39!2sKawah%20Ijen!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Banyuwangi"
          ></iframe>
        </div>
      </main>
    </div>
  );
}