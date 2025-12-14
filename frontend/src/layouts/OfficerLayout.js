import React, { useState } from 'react';
import Sidebar from '../components/officer/Sidebar';
import UserMenu from '../components/UserMenu';
import '../styles/OfficerLayout.css';

const OfficerLayout = ({ currentUser, onLogout, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="officer-layout">
      <Sidebar 
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`officer-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="officer-header">
          <div className="header-left">
            <h1>Cổng Cán Bộ</h1>
          </div>
          <div className="header-right">
            <UserMenu currentUser={currentUser} onLogout={onLogout} />
          </div>
        </header>
        <main className="officer-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OfficerLayout;
