'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from '@/lib/whatsapp';

export default function Footer() {
  const pathname = usePathname();

  // Hide global footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Global Footer */}
      <footer className="mt-auto border-t border-secondary-200/80 bg-white pt-16 pb-8 text-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center space-x-1 text-2xl font-black text-secondary-950">
              <span>Ijen</span><span className="font-extrabold text-primary-500">Tour</span>
            </Link>
            <p className="text-sm leading-relaxed text-secondary-600">
              Penyedia jasa tur profesional terpercaya khusus di wilayah Kawah Ijen, Taman Nasional Baluran, Gunung Bromo, dan sekitarnya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-primary-500 transition-colors">Beranda</Link></li>
              <li><Link href="/packages" className="hover:text-primary-500 transition-colors">Paket Wisata</Link></li>
              <li><Link href="/destinations" className="hover:text-primary-500 transition-colors">Destinasi</Link></li>
              <li><Link href="/gallery" className="hover:text-primary-500 transition-colors">Galeri Wisata</Link></li>
              <li><Link href="/booking" className="hover:text-primary-500 transition-colors">Cek Status Booking</Link></li>
              <li><Link href="/about" className="hover:text-primary-500 transition-colors">Tentang Kami</Link></li>
              <li><Link href="/about#faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="hover:text-primary-500 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary-500 transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Kontak Kami</h4>
            <ul className="space-y-4 text-sm text-secondary-600">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-0.5 shrink-0 text-primary-500" />
                <span>Jl. Raya Ijen No. 45, <span translate="no" className="notranslate">Banyuwangi</span>,<br />Jawa Timur</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 shrink-0 text-primary-500" />
                <a
                  href={getWhatsAppLink(WhatsAppTemplates.generalInquiry())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-500 transition-colors"
                >
                  +{getAdminWhatsAppNumber()} (WhatsApp 24/7)
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 shrink-0 text-primary-500" />
                <a href="mailto:info@ijentour.com" className="hover:text-primary-500 transition-colors">
                  info@ijentour.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Ikuti Kami</h4>
            <div className="flex space-x-3">
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary-200 bg-secondary-50 text-secondary-700 hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950 transition-all">
                <FaInstagram size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary-200 bg-secondary-50 text-secondary-700 hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950 transition-all">
                <FaFacebook size={16} />
              </a>
              <a href="#" aria-label="Youtube" className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary-200 bg-secondary-50 text-secondary-700 hover:border-primary-500 hover:bg-primary-500 hover:text-secondary-950 transition-all">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-secondary-200/80 px-4 pt-6 text-center text-xs text-secondary-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} IjenTour. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
