import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/OfficerSidebar.css';

const OfficerSidebar = ({ currentUser, isCollapsed, onToggleCollapse }) => {
  return (
    <aside className={`officer-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Cán Bộ</h2>
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="menu-list">
          <li>
            <Link to="/officer/dashboard" className="menu-item">
              <span className="label">Báo Cáo Thống Kê</span>
            </Link>
          </li>
          <li>
            <Link to="/officer/residents" className="menu-item">
              <span className="label">Quản Lý Nhân Khẩu</span>
            </Link>
          </li>
          <li>
            <Link to="/officer/households" className="menu-item">
              <span className="label">Quản Lý Hộ Khẩu</span>
            </Link>
          </li>
          <li>
            <Link to="/officer/meetings" className="menu-item">
              <span className="label">Quản Lý Buổi Sinh Hoạt</span>
            </Link>
          </li>
          <li>
            <Link to="/officer/requests" className="menu-item">
              <span className="label">Phê Duyệt Yêu Cầu</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default OfficerSidebar;
