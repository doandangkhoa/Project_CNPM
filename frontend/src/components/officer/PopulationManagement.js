import React, { useState, useEffect, useRef } from 'react';
import '../../styles/OfficerPopulationManagement.css';

const API_BASE_URL = 'http://localhost:8000/api';

const OfficerPopulationManagement = () => {
  const [populations, setPopulations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedPopulation, setSelectedPopulation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const searchTimeoutRef = useRef(null);

  const itemsPerPage = 10;

  // Fetch populations from API
  const fetchPopulations = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
        search: search,
      });

      const response = await fetch(`${API_BASE_URL}/nhan-khau/?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPopulations(data.results || []);
      setTotalCount(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
      console.error('Error fetching populations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for fetching
    searchTimeoutRef.current = setTimeout(() => {
      fetchPopulations(1, value);
    }, 500);
  };

  // Load data on mount
  useEffect(() => {
    fetchPopulations(1, '');
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchPopulations(newPage, searchTerm);
  };

  // Filter populations locally (for status and gender filters)
  const filteredPopulations = populations.filter(pop => {
    const matchStatus = !filterStatus || pop.trang_thai === filterStatus;
    const matchGender = !filterGender || pop.gioi_tinh === filterGender;
    return matchStatus && matchGender;
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch detail population
  const handleViewDetail = async (population) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/nhan-khau/${population.id}/chi-tiet/`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedPopulation(data.nhan_khau);
      setShowDetail(true);
    } catch (err) {
      setError('Lỗi khi tải chi tiết nhân khẩu');
      console.error('Error fetching detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation
  const handleShowDeleteConfirm = (id) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/nhan-khau/${deleteConfirmId}/xoa/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ly_do: '' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh list
      fetchPopulations(currentPage, searchTerm);
      alert('Xóa nhân khẩu thành công');
      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
      setError(null);
    } catch (err) {
      setError('Lỗi khi xóa nhân khẩu');
      console.error('Error deleting:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmId(null);
  };

  // Open form modal for adding new
  const handleAddNewClick = () => {
    setFormData({
      ho_ten: '',
      gioi_tinh: 'Nam',
      ngay_sinh: '',
      noi_sinh: '',
      nguyen_quan: '',
      dan_toc: 'Kinh',
      so_cccd: '',
      ngay_cap: '',
      noi_cap: '',
      quan_he_voi_chu_ho: 'Con trai',
      nghe_nghiep: '',
      noi_lam_viec: '',
      ghi_chu: '',
      ho_gia_dinh: '',
    });
    setIsEditMode(false);
    setFormErrors({});
    setShowFormModal(true);
  };

  // Open form modal for editing
  const handleEditPopulation = (population) => {
    setFormData({
      ho_ten: population.ho_ten || '',
      gioi_tinh: population.gioi_tinh || 'Nam',
      ngay_sinh: population.ngay_sinh || '',
      noi_sinh: population.noi_sinh || '',
      nguyen_quan: population.nguyen_quan || '',
      dan_toc: population.dan_toc || 'Kinh',
      so_cccd: population.so_cccd || '',
      ngay_cap: population.ngay_cap || '',
      noi_cap: population.noi_cap || '',
      quan_he_voi_chu_ho: population.quan_he_voi_chu_ho || '',
      nghe_nghiep: population.nghe_nghiep || '',
      noi_lam_viec: population.noi_lam_viec || '',
      ghi_chu: population.ghi_chu || '',
      ho_gia_dinh: population.ho_gia_dinh?.id || population.ho_gia_dinh || '',
    });
    setIsEditMode(true);
    setFormErrors({});
    setShowFormModal(true);
    setShowDetail(false);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Submit form (add or update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.ho_ten || !formData.ngay_sinh) {
      setFormErrors({
        ho_ten: !formData.ho_ten ? 'Họ tên là bắt buộc' : null,
        ngay_sinh: !formData.ngay_sinh ? 'Ngày sinh là bắt buộc' : null,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = isEditMode
        ? `${API_BASE_URL}/nhan-khau/${selectedPopulation.id}/cap-nhat/`
        : `${API_BASE_URL}/nhan-khau/them-moi/`;

      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert(isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công');
      
      // Refresh list
      fetchPopulations(currentPage, searchTerm);
      setShowFormModal(false);
      setFormData(null);
    } catch (err) {
      setError(err.message || (isEditMode ? 'Lỗi khi cập nhật' : 'Lỗi khi thêm mới'));
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setFormData(null);
    setFormErrors({});
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      song: 'Còn sống',
      chet: 'Đã chết',
      tam_tru: 'Tạm trú',
      tam_vang: 'Tạm vắng',
      chuyen_di: 'Chuyển đi',
    };
    return statusMap[status] || status;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="officer-population-management">
      <div className="section-header">
        <h2>Quản Lý Nhân Khẩu</h2>
        <button className="btn btn-primary" onClick={handleAddNewClick}>+ Thêm Nhân Khẩu Mới</button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          <strong>Lỗi:</strong> {error}
          <button
            className="close-btn"
            onClick={() => setError(null)}
            style={{ float: 'right', border: 'none', background: 'none' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="search-filter">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, CCCD, nghề nghiệp..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={loading}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="song">Còn sống</option>
            <option value="chet">Đã chết</option>
            <option value="tam_tru">Tạm trú</option>
            <option value="tam_vang">Tạm vắng</option>
            <option value="chuyen_di">Chuyển đi</option>
          </select>
        </div>
        <div className="filter-box">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            disabled={loading}
          >
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      {/* Populations Table */}
      <div className="populations-table-container">
        {loading && <div className="loading">Đang tải dữ liệu...</div>}
        
        {!loading && (
          <>
            <table className="populations-table">
              <thead>
                <tr>
                  <th>Họ Tên</th>
                  <th>Giới Tính</th>
                  <th>Ngày Sinh</th>
                  <th>Tuổi</th>
                  <th>CCCD</th>
                  <th>Nghề Nghiệp</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPopulations.map(pop => (
                  <tr key={pop.id}>
                    <td className="name">{pop.ho_ten}</td>
                    <td className="gender">{pop.gioi_tinh}</td>
                    <td className="birth-date">
                      {new Date(pop.ngay_sinh).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="age">{calculateAge(pop.ngay_sinh)} tuổi</td>
                    <td className="cccd">{pop.so_cccd || '-'}</td>
                    <td className="occupation">{pop.nghe_nghiep || '-'}</td>
                    <td>
                      <span className={`status-badge ${pop.trang_thai}`}>
                        {getStatusLabel(pop.trang_thai)}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-action detail"
                        onClick={() => handleViewDetail(pop)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEditPopulation(pop)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleShowDeleteConfirm(pop.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPopulations.length === 0 && (
              <div className="empty-state">
                <p>Không tìm thấy nhân khẩu nào</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ← Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Tiếp →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedPopulation && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Nhân Khẩu - {selectedPopulation.ho_ten}</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông Tin Cơ Bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Họ Tên:</label>
                    <span>{selectedPopulation.ho_ten}</span>
                  </div>
                  <div className="detail-item">
                    <label>Biệt Danh:</label>
                    <span>{selectedPopulation.bi_danh || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giới Tính:</label>
                    <span>{selectedPopulation.gioi_tinh_hien_thi || selectedPopulation.gioi_tinh}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Sinh:</label>
                    <span>
                      {new Date(selectedPopulation.ngay_sinh).toLocaleDateString('vi-VN')}
                      {' '}({selectedPopulation.tuoi} tuổi)
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Sinh:</label>
                    <span>{selectedPopulation.noi_sinh || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quê Quán:</label>
                    <span>{selectedPopulation.nguyen_quan || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Dân Tộc:</label>
                    <span>{selectedPopulation.dan_toc}</span>
                  </div>
                  <div className="detail-item">
                    <label>CCCD:</label>
                    <span>{selectedPopulation.so_cccd || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Cấp CCCD:</label>
                    <span>{selectedPopulation.ngay_cap ? new Date(selectedPopulation.ngay_cap).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Cấp CCCD:</label>
                    <span>{selectedPopulation.noi_cap || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quan Hệ với Chủ Hộ:</label>
                    <span>{selectedPopulation.quan_he_voi_chu_ho}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông Tin Công Việc & Nơi Ở</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nghề Nghiệp:</label>
                    <span>{selectedPopulation.nghe_nghiep || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Làm Việc:</label>
                    <span>{selectedPopulation.noi_lam_viec || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hộ Khẩu:</label>
                    <span>{selectedPopulation.ten_ho_khau || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ Hộ Khẩu:</label>
                    <span>{selectedPopulation.dia_chi_ho_khau || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`status-badge ${selectedPopulation.trang_thai}`}>
                      {selectedPopulation.trang_thai_hien_thi || getStatusLabel(selectedPopulation.trang_thai)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPopulation.ghi_chu && (
                <div className="detail-section">
                  <h4>Ghi Chú</h4>
                  <p>{selectedPopulation.ghi_chu}</p>
                </div>
              )}

              {selectedPopulation.bien_dong && selectedPopulation.bien_dong.length > 0 && (
                <div className="detail-section">
                  <h4>Lịch Sử Thay Đổi</h4>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Loại</th>
                        <th>Ngày</th>
                        <th>Người Thực Hiện</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPopulation.bien_dong.map((bd, idx) => (
                        <tr key={idx}>
                          <td>{bd.loai_bien_dong || '-'}</td>
                          <td>{new Date(bd.ngay_bien_dong).toLocaleDateString('vi-VN')}</td>
                          <td>{bd.nguoi_tao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
              <button className="btn btn-primary" onClick={() => handleEditPopulation(selectedPopulation)}>
                Chỉnh Sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      {showFormModal && formData && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditMode ? 'Cập Nhật Nhân Khẩu' : 'Thêm Nhân Khẩu Mới'}</h3>
              <button
                className="close-btn"
                onClick={handleCloseForm}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h4>Thông Tin Cơ Bản</h4>
                  
                  <div className="form-group">
                    <label>Họ Tên *</label>
                    <input
                      type="text"
                      name="ho_ten"
                      value={formData.ho_ten}
                      onChange={handleFormChange}
                      className={formErrors.ho_ten ? 'error' : ''}
                      placeholder="Nhập họ tên"
                    />
                    {formErrors.ho_ten && <span className="error-text">{formErrors.ho_ten}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Giới Tính</label>
                      <select
                        name="gioi_tinh"
                        value={formData.gioi_tinh}
                        onChange={handleFormChange}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Ngày Sinh *</label>
                      <input
                        type="date"
                        name="ngay_sinh"
                        value={formData.ngay_sinh}
                        onChange={handleFormChange}
                        className={formErrors.ngay_sinh ? 'error' : ''}
                      />
                      {formErrors.ngay_sinh && <span className="error-text">{formErrors.ngay_sinh}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nơi Sinh</label>
                      <input
                        type="text"
                        name="noi_sinh"
                        value={formData.noi_sinh}
                        onChange={handleFormChange}
                        placeholder="Nơi sinh"
                      />
                    </div>

                    <div className="form-group">
                      <label>Quê Quán</label>
                      <input
                        type="text"
                        name="nguyen_quan"
                        value={formData.nguyen_quan}
                        onChange={handleFormChange}
                        placeholder="Quê quán"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Dân Tộc</label>
                      <input
                        type="text"
                        name="dan_toc"
                        value={formData.dan_toc}
                        onChange={handleFormChange}
                        placeholder="Dân tộc"
                      />
                    </div>

                    <div className="form-group">
                      <label>Quan Hệ với Chủ Hộ</label>
                      <input
                        type="text"
                        name="quan_he_voi_chu_ho"
                        value={formData.quan_he_voi_chu_ho}
                        onChange={handleFormChange}
                        placeholder="Ví dụ: Chủ hộ, Vợ, Con"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông Tin CCCD</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Số CCCD</label>
                      <input
                        type="text"
                        name="so_cccd"
                        value={formData.so_cccd}
                        onChange={handleFormChange}
                        placeholder="Số CCCD"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ngày Cấp</label>
                      <input
                        type="date"
                        name="ngay_cap"
                        value={formData.ngay_cap}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nơi Cấp</label>
                    <input
                      type="text"
                      name="noi_cap"
                      value={formData.noi_cap}
                      onChange={handleFormChange}
                      placeholder="Nơi cấp CCCD"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông Tin Công Việc</h4>
                  
                  <div className="form-group">
                    <label>Nghề Nghiệp</label>
                    <input
                      type="text"
                      name="nghe_nghiep"
                      value={formData.nghe_nghiep}
                      onChange={handleFormChange}
                      placeholder="Nghề nghiệp"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nơi Làm Việc</label>
                    <input
                      type="text"
                      name="noi_lam_viec"
                      value={formData.noi_lam_viec}
                      onChange={handleFormChange}
                      placeholder="Nơi làm việc"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Ghi Chú</h4>
                  
                  <div className="form-group">
                    <textarea
                      name="ghi_chu"
                      value={formData.ghi_chu}
                      onChange={handleFormChange}
                      placeholder="Ghi chú thêm"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseForm}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập Nhật' : 'Thêm Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác Nhận Xóa</h3>
              <button
                className="close-btn"
                onClick={handleCancelDelete}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">
                Bạn có chắc chắn muốn xóa nhân khẩu này không?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Không
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Có, Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerPopulationManagement;
