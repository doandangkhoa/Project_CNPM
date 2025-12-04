import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagePage.css';

const ManagePage = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Trang quản lý của Admin</h1>

      <div className="cards-container">
        <div
          className="card"
          onClick={() => handleCardClick('/admin/userlist')}
        >
          <h2>Danh sách người dùng</h2>
          <p>Thông tin toàn bộ người dùng</p>
        </div>

        <div
          className="card"
          onClick={() => handleCardClick('/admin/userfind')}
        >
          <h2>Tìm kiếm người dùng</h2>
          <p>Tìm kiếm thông tin một người dùng cụ thể</p>
        </div>
        <div
          className="card"
          onClick={() => handleCardClick('/admin/userupdate')}
        >
          <h2>Cập nhật người dùng</h2>
          <p>Cập nhật thông tin một người dùng cụ thể</p>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
