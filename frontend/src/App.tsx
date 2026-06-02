import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MatrixBackground from './components/MatrixBackground';

import ScrollToTop from './components/ScrollToTop';
import { LoadingState } from './components/ui/State';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return <LoadingState label="Loading page" />;
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: -100,
        left: 16,
        padding: '8px 16px',
        background: 'var(--color-accent)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        zIndex: 10000,
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'top 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '16px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-100px';
      }}
    >
      Skip to main content
    </a>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <ScrollToTop />
      <MatrixBackground />

      <Navbar />
      <main id="main-content" className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
