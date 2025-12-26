import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import GiaDinhVanHoaManagement from '../../components/officer/GiaDinhVanHoaManagement';

const GiaDinhVanHoaPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <GiaDinhVanHoaManagement />
    </OfficerLayout>
  );
};

export default GiaDinhVanHoaPage;
