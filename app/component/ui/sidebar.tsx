'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import ThemeToggle from './themeToggle'
import { MAIN_NAV_ITEMS, NavDropdownItem } from './navConfig'
import { useBookingModal } from '@/lib/bookingModalStore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { openBookingModal } = useBookingModal()
  const [openAccordions, setOpenAccordions] = useState<string[]>([])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      onClose()
    }
  }

  const toggleAccordion = (label: string) => {
    setOpenAccordions((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Transparan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-secondary-950/70 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />

          {/* Panel Sidebar dengan Drag Gesture */}
          <motion.aside
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240, mass: 0.8 }}
            className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col justify-between border-r border-secondary-200 dark:border-secondary-800 bg-white/95 dark:bg-secondary-950/95 p-5 sm:p-6 text-secondary-950 dark:text-white shadow-2xl backdrop-blur-2xl touch-pan-y select-none lg:hidden overflow-y-auto"
          >
            <div>
              {/* Header Sidebar: Logo, Theme Mode, & Close Button */}
              <div className="flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800 pb-4">
                <Link
                  href="/"
                  onClick={onClose}
                  className="relative flex items-center transition-transform hover:scale-105"
                  aria-label="Mount Ijen Tour Home"
                >
                  <img
                    src="/images/logo-light.png"
                    alt="Mount Ijen Tour and Trip Organizer"
                    className="h-10 sm:h-11 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/images/logo-dark.png"
                    alt="Mount Ijen Tour and Trip Organizer"
                    className="h-10 sm:h-11 w-auto object-contain hidden dark:block"
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-950 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar in Sidebar */}
              <form
                action="/blog"
                onSubmit={onClose}
                className="mt-4 flex items-center overflow-hidden rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 px-3.5 py-2.5 transition focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-secondary-900 focus-within:ring-2 focus-within:ring-primary-500/20"
              >
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-secondary-400 dark:text-secondary-500" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search travel info..."
                  aria-label="Search travel guides and packages"
                  className="w-full bg-transparent pl-2.5 text-xs text-secondary-950 dark:text-white outline-none placeholder:text-secondary-400 dark:placeholder:text-secondary-500"
                />
              </form>

              {/* Accordion Public Navigation */}
              <nav className="mt-5 space-y-1.5" aria-label="Mobile Navigation">
                {MAIN_NAV_ITEMS.map((item) => {
                  const active = isItemActive(item)
                  const hasDropdown = Boolean(item.sections && item.sections.length > 0)
                  const isOpenAccordion = openAccordions.includes(item.label)

                  if (!hasDropdown && item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                          active
                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                            : 'text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-900'
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    )
                  }

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-secondary-100 dark:border-secondary-800/80 overflow-hidden bg-secondary-50/50 dark:bg-secondary-900/40"
                    >
                      {/* Accordion Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                          active
                            ? 'text-primary-700 dark:text-primary-400 font-black'
                            : 'text-secondary-800 dark:text-secondary-200'
                        }`}
                        aria-expanded={isOpenAccordion}
                      >
                        <span>{item.label}</span>
                        <ChevronDownIcon
                          className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${
                            isOpenAccordion ? 'rotate-180 text-primary-600' : ''
                          }`}
                        />
                      </button>

                      {/* Accordion Body */}
                      <AnimatePresence>
                        {isOpenAccordion && item.sections && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden bg-white/70 dark:bg-secondary-950/50 border-t border-secondary-100 dark:border-secondary-800/80 px-3 py-2 space-y-3"
                          >
                            {item.sections.map((section, sIdx) => (
                              <div key={sIdx} className="space-y-1">
                                {section.title && (
                                  <div className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 px-2 py-1">
                                    {section.title}
                                  </div>
                                )}
                                <div className="space-y-1 pl-1">
                                  {section.items.map((subItem) => {
                                    const basePath = subItem.href.split('?')[0].split('#')[0]
                                    const isSubActive =
                                      !subItem.href.includes('#') &&
                                      (basePath === '/'
                                        ? pathname === '/'
                                        : pathname === basePath || pathname.startsWith(`${basePath}/`))

                                    return (
                                      <Link
                                        key={subItem.title}
                                        href={subItem.href}
                                        onClick={onClose}
                                        className={`flex flex-col px-3 py-2 rounded-xl transition ${
                                          isSubActive
                                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold'
                                            : 'hover:bg-secondary-100/70 dark:hover:bg-secondary-900/60 text-secondary-700 dark:text-secondary-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-secondary-950 dark:text-white">
                                            {subItem.title}
                                          </span>
                                          {subItem.badge && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                                              {subItem.badge}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-secondary-500 dark:text-secondary-400 line-clamp-1 mt-0.5">
                                          {subItem.description}
                                        </span>
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </nav>
            </div>

            {/* Bottom Section: Primary CTA "Book Your Trip" */}
            <div className="border-t border-secondary-200 dark:border-secondary-800 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  openBookingModal()
                }}
                className="w-full flex items-center justify-center rounded-2xl bg-primary-500 hover:bg-primary-400 active:scale-95 px-4 py-3.5 text-center text-xs font-black text-secondary-950 shadow-lg shadow-primary-500/20 transition cursor-pointer"
              >
                <span>Book Your Trip Now</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}