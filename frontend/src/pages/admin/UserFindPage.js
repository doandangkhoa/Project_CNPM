import React, { useState } from 'react';
import './UserFindPage.css';

const UserFindPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  // Lấy cookie CSRF nếu cần (GET không bắt buộc, nhưng credentials vẫn dùng)
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

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setUserData(null);

    if (!searchQuery) {
      setError('Vui lòng nhập ID người dùng');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${searchQuery}/`,
        {
          method: 'GET',
          credentials: 'include', // để gửi session cookie
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Không tìm thấy người dùng');
        return;
      }

      const data = await res.json();
      setUserData(data);
    } catch (err) {
      setError('Không thể kết nối server');
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Tra cứu thông tin</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập ID người dùng"
          />
          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </div>
      </form>

      {error && <div className="text-danger mt-2">{error}</div>}

      {userData && (
        <div className="search-results mt-3">
          <h3>Thông tin người dùng</h3>
          <ul>
            <li>ID: {userData.id}</li>
            <li>Username: {userData.username}</li>
            <li>Email: {userData.email}</li>
            <li>Role: {userData.role_hien_thi}</li>
            <li>Chức vụ: {userData.chuc_vu_hien_thi || '—'}</li>
            <li>
              Trạng thái: {userData.is_active ? 'Hoạt động' : 'Không hoạt động'}
            </li>
            <li>Ngày tham gia: {userData.date_joined.split('T')[0]}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserFindPage;
