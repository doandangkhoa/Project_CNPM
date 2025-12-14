import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/NhanKhauList.css';

function NhanKhauListPage({ currentUser }) {
  const navigate = useNavigate();
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchNhanKhaus();
  }, [searchTerm, filterStatus]);

  const fetchNhanKhaus = async () => {
    try {
      let url = 'http://localhost:8000/api/nhan-khau/tim-kiem/';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('trang_thai', filterStatus);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNhanKhaus(data.results || data);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError('Không thể tải danh sách nhân khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/nhan-khau/${id}`);
  };

  const handleAddNew = () => {
    navigate('/nhan-khau/them-moi');
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'song': 'badge-active',
      'chet': 'badge-death',
      'tam_tru': 'badge-temporary',
      'tam_vang': 'badge-absent',
      'chuyen_di': 'badge-moved'
    };
    return statusMap[status] || 'badge-default';
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="nhan-khau-container">
      <div className="nhan-khau-header">
        <h1>Quản Lý Nhân Khẩu</h1>
        <button className="btn-add-new" onClick={handleAddNew}>
          + Thêm Nhân Khẩu Mới
        </button>
      </div>

      <div className="nhan-khau-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc CCCD..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="song">Còn sống</option>
          <option value="chet">Đã chết</option>
          <option value="tam_tru">Tạm trú</option>
          <option value="tam_vang">Tạm vắng</option>
          <option value="chuyen_di">Chuyển đi</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {nhanKhaus.length === 0 ? (
        <div className="no-data">
          <p>Không tìm thấy nhân khẩu nào</p>
        </div>
      ) : (
        <div className="nhan-khau-grid">
          {nhanKhaus.map((nhanKhau) => (
            <div key={nhanKhau.id} className="nhan-khau-card">
              <div className="card-header">
                <h3>{nhanKhau.ho_ten}</h3>
                <span className={`badge ${getStatusBadgeClass(nhanKhau.trang_thai)}`}>
                  {nhanKhau.trang_thai_hien_thi}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <label>CCCD:</label>
                  <span>{nhanKhau.so_cccd || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <label>Giới tính:</label>
                  <span>{nhanKhau.gioi_tinh_hien_thi || nhanKhau.gioi_tinh}</span>
                </div>

                <div className="info-row">
                  <label>Tuổi:</label>
                  <span>{nhanKhau.ngay_sinh ? calculateAge(nhanKhau.ngay_sinh) : 'N/A'}</span>
                </div>

                <div className="info-row">
                  <label>Dân tộc:</label>
                  <span>{nhanKhau.dan_toc || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <label>Quan hệ với chủ hộ:</label>
                  <span>{nhanKhau.quan_he_voi_chu_ho || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <label>Hộ khẩu:</label>
                  <span>{nhanKhau.ten_ho_khau || 'N/A'}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-detail"
                  onClick={() => handleViewDetail(nhanKhau.id)}
                >
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NhanKhauListPage;
