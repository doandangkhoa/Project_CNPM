import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage(props) {
  const onLogin = props.onLogin;

  const _useState1 = useState('');
  const username = _useState1[0];
  const setUsername = _useState1[1];

  const _useState2 = useState('');
  const password = _useState2[0];
  const setPassword = _useState2[1];

  const _useState3 = useState('');
  const error = _useState3[0];
  const setError = _useState3[1];

  const navigate = useNavigate();

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((cookie) => {
        const parts = cookie.trim().split('=');
        if (parts[0] === name) cookieValue = decodeURIComponent(parts[1]);
      });
    }
    return cookieValue;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        onLogin(data.user);

        const role = data.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'can_bo') navigate('/can-bo/dashboard');
        else navigate('/nguoi-dan/dashboard');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    }
  }

  function goRegister() {
    navigate('/register');
  }

  return React.createElement(
    'div',
    { className: 'login-container' },

    React.createElement(
      'div',
      { className: 'login-card' },

      React.createElement(
        'h3',
        { className: 'login-title' },
        'Đăng nhập hệ thống'
      ),

      React.createElement(
        'form',
        { onSubmit: handleSubmit },

        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', null, 'Tên đăng nhập'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Nhập username',
            value: username,
            onChange: function (e) {
              setUsername(e.target.value);
            },
          })
        ),

        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', null, 'Mật khẩu'),
          React.createElement('input', {
            type: 'password',
            placeholder: 'Nhập mật khẩu',
            value: password,
            onChange: function (e) {
              setPassword(e.target.value);
            },
          })
        ),

        error &&
          React.createElement(
            'div',
            { className: 'error-text' },
            error
          ),

        React.createElement(
          'button',
          {
            type: 'submit',
            className: 'btn-primary',
          },
          'Đăng nhập'
        ),

        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn-secondary',
            onClick: goRegister,
          },
          'Đăng ký'
        )
      )
    )
  );
}

export default LoginPage;
