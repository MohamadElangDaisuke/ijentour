"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, HelpCircle, ChevronDown
} from "lucide-react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

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
      setError("Silakan lengkapi nama, email, dan pesan Anda.");
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
          subject: subject || "Pertanyaan Perjalanan",
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, silakan coba lagi.");
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
            Hubungi Kami
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Punya pertanyaan seputar paket tur, penyesuaian itinerary, atau butuh bantuan? Tim kami siap membantu petualangan Anda.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden">
          {/* KOLOM KIRI - INFORMASI KONTAK */}
          <div className="bg-secondary-950 text-white p-8 md:p-12">
            <h2 className="text-3xl font-black text-white mb-6">Informasi Kontak</h2>
            <p className="text-secondary-200 mb-10 leading-relaxed">
              Silakan hubungi kami melalui formulir di samping atau melalui kontak di bawah ini. Kami akan membalas pesan Anda sesegera mungkin.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <MapPin size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Alamat Kantor</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">
                    Jl. Raya Ijen No. 45, Licin<br />
                    <span translate="no" className="notranslate">Banyuwangi</span>, Jawa Timur 68454
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-secondary-900 flex items-center justify-center shrink-0 mr-4 border border-secondary-800">
                  <Phone size={24} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Telepon / WhatsApp</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">+62 822-6817-7188<br />+62 898-7654-3210</p>
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
                  <h4 className="font-bold text-white mb-1">Jam Operasional</h4>
                  <p className="text-secondary-200 text-sm leading-relaxed">Senin - Minggu: 08:00 - 22:00 WIB<br />Layanan Darurat: 24/7</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-secondary-800">
              <h4 className="font-bold text-white mb-4">Media Sosial</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition">
                  <FaFacebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-900 flex items-center justify-center hover:bg-primary-500 hover:text-secondary-950 transition">
                  <FaYoutube size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN - FORMULIR KONTAK DENGAN BACKEND INTEGRATION */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-secondary-950 mb-6">Kirim Pesan</h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Pesan Berhasil Dikirim!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Terima kasih telah menghubungi Ijen Tour. Tim konsultan perjalanan kami akan menghubungi Anda via WhatsApp/Email segera.
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
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budi@example.com"
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-800 mb-2">Pilihan Paket (Opsional)</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition"
                  >
                    <option value="">Pilih Subjek / Paket Tur...</option>
                    <option value="Midnight Expedition Blue Fire Ijen">Midnight Expedition Blue Fire Ijen</option>
                    <option value="Bromo & Ijen Crater Sunrise Combo">Bromo & Ijen Crater Sunrise Combo</option>
                    <option value="Private Crater Lake & Waterfall Tour">Private Crater Lake & Waterfall Tour</option>
                    <option value="Kawah Wurung & Djawatan Green Escape">Kawah Wurung & Djawatan Green Escape</option>
                    <option value="Bali to Ijen Overnight Overland">Bali to Ijen Overnight Overland</option>
                    <option value="Kustom / Private Tour Spesial">Paket Kustom / Private Tour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-800 mb-2">Pesan atau Pertanyaan *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau kebutuhan spesifik perjalanan Anda di sini..."
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
                    <span>MENGIRIMKAN PESAN...</span>
                  </>
                ) : (
                  <>
                    <span>KIRIM PESAN SEKARANG</span>
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
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-secondary-600 mt-2">
              Jawaban cepat untuk hal-hal penting seputar pendakian, tiket, dan keselamatan sebelum memulai tur.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {(faqs.length > 0 ? faqs : [
              {
                id: "faq-1",
                question: "Apakah fenomena Blue Fire selalu bisa dilihat setiap malam?",
                answer: "Fenomena Blue Fire adalah proses alamiah yang aktif setiap malam sepanjang tahun, asalkan kawah tidak ditutup karena aktivitas vulkanik atau hujan lebat yang memadamkan api. Pemandu kami memantau kondisi PVMBG sebelum berangkat.",
                category: "general"
              },
              {
                id: "faq-2",
                question: "Apakah aman mendaki Kawah Ijen bersama anak-anak atau lansia?",
                answer: "Sangat aman dengan persiapan yang tepat. Jalur pendakian cukup lebar. Tersedia jasa troli dorong lokal (trolley taxi) berlisensi jika tidak kuat mendaki jalan kaki.",
                category: "safety"
              },
              {
                id: "faq-3",
                question: "Kapan waktu penjemputan dan apa saja yang perlu kami bawa?",
                answer: "Penjemputan Midnight Blue Fire dilakukan antara pukul 00:00 - 00:30 WIB dini hari dari hotel di Banyuwangi. Cukup bawa jaket hangat, sepatu kets, dan kartu identitas. Masker respirator dan senter kami sediakan.",
                category: "preparation"
              },
              {
                id: "faq-4",
                question: "Bagaimana cara melakukan pemesanan dan konfirmasi pembayaran?",
                answer: "Pilih paket tur di halaman Packages, lalu klik pesan via WhatsApp atau isi form booking online. Tim kami akan mengirimkan invoice resmi dan tiket digital.",
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