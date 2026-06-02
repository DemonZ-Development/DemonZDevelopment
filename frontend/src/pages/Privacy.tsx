import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' },
  container: { 
    maxWidth: 860, 
    margin: '0 auto', 
    padding: '48px', 
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)',
    backdropFilter: 'blur(var(--glass-blur))',
  },
  title: { 
    fontFamily: 'var(--font-heading)', 
    fontSize: '2.5rem', 
    fontWeight: 800, 
    color: 'var(--color-text-strong)', 
    marginBottom: 8,
    letterSpacing: '-1px'
  },
  updated: { fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { 
    fontFamily: 'var(--font-heading)', 
    fontSize: '1.35rem', 
    fontWeight: 600, 
    color: 'var(--color-text-strong)', 
    marginBottom: 12, 
    paddingBottom: 6, 
    borderBottom: '1px solid var(--color-border)' 
  },
  text: { color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.975rem', marginBottom: 12 },
  list: { paddingLeft: 20, color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 12, listStyleType: 'disc' },
  backLink: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 8, 
    color: 'var(--color-accent)', 
    textDecoration: 'none', 
    fontSize: '0.9rem', 
    marginTop: 24, 
    fontWeight: 500,
    transition: 'color var(--transition-fast)'
  },
};

export default function Privacy() {
  useDocumentTitle('Privacy Policy | DemonZ Development');

  return (
    <div style={s.page}>
      <div style={s.container}>
        <ScrollReveal>
          <h1 style={s.title}>Privacy Policy</h1>
          <p style={s.updated}>Last updated: June 1, 2026</p>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>1. Data Transparency & Collection</h2>
            <p style={s.text}>
              DemonZ Development is committed to respecting user privacy. We do not run intrusive trackers, sell user data, or run third-party advertising services. Our data collection is limited to:
            </p>
            <ul style={s.list}>
              <li><strong>Comment Submissions:</strong> Username and email address provided when posting comments on our projects. This is used strictly for display and moderation.</li>
              <li><strong>Downloads Telemetry:</strong> Aggregated, anonymous download metrics to assess project engagement.</li>
              <li><strong>Technical Server Logs:</strong> Standard request logs processed by Cloudflare (IP address, browser type, request timestamps) to maintain server security and mitigate DDoS threats.</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>2. Use of Information</h2>
            <p style={s.text}>Any data gathered is used solely to:</p>
            <ul style={s.list}>
              <li>Moderate and display community comments.</li>
              <li>Measure download traffic and improve release builds.</li>
              <li>Detect, prevent, and respond to unauthorized system access.</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>3. Cookies & Local Storage</h2>
            <p style={s.text}>
              We use minimal browser localStorage to save preferences (such as Admin sessions). We do not deploy third-party advertising cookies or cross-site behaviors.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>4. Subprocessors & Infrastructure Partners</h2>
            <p style={s.text}>
              We use the following infrastructure subprocessors to deliver the platform:
            </p>
            <ul style={s.list}>
              <li><strong>Cloudflare:</strong> Static assets distribution, DNS, and serverless runtime API hosting.</li>
              <li><strong>Supabase:</strong> Databases storage and user session verification helpers.</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>5. Data Retention & Control</h2>
            <p style={s.text}>
              Comments are preserved on the platform as long as the relevant project is active. If you would like your posted comments or database entries purged, you can request manual removal at any time by contacting us directly.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>6. Inquiries</h2>
            <p style={s.text}>
              For any questions regarding telemetry, server logs, or request audits, email us at: <strong>contact@demonzdevelopment.online</strong>.
            </p>
          </div>

          <Link to="/" style={s.backLink}>← Back to Home</Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
