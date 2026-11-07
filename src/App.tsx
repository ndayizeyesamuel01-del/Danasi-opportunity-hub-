/**
 * DANASI OPPORTUNITY HUB — Root Application Component
 * Founder & Project Owner: NDAYIZEYE Samuel
 * Tagline: Your Gateway to Jobs, Scholarships & Global Opportunities.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { TranslationProvider, useTranslation } from './translations/index.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { HomePage } from './pages/public/HomePage.tsx';
import { JobsPage } from './pages/public/JobsPage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { OpportunitiesPage } from './pages/public/OpportunitiesPage.tsx';
import { ServicesPage } from './pages/public/ServicesPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { LegalPage } from './pages/public/LegalPage.tsx';
import { UserDashboard } from './pages/dashboard/UserDashboard.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { api } from './services/api.ts';
import { Bell, Info } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { t } = useTranslation();

  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  useEffect(() => {
    // Fetch platform info & notices
    api.getPlatformInfo()
      .then((res) => {
        if (res.systemNotice) {
          setSystemNotice(res.systemNotice);
        }
      })
      .catch(() => {});
  }, []);

  const handleNavigate = (route: string) => {
    if (route === 'dashboard' && !isAuthenticated) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (route === 'admin' && !isAdmin) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Loading DANASI OPPORTUNITY HUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* System Announcement Banner if active */}
      {systemNotice && (
        <div className="bg-slate-900 text-amber-300 text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span className="truncate max-w-4xl">{systemNotice}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
        {currentRoute === 'jobs' && (
          <JobsPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
        {currentRoute === 'about' && (
          <AboutPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
        {currentRoute === 'opportunities' && (
          <OpportunitiesPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
        {currentRoute === 'services' && (
          <ServicesPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}
        {currentRoute === 'contact' && (
          <ContactPage onNavigate={handleNavigate} />
        )}
        {currentRoute === 'legal' && (
          <LegalPage />
        )}
        {currentRoute === 'dashboard' && (
          <UserDashboard />
        )}
        {currentRoute === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (currentRoute === 'home') {
            setCurrentRoute('dashboard');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TranslationProvider>
  );
}
