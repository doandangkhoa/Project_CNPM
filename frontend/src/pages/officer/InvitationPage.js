import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import InvitationManagement from '../../components/officer/InvitationManagement';

const InvitationPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <InvitationManagement />
    </OfficerLayout>
  );
};

export default InvitationPage;
