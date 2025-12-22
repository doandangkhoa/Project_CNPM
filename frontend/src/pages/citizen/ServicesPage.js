import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import Services from '../../components/citizen/Services';

const CitizenServicesPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <Services currentUser={currentUser} />
    </CitizenLayout>
  );
};

export default CitizenServicesPage;
