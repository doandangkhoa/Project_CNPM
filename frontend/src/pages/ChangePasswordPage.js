import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState([]);
  const [success, setSuccess] = useState('');

  // Lấy cookie CSRF
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

  const handleChangePassword = async () => {
    setError([]);
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError(['Vui lòng nhập đầy đủ thông tin']);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/me/change-password/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
      } else {
        let errs = [];

        if (data.errors && typeof data.errors === 'object') {
          for (let key in data.errors) {
            data.errors[key].forEach((msg) => {
              errs.push(msg);
            });
          }
        } else if (data.message) {
          errs.push(data.message);
        } else {
          errs.push('Đã xảy ra lỗi không xác định.');
        }

        setError(errs);
      }
    } catch (err) {
      setError(['Không thể kết nối server']);
    }
  };

  return (
    <div className="change-container">
      <div className="change-box">
        <h3>Đổi mật khẩu</h3>

        <input
          type="password"
          className="form-control"
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          type="password"
          className="form-control"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {/* HIỂN THỊ LỖI */}
        {error.length > 0 && (
          <div className="text-danger">
            {error.map((e, i) => (
              <div key={i}>• {e}</div>
            ))}
          </div>
        )}

        {/* HIỂN THỊ THÀNH CÔNG */}
        {success && <div className="text-success">{success}</div>}

        <button
          className="btn btn-primary w-100 mb-2"
          onClick={handleChangePassword}
        >
          Đổi mật khẩu
        </button>

        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => navigate('/')}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
