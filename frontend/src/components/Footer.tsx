import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Articles', path: '/articles' },
] as const;

const SOCIAL_LINKS = [
  {
    label: 'Discord',
    href: 'https://discord.gg/GYsTt96ypf',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/DemonZ-Development',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'Modrinth',
    href: 'https://modrinth.com/organization/DemonZDevelopment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 3.31 1.607 6.244 4.092 8.067C5.975 19.98 5 19.262 5 18.23c0-.663.267-1.3.743-1.761L12 10.22l6.257 6.25c.476.46.743 1.097.743 1.76 0 1.03-.975 1.75-2.092 1.838C19.393 18.244 21 15.31 21 12c0-5.523-4.477-10-10-10zm0 14c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/r/DemonZDevelopment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.1-3.51 3.01.69c.03.88.75 1.58 1.64 1.58 1.1 0 2-.9 2-2s-.9-2-2-2c-.84 0-1.53.52-1.81 1.27l-3.32-.76c-.23-.05-.47.09-.54.31l-1.42 4.54C8.11 8.5 5.9 9.14 4.26 10.14c-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.26.79 2.34 1.9 2.78-.06.31-.1.63-.1.95 0 3.59 4.31 6.5 9.61 6.5s9.61-2.91 9.61-6.5c0-.32-.04-.64-.1-.95 1.11-.44 1.9-1.52 1.9-2.78zM7.22 13.91c0-.9.73-1.63 1.63-1.63s1.63.73 1.63 1.63c0 .9-.73 1.63-1.63 1.63s-1.63-.73-1.63-1.63zm9.64 4.09c-1.39 1.39-4.05 1.49-4.86 1.49-.81 0-3.48-.1-4.86-1.49-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 1.09 1.09 3.23 1.2 4.15 1.2.92 0 3.06-.1 4.15-1.2.2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-.25-2.46c-.9 0-1.63-.73-1.63-1.63 0-.9.73-1.63 1.63-1.63s1.63.73 1.63 1.63c0 .9-.73 1.63-1.63 1.63z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/DemonZ_Dev',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
] as const;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand}>
              <img
                src="/dzd-logo.jpeg"
                alt="DemonZ Development logo"
                width={32}
                height={32}
                className={styles.brandLogo}
              />
              <span className={styles.brandName}>DemonZ Development</span>
            </Link>
            <p className={styles.tagline}>
              Open source libraries, game mods, and small AI experiments. Built
              by three developers, for whoever finds it useful.
            </p>
            <div className={styles.social}>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.colTitle}>Site</h4>
            <ul className={styles.list}>
              {QUICK_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className={styles.listLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Legal</h4>
            <ul className={styles.list}>
              {LEGAL_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className={styles.listLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.bottomText}>© 2026 DemonZ Development</p>
          <p className={styles.bottomText}>MIT where applicable.</p>
        </div>
      </div>
    </footer>
  );
}
