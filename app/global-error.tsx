'use client'

import Script from 'next/script'
import './globals.css'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-secondary-50 text-secondary-950 dark:bg-secondary-950 dark:text-white">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const savedTheme = localStorage.getItem("ijentour-theme");
            const theme = savedTheme === "dark" ? "dark" : "light";
            document.documentElement.classList.toggle("dark", theme === "dark");
            document.documentElement.style.colorScheme = theme;
          })();`}
        </Script>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', textAlign: 'center' }}>
          <h2 className="text-2xl font-bold text-secondary-950 dark:text-white mb-2">
            System Error
          </h2>
          <p className="text-secondary-600 dark:text-secondary-300 mb-6 max-w-md">
            We encountered an unexpected issue while loading the page. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-secondary-950 dark:text-secondary-950 font-semibold transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
