import React from 'react';
import './Navbar.css';

const Navbar = ({ collapsed = false }) => {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const leftOffset = collapsed ? '60px' : '220px';
  const width = `calc(100% - ${collapsed ? '60px' : '220px'})`;

  return (
    <nav
      className="navbar"
      style={{
        left: leftOffset,
        width: width,
        transition: 'left 0.25s, width 0.25s',
      }}
    >
      <span className="navbar-brand">Ứng dụng Quản lý</span>
      <button className="logout-button" onClick={handleLogout}>
        Đăng xuất
      </button>
    </nav>
  );
};

export default Navbar;
