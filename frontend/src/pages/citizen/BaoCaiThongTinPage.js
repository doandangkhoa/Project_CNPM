import React from 'react';
import CitizenLayout from '../../layouts/CitizenLayout';
import BaoCaiThongTinForm from '../../components/citizen/BaoCaiThongTinForm';
import '../../styles/BaoCaiThongTinPage.css';

const BaoCaiThongTinPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="bao-sai-thong-tin-page">
        <BaoCaiThongTinForm currentUser={currentUser} />
      </div>
    </CitizenLayout>
  );
};

export default BaoCaiThongTinPage;
