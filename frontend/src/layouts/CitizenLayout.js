import React from 'react';
import UserMenu from '../components/UserMenu';
import '../styles/CitizenLayout.css';

const CitizenLayout = ({ currentUser, onLogout, children }) => {
  return (
    <div className="citizen-layout">
      <header className="citizen-header">
        <div className="header-container">
          <div className="logo-section">
            <h1>Cổng Dịch Vụ Công</h1>
          </div>
          <div className="user-section">
            <UserMenu currentUser={currentUser} onLogout={onLogout} />
          </div>
        </div>
      </header>
      <nav className="citizen-nav">
        <ul>
          <li><a href="/citizen/home">Trang Chủ</a></li>
          <li><a href="/citizen/household">Sổ Hộ Khẩu</a></li>
          <li><a href="/citizen/services">Dịch Vụ</a></li>
          <li><a href="/citizen/requests">Lịch Sử Yêu Cầu</a></li>
          <li><a href="/citizen/profile">Thông Tin Cá Nhân</a></li>
        </ul>
      </nav>
      <main className="citizen-main">
        {children}
      </main>
      <footer className="citizen-footer">
        <p>&copy; 2025 Cổng Dịch Vụ Công. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default CitizenLayout;
