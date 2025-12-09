import React, { useEffect, useState } from 'react';

const UserProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(currentUser || null);

  useEffect(() => {
    // If currentUser not provided or you want fresh data, try fetching /api/me
    if (!user) {
      fetch('/api/me/', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return (
    <div style={{ padding: 24 }}>
      <h2>Thông tin người dùng</h2>
      <p>Đang tải thông tin...</p>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Thông tin người dùng</h2>
      <div style={{ marginTop: 12, maxWidth: 700 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, padding: 8 }}>
          <strong>Họ tên</strong>
          <div style={{ fontWeight: 600 }}>{user.ho_ten || user.full_name || user.username || '—'}</div>

          <strong>Email</strong>
          <div>{user.email || '—'}</div>

          <strong>Role</strong>
          <div>{user.role_hien_thi || user.role || '—'}</div>

          <strong>Chức vụ</strong>
          <div>{user.chuc_vu_hien_thi || user.chuc_vu || '—'}</div>

          <strong>Ngày tạo</strong>
          <div>{user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
