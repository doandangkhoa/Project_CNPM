import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock login: username=admin, password=1234
    if (username === 'admin' && password === '1234') {
      onLogin(); // gọi callback để vào trang chính
    } else {
      setError('Tên đăng nhập hoặc mật khẩu sai');
    }
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
          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
