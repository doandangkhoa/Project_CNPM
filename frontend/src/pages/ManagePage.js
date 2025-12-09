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
      title: 'Thêm nhân khẩu',
      description: 'Thêm thông tin nhân khẩu mới vào hệ thống',
      path: '/resident-add',
    },
    {
      title: 'Cập nhật nhân khẩu',
      description: 'Cập nhật thông tin nhân khẩu',
      path: '/resident-update',
    },
    {
      title: 'Tách hộ khẩu',
      description: 'Thực hiện tách hộ khẩu cho nhân khẩu',
      path: '/manage/split-household',
    },
    {
      title: 'Khai báo tạm vắng/tạm trú',
      description: 'Quản lý thông tin tạm vắng và tạm trú',
      path: '/manage/temporary-residence',
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
