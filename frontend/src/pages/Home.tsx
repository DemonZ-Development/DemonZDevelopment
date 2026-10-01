import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import RealStats from '../components/RealStats';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { ArrowRightIcon } from '../components/ui/Icon';
import { fetchStudioLog, type StudioLogEntry, type StudioLogTag } from '../lib/api';
import styles from './Home.module.css';

const TAG_LABEL: Record<StudioLogTag | 'other', string> = {
  game: 'Game',
  lib: 'Library',
  ai: 'AI',
  site: 'Site',
  other: 'Other',
};

export default function Home() {
  const [entries, setEntries] = useState<StudioLogEntry[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchStudioLog()
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(() => {
        if (active) setEntries([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageTransition>
      <SEO />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>
            DemonZ Development
          </p>
          <h1 className={styles.heroHeading}>
            Open source tools, game mods,<br />
            and local AI experiments.
          </h1>
          <p className={styles.heroSubtitle}>
            DemonZ is an independent collective of seven developers. We build
            gameplay systems, publish the tooling we rely on in production,
            and experiment with local machine learning models. Most of what
            we release is public and free to use.
          </p>
          <div className={styles.heroCtaGroup}>
            <Link to="/projects" className={styles.ctaPrimary}>
              Explore projects
              <ArrowRightIcon size={16} />
            </Link>
            <Link to="/articles" className={styles.ctaSecondary}>
              Read devlogs
            </Link>
          </div>
        </div>
      </section>

      {/* Studio Log */}
      <ScrollReveal>
        <section className={styles.logSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>Studio Log</h2>
            <p className={styles.sectionSub}>
              Status updates, ongoing development, and recent changes across our projects.
            </p>
          </div>

          {entries === null ? (
            <p className={styles.logEmpty}>Loading the studio log…</p>
          ) : entries.length === 0 ? (
            <p className={styles.logEmpty}>
              Nothing logged yet. Check back after the next release.
            </p>
          ) : (
            <ol className={styles.log}>
              {entries.map((entry) => {
                const tagClass = styles[`tag_${entry.tag}`] ?? styles.tag_other;
                return (
                  <li key={entry.id} className={styles.logItem}>
                    <div className={styles.logMeta}>
                      <time className={styles.logDate}>{entry.entry_date}</time>
                      <span className={`${styles.logTag} ${tagClass}`}>
                        {TAG_LABEL[entry.tag] ?? entry.tag}
                      </span>
                    </div>
                    <div className={styles.logBody}>
                      <h3 className={styles.logTitle}>{entry.title}</h3>
                      <p className={styles.logText}>{entry.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </ScrollReveal>

      {/* Latest Releases & Articles */}
      <ScrollReveal>
        <section className={styles.statsSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>Latest from the studio</h2>
            <p className={styles.sectionSub}>
              Recent software releases, game mods, and technical articles.
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
                Focused on building games and practical tools.
              </h2>
              <p>
                DemonZ started in 2021 as a small group building server
                utilities. Today, our focus is twofold: developing standalone
                game projects, and releasing the underlying libraries and tools
                we build along the way.
              </p>
              <p>
                We operate as an asynchronous team of seven developers across
                different time zones. If our open-source tooling solves a problem
                or saves you time in your own builds, that is the goal.
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
                  <dd>Seven developers</dd>
                </div>
                <div className={styles.factRow}>
                  <dt>Licensing</dt>
                  <dd>Open source</dd>
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
            <h2 className={styles.ctaHeading}>Follow our work</h2>
            <p className={styles.ctaSub}>
              Follow releases on GitHub and Modrinth, read technical breakdowns
              on our blog, or chat with us in Discord.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/articles" className={styles.ctaPrimary}>
                Read devlogs
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
