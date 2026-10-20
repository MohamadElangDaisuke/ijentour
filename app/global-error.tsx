'use client'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            System Error
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px' }}>
            We encountered an unexpected issue while loading the page. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
