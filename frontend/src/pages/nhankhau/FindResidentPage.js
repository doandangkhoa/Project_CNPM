import React, { useState } from 'react';
import './FindResidentPage.css';

const SearchNhanKhau = () => {
  const [searchParams, setSearchParams] = useState({
    ho_ten: '',
    so_cccd: '',
    ngay_sinh: '',
    so_ho_khau: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

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

  const handleSearch = async (e, page = 1) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra xem có ít nhất một tiêu chí tìm kiếm không
    const { ho_ten, so_cccd, ngay_sinh, so_ho_khau } = searchParams;
    if (!ho_ten && !so_cccd && !ngay_sinh && !so_ho_khau) {
      setError('Vui lòng nhập ít nhất một tiêu chí tìm kiếm');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...searchParams,
        page: page,
        limit: pagination.limit,
      });

      const response = await fetch(
        `http://localhost:8000/api/nhan-khau/tim-kiem/?${params}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'success') {
          setResults(data.results);
          setPagination({
            ...pagination,
            page: data.page,
            total: data.total,
            totalPages: Math.ceil(data.total / data.limit),
          });
          setSuccess(`Tìm thấy ${data.total} kết quả phù hợp`);
        } else {
          setError(data.message || 'Không tìm thấy nhân khẩu nào');
        }
      } else {
        setError(data.message || `Lỗi: ${response.status}`);
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchParams({
      ho_ten: '',
      so_cccd: '',
      ngay_sinh: '',
      so_ho_khau: '',
    });
    setResults([]);
    setError('');
    setSuccess('');
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleSearch(null, newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (err) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age <= 0) {
        const monthAge =
          today.getMonth() -
          birthDate.getMonth() +
          12 * (today.getFullYear() - birthDate.getFullYear());
        if (monthAge <= 0) {
          const dayAge = Math.floor(
            (today - birthDate) / (1000 * 60 * 60 * 24)
          );
          return `${dayAge} ngày tuổi`;
        }
        return `${monthAge} tháng tuổi`;
      }

      return `${age} tuổi`;
    } catch (err) {
      return '';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      song: 'Còn sống',
      chet: 'Đã chết',
      tam_tru: 'Tạm trú',
      tam_vang: 'Tạm vắng',
      chuyen_di: 'Đã chuyển đi',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'song':
        return '#2ecc71';
      case 'chet':
        return '#e74c3c';
      case 'tam_tru':
        return '#f39c12';
      case 'tam_vang':
        return '#3498db';
      case 'chuyen_di':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Tra cứu thông tin nhân khẩu</h1>

      <p className="search-subtitle">
        Tìm kiếm theo một hoặc nhiều tiêu chí: Họ tên, Số CCCD, Ngày sinh, Số hộ
        khẩu
      </p>

      {success && (
        <div className="success-message">
          <span>✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>✗</span>
          {error}
        </div>
      )}

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-grid">
          <div className="search-field">
            <label>Họ và tên / Bí danh</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.ho_ten}
              onChange={(e) =>
                setSearchParams({ ...searchParams, ho_ten: e.target.value })
              }
              placeholder="Nhập họ tên hoặc bí danh..."
            />
          </div>

          <div className="search-field">
            <label>Số CCCD</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.so_cccd}
              onChange={(e) =>
                setSearchParams({ ...searchParams, so_cccd: e.target.value })
              }
              placeholder="Nhập số CCCD..."
            />
          </div>

          <div className="search-field">
            <label>Ngày sinh</label>
            <input
              type="date"
              className="search-input"
              value={searchParams.ngay_sinh}
              onChange={(e) =>
                setSearchParams({ ...searchParams, ngay_sinh: e.target.value })
              }
            />
          </div>

          <div className="search-field">
            <label>Số hộ khẩu</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.so_ho_khau}
              onChange={(e) =>
                setSearchParams({ ...searchParams, so_ho_khau: e.target.value })
              }
              placeholder="Nhập số hộ khẩu..."
            />
          </div>
        </div>

        <div className="search-actions">
          <button
            type="submit"
            className="search-button primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang tìm...
              </>
            ) : (
              '🔍 Tìm kiếm'
            )}
          </button>
          <button
            type="button"
            className="search-button secondary"
            onClick={handleClear}
          >
            Xóa tất cả
          </button>
        </div>
      </form>

      <div className="search-results">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Đang tìm kiếm...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="results-header">
              <h3>Kết quả tìm kiếm</h3>
              <div className="results-info">
                Hiển thị {results.length}/{pagination.total} kết quả
              </div>
            </div>

            <div className="results-grid">
              {results.map((resident) => (
                <div key={resident.id} className="result-card">
                  <div className="result-card-header">
                    <div className="resident-name">
                      <h4>{resident.ho_ten}</h4>
                      {resident.bi_danh && (
                        <span className="resident-alias">
                          ({resident.bi_danh})
                        </span>
                      )}
                    </div>
                    <div className="resident-id">ID: {resident.id}</div>
                  </div>

                  <div className="result-card-content">
                    <div className="info-row">
                      <span className="info-label">📅 Ngày sinh:</span>
                      <span className="info-value">
                        {formatDate(resident.ngay_sinh)}
                        <span className="age-badge">
                          {calculateAge(resident.ngay_sinh)}
                        </span>
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">🆔 CCCD:</span>
                      <span className="info-value">
                        {resident.so_cccd || 'Chưa có'}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">🏠 Hộ khẩu:</span>
                      <span className="info-value">
                        {resident.ho_gia_dinh?.so_ho_khau || 'Chưa có'}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">👤 Giới tính:</span>
                      <span className="info-value">
                        {resident.gioi_tinh || 'Chưa có'}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">📍 Nguyên quán:</span>
                      <span className="info-value">
                        {resident.nguyen_quan || 'Chưa có'}
                      </span>
                    </div>

                    <div className="status-container">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(resident.trang_thai),
                        }}
                      >
                        {formatStatus(resident.trang_thai)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  ← Trước
                </button>

                <div className="pagination-pages">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`pagination-button ${
                            pagination.page === pageNum ? 'active' : ''
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        ) : !error && !loading ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Chưa có kết quả tìm kiếm</h3>
            <p>Nhập ít nhất một tiêu chí tìm kiếm và nhấn "Tìm kiếm"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchNhanKhau;
