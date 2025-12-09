import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ collapsed = false, currentUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(currentUser || null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setProfile(currentUser || null);
  }, [currentUser]);

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/me/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user || data);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', data);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key === name) cookieValue = decodeURIComponent(value);
      });
    }
    return cookieValue;
  }

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
      <span className="navbar-brand">Trang Quản lý Dân Cư</span>

      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="navbar-bell" title="Thông báo">
            <span className="bell-icon">🔔</span>
            <span className="bell-badge" style={{ display: 'none' }}>0</span>
          </div>

          <div
            className="avatar-circle"
            onClick={() => { setDropdownOpen((s) => !s); if (!profile) fetchProfile(); }}
            title={profile.ho_ten || profile.username || 'Tài khoản'}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span>{(profile.ho_ten || profile.username || 'U').slice(0,1).toUpperCase()}</span>
            )}
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-header">
                <div className="profile-avatar-preview">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" />
                  ) : (
                    <div className="avatar-circle-small">{(profile.ho_ten||profile.username||'U').slice(0,1).toUpperCase()}</div>
                  )}
                </div>
                <div style={{ marginLeft: 12 }}>
                  <div style={{ fontWeight: 700 }}>{profile.ho_ten || profile.username}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{profile.email || ''}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{profile.role_hien_thi || profile.role || ''} {profile.chuc_vu_hien_thi ? `· ${profile.chuc_vu_hien_thi}` : ''}</div>
                </div>
              </div>

              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="change-password-button" onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>Xem hồ sơ</button>
                <button className="change-password-button" onClick={() => { setDropdownOpen(false); handleChangePassword(); }}>Đổi mật khẩu</button>
                <button className="logout-button" onClick={async () => { setDropdownOpen(false); await handleLogout(); }}>Đăng xuất</button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
