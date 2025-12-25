import React from 'react';
import OfficerLayout from '../../layouts/OfficerLayout';
import MeetingManagement from '../../components/officer/MeetingManagement';

const OfficerMeetingsPage = ({ currentUser, onLogout }) => {
  return (
    <OfficerLayout currentUser={currentUser} onLogout={onLogout}>
      <MeetingManagement />
    </OfficerLayout>
  );
};

export default OfficerMeetingsPage;
