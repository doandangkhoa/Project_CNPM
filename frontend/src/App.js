import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './utils/ProtectedRoute';

// Admin Pages
import AdminUsersPage from './pages/admin/UsersPage';

// Officer Pages
import OfficerDashboardPage from './pages/officer/DashboardPage';
import OfficerHouseholdsPage from './pages/officer/HouseholdsPage';
import OfficerResidentsPage from './pages/officer/ResidentsPage';
import OfficerRequestsPage from './pages/officer/RequestsPage';
import OfficerMeetingsPage from './pages/officer/MeetingsPage';
import InvitationPage from './pages/officer/InvitationPage';
import GiaDinhVanHoaPage from './pages/officer/GiaDinhVanHoaPage';

// Citizen Pages
import CitizenHomePage from './pages/citizen/HomePage';
import CitizenHouseholdPage from './pages/citizen/HouseholdPage';
import CitizenServicesPage from './pages/citizen/ServicesPage';
import CitizenUserProfilePage from './pages/citizen/UserProfilePage';
import RequestPage from './pages/citizen/RequestPage';
import LichSuYeuCauPage from './pages/citizen/LichSuYeuCauPage';

// User Pages
import UserProfilePage from './pages/UserProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NhanKhauListPage from './pages/nhankhau/ListPage';
import NhanKhauDetailPage from './pages/nhankhau/DetailPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (currentUser) => {
    setCurrentUser(currentUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Profile Routes */}
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <UserProfilePage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <ChangePasswordPage currentUser={currentUser} />
            </ProtectedRoute>
          }
        />

        {/* Nhan Khau Routes */}
        <Route
          path="/nhan-khau"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <NhanKhauListPage currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-khau/:id"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <NhanKhauDetailPage currentUser={currentUser} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute currentUser={currentUser} requiredRoles={['admin']}>
              <AdminUsersPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <OfficerDashboardPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/households"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <OfficerHouseholdsPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/residents"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <OfficerResidentsPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/requests"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <OfficerRequestsPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />        <Route
          path="/officer/meetings"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <OfficerMeetingsPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/invitations"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <InvitationPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/gia-dinh-van-hoa"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['can_bo']}
            >
              <GiaDinhVanHoaPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        {/* Citizen Routes */}
        <Route
          path="/citizen/home"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <CitizenHomePage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/household"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <CitizenHouseholdPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/services"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <CitizenServicesPage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/request"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <RequestPage currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <CitizenUserProfilePage
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/lich-su-yeu-cau"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              requiredRoles={['nguoi_dan']}
            >
              <LichSuYeuCauPage currentUser={currentUser} />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.role === 'admin' ? (
                <Navigate to="/admin/users" replace />
              ) : currentUser.role === 'can_bo' ? (
                <Navigate to="/officer/dashboard" replace />
              ) : (
                <Navigate to="/citizen/home" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
