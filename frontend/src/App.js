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
import AdminManagePage from './pages/admin/ManagePage';
import AdminUserListPage from './pages/admin/UserListPage';
import AdminUserFindPage from './pages/admin/UserFindPage';
import AdminUserUpdatePage from './pages/admin/UserUpdatePage';
import AddResidentPage from './pages/nhankhau/AddResidentPage';
import FindResidentPage from './pages/nhankhau/FindResidentByIDPage';
import FindResidentByIDPage from './pages/nhankhau/FindResidentPage';
import UpdateResidentPage from './pages/nhankhau/UpdateResidentPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (currentUser) => {
    setCurrentUser(currentUser);
  };

  return (
    <Router>
      <Routes>
        {currentUser ? (
          <>
            <Route
              path="/"
              element={
                <BaseLayout currentUser={currentUser}>
                  <HomePage />
                </BaseLayout>
              }
            />
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

            {/* Nhân khẩu routes */}
            <Route
              path="/resident-add"
              element={
                <BaseLayout currentUser={currentUser}>
                  <AddResidentPage />
                </BaseLayout>
              }
            />
            <Route
              path="/resident-findbyid"
              element={
                <BaseLayout currentUser={currentUser}>
                  <FindResidentByIDPage />
                </BaseLayout>
              }
            />
            <Route
              path="/resident-find"
              element={
                <BaseLayout currentUser={currentUser}>
                  <FindResidentPage />
                </BaseLayout>
              }
            />
            <Route
              path="/resident-update"
              element={
                <BaseLayout currentUser={currentUser}>
                  <UpdateResidentPage />
                </BaseLayout>
              }
            />

            {/* Đổi mật khẩu */}
            <Route
              path="/change-password"
              element={
                <BaseLayout currentUser={currentUser}>
                  <ChangePasswordPage />
                </BaseLayout>
              }
            />
            {currentUser.role === 'admin' && (
              <>
                <Route
                  path="/admin/manage"
                  element={
                    <BaseLayout currentUser={currentUser}>
                      <AdminManagePage />
                    </BaseLayout>
                  }
                />
                <Route
                  path="/admin/userlist"
                  element={
                    <BaseLayout currentUser={currentUser}>
                      <AdminUserListPage />
                    </BaseLayout>
                  }
                />
                <Route
                  path="/admin/userfind"
                  element={
                    <BaseLayout currentUser={currentUser}>
                      <AdminUserFindPage />
                    </BaseLayout>
                  }
                />
                <Route
                  path="/admin/userupdate"
                  element={
                    <BaseLayout currentUser={currentUser}>
                      <AdminUserUpdatePage />
                    </BaseLayout>
                  }
                />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
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
