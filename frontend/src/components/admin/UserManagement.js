import React, { useState, useEffect, useRef } from 'react';
import '../../styles/UserManagement.css';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const searchTimeoutRef = useRef(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'nguoi_dan',
    chuc_vu: '',
    cccd: '',
    is_active: true,
  });

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for fetching (debounce 300ms)
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers();
    }, 300);

    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        let filteredUsers = Array.isArray(data) ? data : data.results || [];

        // Client-side filtering
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (filterRole) {
          filteredUsers = filteredUsers.filter(user => user.role === filterRole);
        }

        if (filterStatus) {
          const isActive = filterStatus === 'active';
          filteredUsers = filteredUsers.filter(user => user.is_active === isActive);
        }

        setUsers(filteredUsers);
        setError(null);
      } else {
        setError('Không thể tải danh sách tài khoản');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccess('Tạo tài khoản thành công!');
        setShowAddForm(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'nguoi_dan',
          chuc_vu: '',
          cccd: '',
          is_active: true,
        });
        setTimeout(() => setSuccess(null), 3000);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(JSON.stringify(errorData.errors || errorData));
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // View user detail
  const handleViewDetail = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setShowDetailModal(true);
      } else {
        setError('Không thể tải thông tin chi tiết');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // Edit user
  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      chuc_vu: user.chuc_vu || '',
      is_active: user.is_active,
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };

      // Only include chuc_vu if role is can_bo
      if (formData.role === 'can_bo') {
        updateData.chuc_vu = formData.chuc_vu || null;
      } else {
        // If role is nguoi_dan, set chuc_vu to null
        updateData.chuc_vu = null;
      }

      // Add password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/${editingId}/update/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Cập nhật tài khoản thành công!');
        setShowEditForm(false);
        setEditingId(null);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'nguoi_dan',
          chuc_vu: '',
          is_active: true,
        });
        setTimeout(() => setSuccess(null), 3000);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(JSON.stringify(errorData.errors || errorData));
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/delete/`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
        });

        if (response.ok) {
          setSuccess('Xóa tài khoản thành công!');
          setTimeout(() => setSuccess(null), 3000);
          fetchUsers();
        } else {
          setError('Không thể xóa tài khoản');
        }
      } catch (err) {
        setError('Lỗi kết nối: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h1>Quản Lý Tài Khoản</h1>
        <button className="btn-add-user" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Hủy' : '+ Thêm Tài Khoản Mới'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddUser} className="add-user-form">
          <h3>Thêm Tài Khoản Mới</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="username"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mật khẩu"
              />
            </div>

            <div className="form-group">
              <label>CCCD</label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                placeholder="Nhập số CCCD"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vai trò</label>
              <select name="role" value={formData.role} onChange={(e) => {
                const newRole = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  role: newRole,
                  chuc_vu: newRole === 'admin' ? 'admin' : prev.chuc_vu
                }));
              }}>
                <option value="nguoi_dan">Người dân</option>
                <option value="can_bo">Cán bộ</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'can_bo' && (
            <div className="form-group">
              <label>Chức vụ</label>
              <select name="chuc_vu" value={formData.chuc_vu} onChange={handleChange}>
                <option value="">Chọn chức vụ</option>
                <option value="to_truong">Tổ trưởng</option>
                <option value="to_pho">Tổ phó</option>
                <option value="can_bo">Cán bộ</option>
              </select>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="form-group">
              <label>Chức vụ</label>
              <input
                type="text"
                name="chuc_vu"
                value={formData.chuc_vu}
                readOnly
                placeholder="Admin"
              />
            </div>
          )}

          <button type="submit" className="btn-submit">Tạo Tài Khoản</button>
        </form>
      )}

      {showEditForm && (
        <form onSubmit={handleUpdateUser} className="edit-user-form">
          <h3>Sửa Tài Khoản</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vai trò</label>
              <select name="role" value={formData.role} onChange={(e) => {
                const newRole = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  role: newRole,
                  chuc_vu: newRole === 'admin' ? 'admin' : prev.chuc_vu
                }));
              }}>
                <option value="nguoi_dan">Người dân</option>
                <option value="can_bo">Cán bộ</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>CCCD</label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                placeholder="Nhập số CCCD"
              />
            </div>
          </div>

          {formData.role === 'can_bo' && (
            <div className="form-group">
              <label>Chức vụ</label>
              <select name="chuc_vu" value={formData.chuc_vu} onChange={handleChange}>
                <option value="">Chọn chức vụ</option>
                <option value="to_truong">Tổ trưởng</option>
                <option value="to_pho">Tổ phó</option>
                <option value="can_bo">Cán bộ</option>
              </select>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="form-group">
              <label>Chức vụ</label>
              <input
                type="text"
                name="chuc_vu"
                value={formData.chuc_vu}
                readOnly
                placeholder="Admin"
              />
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu mới (bỏ trống nếu không thay đổi)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="form-group">
            <label>
              Tài khoản hoạt động
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ marginLeft: '3px' }}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Cập Nhật</button>
            <button type="button" className="btn-cancel" onClick={() => setShowEditForm(false)}>Hủy</button>
          </div>
        </form>
      )}

      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Tài Khoản</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Tên đăng nhập:</label>
                <span>{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <label>Vai trò:</label>
                <span>{selectedUser.role_hien_thi || selectedUser.role}</span>
              </div>
              <div className="detail-row">
                <label>Chức vụ:</label>
                <span>{selectedUser.role === 'admin' ? 'admin' : (selectedUser.chuc_vu_hien_thi || selectedUser.chuc_vu || '-')}</span>
              </div>
              <div className="detail-row">
                <label>Trạng thái:</label>
                <span className={selectedUser.is_active ? 'text-success' : 'text-danger'}>
                  {selectedUser.is_active ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
              <div className="detail-row">
                <label>Ngày tạo:</label>
                <span>{new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả vai trò</option>
          <option value="nguoi_dan">Người dân</option>
          <option value="can_bo">Cán bộ</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Bị khóa</option>
        </select>
      </div>

      {users.length === 0 ? (
        <div className="no-data">Không có tài khoản nào</div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Chức vụ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge-role">
                      {user.role_hien_thi || user.role}
                    </span>
                  </td>
                  <td>{user.role === 'admin' ? 'admin' : (user.chuc_vu_hien_thi || user.chuc_vu || 'không có')}</td>
                  <td>
                    <span className={`badge-status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetail(user.id)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(user)}
                      title="Chỉnh sửa (bao gồm đổi mật khẩu)"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
