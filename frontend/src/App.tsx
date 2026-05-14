import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import { Navbar }          from './components/Navigation/Navbar';
import { ProtectedRoute }  from './components/Auth/ProtectedRoute';

import { LoginPage }       from './pages/LoginPage';
import { HomePage }        from './pages/HomePage';
import { BookletPage }     from './pages/BookletPage';
import { DevotionsPage }   from './pages/DevotionsPage';
import { SermonsPage }     from './pages/SermonsPage';
import { PhotosPage }      from './pages/PhotosPage';
import { PrayerPage }      from './pages/PrayerPage';
import { ConvictionsPage } from './pages/ConvictionsPage';
import { ThanksgivingPage }from './pages/ThanksgivingPage';
import { BlessingsPage }   from './pages/BlessingsPage';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* ── Core palette from moodboard ── */
    --bg-primary:     #0A1128;
    --bg-deep:        #060D1E;
    --sidebar-bg:     #0D1635;
    --card-bg:        #111D3E;
    --card-alt:       #0F1A36;
    --input-bg:       #162040;
    --border:         rgba(255,255,255,0.08);
    --border-accent:  rgba(212,230,0,0.25);
    --hover-bg:       rgba(255,255,255,0.04);
    --active-bg:      rgba(212,230,0,0.1);

    /* ── Type colours ── */
    --text-primary:   #F0EDE4;
    --text-secondary: #C8C4B8;
    --text-muted:     #5A6080;

    /* ── Accent colours ── */
    --yellow:         #D4E600;
    --yellow-bright:  #E8F400;
    --yellow-dim:     rgba(212,230,0,0.15);
    --blue-mid:       #2B4BA0;
    --blue-sky:       #4A90D9;
    --green-field:    #5A8A3C;
    --white-soft:     #F0EDE4;

    /* Legacy alias so existing pages don't break */
    --gold:           #D4E600;

    /* ── Typography ── */
    --font-display:   'Barlow Condensed', 'Impact', sans-serif;
    --font-script:    'Playfair Display', 'Georgia', serif;
    --font-body:      'Barlow', system-ui, sans-serif;
  }

  html, body, #root {
    height: 100%;
    min-height: 100vh;
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }

  /* Grain texture overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.35;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(212,230,0,0.15); border-radius: 3px; }

  /* Layout */
  .app-layout {
    display: flex;
    min-height: 100vh;
  }
  .app-main {
    flex: 1;
    margin-left: 220px;
    min-height: 100vh;
    overflow-y: auto;
  }
  @media (max-width: 768px) {
    .app-main {
      margin-left: 0;
      padding-bottom: 80px;
    }
  }

  /* Input focus */
  input:focus, textarea:focus, select:focus {
    border-color: rgba(212,230,0,0.4) !important;
    box-shadow: 0 0 0 3px rgba(212,230,0,0.08);
  }

  select option {
    background: #162040;
    color: #F0EDE4;
  }

  /* Display heading utility */
  .display-heading {
    font-family: var(--font-display);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    line-height: 0.95;
  }
  .script-heading {
    font-family: var(--font-script);
    font-style: italic;
    font-weight: 700;
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="app-main">
      {children}
    </main>
  </div>
);

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/"            element={<HomePage />} />
                    <Route path="/booklet"     element={<BookletPage />} />
                    <Route path="/devotions"   element={<DevotionsPage />} />
                    <Route path="/sermons"     element={<SermonsPage />} />
                    <Route path="/photos"      element={<PhotosPage />} />
                    <Route path="/prayer"      element={<PrayerPage />} />
                    <Route path="/convictions" element={<ConvictionsPage />} />
                    <Route path="/thanksgiving"element={<ThanksgivingPage />} />
                    <Route path="/blessings"   element={<BlessingsPage />} />
                    <Route path="*"            element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};