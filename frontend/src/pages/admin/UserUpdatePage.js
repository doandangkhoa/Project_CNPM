import React, { useState } from 'react';
import './UserUpdatePage.css';

const UserUpdatePage = () => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [chucVu, setChucVu] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const roleOptions = [
    { value: 'can_bo', label: 'Cán bộ' },
    { value: 'nguoi_dan', label: 'Người dân' },
  ];

  const chucVuOptions = [
    { value: '', label: '---Chọn chức vụ---' }, // để trống nếu không có
    { value: 'to_truong', label: 'Tổ trưởng' },
    { value: 'to_pho', label: 'Tổ phó' },
    { value: 'can_bo', label: 'Cán bộ' },
  ];

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

  const handleUpdateUser = async (e) => {
    console.log('Đã nhấn');
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) {
      setError('Vui lòng nhập ID người dùng');
      return;
    }
    if (!role) {
      setError('Vui lòng chọn role');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${userId}/update/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
          body: JSON.stringify({
            role: role,
            chuc_vu: chucVu || null,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess('Cập nhật thành công');
      } else {
        setError(data);
      }
    } catch (err) {
      setError('Không thể kết nối server');
    }
  };

  return (
    <div className="user-update-container">
      <h1>Quản lý quyền người dùng</h1>
      <form onSubmit={handleUpdateUser}>
        <div>
          <label>ID người dùng:</label>
          <input
            type="number"
            placeholder="Nhập ID người dùng"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          />
        </div>

        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">---Chọn role---</option>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="user-fetch">
          <label>Chức vụ:</label>
          <select value={chucVu} onChange={(e) => setChucVu(e.target.value)}>
            {chucVuOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button type="submit">Cập nhật</button>
        </div>
      </form>
      {/* HIỂN THỊ LỖI */}
      {error && (
        <div className="text-danger">
          {typeof error === 'string'
            ? error
            : error.non_field_errors
            ? error.non_field_errors.map((e, i) => <div key={i}>• {e}</div>)
            : Object.entries(error).map(([field, messages]) => (
                <div key={field}>
                  <strong>{field}:</strong>{' '}
                  {Array.isArray(messages) ? messages.join(', ') : messages}
                </div>
              ))}
        </div>
      )}

      {/* HIỂN THỊ THÀNH CÔNG */}
      {success && <div className="text-success">{success}</div>}
    </div>
  );
};

export default UserUpdatePage;
