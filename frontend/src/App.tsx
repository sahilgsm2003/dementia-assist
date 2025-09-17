import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardPage } from './components/DashboardPage';
import { FamilyMemberQuiz } from './components/FamilyMemberQuiz';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'quiz';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quizMembers, setQuizMembers] = useState<FamilyMember[]>([]);

  const handleNavigate = (page: string) => {
    if (page === 'features' || page === 'about') {
      // Scroll to sections on landing page
      if (currentPage !== 'landing') {
        setCurrentPage('landing');
      }
      // In a real app, you'd scroll to the appropriate section
      return;
    }
    
    setCurrentPage(page as Page);
  };

  const handleAuth = (email: string, password: string) => {
    // Simple mock authentication
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const handleStartQuiz = (members: FamilyMember[]) => {
    setQuizMembers(members);
    setCurrentPage('quiz');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <AuthPage type="login" onNavigate={handleNavigate} onAuth={handleAuth} />;
      case 'register':
        return <AuthPage type="register" onNavigate={handleNavigate} onAuth={handleAuth} />;
      case 'dashboard':
        return <DashboardPage onStartQuiz={handleStartQuiz} />;
      case 'quiz':
        return <FamilyMemberQuiz familyMembers={quizMembers} onBack={handleBackToDashboard} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      onNavigate={handleNavigate}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;