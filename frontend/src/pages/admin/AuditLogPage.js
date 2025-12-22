import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import AuditLog from '../../components/admin/AuditLog';

const AdminAuditLogPage = ({ currentUser, onLogout }) => {
  return (
    <AdminLayout currentUser={currentUser} onLogout={onLogout}>
      <AuditLog />
    </AdminLayout>
  );
};

export default AdminAuditLogPage;
