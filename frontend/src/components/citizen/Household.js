import React, { useState, useEffect } from 'react';
import '../../styles/CitizenHousehold.css';

const CitizenHousehold = ({ currentUser }) => {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHouseholdData();
  }, [currentUser]);

  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        'http://localhost:8000/api/citizen/profile/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const hoGiaDinh = data.ho_gia_dinh;
        const nhanKhau = data.nhan_khau;

        if (hoGiaDinh) {
          setHousehold({
            so_ho_khau: hoGiaDinh.so_ho_khau,
            chu_ho: hoGiaDinh.ho_ten_chu_ho,
            cccd_chu_ho: hoGiaDinh.id_chu_ho ? 'Có' : 'Chưa xác định',
            dia_chi: hoGiaDinh.dia_chi,
            phuong_xa: hoGiaDinh.phuong_xa,
            so_dien_thoai: hoGiaDinh.so_dien_thoai,
            ngay_tao: hoGiaDinh.ngay_tao,
            so_luong_thanh_vien: hoGiaDinh.so_luong_thanh_vien,
          });

          // Map danh sách thành viên
          if (
            hoGiaDinh.danh_sach_thanh_vien &&
            hoGiaDinh.danh_sach_thanh_vien.length > 0
          ) {
            setMembers(
              hoGiaDinh.danh_sach_thanh_vien.map((m) => ({
                id: m.id,
                ho_ten: m.ho_ten,
                cccd: m.so_cccd,
                ngay_sinh: m.ngay_sinh,
                gioi_tinh: m.gioi_tinh_hien_thi,
                quan_he_chu_ho: m.quan_he_voi_chu_ho_display,
                tuoi: m.tuoi,
                trang_thai: m.trang_thai,
              }))
            );
          }
        } else {
          setError('Chưa có thông tin hộ khẩu');
        }
      } else {
        setError(data.message || 'Không thể tải thông tin hộ khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="citizen-household">
        <div className="error-message">
          <h3>⚠️ {error}</h3>
          <button onClick={fetchHouseholdData} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!household) {
    return <div className="loading">Không có thông tin hộ khẩu.</div>;
  }

  return (
    <div className="citizen-household">
      <div className="section-header">
        <h2>Sổ Hộ Khẩu Điện Tử</h2>
        <p className="subtitle">
          Thông tin thành viên trong hộ gia đình của bạn
        </p>
      </div>

      {/* Household Info */}
      <div className="household-info">
        <h3>Thông Tin Hộ Khẩu</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Số Hộ Khẩu:</label>
            <span>{household.so_ho_khau}</span>
          </div>
          <div className="info-item">
            <label>Chủ Hộ:</label>
            <span>{household.chu_ho}</span>
          </div>
          <div className="info-item">
            <label>CCCD Chủ Hộ:</label>
            <span>{household.cccd_chu_ho}</span>
          </div>
          <div className="info-item">
            <label>Trạng Thái:</label>
            <span className="status-badge active">Hoạt động</span>
          </div>
          <div className="info-item full-width">
            <label>Địa Chỉ:</label>
            <span>{household.dia_chi}</span>
          </div>
          <div className="info-item">
            <label>Phường/Xã:</label>
            <span>{household.phuong_xa}</span>
          </div>
          <div className="info-item">
            <label>Số Điện Thoại:</label>
            <span>{household.so_dien_thoai || 'Chưa cập nhật'}</span>
          </div>
          <div className="info-item">
            <label>Ngày Tạo:</label>
            <span>
              {new Date(household.ngay_tao).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="members-section">
        <h3>Danh Sách Thành Viên ({members.length} người)</h3>
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>CCCD</th>
                <th>Năm Sinh</th>
                <th>Giới Tính</th>
                <th>Quan Hệ</th>
                <th>Tình Trạng</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="member-row">
                  <td className="member-name">{member.ho_ten}</td>
                  <td>{member.cccd}</td>
                  <td>{member.nam_sinh}</td>
                  <td>{member.gioi_tinh}</td>
                  <td>
                    <span className="relation-badge">
                      {member.quan_he_chu_ho}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge">{member.tinh_trang}</span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-action detail"
                      onClick={() => handleViewMember(member)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <h3>Thao Tác</h3>
        <div className="action-buttons">
          <a href="/citizen/services?type=update_info" className="action-btn">
            ⚠️ Báo Sai Thông Tin
          </a>
          <a href="/citizen/services?type=tam_tru" className="action-btn">
            🏠 Đăng Ký Tạm Trú
          </a>
          <a href="/citizen/services?type=tam_vang" className="action-btn">
            📋 Khai Báo Tạm Vắng
          </a>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Thành Viên</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-row">
                  <label>Họ Tên:</label>
                  <span>{selectedMember.ho_ten}</span>
                </div>
                <div className="detail-row">
                  <label>CCCD:</label>
                  <span>{selectedMember.cccd}</span>
                </div>
                <div className="detail-row">
                  <label>Ngày Sinh:</label>
                  <span>
                    {selectedMember.ngay_sinh
                      ? new Date(selectedMember.ngay_sinh).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Giới Tính:</label>
                  <span>{selectedMember.gioi_tinh}</span>
                </div>
                <div className="detail-row">
                  <label>Tuổi:</label>
                  <span>{selectedMember.tuoi} tuổi</span>
                </div>
                <div className="detail-row">
                  <label>Tình Trạng:</label>
                  <span className={`status-badge ${selectedMember.trang_thai}`}>
                    {selectedMember.trang_thai === 'thuong_tru' && 'Thường Trú'}
                    {selectedMember.trang_thai === 'tam_tru' && 'Tạm Trú'}
                    {selectedMember.trang_thai === 'tam_vang' && 'Tạm Vắng'}
                    {selectedMember.trang_thai === 'chuyen_di' &&
                      'Đã Chuyển Đi'}
                    {selectedMember.trang_thai === 'da_chet' && 'Đã Qua Đời'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
              <a
                href="/citizen/services?type=update_info"
                className="btn btn-primary"
              >
                Báo Sai Thông Tin
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenHousehold;
