import React from 'react';
import { Link } from 'react-router-dom';
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
          <li>
            <Link to="/citizen/home">Trang Chủ</Link>
          </li>
          <li>
            <Link to="/citizen/request">Dịch Vụ</Link>
          </li>
          <li>
            <Link to="/citizen/lich-su-yeu-cau">Lịch Sử Yêu Cầu</Link>
          </li>
          <li>
            <Link to="/citizen/profile">Thông Tin Cá Nhân</Link>
          </li>
        </ul>
      </nav>
      <main className="citizen-main">{children}</main>
      <footer className="citizen-footer">
        <p>&copy; 2025 Cổng Dịch Vụ Công. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default CitizenLayout;
