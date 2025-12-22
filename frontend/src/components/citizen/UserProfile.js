import React, { useState, useEffect } from 'react';
import '../../styles/CitizenUserProfile.css';

const CitizenUserProfile = ({ currentUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' hoặc 'household'

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
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
        setProfileData(data);
        setError('');
      } else {
        setError(data.message || 'Không thể tải thông tin hồ sơ');
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin...</div>;
  }

  if (error) {
    return (
      <div className="citizen-profile">
        <div className="error-message">
          <h3>⚠️ {error}</h3>
          <button onClick={fetchProfileData} className="btn-retry">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const nhanKhau = profileData?.nhan_khau;
  const hoGiaDinh = profileData?.ho_gia_dinh;

  return (
    <div className="citizen-profile">
      <div className="profile-header">
        <h2>Hồ Sơ Cá Nhân</h2>
        <p className="subtitle">Thông tin nhân khẩu và hộ khẩu của bạn</p>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          👤 Thông Tin Cá Nhân
        </button>
        <button
          className={`tab-btn ${activeTab === 'household' ? 'active' : ''}`}
          onClick={() => setActiveTab('household')}
        >
          🏠 Thông Tin Hộ Khẩu
        </button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && nhanKhau && (
        <div className="profile-section">
          <div className="section-title">
            <h3>Thông Tin Nhân Khẩu</h3>
          </div>

          <div className="info-grid">
            {/* Row 1 */}
            <div className="info-item">
              <label>Họ và Tên:</label>
              <span>{nhanKhau.ho_ten}</span>
            </div>
            <div className="info-item">
              <label>Giới Tính:</label>
              <span>{nhanKhau.gioi_tinh_hien_thi}</span>
            </div>
            <div className="info-item">
              <label>Tuổi:</label>
              <span>{nhanKhau.tuoi} tuổi</span>
            </div>

            {/* Row 2 */}
            <div className="info-item">
              <label>Ngày Sinh:</label>
              <span>
                {new Date(nhanKhau.ngay_sinh).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="info-item">
              <label>Nơi Sinh:</label>
              <span>{nhanKhau.noi_sinh}</span>
            </div>
            <div className="info-item">
              <label>Quốc Tịch:</label>
              <span>Việt Nam</span>
            </div>

            {/* Row 3 */}
            <div className="info-item">
              <label>Số CCCD:</label>
              <span className="cccd">{nhanKhau.so_cccd}</span>
            </div>
            <div className="info-item">
              <label>Nơi Cấp CCCD:</label>
              <span>{nhanKhau.noi_cap}</span>
            </div>
            <div className="info-item">
              <label>Ngày Cấp:</label>
              <span>
                {nhanKhau.ngay_cap
                  ? new Date(nhanKhau.ngay_cap).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </span>
            </div>

            {/* Row 4 */}
            <div className="info-item">
              <label>Dân Tộc:</label>
              <span>{nhanKhau.dan_toc}</span>
            </div>
            <div className="info-item">
              <label>Nguyên Quán:</label>
              <span>{nhanKhau.nguyen_quan}</span>
            </div>
            <div className="info-item">
              <label>Trạng Thái:</label>
              <span className={`status-badge ${nhanKhau.trang_thai}`}>
                {nhanKhau.trang_thai_hien_thi}
              </span>
            </div>

            {/* Row 5 */}
            <div className="info-item full-width">
              <label>Nghề Nghiệp:</label>
              <span>{nhanKhau.nghe_nghiep || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item full-width">
              <label>Nơi Làm Việc:</label>
              <span>{nhanKhau.noi_lam_viec || 'Chưa cập nhật'}</span>
            </div>

            {/* Row 6 */}
            <div className="info-item full-width">
              <label>Quan Hệ với Chủ Hộ:</label>
              <span>{nhanKhau.quan_he_voi_chu_ho || 'Chưa cập nhật'}</span>
            </div>

            {nhanKhau.ghi_chu && (
              <div className="info-item full-width">
                <label>Ghi Chú:</label>
                <span>{nhanKhau.ghi_chu}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Household Information Tab */}
      {activeTab === 'household' && hoGiaDinh ? (
        <div className="profile-section">
          <div className="section-title">
            <h3>Thông Tin Hộ Khẩu</h3>
          </div>

          <div className="info-grid">
            {/* Row 1 */}
            <div className="info-item">
              <label>Số Hộ Khẩu:</label>
              <span className="ho-khau-number">{hoGiaDinh.so_ho_khau}</span>
            </div>
            <div className="info-item">
              <label>Chủ Hộ:</label>
              <span>{hoGiaDinh.ho_ten_chu_ho}</span>
            </div>
            <div className="info-item">
              <label>Số Thành Viên:</label>
              <span className="member-count">
                {hoGiaDinh.so_luong_thanh_vien} người
              </span>
            </div>

            {/* Row 2 */}
            <div className="info-item full-width">
              <label>Địa Chỉ:</label>
              <span>{hoGiaDinh.dia_chi}</span>
            </div>

            {/* Row 3 */}
            <div className="info-item">
              <label>Phường/Xã:</label>
              <span>{hoGiaDinh.phuong_xa}</span>
            </div>
            <div className="info-item">
              <label>Số Điện Thoại:</label>
              <span>{hoGiaDinh.so_dien_thoai || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-item">
              <label>Ngày Tạo:</label>
              <span>
                {new Date(hoGiaDinh.ngay_tao).toLocaleDateString('vi-VN')}
              </span>
            </div>

            {hoGiaDinh.ghi_chu && (
              <div className="info-item full-width">
                <label>Ghi Chú:</label>
                <span>{hoGiaDinh.ghi_chu}</span>
              </div>
            )}
          </div>

          {/* Members List */}
          {hoGiaDinh.danh_sach_thanh_vien &&
            hoGiaDinh.danh_sach_thanh_vien.length > 0 && (
              <div className="members-section">
                <h4>Danh Sách Thành Viên</h4>
                <div className="members-table">
                  <table>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Họ và Tên</th>
                        <th>Ngày Sinh</th>
                        <th>Giới Tính</th>
                        <th>Quan Hệ</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hoGiaDinh.danh_sach_thanh_vien.map((member, index) => (
                        <tr key={member.id}>
                          <td>{index + 1}</td>
                          <td>{member.ho_ten}</td>
                          <td>
                            {new Date(member.ngay_sinh).toLocaleDateString(
                              'vi-VN'
                            )}
                          </td>
                          <td>{member.gioi_tinh_hien_thi}</td>
                          <td>{member.quan_he_voi_chu_ho_display}</td>
                          <td>
                            <span
                              className={`status-badge ${member.trang_thai}`}
                            >
                              {member.trang_thai === 'thuong_tru' &&
                                'Thường Trú'}
                              {member.trang_thai === 'tam_tru' && 'Tạm Trú'}
                              {member.trang_thai === 'tam_vang' && 'Tạm Vắng'}
                              {member.trang_thai === 'chuyen_di' &&
                                'Đã Chuyển Đi'}
                              {member.trang_thai === 'da_chet' && 'Đã Qua Đời'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      ) : (
        activeTab === 'household' && (
          <div className="profile-section">
            <p className="no-data">Chưa có thông tin hộ khẩu.</p>
          </div>
        )
      )}
    </div>
  );
};

export default CitizenUserProfile;
