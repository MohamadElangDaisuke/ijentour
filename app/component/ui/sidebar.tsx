'use client'

import Link from 'next/link'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ThemeToggle from './themeToggle'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  navigation: Array<{ name: string; href: string; current: boolean }>
  currentUser?: any
}

export default function Sidebar({ isOpen, onClose, navigation, currentUser }: SidebarProps) {
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs sm:hidden"
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
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-secondary-200 bg-white/95 p-6 text-secondary-950 shadow-2xl backdrop-blur-xl touch-none select-none sm:hidden"
          >
            <div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-1.5 h-12 bg-white/20 rounded-full sm:hidden" />

              {/* Header Sidebar: Logo & Close Button */}
              <div className="flex items-center justify-between border-b border-secondary-200 pb-6">
                <Link
                  href="/"
                  onClick={onClose}
                  className="text-xl font-black tracking-tight text-secondary-950"
                >
                  Ijen<span className="text-primary-500 font-extrabold">Tour</span>
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-950"
                    aria-label="Close navigation"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Navigasi Rute Public */}
              <nav className="mt-6 space-y-1">
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

            {/* Tombol Book a trip & Login */}
            <div className="border-t border-secondary-200 pt-6 space-y-2">
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
                  Book a trip
                </Link>
                {currentUser ? (
                  <Link
                    href={
                      currentUser.role === "ADMIN"
                        ? "/admin/dashboard"
                        : currentUser.role === "MITRA"
                        ? "/mitra"
                        : "/customer"
                    }
                    onClick={onClose}
                    className="mt-2 block w-full rounded-full border border-primary-500 bg-primary-50 dark:bg-secondary-900 px-4 py-2.5 text-center text-xs font-bold text-secondary-900 dark:text-primary-300 transition-all hover:bg-primary-500 hover:text-secondary-950"
                  >
                    {currentUser.role === "ADMIN"
                      ? "👑 Buka Admin Dashboard"
                      : currentUser.role === "MITRA"
                      ? "🧭 Buka Portal Mitra Guide"
                      : `👤 Dashboard (${currentUser.name.split(" ")[0]})`}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="mt-2 block w-full rounded-full border border-secondary-300 px-4 py-2.5 text-center text-xs font-bold text-secondary-900 transition-all hover:bg-secondary-100"
                  >
                    Portal Akun / Masuk
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}