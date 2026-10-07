'use client'

import Link from 'next/link'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import ThemeToggle from './themeToggle'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  navigation: Array<{ name: string; href: string; current: boolean }>
}

export default function Sidebar({ isOpen, onClose, navigation }: SidebarProps) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      onClose()
    }
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
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
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
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-secondary-200 bg-white/95 dark:bg-secondary-950/95 p-6 text-secondary-950 dark:text-white shadow-2xl backdrop-blur-xl touch-none select-none lg:hidden"
          >
            <div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-12 bg-white/20 rounded-full lg:hidden" />

              {/* Header Sidebar: Logo, Theme Mode, & Close Button */}
              <div className="flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800 pb-5">
                <Link
                  href="/"
                  onClick={onClose}
                  className="text-xl font-black tracking-tight text-secondary-950 dark:text-white"
                >
                  Ijen<span className="text-primary-500 font-extrabold">Tour</span>
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-950 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Search Bar di Sidebar */}
              <form action="/blog" onSubmit={onClose} className="mt-5 flex items-center overflow-hidden rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900 px-3.5 py-2.5 transition focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-secondary-900 focus-within:ring-2 focus-within:ring-primary-500/20">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-secondary-400 dark:text-secondary-500" />
                <input
                  type="search"
                  name="q"
                  placeholder="Cari artikel & paket..."
                  aria-label="Cari artikel dan paket"
                  className="w-full bg-transparent pl-2.5 text-xs text-secondary-950 dark:text-white outline-none placeholder:text-secondary-400 dark:placeholder:text-secondary-500"
                />
              </form>

              {/* Navigasi Rute Public */}
              <nav className="mt-5 space-y-1">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.07, duration: 0.35, ease: 'easeOut' }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`block rounded-lg px-4 py-3 text-base font-semibold transition-colors duration-150 ${
                        item.current
                          ? 'bg-primary-50 text-primary-700 font-bold'
                          : 'text-secondary-700 hover:bg-secondary-100 hover:text-primary-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Tombol Pesan Tur */}
            <div className="border-t border-secondary-200 pt-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: 'easeOut' }}
              >
                <Link
                  href="/packages"
                  onClick={onClose}
                  className="block w-full rounded-full bg-primary-500 px-4 py-3 text-center text-sm font-extrabold text-secondary-950 shadow-lg shadow-primary-500/20 transition-all duration-150 hover:bg-primary-400"
                >
                  Pesan Tur Sekarang
                </Link>
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}