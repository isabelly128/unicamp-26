import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useDevotionStore } from './stores/devotionStore';

import { Navbar }          from './components/Navigation/Navbar';
import { ProtectedRoute }  from './components/Auth/ProtectedRoute';

import { LoginPage }       from './pages/LoginPage';
import { HomePage }        from './pages/HomePage';
import { BookletPage }     from './pages/BookletPage';
import { DevotionsPage }   from './pages/DevotionsPage';
import { SermonsPage }     from './pages/SermonsPage';
import { PhotosPage }      from './pages/PhotosPage';
import { PrayerPage }      from './pages/PrayerPage';
import { TestimonyPage }   from './pages/TestimonyPage';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-primary:#0A1128; --bg-deep:#060D1E; --sidebar-bg:#0D1635;
    --card-bg:#111D3E; --card-alt:#0F1A36; --input-bg:#162040;
    --border:rgba(255,255,255,0.08); --border-accent:rgba(247,246,221,0.25);
    --hover-bg:rgba(255,255,255,0.04); --active-bg:rgba(247,246,221,0.1);
    --text-primary:#f7f6dd; --text-secondary:#C8C4B8; --text-muted:#5A6080;
    --yellow:#f7f6dd; --yellow-bright:#f7f6dd; --yellow-dim:rgba(247,246,221,0.15);
    --blue-mid:#2B4BA0; --blue-sky:#4A90D9; --green-field:#5A8A3C;
    --white-soft:#f7f6dd; --gold:#f7f6dd;
    --font-display:'arial black regular','Impact',sans-serif;
    --font-script:'alex brush regular','Georgia',serif;
    --font-body:'arial black regular',system-ui,sans-serif;
  }
  html,body,#root { height:100%; min-height:100vh; }
  body { background:var(--bg-primary); color:var(--text-primary); font-family:var(--font-body); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:rgba(247,246,221,0.15);border-radius:3px;}
  .app-layout { display:flex; min-height:100vh; }
  .app-main { flex:1; margin-left:220px; min-height:100vh; overflow-y:auto; }
  @media(max-width:768px){ .app-main{ margin-left:0; padding-bottom:80px; } .sidebar{ display:none!important; } .mobile-nav{ display:flex!important; } }
  input:focus,textarea:focus{ border-color:rgba(247,246,221,0.4)!important; box-shadow:0 0 0 3px rgba(247,246,221,0.08); }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="app-main">{children}</main>
  </div>
);

export const App: React.FC = () => {
  const { isAuthenticated, isSessionVerified, validateSession } = useAuthStore();
  const loadCampContent = useDevotionStore((state) => state.loadCampContent);

  useEffect(() => {
    void loadCampContent();
  }, [loadCampContent]);

  useEffect(() => {
    if (!isSessionVerified) {
      void validateSession();
    }
  }, [isSessionVerified, validateSession]);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter basename="/staff">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated && isSessionVerified ? <Navigate to="/" replace /> : <LoginPage />}
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
                    <Route path="/testimony"   element={<TestimonyPage />} />
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
