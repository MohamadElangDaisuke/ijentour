'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from '@/lib/whatsapp';
import { OFFICIAL_SOCIAL_LINKS } from '@/lib/constants';

const articleCategories = [
  'Guides',
  'Tips & Tricks',
  'Local Culture',
  'Destinations',
  'Culinary',
  'Ijen Insights',
];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center transition-transform hover:scale-105" aria-label="Mount Ijen Tour Home">
              <img
                src="/images/logo-light.png"
                alt="Mount Ijen Tour and Trip Organizer"
                className="h-12 w-auto object-contain dark:hidden sm:h-14"
              />
              <img
                src="/images/logo-dark.png"
                alt="Mount Ijen Tour and Trip Organizer"
                className="hidden h-12 w-auto object-contain dark:block sm:h-14"
              />
            </Link>
            <p className="text-sm leading-relaxed text-secondary-600">
              Trusted professional tour service specializing in Mount Ijen Crater, Baluran National Park, Mount Bromo, and surrounding destinations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
              <li><Link href="/packages" className="hover:text-primary-500 transition-colors">Tour Packages</Link></li>
              <li><Link href="/destinations" className="hover:text-primary-500 transition-colors">Destinations</Link></li>
              <li><Link href="/gallery" className="hover:text-primary-500 transition-colors">Travel Gallery</Link></li>
              <li><Link href="/booking" className="hover:text-primary-500 transition-colors">Check Booking Status</Link></li>
              <li><Link href="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link href="/about#faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="hover:text-primary-500 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Article Categories */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Explore by Interest</h4>
            <ul className="space-y-2.5 text-sm">
              {articleCategories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    className="hover:text-primary-500 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Contact Us</h4>
            <ul className="space-y-4 text-sm text-secondary-600">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 mt-0.5 shrink-0 text-primary-500" />
                <span>Jl. Raya Ijen No. 45, <span translate="no" className="notranslate">Banyuwangi</span>,<br />East Java, Indonesia</span>
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
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary-950">Follow Us</h4>
            <div className="flex space-x-3">
              <a
                href={OFFICIAL_SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 hover:bg-primary-500 hover:text-secondary-950 transition-all shadow-2xs"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 hover:bg-primary-500 hover:text-secondary-950 transition-all shadow-2xs"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href={OFFICIAL_SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 hover:bg-primary-500 hover:text-secondary-950 transition-all shadow-2xs"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-secondary-200/80 px-4 pt-6 text-center text-xs text-secondary-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} IjenTour. All rights reserved.</p>
          <nav aria-label="Legal" className="mt-3 flex justify-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-primary-500">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-primary-500">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
