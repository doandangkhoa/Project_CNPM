import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [cccd, setCCCD] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async function (e) {
    e.preventDefault();
    setError('');

    if (!username || !email || !cccd || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    if (cccd.length !== 12 || !/^\d+$/.test(cccd)) {
      setError('Số CCCD phải là 12 chữ số');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, cccd, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        navigate('/login');
      } else {
        setError(data.message || data.errors?.cccd?.[0] || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'register-container' },
    React.createElement(
      'div',
      { className: 'register-box' },
      React.createElement('h3', null, 'Đăng ký tài khoản'),

      React.createElement(
        'form',
        { onSubmit: handleRegister },

        React.createElement('input', {
          type: 'text',
          className: 'form-control',
          placeholder: 'Tên đăng nhập',
          value: username,
          onChange: (e) => setUsername(e.target.value),
        }),

        React.createElement('input', {
          type: 'email',
          className: 'form-control',
          placeholder: 'Email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
        }),

        React.createElement('input', {
          type: 'text',
          className: 'form-control',
          placeholder: 'Số CCCD (12 chữ số)',
          value: cccd,
          maxLength: '12',
          onChange: (e) => setCCCD(e.target.value.replace(/\D/g, '')),
        }),

        React.createElement('input', {
          type: 'password',
          className: 'form-control',
          placeholder: 'Mật khẩu',
          value: password,
          onChange: (e) => setPassword(e.target.value),
        }),

        React.createElement('input', {
          type: 'password',
          className: 'form-control',
          placeholder: 'Nhập lại mật khẩu',
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
        }),

        error &&
          React.createElement('div', { className: 'text-danger' }, error),

        React.createElement(
          'button',
          {
            type: 'submit',
            className: 'btn btn-primary w-100 mb-2',
            disabled: loading,
          },
          loading ? 'Đang đăng ký...' : 'Đăng ký'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn btn-outline-secondary w-100',
            onClick: () => navigate('/login'),
          },
          'Quay lại đăng nhập'
        )
      )
    )
  );
}

export default RegisterPage;
