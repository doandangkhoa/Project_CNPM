import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Trang chủ</h1>

      <div className="cards-container">
        <div className="card" onClick={() => handleCardClick('/search')}>
          <h2>Tra cứu</h2>
          <p>Tìm kiếm và xem thông tin chi tiết</p>
        </div>

        {/* Hide management card for regular users (nguoi_dan) or when not logged in */}
        {currentUser && currentUser.role !== 'nguoi_dan' && (
          <div className="card" onClick={() => handleCardClick('/manage')}>
            <h2>Quản lý</h2>
            <p>Thêm, sửa, xóa và cập nhật thông tin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
