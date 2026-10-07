'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import Sidebar from './sidebar'
import ThemeToggle from './themeToggle'

const navigation = [
  { name: 'Beranda', href: '/' },
  { name: 'Paket Tur', href: '/packages' },
  { name: 'Destinasi', href: '/destinations' },
  { name: 'Galeri', href: '/gallery' },
  { name: 'Blog', href: '/blog' },
  { name: 'Tentang', href: '/about' },
  { name: 'FAQ', href: '/about#faq' },
  { name: 'Kontak', href: '/contact' },
]

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Track scroll position to toggle transparency & hide/show motion effect
  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(current > 20)
    
    // Hide navbar when scrolling down past 150px, show when scrolling up
    if (current > previous && current > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-40 transition-colors duration-500"
        animate={{
          y: hidden ? -100 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          className={`site-navbar w-full transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 dark:bg-secondary-950/90 backdrop-blur-md border-b border-secondary-100 dark:border-secondary-800 shadow-sm py-3'
              : 'bg-white/80 dark:bg-secondary-950/80 backdrop-blur-sm py-4'
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between">

              {/* Mobile / Tablet Hamburger Trigger */}
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-lg p-2 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-950 dark:hover:text-white focus:outline-hidden transition-colors cursor-pointer"
                  aria-label="Open mobile menu"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>

              {/* Logo: IjenTour */}
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-2xl font-black tracking-tight text-secondary-950 dark:text-white transition-transform duration-200 hover:scale-105"
                >
                  Ijen<span className="text-primary-500 font-extrabold">Tour</span>
                </Link>
              </div>

              {/* Desktop Center Navigation Links */}
              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <div className="flex space-x-8">
                  {navigation.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative text-sm font-semibold transition-colors duration-200 py-1 ${
                          isActive
                            ? 'text-primary-600 dark:text-primary-400 font-bold'
                            : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.span
                            layoutId="activeNavIndicator"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary-500 shadow-sm"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Right Side Actions: ThemeToggle, Search & Book a trip Button */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {isSearchOpen ? (
                  <form action="/blog" className="flex items-center overflow-hidden rounded-full border border-primary-500 bg-white/90 dark:bg-secondary-900/90 shadow-sm">
                    <MagnifyingGlassIcon className="ml-3 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                    <input
                      type="search"
                      name="q"
                      autoFocus
                      placeholder="Cari artikel..."
                      aria-label="Cari artikel dan destinasi"
                      className="w-32 bg-transparent px-2 py-2 text-xs text-secondary-950 dark:text-white outline-none placeholder:text-secondary-500 sm:w-44"
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)} aria-label="Tutup pencarian" title="Tutup pencarian" className="mr-1 rounded-full p-1 text-secondary-500 transition hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-950 dark:hover:text-white cursor-pointer">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Buka pencarian"
                    title="Cari artikel dan destinasi"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary-200 dark:border-secondary-800 bg-white/80 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 shadow-sm transition hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-secondary-800 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                )}

                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-xs font-bold text-secondary-950 shadow-sm transition-all duration-300 hover:bg-primary-400 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Pesan Tur
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navigation={navigation.map((item) => ({
          ...item,
          current: item.href === '/' ? pathname === '/' : pathname === item.href
        }))}
      />
    </>
  )
}