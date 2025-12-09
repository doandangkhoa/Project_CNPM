import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagePage.css';

const ManagePage = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  const managementOptions = [
    {
      title: 'Tìm theo ID',
      description: 'Tìm nhân khẩu theo ID',
      path: '/resident-findbyid',
    },
    {
      title: 'Tìm theo cách khác',
      description: 'Tìm theo họ tên, CCCD, ngày sinh hoặc số hộ khẩu',
      path: '/resident-find',
    },
  ];

  return (
    <div className="manage-container">
      <h1 className="manage-title">Quản lý</h1>

      <div className="manage-cards-container">
        {managementOptions.map((option, index) => (
          <div
            key={index}
            className="manage-card"
            onClick={() => handleCardClick(option.path)}
          >
            <h2>{option.title}</h2>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePage;
