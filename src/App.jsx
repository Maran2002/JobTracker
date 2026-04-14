import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './routes/AuthGuard';
import MainLayout from './layouts/MainLayout';
import useThemeStore       from './store/useThemeStore';
import usePreferencesStore from './store/usePreferencesStore';
import useAuthStore        from './store/useAuthStore';
import { Toaster } from 'vibe-toast';

// Auth pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main pages
import Dashboard       from './pages/Dashboard';
import Applications    from './pages/Applications';
import AddApplication  from './pages/AddApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import Pipeline        from './pages/Pipeline';
import Schedule        from './pages/Schedule';
import Analytics       from './pages/Analytics';
import Settings        from './pages/Settings';

// 404
const NotFound = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'16px' }}>
    <div style={{ fontSize:'72px', fontWeight:'900', color:'var(--ct-primary)', opacity:0.3 }}>404</div>
    <div style={{ fontSize:'20px', fontWeight:'700', color:'var(--ct-text)' }}>Page not found</div>
    <a href="/dashboard" style={{ color:'var(--ct-primary)', fontWeight:'600', fontSize:'14px' }}>← Back to Dashboard</a>
  </div>
);

// Wrap each protected page in MainLayout
const ProtectedPage = ({ children, searchPlaceholder }) => (
  <AuthGuard>
    <MainLayout searchPlaceholder={searchPlaceholder}>
      {children}
    </MainLayout>
  </AuthGuard>
);

function App() {
  const { initTheme }         = useThemeStore();
  const { initPreferences, fetchPreferences } = usePreferencesStore();
  const { isAuthenticated }   = useAuthStore();

  // Restore persisted theme + accent color on mount
  useEffect(() => {
    initTheme();
    initPreferences();
  }, [initTheme, initPreferences]);

  // Fetch latest preferences from backend whenever the user is authenticated
  useEffect(() => {
    if (isAuthenticated) fetchPreferences();
  }, [isAuthenticated, fetchPreferences]);

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedPage searchPlaceholder="Search applications...">
            <Dashboard />
          </ProtectedPage>
        } />
        <Route path="/applications" element={
          <ProtectedPage searchPlaceholder="Search applications...">
            <Applications />
          </ProtectedPage>
        } />
        <Route path="/applications/new" element={
          <ProtectedPage searchPlaceholder="New application...">
            <AddApplication />
          </ProtectedPage>
        } />
        <Route path="/applications/edit/:id" element={
          <ProtectedPage searchPlaceholder="Edit application...">
            <AddApplication />
          </ProtectedPage>
        } />
        <Route path="/applications/:id" element={
          <ProtectedPage searchPlaceholder="View application...">
            <ApplicationDetails />
          </ProtectedPage>
        } />
        <Route path="/pipeline" element={
          <ProtectedPage searchPlaceholder="Search pipeline...">
            <Pipeline />
          </ProtectedPage>
        } />
        <Route path="/schedule" element={
          <ProtectedPage searchPlaceholder="Search interviews...">
            <Schedule />
          </ProtectedPage>
        } />
        <Route path="/analytics" element={
          <ProtectedPage searchPlaceholder="Search analytics...">
            <Analytics />
          </ProtectedPage>
        } />
        <Route path="/settings" element={
          <ProtectedPage searchPlaceholder="Search settings...">
            <Settings />
          </ProtectedPage>
        } />

        {/* Default */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
