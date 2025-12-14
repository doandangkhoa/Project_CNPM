import React, { useState, useEffect } from 'react';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'nguoi_dan',
    chuc_vu: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      let url = 'http://localhost:8000/api/users/';
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.results || []);
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Tạo tài khoản thành công!');
        setShowAddForm(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'nguoi_dan',
          chuc_vu: '',
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(JSON.stringify(errorData.errors || errorData));
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/delete/`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Xóa tài khoản thành công!');
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

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddUser} className="add-user-form">
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
              <label>Vai trò</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="nguoi_dan">Người dân</option>
                <option value="can_bo">Cán bộ</option>
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

          <button type="submit" className="btn-submit">Tạo Tài Khoản</button>
        </form>
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
          <option value="admin">Admin</option>
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
                  <td>{user.chuc_vu_hien_thi || user.chuc_vu || '-'}</td>
                  <td>
                    <span className={`badge-status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Xóa
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
