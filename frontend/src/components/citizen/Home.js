import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/CitizenHome.css';

const CitizenHome = ({ currentUser }) => {
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
              <Link to="/citizen/tam-tru-tam-vang" className="service-btn">
                Nộp đơn
              </Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📜</div>
              <h3>Cấp Giấy Xác Nhận</h3>
              <p>Yêu cầu cấp giấy xác nhận thông tin</p>
              <a href="/citizen/services?type=xac_nhan" className="service-btn">
                Nộp Đơn
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">⚠️</div>
              <h3>Báo Sai Thông Tin</h3>
              <p>Báo cáo thông tin không chính xác</p>
              <a
                href="/citizen/services?type=update_info"
                className="service-btn"
              >
                Nộp Đơn
              </a>
            </div>
          </div>
        </section>

        {/* Recent Requests */}
        <section className="recent-section">
          <h2>Yêu Cầu Gần Đây</h2>
          <div className="recent-list">
            <div className="recent-item">
              <div className="item-status approved">Đã Duyệt</div>
              <div className="item-content">
                <h4>Báo Sai Thông Tin</h4>
                <p>Cập nhật địa chỉ thường trú</p>
              </div>
              <div className="item-date">15/11/2024</div>
            </div>

            <div className="recent-item">
              <div className="item-status pending">Chờ Duyệt</div>
              <div className="item-content">
                <h4>Đăng Ký Tạm Trú</h4>
                <p>Tạm trú tại địa chỉ 123 Đường Lê Lợi</p>
              </div>
              <div className="item-date">01/12/2024</div>
            </div>

            <div className="recent-item">
              <div className="item-status approved">Đã Duyệt</div>
              <div className="item-content">
                <h4>Khai Báo Tạm Vắng</h4>
                <p>Tạm vắng từ 10/12 đến 20/12</p>
              </div>
              <div className="item-date">10/12/2024</div>
            </div>
          </div>
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
