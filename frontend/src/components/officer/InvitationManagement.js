import React, { useState, useEffect, useRef } from 'react';
import '../../styles/InvitationManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getCsrfToken = () => {
  const name = 'csrftoken';
  if (!document.cookie) return '';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
};

const InvitationManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholds, setSelectedHouseholds] = useState(new Set());
  const [invitationFilter, setInvitationFilter] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMode, setSendMode] = useState('all'); // 'all' hoặc 'selected'

  // Fetch meetings
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/sinh-hoat/danh-sach-sinh-hoat/`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách buổi sinh hoạt');
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch households
  const fetchHouseholds = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ho-gia-dinh/`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách hộ gia đình');
      const data = await res.json();
      setHouseholds(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch invitations for selected meeting
  const fetchInvitations = async (meetingId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/sinh-hoat/thu-moi/${meetingId}/danh-sach/`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Lỗi khi tải danh sách thư mời');
      const data = await res.json();
      setInvitations(data.danh_sach || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchHouseholds();
  }, []);

  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowInvitations(true);
    fetchInvitations(meeting.id);
    setSelectedHouseholds(new Set());
  };

  const handleHouseholdToggle = (householdId) => {
    const newSelected = new Set(selectedHouseholds);
    if (newSelected.has(householdId)) {
      newSelected.delete(householdId);
    } else {
      newSelected.add(householdId);
    }
    setSelectedHouseholds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedHouseholds.size === households.length) {
      setSelectedHouseholds(new Set());
    } else {
      setSelectedHouseholds(new Set(households.map(h => h.id)));
    }
  };

  const handleSendInvitations = async () => {
    if (!selectedMeeting) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let url, method = 'POST';
      let body = {};

      if (sendMode === 'all') {
        url = `${API_BASE_URL}/sinh-hoat/thu-moi/${selectedMeeting.id}/gui-toan-bo/`;
      } else {
        url = `${API_BASE_URL}/sinh-hoat/thu-moi/${selectedMeeting.id}/gui-chon-loc/`;
        body = {
          danh_sach_ho_id: Array.from(selectedHouseholds)
        };
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        credentials: 'include',
        body: sendMode === 'all' ? undefined : JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Lỗi khi gửi thư mời');
      const result = await res.json();

      setSuccess(`Đã gửi ${result.tong_cong} thư mời thành công!`);
      setShowSendModal(false);
      fetchInvitations(selectedMeeting.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsViewed = async (invitationId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/sinh-hoat/thu-moi/${invitationId}/cap-nhat-trang-thai/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
          },
          credentials: 'include',
          body: JSON.stringify({ trang_thai: 'da_xem' })
        }
      );

      if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái');
      fetchInvitations(selectedMeeting.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'chua_gui': 'Chưa gửi',
      'da_gui': 'Đã gửi',
      'da_xem': 'Đã xem',
      'da_phan_hoi': 'Đã phản hồi'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'chua_gui': '#f3f4f6',
      'da_gui': '#fef3c7',
      'da_xem': '#dbeafe',
      'da_phan_hoi': '#dcfce7'
    };
    return colors[status] || '#f3f4f6';
  };

  const filteredInvitations = invitations.filter(inv => {
    if (!invitationFilter) return true;
    return inv.trang_thai === invitationFilter;
  });

  return (
    <div className="invitation-management-container">
      <div className="invitation-header">
        <h1>Quản Lý Thư Mời Sinh Hoạt</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {!showInvitations ? (
        <div className="meetings-list">
          <h2>Danh Sách Buổi Sinh Hoạt</h2>
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : meetings.length === 0 ? (
            <div className="no-data">Không có buổi sinh hoạt nào</div>
          ) : (
            <div className="meetings-grid">
              {meetings.map(meeting => (
                <div key={meeting.id} className="meeting-card">
                  <h3>{meeting.chu_de}</h3>
                  <p><strong>Ngày:</strong> {new Date(meeting.ngay_to_chuc).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Giờ:</strong> {meeting.gio_to_chuc}</p>
                  <p><strong>Địa điểm:</strong> {meeting.dia_diem}</p>
                  <button
                    className="btn-select"
                    onClick={() => handleSelectMeeting(meeting)}
                  >
                    Quản Lý Thư Mời
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="invitations-section">
          <button
            className="btn-back"
            onClick={() => {
              setShowInvitations(false);
              setSelectedMeeting(null);
            }}
          >
            ← Quay Lại
          </button>

          <div className="meeting-detail">
            <h2>{selectedMeeting.chu_de}</h2>
            <p>
              {new Date(selectedMeeting.ngay_to_chuc).toLocaleDateString('vi-VN')} - {selectedMeeting.gio_to_chuc}
            </p>
          </div>

          <div className="invitations-controls">
            <div className="filter-group">
              <label>Lọc theo trạng thái:</label>
              <select
                value={invitationFilter}
                onChange={(e) => setInvitationFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="chua_gui">Chưa gửi</option>
                <option value="da_gui">Đã gửi</option>
                <option value="da_xem">Đã xem</option>
                <option value="da_phan_hoi">Đã phản hồi</option>
              </select>
            </div>

            <button
              className="btn-send-invitations"
              onClick={() => setShowSendModal(true)}
            >
              Gửi Thư Mời
            </button>
          </div>

          <div className="invitations-table-wrapper">
            <table className="invitations-table">
              <thead>
                <tr>
                  <th>Tên Chủ Hộ</th>
                  <th>Số Hộ Khẩu</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Gửi</th>
                  <th>Phản Hồi</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map(invitation => (
                  <tr key={invitation.id}>
                    <td>{invitation.ten_chu_ho}</td>
                    <td>{invitation.so_ho_khau}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(invitation.trang_thai) }}
                      >
                        {getStatusLabel(invitation.trang_thai)}
                      </span>
                    </td>
                    <td>{new Date(invitation.ngay_gui).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {invitation.phan_hoi_tham_gia === null
                        ? '-'
                        : invitation.phan_hoi_tham_gia
                        ? '✓ Sẽ tham gia'
                        : '✗ Không tham gia'}
                    </td>
                    <td>
                      {invitation.trang_thai === 'da_gui' && (
                        <button
                          className="btn-small"
                          onClick={() => handleMarkAsViewed(invitation.id)}
                        >
                          Đánh dấu đã xem
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gửi Thư Mời</h3>

            <div className="mode-selector">
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={sendMode === 'all'}
                  onChange={(e) => setSendMode(e.target.value)}
                />
                Gửi cho TẤT CẢ hộ
              </label>
              <label>
                <input
                  type="radio"
                  value="selected"
                  checked={sendMode === 'selected'}
                  onChange={(e) => setSendMode(e.target.value)}
                />
                Gửi cho hộ được chọn
              </label>
            </div>

            {sendMode === 'selected' && (
              <div className="households-selection">
                <button
                  className="btn-select-all"
                  onClick={handleSelectAll}
                >
                  {selectedHouseholds.size === households.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>

                <div className="households-list">
                  {households.map(household => (
                    <label key={household.id} className="household-item">
                      <input
                        type="checkbox"
                        checked={selectedHouseholds.has(household.id)}
                        onChange={() => handleHouseholdToggle(household.id)}
                      />
                      {household.ho_ten_chu_ho} ({household.so_ho_khau})
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-send"
                onClick={handleSendInvitations}
                disabled={sendMode === 'selected' && selectedHouseholds.size === 0}
              >
                Gửi ({sendMode === 'all' ? households.length : selectedHouseholds.size})
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowSendModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationManagement;
