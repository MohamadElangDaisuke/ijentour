'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import Sidebar from './sidebar'

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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user)
        } else {
          setCurrentUser(null)
        }
      })
      .catch(() => setCurrentUser(null))
  }, [pathname])

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
              ? 'bg-white/90 dark:bg-secondary-950/90 backdrop-blur-md border-b border-secondary-100 shadow-sm py-3'
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
                  className="rounded-lg p-2 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-950 focus:outline-hidden transition-colors cursor-pointer"
                  aria-label="Open mobile menu"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>

              {/* Logo: IjenTour (Ijen in White, Tour in Gold/Primary) */}
              <div className="flex items-center">
                <Link
                  href="/"
                    className="text-2xl font-black tracking-tight text-secondary-950 transition-transform duration-200 hover:scale-105"
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
                            ? 'text-primary-600 font-bold'
                            : 'text-secondary-700 hover:text-primary-600'
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

              {/* Right Side Actions: Book a trip Button */}
              <div className="flex items-center">
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
        currentUser={currentUser}
        navigation={navigation.map((item) => ({
          ...item,
          current: item.href === '/' ? pathname === '/' : pathname === item.href
        }))}
      />
    </>
  )
}