import React, { useState, useEffect, useRef } from 'react';
import '../../styles/MeetingManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper: get CSRF token from cookie (Django default)
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

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    chu_de: '',
    ngay_to_chuc: '',
    gio_to_chuc: '',
    dia_diem: '',
    noi_dung: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [formErrors, setFormErrors] = useState(null);
  const searchTimeout = useRef(null);

  // Load meetings: uses 'tim-kiem' when search params present to support filtering server-side
  const fetchMeetings = async (query = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.chu_de || search) params.append('chu_de', query.chu_de || search);
      if (query.ngay_to_chuc || dateSearch) params.append('ngay_to_chuc', query.ngay_to_chuc || dateSearch);

      const url = params.toString()
        ? `${API_BASE_URL}/sinh-hoat/tim-kiem/?${params}`
        : `${API_BASE_URL}/sinh-hoat/danh-sach-sinh-hoat/`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Bạn cần đăng nhập lại');
        throw new Error('Lỗi khi tải danh sách buổi sinh hoạt');
      }
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // debounce search to avoid excessive requests
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchMeetings(), 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, dateSearch]);

  const openCreate = () => {
    setFormData({ chu_de: '', ngay_to_chuc: '', gio_to_chuc: '', dia_diem: '', noi_dung: '' });
    setEditingId(null);
    setFormErrors(null);
    setShowForm(true);
  };

  const handleEdit = (meeting) => {
    setFormData({
      chu_de: meeting.chu_de || '',
      ngay_to_chuc: meeting.ngay_to_chuc || '',
      gio_to_chuc: meeting.gio_to_chuc || '',
      dia_diem: meeting.dia_diem || '',
      noi_dung: meeting.noi_dung || '',
    });
    setEditingId(meeting.id);
    setFormErrors(null);
    setShowForm(true);
  };

  const handleView = async (meeting) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/sinh-hoat/${meeting.id}/chi-tiet/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Không thể tải chi tiết');
      const data = await res.json();
      setSelectedMeeting(data);
      setShowAttendance(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa buổi sinh hoạt này?')) return;
    setLoading(true);
    setError(null);
    try {
      const csrf = getCsrfToken();
      const res = await fetch(`${API_BASE_URL}/sinh-hoat/${id}/xoa/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrf },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      await fetchMeetings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFormErrors(null);
    try {
      const csrf = getCsrfToken();
      const url = editingId ? `${API_BASE_URL}/sinh-hoat/${editingId}/cap-nhat/` : `${API_BASE_URL}/sinh-hoat/them-moi/`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
        body: JSON.stringify(formData),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        // If server returns validation errors, show them
        if (payload && typeof payload === 'object') {
          setFormErrors(payload);
          throw new Error('Dữ liệu không hợp lệ');
        }
        throw new Error(payload?.detail || 'Lỗi lưu dữ liệu');
      }
      setShowForm(false);
      await fetchMeetings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (meeting) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/sinh-hoat/diem-danh/${meeting.id}/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Không thể tải danh sách điểm danh');
      const data = await res.json();
      setAttendanceList(Array.isArray(data) ? data : data.results || []);
      setSelectedMeeting(meeting);
      setShowAttendance(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // toggle attendance (auto-save on change)
  const toggleAttendance = async (hoId, checked) => {
    // Validate hoId - must be a number
    if (!hoId || isNaN(hoId)) {
      setError('ID hộ không hợp lệ');
      return;
    }
    setError(null);
    try {
      const csrf = getCsrfToken();
      const payload = {
        lich_id: selectedMeeting.id,
        ho_id: parseInt(hoId),
        trang_thai: !!checked,
      };
      const res = await fetch(`${API_BASE_URL}/sinh-hoat/diem-danh/cap-nhat/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || payload?.detail || 'Không thể cập nhật điểm danh');
      }
      // update local state
      setAttendanceList((prev) => prev.map((r) => {
        const rid = r.ho_gia_dinh ? (typeof r.ho_gia_dinh === 'object' ? r.ho_gia_dinh.id : r.ho_gia_dinh) : r.id;
        if (rid === parseInt(hoId)) return { ...r, da_tham_gia: checked };
        return r;
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="meeting-management">
      <header className="mm-header">
        <h2>Quản Lý Buổi Sinh Hoạt</h2>
        <div className="mm-controls">
          <input placeholder="Tìm theo chủ đề" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="date" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} />
          <button onClick={() => fetchMeetings()}>Tìm</button>
          <button onClick={openCreate}>Tạo mới</button>
        </div>
      </header>

      {loading && <div className="mm-loading">Đang tải...</div>}
      {error && <div className="mm-error">{error}</div>}

      <table className="mm-table">
        <thead>
          <tr>
            <th>Chủ đề</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Địa điểm</th>
            <th>Tham gia</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m) => (
            <tr key={m.id}>
              <td>{m.chu_de}</td>
              <td>{m.ngay_to_chuc}</td>
              <td>{m.gio_to_chuc}</td>
              <td>{m.dia_diem}</td>
              <td>{m.so_luong_tham_gia ?? '-'}</td>
              <td>
                <button onClick={() => handleView(m)}>Xem</button>
                <button onClick={() => handleEdit(m)}>Sửa</button>
                <button onClick={() => handleDelete(m.id)}>Xóa</button>
                <button onClick={() => loadAttendance(m)}>Điểm danh</button>
              </td>
            </tr>
          ))}
          {meetings.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center' }}>Không có buổi sinh hoạt</td></tr>
          )}
        </tbody>
      </table>

      {/* Form Modal */}
      {showForm && (
        <div className="mm-modal-overlay">
          <div className="mm-modal">
            <form className="mm-form" onSubmit={handleFormSubmit}>
              <h3>{editingId ? 'Cập nhật' : 'Tạo mới'} buổi sinh hoạt</h3>
              <label>
                Chủ đề
                <input name="chu_de" value={formData.chu_de} onChange={(e) => setFormData({ ...formData, chu_de: e.target.value })} required />
                {formErrors?.chu_de && <div className="mm-field-error">{formErrors.chu_de}</div>}
              </label>
              <label>
                Ngày tổ chức
                <input type="date" name="ngay_to_chuc" value={formData.ngay_to_chuc} onChange={(e) => setFormData({ ...formData, ngay_to_chuc: e.target.value })} required />
                {formErrors?.ngay_to_chuc && <div className="mm-field-error">{formErrors.ngay_to_chuc}</div>}
              </label>
              <label>
                Giờ tổ chức
                <input type="time" name="gio_to_chuc" value={formData.gio_to_chuc} onChange={(e) => setFormData({ ...formData, gio_to_chuc: e.target.value })} required />
                {formErrors?.gio_to_chuc && <div className="mm-field-error">{formErrors.gio_to_chuc}</div>}
              </label>
              <label>
                Địa điểm
                <input name="dia_diem" value={formData.dia_diem} onChange={(e) => setFormData({ ...formData, dia_diem: e.target.value })} />
              </label>
              <label>
                Nội dung
                <textarea name="noi_dung" value={formData.noi_dung} onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })} />
              </label>
              <div className="mm-form-actions">
                <button type="submit">Lưu</button>
                <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Attendance Panel */}
      {selectedMeeting && (
        <div className="mm-detail">
          <h3>Chi tiết buổi sinh hoạt: </h3>
          <p><strong>Chủ đề:</strong> {selectedMeeting.chu_de}</p>
          <p><strong>Ngày:</strong> {selectedMeeting.ngay_to_chuc}</p>
          <p><strong>Giờ:</strong> {selectedMeeting.gio_to_chuc}</p>
          <p><strong>Địa điểm:</strong> {selectedMeeting.dia_diem}</p>
          <p><strong>Nội dung:</strong> {selectedMeeting.noi_dung}</p>

          {showAttendance ? (
            <div className="mm-attendance">
              <h4>Danh sách điểm danh</h4>
              <table>
                <thead>
                  <tr><th>Hộ</th><th>Tên</th><th>Số hộ khẩu</th><th>Đã tham gia</th></tr>
                </thead>
                <tbody>
                  {attendanceList.map((r, idx) => {
                    // Two possible shapes: HoGiaDinh objects (raw) or ThamGiaSinhHoat records with 'ho_gia_dinh' nested
                    let hoId = null;
                    let tenChuHo = '-';
                    let soHoKhau = '-';
                    
                    if (r.ho_gia_dinh) {
                      // If ho_gia_dinh is an object
                      if (typeof r.ho_gia_dinh === 'object') {
                        hoId = r.ho_gia_dinh.id;
                        tenChuHo = r.ho_gia_dinh.ho_ten_chu_ho || r.ho_gia_dinh.ten_chu_ho;
                        soHoKhau = r.ho_gia_dinh.so_ho_khau;
                      } else {
                        // If ho_gia_dinh is an ID
                        hoId = r.ho_gia_dinh;
                        tenChuHo = r.ten_chu_ho;
                        soHoKhau = r.so_ho_khau;
                      }
                    } else {
                      // Direct object (HoGiaDinh)
                      hoId = r.id;
                      tenChuHo = r.ho_ten_chu_ho || r.ten_chu_ho;
                      soHoKhau = r.so_ho_khau;
                    }
                    
                    const da = !!(r.da_tham_gia);
                    return (
                      <tr key={idx}>
                        <td>{hoId ?? '-'}</td>
                        <td>{tenChuHo}</td>
                        <td>{soHoKhau}</td>
                        <td>
                          <input type="checkbox" checked={da} onChange={(e) => toggleAttendance(hoId, e.target.checked)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mm-detail-actions">
              <button onClick={() => loadAttendance(selectedMeeting)}>Danh sách tham gia</button>
            </div>
          )}

          <div className="mm-close">
            <button onClick={() => { setSelectedMeeting(null); setShowAttendance(false); }}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManagement;
