import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MatrixBackground from './components/MatrixBackground';
import ScrollToTop from './components/ScrollToTop';
import { LoadingState } from './components/ui/State';

const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return <LoadingState label="Loading page" />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MatrixBackground />
      <main id="main-content" className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default App;
