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

  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (currentUser) => {
    setIsLoggedIn(true);
    setCurrentUser(currentUser);
  };

  return (
    <Router>
      <Routes>
        {currentUser ? (
          <>
            <Route
              path="/search"
              element={
                <BaseLayout currentUser={currentUser}>
                  <SearchPage />
                </BaseLayout>
              }
            />
            <Route
              path="/manage"
              element={
                <BaseLayout currentUser={currentUser}>
                  <ManagePage />
                </BaseLayout>
              }
            />
            <Route
              path="/about"
              element={
                <BaseLayout currentUser={currentUser}>
                  <AboutPage />
                </BaseLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <BaseLayout currentUser={currentUser}>
                  <ContactPage />
                </BaseLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <BaseLayout currentUser={currentUser}>
                  <DashboardPage />
                </BaseLayout>
              }
            />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route
              path="*"
              element={
                <BaseLayout currentUser={currentUser}>
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
