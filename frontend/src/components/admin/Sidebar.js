import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdminSidebar.css';

const AdminSidebar = ({ currentUser, isCollapsed, onToggleCollapse }) => {
  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Admin Panel</h2>
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
            <Link to="/admin/users" className="menu-item">
              <span className="icon">👥</span>
              <span className="label">Quản Lý Tài Khoản</span>
            </Link>
          </li>
        </ul>
      </nav>

    </aside>
  );
};

export default AdminSidebar;
