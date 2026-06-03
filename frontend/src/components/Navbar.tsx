import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useRestoreFocus } from '../hooks/useRestoreFocus';
import styles from './Navbar.module.css';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  useRestoreFocus(isOpen, hamburgerRef);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const navClasses = [
    styles.navbar,
    isOpen ? styles.navbarOpen : '',
    !isOpen && scrolled ? styles.navbarScrolled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={navClasses}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" aria-label="DemonZ Development — Home" end className={styles.brand}>
          <img
            src="/dzd-logo.jpeg?v=2"
            alt="DemonZ Development logo"
            width={32}
            height={32}
            className={styles.brandLogo}
          />
          <span className={styles.brandName}>DemonZ</span>
        </NavLink>

        <ul className={styles.desktopLinks}>
          {NAV_LINKS.map(({ label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `${styles.desktopLink} ${isActive ? styles.desktopLinkActive : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          ref={hamburgerRef}
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className={`${styles.hamburgerBar} ${isOpen ? styles.hamburgerBarOpen : ''}`} />
          <span className={`${styles.hamburgerBar} ${isOpen ? styles.hamburgerBarOpen : ''}`} />
          <span className={`${styles.hamburgerBar} ${isOpen ? styles.hamburgerBarOpen : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          id="mobile-menu"
          className={styles.mobileOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {NAV_LINKS.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
