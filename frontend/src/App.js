import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import ManagePage from './pages/ManagePage';
import { Navigate } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import HomePage from './pages/HomePage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route
              path="/search"
              element={
                <BaseLayout>
                  <SearchPage />
                </BaseLayout>
              }
            />
            <Route
              path="/manage"
              element={
                <BaseLayout>
                  <ManagePage />
                </BaseLayout>
              }
            />
            <Route
              path="/about"
              element={
                <BaseLayout>
                  <AboutPage />
                </BaseLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <BaseLayout>
                  <ContactPage />
                </BaseLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <BaseLayout>
                  <DashboardPage />
                </BaseLayout>
              }
            />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route
              path="*"
              element={
                <BaseLayout>
                  <HomePage />
                </BaseLayout>
              }
            />
          </>
        ) : (
          <>
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
