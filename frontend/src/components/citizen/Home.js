import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CitizenHome.css';

const CitizenHome = ({ currentUser }) => {
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        'http://localhost:8000/api/tam-tru-tam-vang/gan-day/',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentRequests(Array.isArray(data.data) ? data.data : []);
      } else {
        setError('Không thể tải yêu cầu gần đây');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
      console.error('Error fetching recent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'da_duyet':
        return 'approved';
      case 'cho_duyet':
        return 'pending';
      case 'tu_choi':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'da_duyet':
        return 'Đã Duyệt';
      case 'cho_duyet':
        return 'Chờ Duyệt';
      case 'tu_choi':
        return 'Từ Chối';
      default:
        return status;
    }
  };

  const getLoaiPhieuLabel = (loai) => {
    switch (loai) {
      case 'tam_tru':
        return 'Đăng Ký Tạm Trú';
      case 'tam_vang':
        return 'Khai Báo Tạm Vắng';
      default:
        return loai;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="citizen-home">
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Cổng Dịch Vụ Công Trực Tuyến</h1>
        </div>
      </div>

      <div className="home-container">
        {/* Quick Stats */}

        {/* Services Section */}
        <section className="services-section">
          <h2>Dịch Vụ Công</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🏠</div>
              <h3>Đăng Ký Tạm Trú/Tạm Vắng</h3>
              <p>Đăng ký tạm trú tại địa chỉ khác</p>
              <Link to="/citizen/request" className="service-btn">
                Nộp đơn
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📜</div>
              <h3>Cấp Giấy Xác Nhận</h3>
              <p>Yêu cầu cấp giấy xác nhận thông tin</p>
              <Link to="/citizen/xin-cap-giay-xac-nhan" className="service-btn">
                Nộp Đơn
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">⚠️</div>
              <h3>Báo Sai Thông Tin</h3>
              <p>Báo cáo thông tin không chính xác</p>
              <Link to="/citizen/bao-sai-thong-tin" className="service-btn">
                Nộp Đơn
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Requests */}
        <section className="recent-section">
          <h2>Yêu Cầu Gần Đây</h2>
          {error && (
            <div className="alert alert-warning">
              {error}. <button onClick={fetchRecentRequests}>Thử lại</button>
            </div>
          )}
          {loading ? (
            <div className="loading">Đang tải yêu cầu...</div>
          ) : recentRequests.length > 0 ? (
            <div className="recent-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="recent-item">
                  <div
                    className={`item-status ${getStatusBadgeClass(
                      request.trang_thai
                    )}`}
                  >
                    {getStatusLabel(request.trang_thai)}
                  </div>
                  <div className="item-content">
                    <h4>{getLoaiPhieuLabel(request.loai_phieu)}</h4>
                    <p>
                      {request.dia_chi_tam_tru ||
                        request.ly_do ||
                        'Không có mô tả'}
                    </p>
                  </div>
                  <div className="item-date">
                    {formatDate(request.ngay_bat_dau)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                Chưa có yêu cầu nào.{' '}
                <Link to="/citizen/request">Nộp yêu cầu mới</Link>
              </p>
            </div>
          )}
        </section>

        {/* Help Section */}
        <section className="help-section">
          <h2>Trợ Giúp</h2>
          <div className="help-grid">
            <div className="help-item">
              <h4>Hướng Dẫn Sử Dụng</h4>
              <p>Tìm hiểu cách sử dụng các dịch vụ công trực tuyến</p>
              <Link
                to="/citizen/home"
                className="help-link"
                title="Tính năng đang phát triển"
              >
                Xem hướng dẫn →
              </Link>
            </div>
            <div className="help-item">
              <h4>Câu Hỏi Thường Gặp</h4>
              <p>Giải đáp các câu hỏi thường được hỏi</p>
              <Link
                to="/citizen/home"
                className="help-link"
                title="Tính năng đang phát triển"
              >
                Xem FAQ →
              </Link>
            </div>
            <div className="help-item">
              <h4>Liên Hệ Hỗ Trợ</h4>
              <p>Liên hệ với bộ phận hỗ trợ kỹ thuật</p>
              <Link
                to="/citizen/home"
                className="help-link"
                title="Tính năng đang phát triển"
              >
                Liên hệ →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CitizenHome;
