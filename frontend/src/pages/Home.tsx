import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import RealStats from '../components/RealStats';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { ArrowRightIcon } from '../components/ui/Icon';
import styles from './Home.module.css';

const STUDIO_LOG = [
  {
    date: 'Nov 2025',
    tag: 'game',
    title: 'Boss rush mod — backporting v2.4 to 1.20.4',
    body: 'Cleaning up the AI pathfinding graph and squashing a desync when two players enter the arena at the same time.',
  },
  {
    date: 'Oct 2025',
    tag: 'lib',
    title: 'plugin-framework-api v1.0',
    body: 'First stable release. Bundled hooks for inventory, chat, and permissions. MIT, no telemetry, no required dependencies.',
  },
  {
    date: 'Oct 2025',
    tag: 'ai',
    title: 'Local NPC dialogue model — round 4',
    body: 'Trying smaller context windows and a hand-curated dialogue corpus instead of scraping. Results are messier but more on-brand.',
  },
  {
    date: 'Sep 2025',
    tag: 'site',
    title: 'This site, rewritten',
    body: 'Killed the fake telemetry panel, dropped the gradient text, and put our actual work above the fold.',
  },
];

const TAG_LABEL: Record<string, string> = {
  game: 'Game',
  lib: 'Library',
  ai: 'AI',
  site: 'Site',
};

export default function Home() {
  return (
    <PageTransition>
      <SEO />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowMark} aria-hidden="true" />
            DemonZ Development — a small studio
          </p>
          <h1 className={styles.heroHeading}>
            Open source libraries, game mods,<br />
            and the occasional AI experiment.
          </h1>
          <p className={styles.heroSubtitle}>
            We are three developers who ship production code for games, write
            libraries we wish existed, and train small models on our own GPUs.
            Everything that isn&apos;t a paid game is published under a permissive
            license.
          </p>
          <div className={styles.heroCtaGroup}>
            <Link to="/projects" className={styles.ctaPrimary}>
              See what we&apos;ve shipped
              <ArrowRightIcon size={16} />
            </Link>
            <Link to="/articles" className={styles.ctaSecondary}>
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      {/* Studio log */}
      <ScrollReveal>
        <section className={styles.logSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>What we&apos;re working on</h2>
            <p className={styles.sectionSub}>
              A short, honest log of what the studio is doing right now. No
              fabricated telemetry, no fake live counters.
            </p>
          </div>

          <ol className={styles.log}>
            {STUDIO_LOG.map((entry) => (
              <li key={entry.title} className={styles.logItem}>
                <div className={styles.logMeta}>
                  <time className={styles.logDate}>{entry.date}</time>
                  <span className={`${styles.logTag} ${styles[`tag_${entry.tag}`]}`}>
                    {TAG_LABEL[entry.tag]}
                  </span>
                </div>
                <div className={styles.logBody}>
                  <h3 className={styles.logTitle}>{entry.title}</h3>
                  <p className={styles.logText}>{entry.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal>
        <section className={styles.statsSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>What we&apos;ve shipped</h2>
            <p className={styles.sectionSub}>
              Counts pulled live from the project store and the article library.
            </p>
          </div>
          <RealStats />
        </section>
      </ScrollReveal>

      {/* About */}
      <ScrollReveal>
        <section className={styles.about}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <p className={styles.eyebrow}>About the studio</p>
              <h2 className={styles.aboutHeading}>
                We retired the agency and went back to building.
              </h2>
              <p>
                DemonZ Development started as a small group writing server
                utilities in 2021. A few contracts and side projects later, we
                shut down the agency work and committed to two things: shipping
                standalone games, and publishing every tool we write that
                isn&apos;t tied to a paid title.
              </p>
              <p>
                The team is three people, based in different time zones, and
                asynchronous by default. We do not take on client work. If a
                library here saves you an afternoon, that&apos;s the entire
                business model.
              </p>
            </div>
            <aside className={styles.aboutAside}>
              <dl className={styles.facts}>
                <div className={styles.factRow}>
                  <dt>Founded</dt>
                  <dd>2021</dd>
                </div>
                <div className={styles.factRow}>
                  <dt>Team</dt>
                  <dd>Three devs</dd>
                </div>
                <div className={styles.factRow}>
                  <dt>License</dt>
                  <dd>MIT for libraries</dd>
                </div>
                <div className={styles.factRow}>
                  <dt>Client work</dt>
                  <dd>None, by choice</dd>
                </div>
                <div className={styles.factRow}>
                  <dt>Where</dt>
                  <dd>Three time zones, one Discord</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaHeading}>Want to follow along?</h2>
            <p className={styles.ctaSub}>
              We post dev logs on the blog and ship releases to Modrinth and
              GitHub. No newsletter, no Twitter thread wars.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/articles" className={styles.ctaPrimary}>
                Browse articles
                <ArrowRightIcon size={16} />
              </Link>
              <a
                href="https://github.com/DemonZ-Development"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </PageTransition>
  );
}
