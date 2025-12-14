import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import Home from '../../components/citizen/Home';

const CitizenHomePage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <Home currentUser={currentUser} />
    </CitizenLayout>
  );
};

export default CitizenHomePage;
