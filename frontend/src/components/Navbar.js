import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ collapsed = false, currentUser }) => {
  const navigate = useNavigate();
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
        console.log(data.message); // "Đăng xuất thành công."
        localStorage.removeItem('authToken'); // xóa token local nếu có
        window.location.href = '/login'; // chuyển hướng về trang login
      } else {
        console.error('Logout failed:', data);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChangePassword = () => {
    console.log(currentUser.role);
    navigate('/change-password'); // chuyển hướng về trang change-password
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
      <span className="navbar-brand">Ứng dụng Quản lý</span>
      <button className="change-password-button" onClick={handleChangePassword}>
        Đổi mật khẩu
      </button>
      <button className="logout-button" onClick={handleLogout}>
        Đăng xuất
      </button>
    </nav>
  );
};

export default Navbar;
