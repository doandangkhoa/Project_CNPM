import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

const UserProfilePage = ({ currentUser, onLogout }) => {
  const [user, setUser] = useState(currentUser || null);
  const [loading, setLoading] = useState(!currentUser);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserProfilePage currentUser:', currentUser);
    if (!currentUser) {
      setLoading(true);
      fetch('http://localhost:8000/api/me/', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.user) setUser(data.user);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching profile:', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#ef4444';
      case 'officer':
      case 'cán bộ':
        return '#3b82f6';
      case 'citizen':
      case 'người dân':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return '—';
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'officer') return 'Cán bộ';
    if (role === 'citizen') return 'Người dân';
    return role;
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    setPasswordError('');
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setShowChangePassword(false);
        }, 2000);
      } else {
        setPasswordError(data.message || data.error || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setPasswordError('Lỗi kết nối: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="empty-state">
          <p>Không thể tải thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-header-info">
            <h1>{user.ho_ten || user.full_name || user.username || 'Người dùng'}</h1>
            <div className="profile-role-badge" style={{ borderColor: getRoleColor(user.role) }}>
              <span style={{ color: getRoleColor(user.role) }}>●</span>
              {getRoleLabel(user.role || user.role_hien_thi)}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Đổi Mật Khẩu</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowChangePassword(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitPassword} className="modal-body">
                {passwordError && (
                  <div className="alert alert-error">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="alert alert-success">{passwordSuccess}</div>
                )}

                <div className="form-group">
                  <label>Mật Khẩu Hiện Tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Mật Khẩu Mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu mới"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Xác Nhận Mật Khẩu Mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Xác nhận mật khẩu mới"
                    disabled={submitting}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowChangePassword(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác Nhận'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="profile-info-section">
          <h2>Thông Tin Cá Nhân</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Họ Tên</div>
              <div className="info-value">
                {user.ho_ten || user.full_name || user.username || '—'}
              </div>
            </div>

            <div className="info-card">
              <div className="info-label">Email</div>
              <div className="info-value">
                {user.email || '—'}
              </div>
            </div>

            <div className="info-card">
              <div className="info-label">Tài Khoản</div>
              <div className="info-value">
                {user.username || '—'}
              </div>
            </div>

            <div className="info-card">
              <div className="info-label">Chức Vụ</div>
              <div className="info-value">
                {user.chuc_vu_hien_thi || user.chuc_vu || 'không có'}
              </div>
            </div>

            <div className="info-card">
              <div className="info-label">Ngày Tạo</div>
              <div className="info-value">
                {user.created_at 
                  ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="profile-actions-section">
          <button
            className="action-btn btn-primary"
            onClick={handleChangePasswordClick}
          >
            🔑 Đổi Mật Khẩu
          </button>
          <button
            className="action-btn btn-secondary"
            onClick={handleGoBack}
          >
            ← Quay Lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
