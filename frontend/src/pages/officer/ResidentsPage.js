import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import PopulationManagement from '../../components/officer/PopulationManagement';

const OfficerResidentsPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <PopulationManagement />
    </OfficerLayout>
  );
};

export default OfficerResidentsPage;
