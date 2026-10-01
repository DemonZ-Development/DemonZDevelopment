import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageShell } from '../components/ui/PageShell';
import { Button } from '../components/ui/Button';
import { ArrowRightIcon } from '../components/ui/Icon';

export default function NotFound() {
  useDocumentTitle('Page not found | DemonZ Development');
  return (
    <PageShell>
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-6)',
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            fontWeight: 800,
            lineHeight: 1,
            background:
              'linear-gradient(135deg, var(--color-text-white) 0%, var(--color-accent) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-strong)',
            fontSize: 'var(--text-2xl)',
            margin: 0,
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            color: 'var(--color-text-muted)',
            maxWidth: '44ch',
            margin: 0,
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button>
            Return to Dashboard <ArrowRightIcon size={16} />
          </Button>
        </Link>
      </div>
    </PageShell>
  );
}
