import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Controlled if `collapsed` prop is provided; otherwise fall back to internal state
function Sidebar({ collapsed: collapsedProp, onToggle, currentUser }) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isControlled = typeof collapsedProp === 'boolean';
  const collapsed = isControlled ? collapsedProp : localCollapsed;

  const toggle = () => {
    if (isControlled) {
      onToggle && onToggle();
    } else {
      setLocalCollapsed((c) => !c);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h4 className="mb-2 text-center">
          {collapsed ? 'TQL' : 'Trang quản lý'}
        </h4>
        <button
          className="toggle-btn"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <span className="toggle-icon">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </span>
        </button>
      </div>
      <nav>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              end
              data-short="T"
            >
              <span className="link-short" aria-hidden>
                T
              </span>
              <span className="link-text">Trang chủ</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              data-short="B"
            >
              <span className="link-short" aria-hidden>
                B
              </span>
              <span className="link-text">Bảng điều khiển</span>
            </NavLink>
          </li>
          {currentUser.role === 'admin' && (
            <li className="nav-item">
              <NavLink
                to="/manage"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                data-short="M"
              >
                <span className="link-short" aria-hidden>
                  M
                </span>
                <span className="link-text">Quản lý</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
