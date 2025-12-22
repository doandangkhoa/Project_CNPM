import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import Dashboard from '../../components/officer/Dashboard';

const OfficerDashboardPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <Dashboard currentUser={currentUser} />
    </OfficerLayout>
  );
};

export default OfficerDashboardPage;
