import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { MobileApp } from './components/MobileApp';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { useMobile } from './hooks/useMobile';
import './styles/mobile.css';

function App() {
  const { isMobile } = useMobile();

  return (
    <AuthProvider>
      <DatabaseProvider>
        <Router>
          <div className={`app ${isMobile ? 'mobile' : 'desktop'}`}>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/*" element={
                <AuthGuard>
                  <MobileApp />
                </AuthGuard>
              } />
            </Routes>
          </div>
        </Router>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;