/**
 * @fileoverview Main App Component
 * 
 * FASE 4 - PASO 1: UI SHELL
 * 
 * Minimal app shell that:
 * - Authenticates users
 * - Shows login if not authenticated
 * - Shows checklist submit page if authenticated
 * - Displays offline banner
 * 
 * Reglas canónicas:
 * - NO infiere permisos (no role-based branching)
 * - NO lógica de negocio
 * - Backend es la única autoridad
 */

import { AuthProvider, useAuth } from './lib/auth';
import { OfflineBanner } from './components';
import { LoginPage, ChecklistSubmitPage } from './pages';

/**
 * App content based on auth state.
 * 
 * NOTE: No role-based branching here.
 * We simply show login or the test page.
 */
function AppContent() {
  const { state } = useAuth();

  if (state === 'loading') {
    return <LoadingScreen />;
  }

  if (state === 'unauthenticated') {
    return <LoginPage />;
  }

  // Authenticated - show the test page
  return <ChecklistSubmitPage />;
}

/**
 * Simple loading screen.
 */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * Main App component.
 */
function App() {
  return (
    <AuthProvider>
      <OfflineBanner />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
