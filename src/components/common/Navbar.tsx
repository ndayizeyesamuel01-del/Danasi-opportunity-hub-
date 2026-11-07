/**
 * DANASI OPPORTUNITY HUB — Primary Navigation Bar
 * Follows the strict 3-Zone Top Bar Contract
 * Organization: DANASITECHNICALCOLLEGE
 */

import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { useTranslation } from '../../translations/index.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Menu, X, User as UserIcon, Shield, LayoutDashboard, LogOut, ChevronDown, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', route: 'home' },
    { id: 'find-jobs', label: 'Find Jobs', route: 'jobs' },
    { id: 'remote-jobs', label: 'Remote Jobs', route: 'jobs' },
    { id: 'scholarships', label: 'Scholarships', route: 'opportunities' },
    { id: 'internships', label: 'Internships', route: 'opportunities' },
    { id: 'fellowships', label: 'Fellowships', route: 'opportunities' },
    { id: 'courses', label: 'Courses', route: 'services' },
    { id: 'about', label: 'About', route: 'about' },
    { id: 'contact', label: 'Contact', route: 'contact' }
  ];

  const careerTools = [
    { id: 'cv-builder', label: 'CV Builder', route: 'services' },
    { id: 'cover-letter', label: 'Cover Letter Builder', route: 'services' },
    { id: 'motivation-letter', label: 'Motivation Letter Builder', route: 'services' },
    { id: 'eligibility-checker', label: 'Eligibility Checker', route: 'opportunities' },
    { id: 'interview-prep', label: 'Interview Preparation', route: 'services' },
    { id: 'app-tracker', label: 'Application Tracker', route: 'dashboard' }
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-20">
          {/* ZONE 1: Brand Wordmark */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer whitespace-nowrap shrink-0 py-2"
          >
            <Logo size="md" />
          </div>

          {/* ZONE 2: 10 Navigation Links & Career Tools Menu */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-slate-700">
            {navLinks.slice(0, 7).map((link) => {
              const isActive = currentRoute === link.route && link.id === 'home' ? currentRoute === 'home' : false;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.route)}
                  className="py-1 whitespace-nowrap shrink-0 transition-colors hover:text-blue-700 text-slate-700"
                >
                  {link.label}
                </button>
              );
            })}

            {/* Career Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="flex items-center gap-1 py-1 text-slate-700 hover:text-blue-700 font-semibold"
              >
                <span>Career Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {careerTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(tool.route)}
                      className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium block"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(7).map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.route)}
                className="py-1 whitespace-nowrap shrink-0 transition-colors hover:text-blue-700 text-slate-700"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* ZONE 3: Language Selector + WhatsApp + Profile / Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/250792772425?text=Hello%20DANASI%20Support!%20I%20need%20assistance%20with%20your%20platform."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <LanguageSelector />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate hidden md:inline">
                    {profile?.fullName || user?.email}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{profile?.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700">
                        {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      {t('nav.dashboard')}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 text-left font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        {t('nav.admin')}
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.route)}
                className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-left text-slate-700 hover:bg-slate-50"
              >
                <span>{link.label}</span>
              </button>
            ))}

            <div className="pt-2 pb-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">Career Tools</span>
              <div className="grid grid-cols-2 gap-1 pt-1">
                {careerTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleNavClick(tool.route)}
                    className="px-3 py-1.5 text-xs text-left text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded"
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/250792772425?text=Hello%20DANASI%20Support!%20I%20need%20assistance%20with%20your%20platform."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Support (+250792772425)</span>
              </a>
            </div>

            {isAuthenticated && (
              <>
                <div className="border-t border-slate-200 my-2" />
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  {t('nav.dashboard')}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg text-left font-medium"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    {t('nav.admin')}
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
