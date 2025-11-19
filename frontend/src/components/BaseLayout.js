import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function BaseLayout({ children, currentUser }) {
  // Lift collapsed state here so Navbar and main-content can react to it
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => setCollapsed((c) => !c);

  const sidebarWidth = collapsed ? 60 : 220;

  return (
    <div>
      <Navbar collapsed={collapsed} currentUser={currentUser} />
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        currentUser={currentUser}
      />

      <main
        className="main-content"
        style={{
          marginLeft: `${sidebarWidth}px`,
          marginTop: '56px',
          transition: 'margin-left 0.25s',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default BaseLayout;
