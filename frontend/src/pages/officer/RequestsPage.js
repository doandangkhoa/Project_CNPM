import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import RequestApproval from '../../components/officer/RequestApproval';

const OfficerRequestsPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <RequestApproval />
    </OfficerLayout>
  );
};

export default OfficerRequestsPage;
