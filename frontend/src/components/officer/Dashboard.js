import React, { useState, useEffect } from 'react';
import '../../styles/OfficerDashboard.css';

const OfficerDashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalHouseholds: 0,
    pendingRequests: 0,
    todayRequests: 0,
  });

  useEffect(() => {
    // Simulate fetching stats from API
    const fetchStats = () => {
      setStats({
        totalResidents: 2845,
        totalHouseholds: 612,
        pendingRequests: 8,
        todayRequests: 3,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="officer-dashboard">
      <h2>Báo Cáo Thống Kê</h2>

      <div className="welcome-section">
        <p>
          Chào mừng,{' '}
          <strong>{currentUser?.ho_ten || currentUser?.username}</strong>!
        </p>
        <p className="subtitle">
          Quản lý dữ liệu dân cư và xử lý yêu cầu từ người dân
        </p>
      </div>

      <div className="stats-grid">
        {/* Total Residents */}
        <div className="stat-card">
          <div className="stat-icon residents">👥</div>
          <div className="stat-content">
            <h3>Tổng Nhân Khẩu</h3>
            <p className="stat-value">{stats.totalResidents}</p>
            <a href="/officer/residents">Xem chi tiết →</a>
          </div>
        </div>

        {/* Total Households */}
        <div className="stat-card">
          <div className="stat-icon households">🏠</div>
          <div className="stat-content">
            <h3>Tổng Hộ Khẩu</h3>
            <p className="stat-value">{stats.totalHouseholds}</p>
            <a href="/officer/households">Xem chi tiết →</a>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="stat-card urgent">
          <div className="stat-icon requests">⏳</div>
          <div className="stat-content">
            <h3>Yêu Cầu Chờ Duyệt</h3>
            <p className="stat-value">{stats.pendingRequests}</p>
            <a href="/officer/requests">Xử lý ngay →</a>
          </div>
        </div>

        {/* Today's Requests */}
        <div className="stat-card">
          <div className="stat-icon today">📅</div>
          <div className="stat-content">
            <h3>Yêu Cầu Hôm Nay</h3>
            <p className="stat-value">{stats.todayRequests}</p>
            <a href="/officer/requests">Xem danh sách →</a>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Thao Tác Nhanh</h3>
        <div className="action-buttons">
          <a href="/officer/residents" className="action-btn">
            <span className="icon">➕</span>
            <span>Thêm Nhân Khẩu</span>
          </a>
          <a href="/officer/households" className="action-btn">
            <span className="icon">➕</span>
            <span>Thêm Hộ Khẩu</span>
          </a>
          <a href="/officer/requests" className="action-btn">
            <span className="icon">✔️</span>
            <span>Duyệt Yêu Cầu</span>
          </a>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Hoạt Động Gần Đây</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="time">Hôm nay 14:30</span>
            <span className="description">Cập nhật thông tin hộ khẩu #001</span>
          </div>
          <div className="activity-item">
            <span className="time">Hôm nay 13:15</span>
            <span className="description">
              Duyệt yêu cầu đăng ký tạm trú từ Nguyễn A
            </span>
          </div>
          <div className="activity-item">
            <span className="time">Hôm nay 11:45</span>
            <span className="description">
              Thêm nhân khẩu mới vào hộ khẩu #025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
