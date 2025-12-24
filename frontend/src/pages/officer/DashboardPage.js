import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import ReportPage from './ReportPage';

const OfficerDashboardPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <ReportPage />
    </OfficerLayout>
  );
};

export default OfficerDashboardPage;
