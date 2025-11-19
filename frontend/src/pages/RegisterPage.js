import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Không thể kết nối server');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h3>Đăng ký tài khoản</h3>

        <input
          type="text"
          className="form-control"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-danger">{error}</div>}

        <button className="btn btn-primary w-100 mb-2" onClick={handleRegister}>
          Đăng ký
        </button>

        <button
          className="btn btn-outline-secondary w-100 mb-2"
          onClick={() => navigate('/login')}
        >
          Quay lại đăng nhập
        </button>

        {/* ✅ Nút điều hướng đến trang đổi mật khẩu */}
        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => navigate('/change-password')}
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
