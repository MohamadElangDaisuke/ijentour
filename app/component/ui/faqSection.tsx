"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";

interface FaqItem {
  q: string;
  a: string;
}

const defaultFaqs: FaqItem[] = [
  {
    q: "How long does it take to hike to the summit of Mount Ijen?",
    a: "The trek from the Paltuding basecamp to the summit rim is approximately 3 km (1.8 miles), taking 1.5 to 2 hours at an easy, moderate pace along a wide dirt trail. If you wish to descend to the crater floor to see the Blue Fire up close, it requires an additional 30–45 minutes down a rocky path.",
  },
  {
    q: "Are respirator gas masks and safety gear provided?",
    a: "Yes! All our Mount Ijen tour packages include standard certified respirator gas masks and headlamps. Our local guides also carry backup masks, eye protection, and first-aid supplies.",
  },
  {
    q: "When is the best time to see the Blue Fire phenomenon?",
    a: "The Blue Fire can only be witnessed in pitch darkness between 2:00 AM and 4:30 AM before sunrise. Midnight tours typically depart from Banyuwangi between 12:00 AM and 12:30 AM.",
  },
  {
    q: "What if I cannot complete the hike on foot?",
    a: "Traditional 'trolley / cart' services pulled and pushed by experienced local miners are available at Paltuding. You can rent a trolley for the ascent, descent, or round trip at standard local rates (we can assist in pre-arranging this for you).",
  },
  {
    q: "Is pickup available from hotels, train stations, or the airport?",
    a: "Absolutely! We provide complimentary round-trip transfers across Banyuwangi City, Banyuwangi Kota Station, Ketapang Station, Blimbingsari Airport, and Ketapang Ferry Port for travelers arriving from Bali.",
  },
  {
    q: "What is your booking procedure and cancellation/reschedule policy?",
    a: "Bookings can be made online via our website or directly through WhatsApp. You can reschedule free of charge with at least 24 hours prior notice, subject to crater volcanic safety conditions.",
  },
];

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.faqs) && data.faqs.length > 0) {
          const mapped: FaqItem[] = data.faqs.map((f: any) => ({
            q: f.question,
            a: f.answer,
          }));
          setFaqs(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const listToRender = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section id="faq" className="relative overflow-hidden bg-white px-4 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-secondary-950 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-secondary-700 leading-relaxed">
            Everything you need to know before your adventure to Mount Ijen.
          </p>
        </div>

        <div className="space-y-3.5">
          {listToRender.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-secondary-50 rounded-2xl border border-secondary-200/80 overflow-hidden shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="font-bold text-sm sm:text-base text-secondary-950 flex-1 text-center sm:text-left">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-secondary-200/70 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary-500 text-secondary-950" : "text-secondary-700"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-secondary-600 leading-relaxed border-t border-secondary-200/60 mt-1 text-center sm:text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help Banner */}
        <div className="mt-12 p-6 sm:p-7 rounded-3xl bg-secondary-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-secondary-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center shrink-0">
              <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Have more questions about your trip?</h4>
              <p className="text-xs text-secondary-300">Our local guide team is ready to assist you on WhatsApp 24/7.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-black text-xs transition shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageCircleQuestion className="w-4 h-4" />
              <span>Ask Tour Assistant</span>
            </button>
            <a
              href={getWhatsAppLink(WhatsAppTemplates.generalInquiry())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition shadow-md hover:scale-105 active:scale-95"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
