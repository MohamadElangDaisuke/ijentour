'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Sidebar from './sidebar'
import ThemeToggle from './themeToggle'
import { MAIN_NAV_ITEMS, NavDropdownItem } from './navConfig'
import { useBookingModal } from '@/lib/bookingModalStore'

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const pathname = usePathname()
  const { scrollY } = useScroll()
  const { openBookingModal } = useBookingModal()
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track scroll position to toggle transparency & hide/show motion effect
  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(current > 20)

    // Hide navbar when scrolling down past 150px, show when scrolling up
    if (current > previous && current > 150) {
      setHidden(true)
      setActiveDropdown(null)
    } else {
      setHidden(false)
    }
  })

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null)
  }, [pathname])

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 180)
  }

  // Check if item or any of its children is currently active
  const isItemActive = (item: NavDropdownItem): boolean => {
    if (item.href) {
      return item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    }
    if (item.sections) {
      return item.sections.some((sec) =>
        sec.items.some((sub) => {
          // In-page hash anchors (e.g. /#how-it-works or /about#faq) do not activate top-level dropdown
          if (sub.href.includes('#')) return false
          const basePath = sub.href.split('?')[0]
          if (!basePath || basePath === '/') return false
          return pathname === basePath || pathname.startsWith(`${basePath}/`)
        })
      )
    }
    return false
  }

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
          ref={navRef}
          aria-label="Main Navigation"
          className={`site-navbar w-full transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 dark:bg-secondary-950/95 backdrop-blur-md border-b border-secondary-200/80 dark:border-secondary-800 shadow-sm py-2.5 sm:py-3'
              : 'bg-white/85 dark:bg-secondary-950/85 backdrop-blur-sm py-3.5 sm:py-4'
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between">
              {/* Mobile / Tablet Hamburger Trigger */}
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-xl p-2 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-950 dark:hover:text-white focus:outline-hidden transition-colors cursor-pointer"
                  aria-label="Open mobile navigation menu"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>

              {/* Logo: Mount Ijen Tour */}
              <div className="flex items-center">
                <Link
                  href="/"
                  className="relative flex items-center transition-transform duration-200 hover:scale-105 py-0.5"
                  aria-label="Mount Ijen Tour Home"
                >
                  <img
                    src="/images/logo-light.png"
                    alt="Mount Ijen Tour and Trip Organizer"
                    className="h-10 sm:h-12 md:h-13 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/images/logo-dark.png"
                    alt="Mount Ijen Tour and Trip Organizer"
                    className="h-10 sm:h-12 md:h-13 w-auto object-contain hidden dark:block"
                  />
                </Link>
              </div>

              {/* Desktop Center Navigation Links with Dropdowns */}
              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <ul className="flex items-center space-x-1 xl:space-x-2">
                  {MAIN_NAV_ITEMS.map((item) => {
                    const active = isItemActive(item)
                    const isOpen = activeDropdown === item.label
                    const hasDropdown = Boolean(item.sections && item.sections.length > 0)

                    if (!hasDropdown && item.href) {
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className={`relative text-xs xl:text-sm font-semibold transition-colors duration-200 px-3 py-2 rounded-xl block ${
                              active
                                ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50/60 dark:bg-primary-950/30'
                                : 'text-secondary-700 dark:text-secondary-300 hover:text-secondary-950 dark:hover:text-white hover:bg-secondary-100/70 dark:hover:bg-secondary-900/60'
                            }`}
                          >
                            {item.label}
                            {active && (
                              <motion.span
                                layoutId="activeNavIndicator"
                                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary-500 shadow-xs"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                          </Link>
                        </li>
                      )
                    }

                    return (
                      <li
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveDropdown(isOpen ? null : item.label)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setActiveDropdown(isOpen ? null : item.label)
                            }
                          }}
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          className={`relative text-xs xl:text-sm font-semibold transition-colors duration-200 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer ${
                            active || isOpen
                              ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50/60 dark:bg-primary-950/30'
                              : 'text-secondary-700 dark:text-secondary-300 hover:text-secondary-950 dark:hover:text-white hover:bg-secondary-100/70 dark:hover:bg-secondary-900/60'
                          }`}
                        >
                          <span>{item.label}</span>
                          <ChevronDownIcon
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-primary-500' : 'text-secondary-400'
                            }`}
                          />
                          {active && (
                            <motion.span
                              layoutId="activeNavIndicator"
                              className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary-500 shadow-xs"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                        </button>

                        {/* Dropdown Menu Container */}
                        <AnimatePresence>
                          {isOpen && item.sections && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.98 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              onMouseEnter={() => handleMouseEnter(item.label)}
                              onMouseLeave={handleMouseLeave}
                              className={`absolute top-full pt-2 z-50 ${
                                item.label === 'Explore'
                                  ? '-left-32 w-[740px]'
                                  : item.label === 'About Us'
                                  ? 'right-0 w-[340px]'
                                  : '-left-12 w-[380px]'
                              }`}
                            >
                              <div className="bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-secondary-200/90 dark:border-secondary-800 ring-1 ring-secondary-950/5 overflow-hidden">
                                {item.label === 'Explore' ? (
                                  /* 3-Column Mega Grid for Explore */
                                  <div className="grid grid-cols-3 gap-6">
                                    {item.sections.map((section, sIdx) => (
                                      <div key={sIdx} className="space-y-3">
                                        {section.title && (
                                          <div className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 border-b border-secondary-100 dark:border-secondary-800 pb-1.5">
                                            {section.title}
                                          </div>
                                        )}
                                        <div className="space-y-1">
                                          {section.items.map((subItem) => (
                                            <Link
                                              key={subItem.title}
                                              href={subItem.href}
                                              onClick={() => setActiveDropdown(null)}
                                              className="group flex flex-col p-2.5 rounded-2xl hover:bg-secondary-50 dark:hover:bg-secondary-800/60 transition-colors"
                                            >
                                              <div className="flex items-center justify-between gap-1">
                                                <span className="text-xs font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                  {subItem.title}
                                                </span>
                                                {subItem.badge && (
                                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                                                    {subItem.badge}
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[11px] text-secondary-500 dark:text-secondary-400 leading-snug mt-0.5 line-clamp-1">
                                                {subItem.description}
                                              </span>
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  /* Clean Single Column for Other Categories */
                                  <div className="space-y-2">
                                    {item.sections.map((section, sIdx) => (
                                      <div key={sIdx} className="space-y-1.5">
                                        {section.title && (
                                          <div className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 border-b border-secondary-100 dark:border-secondary-800 pb-1.5 px-2">
                                            {section.title}
                                          </div>
                                        )}
                                        {section.items.map((subItem) => (
                                          <Link
                                            key={subItem.title}
                                            href={subItem.href}
                                            onClick={() => setActiveDropdown(null)}
                                            className="group flex flex-col p-2.5 rounded-2xl hover:bg-secondary-50 dark:hover:bg-secondary-800/60 transition-colors"
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-xs font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {subItem.title}
                                              </span>
                                              {subItem.badge && (
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                                                  {subItem.badge}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-secondary-500 dark:text-secondary-400 leading-snug mt-0.5">
                                              {subItem.description}
                                            </span>
                                          </Link>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Right Side Actions: ThemeToggle, Search & Primary CTA Button */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Desktop Search & ThemeToggle */}
                <div className="hidden lg:flex items-center space-x-3">
                  <ThemeToggle />
                  {isSearchOpen ? (
                    <form
                      action="/blog"
                      className="flex items-center overflow-hidden rounded-full border border-primary-500 bg-white/90 dark:bg-secondary-900/90 shadow-sm"
                    >
                      <MagnifyingGlassIcon className="ml-3 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                      <input
                        type="search"
                        name="q"
                        autoFocus
                        placeholder="Search travel info..."
                        aria-label="Search travel guides and tours"
                        className="w-32 bg-transparent px-2 py-2 text-xs text-secondary-950 dark:text-white outline-none placeholder:text-secondary-400 sm:w-44"
                      />
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        aria-label="Close search"
                        className="mr-1 rounded-full p-1 text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 cursor-pointer"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(true)}
                      aria-label="Open search"
                      title="Search articles and destinations"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100/80 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 shadow-2xs transition hover:bg-primary-50 dark:hover:bg-secondary-800 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Primary Conversion CTA: Book Your Trip */}
                <button
                  type="button"
                  onClick={() => openBookingModal()}
                  className="inline-flex items-center justify-center rounded-full bg-primary-500 hover:bg-primary-400 active:scale-95 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black text-secondary-950 shadow-md shadow-primary-500/20 transition-all duration-200 hover:shadow-lg cursor-pointer"
                >
                  <span>Book Your Trip</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  )
}