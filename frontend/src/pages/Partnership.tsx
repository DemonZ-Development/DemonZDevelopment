import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import styles from './Partnership.module.css';

function ExternalLinkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function Partnership() {
  return (
    <PageTransition className={styles.page}>
      <SEO
        title="Partnership"
        description="DemonZ Development partnerships. Native hosting powered by nexeu.zip and Free-vps.xyz, with collaboration inquiries via Discord."
      />

      <section className={styles.hero}>
        <span className={styles.eyebrow}>Partnerships</span>
        <h1 className={styles.heading}>Collaborations &amp; Infrastructure</h1>
        <p className={styles.subtitle}>
          How we power our deployments and where to reach our team for new partnership inquiries.
        </p>
      </section>

      <div className={styles.container}>
        {/* nexeu.zip Section */}
        <ScrollReveal>
          <section className={styles.partnerCard}>
            <div className={styles.partnerHeader}>
              <div className={styles.logoWrapper}>
                <img
                  src="/nexeu-logo.png"
                  alt="nexeu.zip"
                  width={60}
                  height={60}
                  className={styles.partnerLogo}
                />
              </div>
              <div className={styles.headerText}>
                <h2 className={styles.partnerTitle}>nexeu.zip</h2>
                <p className={`${styles.partnerSub} ${styles.subGreen}`}>Native Infrastructure Partner</p>
              </div>
            </div>

            <p className={styles.partnerDescription}>
              We natively partner with <strong>nexeu.zip</strong>. They provide the server
              infrastructure, low-latency network, and hosting that helps us ship, run,
              and scale our game projects, multiplayer builds, and open-source deployments.
            </p>

            <div className={styles.partnerActions}>
              <a
                href="https://nexeu.zip/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.ctaPartner} ${styles.ctaGreen}`}
              >
                Visit nexeu.zip
                <ExternalLinkIcon size={15} />
              </a>
            </div>
          </section>
        </ScrollReveal>

        {/* Free-vps.xyz Section */}
        <ScrollReveal>
          <section className={styles.partnerCard}>
            <div className={styles.partnerHeader}>
              <div className={styles.logoWrapper}>
                <img
                  src="/free-vps-icon.png"
                  alt="Free-vps.xyz"
                  width={60}
                  height={60}
                  className={styles.partnerLogo}
                />
              </div>
              <div className={styles.headerText}>
                <h2 className={styles.partnerTitle}>Free-vps.xyz</h2>
                <p className={`${styles.partnerSub} ${styles.subBlue}`}>Cloud &amp; VPS Hosting Partner</p>
              </div>
            </div>

            <p className={styles.partnerDescription}>
              We partner with <strong>Free-vps.xyz</strong> for virtual private server hosting,
              cloud instances, and computing resources that help power our testing environments,
              distributed nodes, and development infrastructure.
            </p>

            <div className={styles.partnerActions}>
              <a
                href="https://free-vps.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.ctaPartner} ${styles.ctaBlue}`}
              >
                Visit Free-vps.xyz
                <ExternalLinkIcon size={15} />
              </a>
            </div>
          </section>
        </ScrollReveal>

        {/* Discord Partnership Callout */}
        <ScrollReveal>
          <section className={styles.discordCard}>
            <h2 className={styles.discordTitle}>Want to partner with us?</h2>
            <p className={styles.discordText}>
              We keep things simple and direct. For all partnership proposals, creator collaborations,
              or integration ideas, join our Discord server and talk straight to our developers.
            </p>
            <div className={styles.discordActions}>
              <a
                href="https://discord.gg/GYsTt96ypf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaDiscord}
              >
                <DiscordIcon size={18} />
                Join our Discord
              </a>
            </div>
            <p className={styles.discordMeta}>
              Reach out in our community Discord or open a ticket to discuss collaborations.
            </p>
          </section>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
