import React, { useState, useEffect } from 'react';
import '../../styles/CitizenHousehold.css';

const CitizenHousehold = ({ currentUser }) => {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    // Mock data - In production, fetch from API using currentUser.id
    const mockHousehold = {
      so_ho_khau: '001',
      chu_ho: 'Nguyễn Văn A',
      cccd_chu_ho: '12345678901',
      dia_chi: '123 Đường Lê Lợi, Phường 1, Quận 1',
      ngay_cap: '2020-01-15',
      trang_thai: 'hoat_dong',
    };

    const mockMembers = [
      {
        id: 1,
        ho_ten: 'Nguyễn Văn A',
        cccd: '12345678901',
        nam_sinh: 1980,
        gioi_tinh: 'Nam',
        quoc_tich: 'Việt Nam',
        dia_chi_thuong_tru: '123 Đường Lê Lợi',
        quan_he_chu_ho: 'Chủ hộ',
        tinh_trang: 'Sống',
      },
      {
        id: 2,
        ho_ten: 'Nguyễn Thị B',
        cccd: '12345678902',
        nam_sinh: 1985,
        gioi_tinh: 'Nữ',
        quoc_tich: 'Việt Nam',
        dia_chi_thuong_tru: '123 Đường Lê Lợi',
        quan_he_chu_ho: 'Vợ',
        tinh_trang: 'Sống',
      },
      {
        id: 3,
        ho_ten: 'Nguyễn Văn C',
        cccd: '12345678903',
        nam_sinh: 2008,
        gioi_tinh: 'Nam',
        quoc_tich: 'Việt Nam',
        dia_chi_thuong_tru: '123 Đường Lê Lợi',
        quan_he_chu_ho: 'Con',
        tinh_trang: 'Sống',
      },
      {
        id: 4,
        ho_ten: 'Nguyễn Thị D',
        cccd: '12345678904',
        nam_sinh: 2010,
        gioi_tinh: 'Nữ',
        quoc_tich: 'Việt Nam',
        dia_chi_thuong_tru: '123 Đường Lê Lợi',
        quan_he_chu_ho: 'Con',
        tinh_trang: 'Sống',
      },
    ];

    setHousehold(mockHousehold);
    setMembers(mockMembers);
  }, [currentUser]);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  if (!household) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="citizen-household">
      <div className="section-header">
        <h2>Sổ Hộ Khẩu Điện Tử</h2>
        <p className="subtitle">Thông tin thành viên trong hộ gia đình của bạn</p>
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
            <label>Ngày Cấp:</label>
            <span>{new Date(household.ngay_cap).toLocaleDateString('vi-VN')}</span>
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
              {members.map(member => (
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
                    <span className="status-badge">
                      {member.tinh_trang}
                    </span>
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
              <button className="close-btn" onClick={() => setShowDetail(false)}>
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
                  <label>Năm Sinh:</label>
                  <span>{selectedMember.nam_sinh}</span>
                </div>
                <div className="detail-row">
                  <label>Giới Tính:</label>
                  <span>{selectedMember.gioi_tinh}</span>
                </div>
                <div className="detail-row">
                  <label>Quốc Tịch:</label>
                  <span>{selectedMember.quoc_tich}</span>
                </div>
                <div className="detail-row">
                  <label>Quan Hệ Chủ Hộ:</label>
                  <span>{selectedMember.quan_he_chu_ho}</span>
                </div>
                <div className="detail-row">
                  <label>Địa Chỉ Thường Trú:</label>
                  <span>{selectedMember.dia_chi_thuong_tru}</span>
                </div>
                <div className="detail-row">
                  <label>Tình Trạng:</label>
                  <span>{selectedMember.tinh_trang}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
              <a href="/citizen/services?type=update_info" className="btn btn-primary">
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
