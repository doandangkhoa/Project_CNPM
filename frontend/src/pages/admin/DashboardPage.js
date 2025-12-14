import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';

const AdminDashboardPage = ({ currentUser, onLogout }) => {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <Dashboard />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
