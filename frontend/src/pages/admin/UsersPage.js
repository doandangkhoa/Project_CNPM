import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import UserManagement from '../../components/admin/UserManagement';

const AdminUsersPage = ({ currentUser, onLogout }) => {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <UserManagement />
    </AdminLayout>
  );
};

export default AdminUsersPage;
