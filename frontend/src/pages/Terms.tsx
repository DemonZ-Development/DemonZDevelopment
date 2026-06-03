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

export default function Terms() {
  useDocumentTitle('Terms of Service | DemonZ Development');

  return (
    <div style={s.page}>
      <div style={s.container}>
        <ScrollReveal>
          <h1 style={s.title}>Terms of Service</h1>
          <p style={s.updated}>Last updated: June 1, 2026</p>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>1. Agreement of Use</h2>
            <p style={s.text}>
              By navigating the DemonZ Development platform, downloading software artifacts, or utilizing our telemetry dashboards, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these rules, please discontinue use of our site and builds.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>2. Code Licensing & Distribution</h2>
            <p style={s.text}>
              We publish projects under distinct licenses. Most tools are open source under permissive licenses (e.g. MIT, Apache), but some custom gaming builds or mods are proprietary. Unless specified otherwise:
            </p>
            <ul style={s.list}>
              <li>You may not claim ownership or author credits of downloaded binaries.</li>
              <li>You may not distribute repackaged files as paid products.</li>
              <li>You may not use our code in projects designed to violate network safety policies.</li>
              <li>Decompiling or reverse engineering proprietary assets is strictly prohibited.</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>3. Telemetry and Dashboard Utilization</h2>
            <p style={s.text}>
              All platform telemetries, logs, and simulated operation dashboards are provided for educational and diagnostic purposes. Standard usage patterns are analyzed to defend against rate abuse. Attempting to inject commands or exploit terminal dashboard instances will result in immediate IP banning.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>4. Community Comments</h2>
            <p style={s.text}>
              Users are solely responsible for comments posted to our projects feed. DemonZ Development reserves the right to moderate, hide, or permanently delete comments that contain hate speech, spam, promotional campaigns, or malicious download links.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>5. Disclaimer of Warranties</h2>
            <p style={s.text}>
              DemonZ Development software is provided "as is" and "as available", without warranty of any kind. We make no guarantee that our mods, gaming files, or libraries will be error-free or fully compatible with third-party software updates. Use all binaries at your own discretion.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>6. Liability Limitations</h2>
            <p style={s.text}>
              To the absolute limit allowed by law, DemonZ Development and its developers shall not be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, data loss, operating disruption, or hardware wear) arising out of the use or inability to use our projects.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>7. Modifications & Inquiries</h2>
            <p style={s.text}>
              We reserve the right to modify these terms at any time. Changes will be posted directly to this page. For licensing inquiries, reach out via email at: <strong>demonzdevelopment@gmail.com</strong>.
            </p>
          </div>

          <Link to="/" style={s.backLink}>← Back to Home</Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
