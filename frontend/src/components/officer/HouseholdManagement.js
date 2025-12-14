import React, { useState, useEffect } from 'react';
import '../../styles/OfficerHouseholdManagement.css';

const OfficerHouseholdManagement = () => {
  const [households, setHouseholds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockHouseholds = [
      {
        id: 1,
        so_ho_khau: '001',
        chu_ho: 'Nguyễn Văn A',
        cccd_chu_ho: '12345678901',
        dia_chi: '123 Đường Lê Lợi, Phường 1, Quận 1',
        so_thanh_vien: 4,
        trang_thai: 'hoat_dong',
        ngay_cap: '2020-01-15',
        ghi_chu: '',
      },
      {
        id: 2,
        so_ho_khau: '002',
        chu_ho: 'Trần Thị B',
        cccd_chu_ho: '12345678902',
        dia_chi: '456 Đường Nguyễn Huệ, Phường 2, Quận 1',
        so_thanh_vien: 3,
        trang_thai: 'hoat_dong',
        ngay_cap: '2019-05-20',
        ghi_chu: 'Hộ khẩu kiểm soát',
      },
      {
        id: 3,
        so_ho_khau: '003',
        chu_ho: 'Lê Văn C',
        cccd_chu_ho: '12345678903',
        dia_chi: '789 Đường Trần Hưng Đạo, Phường 3, Quận 1',
        so_thanh_vien: 5,
        trang_thai: 'hoat_dong',
        ngay_cap: '2018-11-10',
        ghi_chu: '',
      },
      {
        id: 4,
        so_ho_khau: '004',
        chu_ho: 'Phạm Thị D',
        cccd_chu_ho: '12345678904',
        dia_chi: '321 Đường Võ Văn Kiệt, Phường 4, Quận 1',
        so_thanh_vien: 2,
        trang_thai: 'tam_dung',
        ngay_cap: '2021-03-12',
        ghi_chu: 'Chủ hộ tạm vắng',
      },
    ];
    setHouseholds(mockHouseholds);
  }, []);

  const filteredHouseholds = households.filter(household => {
    const matchSearch =
      household.chu_ho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.so_ho_khau.includes(searchTerm) ||
      household.cccd_chu_ho.includes(searchTerm) ||
      household.dia_chi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = !filterStatus || household.trang_thai === filterStatus;

    return matchSearch && matchStatus;
  });

  const paginatedHouseholds = filteredHouseholds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHouseholds.length / itemsPerPage);

  const handleViewDetail = (household) => {
    setSelectedHousehold(household);
    setShowDetail(true);
  };

  const handleEditHousehold = (household) => {
    // Implementation for edit
    console.log('Edit household:', household);
  };

  return (
    <div className="officer-household-management">
      <div className="section-header">
        <h2>Quản Lý Hộ Khẩu</h2>
        <button className="btn btn-primary">+ Tạo Hộ Khẩu Mới</button>
      </div>

      {/* Search & Filter */}
      <div className="search-filter">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên chủ hộ, số hộ khẩu, CCCD, địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="hoat_dong">Hoạt động</option>
            <option value="tam_dung">Tạm dừng</option>
            <option value="huy">Hủy</option>
          </select>
        </div>
      </div>

      {/* Households Table */}
      <div className="households-table-container">
        <table className="households-table">
          <thead>
            <tr>
              <th>Số Hộ Khẩu</th>
              <th>Chủ Hộ</th>
              <th>CCCD</th>
              <th>Địa Chỉ</th>
              <th>Số Thành Viên</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHouseholds.map(household => (
              <tr key={household.id}>
                <td className="household-id">{household.so_ho_khau}</td>
                <td className="head-name">{household.chu_ho}</td>
                <td className="cccd">{household.cccd_chu_ho}</td>
                <td className="address">{household.dia_chi}</td>
                <td className="member-count">{household.so_thanh_vien} người</td>
                <td className="actions">
                  <button
                    className="btn-action detail"
                    onClick={() => handleViewDetail(household)}
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button
                    className="btn-action edit"
                    onClick={() => handleEditHousehold(household)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedHouseholds.length === 0 && (
          <div className="empty-state">
            <p>Không tìm thấy hộ khẩu nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ← Trước
        </button>
        <span className="page-info">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Tiếp →
        </button>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedHousehold && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Hộ Khẩu</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông Tin Chủ Hộ</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Số Hộ Khẩu:</label>
                    <span>{selectedHousehold.so_ho_khau}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên Chủ Hộ:</label>
                    <span>{selectedHousehold.chu_ho}</span>
                  </div>
                  <div className="detail-item">
                    <label>CCCD:</label>
                    <span>{selectedHousehold.cccd_chu_ho}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`status-badge ${selectedHousehold.trang_thai}`}>
                      {selectedHousehold.trang_thai === 'hoat_dong'
                        ? 'Hoạt động'
                        : selectedHousehold.trang_thai === 'tam_dung'
                        ? 'Tạm dừng'
                        : 'Hủy'}
                    </span>
                  </div>
                  <div className="detail-item full">
                    <label>Địa Chỉ:</label>
                    <span>{selectedHousehold.dia_chi}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Danh Sách Thành Viên ({selectedHousehold.so_thanh_vien} người)</h4>
                <div className="members-list">
                  <p className="placeholder">
                    (Dữ liệu thành viên sẽ được tải từ API)
                  </p>
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
              <button className="btn btn-primary">Chỉnh Sửa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerHouseholdManagement;
