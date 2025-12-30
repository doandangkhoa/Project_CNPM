import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import XinCapGiayXacNhanForm from '../../components/citizen/XinCapGiayXacNhanForm';
import '../../styles/XinCapGiayXacNhanPage.css';

const XinCapGiayXacNhanPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="xin-cap-giay-xac-nhan-page">
        <XinCapGiayXacNhanForm currentUser={currentUser} />
      </div>
    </CitizenLayout>
  );
};

export default XinCapGiayXacNhanPage;
