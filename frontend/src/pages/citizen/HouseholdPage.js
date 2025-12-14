import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import Household from '../../components/citizen/Household';

const CitizenHouseholdPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <Household currentUser={currentUser} />
    </CitizenLayout>
  );
};

export default CitizenHouseholdPage;
