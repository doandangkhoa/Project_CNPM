import React, { useState } from 'react';
import Sidebar from '../components/admin/Sidebar';
import UserMenu from '../components/UserMenu';
import '../styles/AdminLayout.css';

const AdminLayout = ({ currentUser, onLogout, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar 
        currentUser={currentUser} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`admin-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="admin-header">
          <div className="header-left">
            <h1>Hệ Thống Quản Trị</h1>
          </div>
          <div className="header-right">
            <UserMenu currentUser={currentUser} onLogout={onLogout} />
          </div>
        </header>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
