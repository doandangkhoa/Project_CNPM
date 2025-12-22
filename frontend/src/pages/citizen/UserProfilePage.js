import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import UserProfile from '../../components/citizen/UserProfile';

const CitizenUserProfilePage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <UserProfile currentUser={currentUser} />
    </CitizenLayout>
  );
};

export default CitizenUserProfilePage;
