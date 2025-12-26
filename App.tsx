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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check for local session
    const savedUser = localStorage.getItem('aarogya_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, [currentView]);

  const handleAdminLogin = (pin: string) => {
    if (pin === "1234") { // Simple prototype PIN
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      return true;
    }
    return false;
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
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onNavigate={setCurrentView} 
        currentView={currentView} 
        user={currentUser}
        onLogout={handleLogout}
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