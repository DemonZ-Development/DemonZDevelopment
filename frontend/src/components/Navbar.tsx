import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useRestoreFocus } from '../hooks/useRestoreFocus';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Articles', path: '/articles' },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  /* Track scroll position for backdrop effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [isOpen]);

  /* Restore focus to the hamburger button after menu closes */
  useRestoreFocus(isOpen, hamburgerRef);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <header
      className="navbar"
      data-scrolled={scrolled || undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-nav)',
        height: 'var(--nav-height)',
        transition: 'background var(--transition-base), border-color var(--transition-base)',
        background: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <nav
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          aria-label="DemonZ Development — Home"
          end
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <img
            src="/dzd-logo.jpeg"
            alt="DemonZ Development logo"
            width={36}
            height={36}
            style={{
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-white)',
              letterSpacing: '-0.02em',
            }}
          >
            DZD
          </span>
        </NavLink>

        {/* Desktop Links */}
        <ul
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            listStyle: 'none',
          }}
          className="nav-desktop-links"
        >
          {NAV_LINKS.map(({ label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: isActive
                    ? 'var(--color-text-white)'
                    : 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-md)',
                  transition:
                    'color var(--transition-fast), background var(--transition-fast)',
                  background: isActive
                    ? 'var(--color-accent-muted)'
                    : 'transparent',
                  textDecoration: 'none',
                })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-strong)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          ref={hamburgerRef}
          className="nav-hamburger"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '6px',
            width: 32,
            height: 32,
            position: 'relative',
            zIndex: 'var(--z-top)',
            background: 'transparent',
            border: 'none',
          }}
        >
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              backgroundColor: 'var(--color-text-strong)',
              transition: 'transform 0.2s',
              transform: isOpen ? 'translateY(8px) rotate(45deg)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              backgroundColor: 'var(--color-text-strong)',
              transition: 'opacity 0.2s',
              opacity: isOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              backgroundColor: 'var(--color-text-strong)',
              transition: 'transform 0.2s',
              transform: isOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
            }}
          />
        </button>

        {/* Mobile Menu Overlay */}
        <div
          id="mobile-menu"
          className="nav-mobile-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 'var(--z-nav)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity var(--transition-base), visibility var(--transition-base)',
          }}
        >
          {NAV_LINKS.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setIsOpen(false)}
              style={({ isActive }) => ({
                fontSize: 'var(--text-2xl)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--weight-semibold)',
                color: isActive
                  ? 'var(--color-accent)'
                  : 'var(--color-text-strong)',
                padding: 'var(--space-3) var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                transition: 'none',
                transform: 'none',
                opacity: 1,
                textDecoration: 'none',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Responsive styles */}
      <style>{`
        .nav-desktop-links {
          display: flex !important;
        }
        .nav-hamburger {
          display: none !important;
        }
        .nav-mobile-overlay {
          display: none !important;
        }
        @media (max-width: 768px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-hamburger {
            display: flex !important;
          }
          .nav-mobile-overlay {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
