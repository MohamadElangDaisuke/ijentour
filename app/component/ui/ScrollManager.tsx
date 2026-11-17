'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global Scroll Manager for Mount Ijen Tour
 * 
 * Objectives:
 * 1. Guarantees navigation to any new page (Home, Packages, Blog, etc.) starts at top (scrollY = 0).
 * 2. Preserves natural browser Back/Forward (popstate) scroll restoration.
 * 3. Supports in-page and cross-page anchor navigation (e.g. #faq, #packages).
 * 4. Enables clicking same-page links (e.g. Home while on Home) to smoothly scroll to top.
 * 5. Eliminates flicker and conflicts between CSS smooth scroll and Next.js router.
 */
export default function ScrollManager() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const isPopStateRef = useRef<boolean>(false);

  // 1. Detect browser Back / Forward (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 2. Manage Route Transitions (Push / Replace navigation)
  useEffect(() => {
    // Skip initial mount so we do not interfere with browser initial load
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // A. PopState Navigation (Browser Back / Forward):
    // Allow the browser to restore the previous scroll position
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    // B. Same Pathname with no route change: skip
    if (prevPathname === pathname) {
      return;
    }

    // C. Hash Navigation (e.g. /about#faq):
    // Do not force scroll to top; allow target anchor to be scrolled into view
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const targetId = decodeURIComponent(hash.slice(1));
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // D. Normal Page Navigation:
    // Instantly reset scroll to top (0, 0) without smooth scroll animation conflict
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    html.scrollTop = 0;
    document.body.scrollTop = 0;

    // Restore smooth scroll behavior on the next animation frame
    requestAnimationFrame(() => {
      html.style.scrollBehavior = originalScrollBehavior;

      // Secondary safety check in case streaming or client hydration shifted layout
      if (
        !isPopStateRef.current &&
        !window.location.hash &&
        window.scrollY > 0
      ) {
        html.style.scrollBehavior = 'auto';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        html.scrollTop = 0;
        document.body.scrollTop = 0;
        requestAnimationFrame(() => {
          html.style.scrollBehavior = originalScrollBehavior;
        });
      }
    });
  }, [pathname]);

  // 3. Global Click Listener for Same-Page Links (e.g. Scenario 1: On Home -> scroll down -> click Home)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      // Ignore modified clicks (cmd, ctrl, shift, alt) or non-left clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Ignore external, download, or new tab links
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref) return;

      // Pure hash link on current page (e.g. href="#packages")
      if (rawHref.startsWith('#')) {
        const targetId = decodeURIComponent(rawHref.slice(1));
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);

        // Only handle same-origin links
        if (targetUrl.origin !== window.location.origin) return;

        const isCurrentPage =
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search;

        if (isCurrentPage) {
          if (!targetUrl.hash) {
            // Clicking link to current page without hash (e.g. clicked "Home" while on Home, or Logo while on Home)
            // Smoothly scroll back to the top of the current page!
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          } else {
            // Target has a hash on current page (e.g. /about#faq while on /about)
            const targetId = decodeURIComponent(targetUrl.hash.slice(1));
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  return null;
}
