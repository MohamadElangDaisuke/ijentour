'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const whatsappNumber = '6281234567890';
const whatsappMessage = encodeURIComponent('Halo Ijen Tour, saya ingin bertanya tentang paket wisata Kawah Ijen.');

export default function WhatsAppFloat() {
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {!heroVisible && (
        <motion.a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi Ijen Tour melalui WhatsApp"
          title="Chat WhatsApp Ijen Tour"
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          exit={{ opacity: 0, scale: 0.7, y: 30 }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeInOut' },
            scale: { duration: 0.5, ease: 'easeInOut' },
            y: {
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-[#25D366]/30 transition-colors hover:bg-[#1ebe5b] hover:shadow-2xl hover:shadow-[#25D366]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Chat WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
