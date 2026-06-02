import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../lib/api';
import ProjectCard, { ProjectCardSkeleton } from '../components/ProjectCard';
import ScrollReveal from '../components/ScrollReveal';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import { EmptyState } from '../components/ui/State';
import { SearchIcon } from '../components/ui/Icon';
import styles from './Projects.module.css';

const CATEGORIES = ['all', 'games', 'libraries', 'ai', 'utilities'] as const;
const CATEGORY_MAP: Record<string, string> = {
  all: 'All',
  games: 'Games & Mods',
  libraries: 'Libraries',
  ai: 'AI Telemetry',
  utilities: 'Utilities',
};

const SORT_OPTIONS = [
  { value: 'downloads', label: 'Most Downloads' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'name', label: 'Name A–Z' },
] as const;

export default function Projects() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<string>('downloads');

  const { data: allProjects = [], isLoading: loading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  const featuredProjects = useMemo(() => {
    return allProjects.filter((p) => p.is_featured);
  }, [allProjects]);

  const recentProjects = useMemo(() => {
    return [...allProjects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);
  }, [allProjects]);

  // Client-side filtering & sorting for the interactive "All Releases" list
  const filteredProjects = useMemo(() => {
    // 1. Filter by category
    let result = allProjects;
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    // 2. Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else {
        // default: downloads
        return (b.downloads || 0) - (a.downloads || 0);
      }
    });

    return result;
  }, [allProjects, category, search, sort]);

  return (
    <PageTransition className={styles.page}>
      <SEO title="Projects" description="Explore our open-source utilities, game releases, and modifications." />
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>Projects</h1>
          <p>Explore our open-source utilities, game releases, and modifications.</p>
        </div>
      </section>

      {/* Filters (Moved to top) */}
      <section className={styles.section} style={{ marginBottom: '2rem' }}>
        <div className={styles.filters}>
          <div className={styles.filtersInner}>
            <div className={styles.searchBox}>
              <SearchIcon size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.filterRow}>
              <div className={styles.pills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.pill} ${category === cat ? styles.pillActive : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {CATEGORY_MAP[cat]}
                  </button>
                ))}
              </div>

              <select
                className={styles.sortSelect}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Releases */}
      {featuredProjects.length > 0 && !search && category === 'all' && (
        <ScrollReveal>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Releases</h2>
              <p className={styles.sectionSubtitle}>Handpicked highlights from our collection</p>
            </div>
            <div className={styles.cards}>
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Recent Updates */}
      {recentProjects.length > 0 && !search && category === 'all' && (
        <ScrollReveal>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Updates</h2>
              <p className={styles.sectionSubtitle}>The latest versions and revisions</p>
            </div>
            <div className={styles.cards}>
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* All Releases */}
      <section className={styles.section}>
        {(!search && category === 'all') && (
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Releases</h2>
            <p className={styles.sectionSubtitle}>Browse our entire catalog of projects</p>
          </div>
        )}




        {/* Grid/Content */}
        <div className={styles.gridInner}>
          {loading ? (
            <div className={styles.skeletons}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={styles.empty}>
              <EmptyState
                title="No projects found"
                description="Try adjusting your search or filters."
              />
            </div>
          ) : (
            <div className={styles.cards}>
              {filteredProjects.map((project) => (
                <ScrollReveal key={project.id}>
                  <ProjectCard project={project} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
