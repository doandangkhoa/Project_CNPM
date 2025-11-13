import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        onLogin(); // Chuyển vào trang chính
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="login-box bg-white p-4 rounded shadow"
        style={{ width: '350px' }}
      >
        <h3 className="text-center mb-4">Đăng nhập</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-danger mb-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 mb-2">
            Đăng nhập
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={handleRegister}
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
