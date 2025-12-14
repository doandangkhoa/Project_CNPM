import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import HouseholdManagement from '../../components/officer/HouseholdManagement';

const OfficerHouseholdsPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <HouseholdManagement />
    </OfficerLayout>
  );
};

export default OfficerHouseholdsPage;
