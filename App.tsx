
import React, { useState, useEffect } from 'react';
import { ViewState, User } from './types';
import LandingPage from './components/LandingPage';
import FindDoctorPage from './components/FindDoctorPage';
import JoinDoctorPage from './components/JoinDoctorPage';
import DoctorListPage from './components/DoctorListPage';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aarogya_theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedUser = localStorage.getItem('aarogya_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, [currentView]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aarogya_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAdminLogin = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .single();

      if (error || !data) {
        return false;
      }

      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      return true;
    } catch (err) {
      console.error("Admin Auth Error:", err);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aarogya_user');
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'find-doctor':
        return <FindDoctorPage onBack={() => setCurrentView('home')} />;
      case 'join-doctor':
        return <JoinDoctorPage onBack={() => setCurrentView('home')} />;
      case 'doctor-list':
        return <DoctorListPage onBack={() => setCurrentView('home')} />;
      case 'admin':
        return isAdminAuthenticated ? (
          <AdminDashboard onBack={() => {
            setIsAdminAuthenticated(false);
            setCurrentView('home');
          }} />
        ) : (
          <LandingPage onNavigate={setCurrentView} />
        );
      case 'auth':
        return <AuthPage onBack={() => setCurrentView('home')} onAuthSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('home');
        }} />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar 
        onNavigate={setCurrentView} 
        currentView={currentView} 
        user={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer 
        onNavigate={setCurrentView} 
        onAdminLogin={handleAdminLogin} 
      />
    </div>
  );
};

export default App;
