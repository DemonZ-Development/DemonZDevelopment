import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import LiveOpsDashboard from '../components/LiveOpsDashboard';
import RealStats from '../components/RealStats';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  CodeIcon,
  PackageIcon,
  BrainIcon,
  ArrowRightIcon,
  HeartIcon,
} from '../components/ui/Icon';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import styles from './Home.module.css';

function DZDLogo() {
  return (
    <svg className={styles.heroLogo} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <text x="100" y="112" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="40" fontWeight="800" fill="currentColor" opacity="0.25">
        DZD
      </text>
    </svg>
  );
}

export default function Home() {
  useDocumentTitle('DemonZ Development — Open Source & Game Systems');

  const handleScrollToTelemetry = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = document.getElementById('telemetry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Set up keyboard shortcut for the future "s" key to scroll to telemetry.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && /input|textarea|select/i.test(target.tagName)) return;
        const el = document.getElementById('telemetry-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <DZDLogo />
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeading}>We build what we love.</h1>
          <p className={styles.heroSubtitle}>
            Engineering open-source libraries, standalone gaming projects, custom
            gaming mods, and localized machine learning telemetries.
          </p>
          <div className={styles.heroCtaGroup}>
            <Link to="/projects" className={styles.ctaButton}>
              Explore Projects
              <span className={styles.ctaArrow}>
                <ArrowRightIcon />
              </span>
            </Link>
            <button onClick={handleScrollToTelemetry} className={styles.secondaryButton}>
              Cluster Telemetry
            </button>
          </div>
        </div>
        <div className={styles.scrollHint}>
          <span>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* About */}
      <ScrollReveal>
        <section className={styles.about}>
          <span className={styles.sectionLabel}>Engineering Studio</span>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2>Authentic Development</h2>
              <p>
                We are a small collective of software developers dedicated to creating high-performance tools,
                designing game projects, and training customized machine learning models. What started as
                scripting server utilities has evolved into shipping production-ready open-source templates and
                standalone games.
              </p>
              <p>
                Having retired our legacy web and network operations, we do not build projects for clients.
                Our resources are entirely committed to shipping clean, community-accessible codebases, and scaling
                in-house software.
              </p>
              <p>
                While our larger standalone titles and mods remain proprietary, everything else we engineer is
                published under permissive licenses for devs worldwide.
              </p>
            </div>
            <div className={styles.aboutVisual}>
              <div className={styles.aboutIcon}>
                <CodeIcon size={80} />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Focus */}
      <ScrollReveal>
        <section className={styles.services}>
          <span className={styles.sectionLabel}>Our Focus</span>
          <h2 className={styles.sectionHeading}>What We're Working On</h2>
          <p className={styles.sectionSub}>
            The technical pillars driving our active research and deployment pipeline.
          </p>
          <div className={styles.servicesGrid}>
            <SpotlightCard className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                  <path d="M6 12h4m-2-2v4m7-2h.01M19 10h.01" strokeWidth="2" />
                </svg>
              </div>
              <h3>Game Dev & Mods</h3>
              <p>
                Engineering standalone game titles and highly optimized gaming modifications. We write custom physics scripts, multi-threaded networking code, and graphics wrappers.
              </p>
            </SpotlightCard>
            <SpotlightCard className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <PackageIcon />
              </div>
              <h3>Open Source Gems</h3>
              <p>
                Publishing modular TypeScript libraries, serverless database handlers, and automation frameworks. Built to resolve real bottlenecks and shared with permissive licenses.
              </p>
            </SpotlightCard>
            <SpotlightCard className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <BrainIcon />
              </div>
              <h3>AI Model Training</h3>
              <p>
                Fine-tuning domain-specific neural weights, deploying light-weight reasoning APIs, and tracking telemetry indicators for local autonomous agent pipelines.
              </p>
            </SpotlightCard>
          </div>
        </section>
      </ScrollReveal>

      {/* Real platform stats */}
      <ScrollReveal>
        <section className={styles.realStatsSection}>
          <span className={styles.sectionLabel}>Platform Stats</span>
          <h2 className={styles.sectionHeading}>What we've shipped</h2>
          <p className={styles.sectionSub}>
            Live counts from the project store, article library, and community.
          </p>
          <RealStats />
        </section>
      </ScrollReveal>

      {/* Live ops simulator */}
      <ScrollReveal>
        <section id="telemetry-section" className={styles.ecosystem}>
          <span className={styles.sectionLabel}>Platform Telemetry</span>
          <h2 className={styles.sectionHeading}>Live Operations</h2>
          <p className={styles.sectionSub}>
            Real-time simulated telemetry feeds tracking agent instances, training nodes, and compilation threads.
          </p>
          <LiveOpsDashboard />
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className={styles.contact}>
          <SpotlightCard className={styles.ctaCard}>
            <div className={styles.ctaCardIcon}>
              <HeartIcon />
            </div>
            <h2 className={styles.sectionHeading}>Explore Our Work</h2>
            <p className={styles.sectionSub} style={{ marginBottom: '1.5rem' }}>
              Access our downloads store to find game mods, source-code libraries, and technical releases.
            </p>
            <Link to="/projects" className={styles.ctaButton}>
              Browse Projects <ArrowRightIcon />
            </Link>
          </SpotlightCard>
        </section>
      </ScrollReveal>
    </>
  );
}
