import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserMenu.css';

const UserMenu = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';

      const response = await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.ok) {
        setIsOpen(false);
        onLogout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    navigate('/user-profile');
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    navigate('/change-password');
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => setIsOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="user-menu-container" >
      <button 
        className="user-avatar-btn"
        onClick={toggleMenu}
        title={currentUser?.username}
      >
        <div className="user-avatar-icon">
          {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown" style={{ textAlign: 'center' }}>
          
          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button 
              className="user-menu-item"
              onClick={handleViewProfile}
            >
              <span className="menu-label" style={{ textAlign: 'center' }}>Hồ Sơ Cá Nhân</span>
            </button>

            <button 
              className="user-menu-item"
              onClick={handleChangePassword}
            >
              <span className="menu-label" style={{ textAlign: 'center' }}>Đổi Mật Khẩu</span>
            </button>
          </div>

          <div className="user-menu-divider" style={{ textAlign: 'center' }}></div>

          <button 
            className="user-menu-logout"
            onClick={handleLogout}
          >
            <span className="menu-label" style={{ textAlign: 'center' }}>Đăng Xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
