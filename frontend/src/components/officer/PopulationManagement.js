import React, { useState, useEffect, useRef } from 'react';
import '../../styles/OfficerPopulationManagement.css';
import './PopulationManagement.css';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  console.log('getCsrfToken result:', cookieValue ? 'Found' : 'Not found');
  return cookieValue || '';
};

const OfficerPopulationManagement = () => {
  const [populations, setPopulations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    ho_ten: '',
    so_cccd: '',
    nghe_nghiep: '',
    trang_thai: '',
    gioi_tinh: '',
    dan_toc: '',
    dia_chi: '',
  });
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
  const [editingId, setEditingId] = useState(null);
  const [households, setHouseholds] = useState([]);
  const searchTimeoutRef = useRef(null);

  const itemsPerPage = 10;

  // Fetch households list
  const fetchHouseholds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-khau/danh-sach-ho-khau/`, {
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
      setHouseholds(data.data || []);
    } catch (err) {
      console.error('Error fetching households:', err);
    }
  };

  // Fetch populations from API
  const fetchPopulations = async (page = 1, search = '', advSearch = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });

      // Add basic search if provided
      if (search) {
        params.append('search', search);
      }

      // Add advanced search parameters if provided
      if (advSearch) {
        if (advSearch.ho_ten) params.append('ho_ten', advSearch.ho_ten);
        if (advSearch.so_cccd) params.append('so_cccd', advSearch.so_cccd);
        if (advSearch.nghe_nghiep) params.append('nghe_nghiep', advSearch.nghe_nghiep);
        if (advSearch.trang_thai) params.append('trang_thai', advSearch.trang_thai);
        if (advSearch.gioi_tinh) params.append('gioi_tinh', advSearch.gioi_tinh);
        if (advSearch.dan_toc) params.append('dan_toc', advSearch.dan_toc);
        if (advSearch.dia_chi) params.append('dia_chi', advSearch.dia_chi);
      }

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

  // Handle advanced search
  const handleAdvancedSearch = (e) => {
    const { name, value } = e.target;
    setAdvancedSearch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply advanced search
  const handleApplyAdvancedSearch = () => {
    fetchPopulations(1, '', advancedSearch);
    setShowAdvancedSearch(false);
  };

  // Reset advanced search
  const handleResetAdvancedSearch = () => {
    setAdvancedSearch({
      ho_ten: '',
      so_cccd: '',
      nghe_nghiep: '',
      trang_thai: '',
      gioi_tinh: '',
      dan_toc: '',
      dia_chi: '',
    });
    fetchPopulations(1, '');
  };

  // Load data on mount
  useEffect(() => {
    // First, do a GET request to initialize CSRF token
    fetch(`${API_BASE_URL}/nhan-khau/`, {
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      // CSRF token should now be in cookies after GET request
      console.log('CSRF initialized');
    }).catch(err => console.error('Error initializing CSRF:', err));
    
    fetchPopulations(1, '');
    fetchHouseholds();
    
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
      setError(null);
      
      if (!deleteConfirmId) {
        throw new Error('Không tìm thấy ID để xóa');
      }
      
      const csrfToken = getCsrfToken();
      console.log('Delete CSRF Token:', csrfToken);
      
      const response = await fetch(`${API_BASE_URL}/nhan-khau/${deleteConfirmId}/xoa/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ ly_do: 'Xóa do người dùng yêu cầu' }),
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Refresh list
      fetchPopulations(currentPage, searchTerm);
      alert('Xóa nhân khẩu thành công');
      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa nhân khẩu');
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
      trang_thai: 'thuong_tru',
      thoi_gian_dang_ki_thuong_tru: '',
      dia_chi_thuong_tru_truoc_day: '',
      ghi_chu: '',
      ho_gia_dinh: '',
      ngay_chuyen_di: '',
      noi_chuyen: '',
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
      trang_thai: population.trang_thai || 'thuong_tru',
      thoi_gian_dang_ki_thuong_tru: population.thoi_gian_dang_ki_thuong_tru || '',
      dia_chi_thuong_tru_truoc_day: population.dia_chi_thuong_tru_truoc_day || '',
      ghi_chu: population.ghi_chu || '',
      ho_gia_dinh: population.ho_gia_dinh?.id || population.ho_gia_dinh || '',
      ngay_chuyen_di: population.ngay_chuyen_di || '',
      noi_chuyen: population.noi_chuyen || '',
    });
    setEditingId(population.id);
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

      // Validate editingId when in edit mode
      if (isEditMode && !editingId) {
        throw new Error('Không tìm thấy ID để cập nhật');
      }

      const url = isEditMode
        ? `${API_BASE_URL}/nhan-khau/${editingId}/cap-nhat/`
        : `${API_BASE_URL}/nhan-khau/them-moi/`;

      const method = isEditMode ? 'PATCH' : 'POST';
      const csrfToken = getCsrfToken();

      // Prepare data with proper date handling
      // Convert empty strings to null for date fields
      const submitData = {
        ...formData,
        ngay_sinh: formData.ngay_sinh || null,
        ngay_cap: formData.ngay_cap || null,
        thoi_gian_dang_ki_thuong_tru: formData.thoi_gian_dang_ki_thuong_tru || null,
        ngay_chuyen_di: formData.ngay_chuyen_di || null,
      };

      console.log('Sending data:', submitData);
      console.log('CSRF Token:', csrfToken);
      console.log('URL:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        console.log('Validation errors:', errorData.errors);
        const errorMsg = errorData.errors 
          ? Object.entries(errorData.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
          : (errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      alert(isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công');
      
      // Refresh list
      fetchPopulations(currentPage, searchTerm);
      setShowFormModal(false);
      setFormData(null);
      setEditingId(null);
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
    setEditingId(null);
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
      <div className="search-filter" style={{ marginBottom: '15px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Tìm Kiếm Nhân Khẩu</h4>
      </div>

      {/* Advanced Search */}
      <div className="advanced-search" style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px', border: '1px solid #dee2e6' }}>
        <h5 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Tiêu Chí Tìm Kiếm</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Họ Tên:</label>
              <input
                type="text"
                name="ho_ten"
                value={advancedSearch.ho_ten}
                onChange={handleAdvancedSearch}
                placeholder="Họ tên"
                style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>CCCD:</label>
              <input
                type="text"
                name="so_cccd"
                value={advancedSearch.so_cccd}
                onChange={handleAdvancedSearch}
                placeholder="Số CCCD"
                style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Dân Tộc:</label>
              <input
                type="text"
                name="dan_toc"
                value={advancedSearch.dan_toc}
                onChange={handleAdvancedSearch}
                placeholder="Dân tộc"
                style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Nghề Nghiệp:</label>
              <input
                type="text"
                name="nghe_nghiep"
                value={advancedSearch.nghe_nghiep}
                onChange={handleAdvancedSearch}
                placeholder="Nghề nghiệp"
                style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Địa Chỉ:</label>
              <input
                type="text"
                name="dia_chi"
                value={advancedSearch.dia_chi}
                onChange={handleAdvancedSearch}
                placeholder="Địa chỉ hộ khẩu"
                style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Giới Tính:</label>
              <select
                name="gioi_tinh"
                value={advancedSearch.gioi_tinh}
                onChange={handleAdvancedSearch}
                style={{ width: '70%', padding: '3px', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Trạng Thái:</label>
              <select
                name="trang_thai"
                value={advancedSearch.trang_thai}
                onChange={handleAdvancedSearch}
                style={{ width: '70%', padding: '3px', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="">Tất cả</option>
                <option value="thuong_tru">Còn sống (Thường trú)</option>
                <option value="da_chet">Đã chết</option> 
                <option value="tam_tru">Tạm trú</option>
                <option value="tam_vang">Tạm vắng</option>
                <option value="chuyen_di">Chuyển đi</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleApplyAdvancedSearch} style={{ padding: '8px 16px', fontSize: '13px' }}>Tìm Kiếm</button>
            <button className="btn btn-secondary" onClick={handleResetAdvancedSearch} style={{ padding: '8px 16px', fontSize: '13px' }}>Đặt Lại</button>
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
                        {pop.trang_thai_hien_thi || pop.trang_thai}
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
                    <label>Quan Hệ với Chủ Hộ:</label>
                    <span>{selectedPopulation.quan_he_voi_chu_ho}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ Hộ Khẩu:</label>
                    <span>{selectedPopulation.dia_chi_ho_khau || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ Thường Trú Trước Đây:</label>
                    <span>{selectedPopulation.dia_chi_thuong_tru_truoc_day || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thời Gian Đăng Kí Thường Trú:</label>
                    <span>{selectedPopulation.thoi_gian_dang_ki_thuong_tru ? new Date(selectedPopulation.thoi_gian_dang_ki_thuong_tru).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`status-badge ${selectedPopulation.trang_thai}`}>
                      {selectedPopulation.trang_thai_hien_thi || selectedPopulation.trang_thai}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relocation Info - Only show when status is "chuyen_di" */}
              {selectedPopulation.trang_thai === 'chuyen_di' && (
                <div className="detail-section">
                  <h4>Thông Tin Chuyển Đi</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Ngày Chuyển Đi:</label>
                      <span>{selectedPopulation.ngay_chuyen_di ? new Date(selectedPopulation.ngay_chuyen_di).toLocaleDateString('vi-VN') : '-'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Nơi Chuyển:</label>
                      <span>{selectedPopulation.noi_chuyen || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Thông Tin Hệ Thống</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{selectedPopulation.created_at ? new Date(selectedPopulation.created_at).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Cập Nhật:</label>
                    <span>{selectedPopulation.updated_at ? new Date(selectedPopulation.updated_at).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                </div>
              </div>

              {selectedPopulation.ghi_chu && (
                <div className="detail-section">
                  <h4>Ghi Chú</h4>
                  <p>{selectedPopulation.ghi_chu}</p>
                </div>
              )}

              {/* Change History - Hidden from UI */}
              {/* {selectedPopulation.bien_dong && selectedPopulation.bien_dong.length > 0 && (
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
              )} */}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Họ Tên *</label>
                      <input
                        type="text"
                        name="ho_ten"
                        value={formData.ho_ten}
                        onChange={handleFormChange}
                        className={formErrors.ho_ten ? 'error' : ''}
                        placeholder="Nhập họ tên"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                      {formErrors.ho_ten && <span className="error-text">{formErrors.ho_ten}</span>}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Biệt Danh</label>
                      <input
                        type="text"
                        name="bi_danh"
                        value={formData.bi_danh}
                        onChange={handleFormChange}
                        placeholder="Biệt danh"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Giới Tính</label>
                      <select
                        name="gioi_tinh"
                        value={formData.gioi_tinh}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Ngày Sinh *</label>
                      <input
                        type="date"
                        name="ngay_sinh"
                        value={formData.ngay_sinh}
                        onChange={handleFormChange}
                        className={formErrors.ngay_sinh ? 'error' : ''}
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                      {formErrors.ngay_sinh && <span className="error-text">{formErrors.ngay_sinh}</span>}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Nơi Sinh</label>
                      <input
                        type="text"
                        name="noi_sinh"
                        value={formData.noi_sinh}
                        onChange={handleFormChange}
                        placeholder="Nơi sinh"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Quê Quán</label>
                      <input
                        type="text"
                        name="nguyen_quan"
                        value={formData.nguyen_quan}
                        onChange={handleFormChange}
                        placeholder="Quê quán"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Dân Tộc</label>
                      <input
                        type="text"
                        name="dan_toc"
                        value={formData.dan_toc}
                        onChange={handleFormChange}
                        placeholder="Dân tộc"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>CCCD</label>
                      <input
                        type="text"
                        name="so_cccd"
                        value={formData.so_cccd}
                        onChange={handleFormChange}
                        placeholder="Số CCCD"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Ngày Cấp CCCD</label>
                      <input
                        type="date"
                        name="ngay_cap"
                        value={formData.ngay_cap}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Nơi Cấp CCCD</label>
                      <input
                        type="text"
                        name="noi_cap"
                        value={formData.noi_cap}
                        onChange={handleFormChange}
                        placeholder="Nơi cấp CCCD"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông Tin Công Việc & Nơi Ở</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Nghề Nghiệp</label>
                      <input
                        type="text"
                        name="nghe_nghiep"
                        value={formData.nghe_nghiep}
                        onChange={handleFormChange}
                        placeholder="Nghề nghiệp"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Nơi Làm Việc</label>
                      <input
                        type="text"
                        name="noi_lam_viec"
                        value={formData.noi_lam_viec}
                        onChange={handleFormChange}
                        placeholder="Nơi làm việc"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Hộ Khẩu</label>
                      <input
                        type="text"
                        name="ten_ho_khau"
                        value={formData.ten_ho_khau || ''}
                        onChange={handleFormChange}
                        placeholder="Hộ khẩu"
                        readOnly
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Quan Hệ với Chủ Hộ</label>
                      <input
                        type="text"
                        name="quan_he_voi_chu_ho"
                        value={formData.quan_he_voi_chu_ho}
                        onChange={handleFormChange}
                        placeholder="Ví dụ: Chủ hộ, Vợ, Con"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Địa Chỉ Hộ Khẩu</label>
                      <input
                        type="text"
                        name="dia_chi_ho_khau"
                        value={formData.dia_chi_ho_khau || ''}
                        onChange={handleFormChange}
                        placeholder="Địa chỉ hộ khẩu"
                        readOnly
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Địa Chỉ Thường Trú Trước Đây</label>
                      <input
                        type="text"
                        name="dia_chi_thuong_tru_truoc_day"
                        value={formData.dia_chi_thuong_tru_truoc_day}
                        onChange={handleFormChange}
                        placeholder="Địa chỉ thường trú trước đây"
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Thời Gian Đăng Kí Thường Trú</label>
                      <input
                        type="date"
                        name="thoi_gian_dang_ki_thuong_tru"
                        value={formData.thoi_gian_dang_ki_thuong_tru}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Trạng Thái</label>
                      <select
                        name="trang_thai"
                        value={formData.trang_thai}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      >
                        <option value="thuong_tru">Thường trú</option>
                        <option value="da_chet">Đã mất</option>
                        <option value="tam_tru">Tạm trú</option>
                        <option value="tam_vang">Tạm vắng</option>
                        <option value="chuyen_di">Chuyển đi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Relocation Info - Only show when status is "chuyen_di" */}
                {formData.trang_thai === 'chuyen_di' && (
                  <div className="form-section">
                    <h4>Thông Tin Chuyển Đi</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px' }}>Ngày Chuyển Đi</label>
                        <input
                          type="date"
                          name="ngay_chuyen_di"
                          value={formData.ngay_chuyen_di}
                          onChange={handleFormChange}
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '6px' }}>Nơi Chuyển</label>
                        <input
                          type="text"
                          name="noi_chuyen"
                          value={formData.noi_chuyen}
                          onChange={handleFormChange}
                          placeholder="Nơi chuyển đi"
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h4>Ghi Chú</h4>
                  <div>
                    <textarea
                      name="ghi_chu"
                      value={formData.ghi_chu}
                      onChange={handleFormChange}
                      placeholder="Ghi chú thêm"
                      rows="4"
                      style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
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
              <p className="confirm-warning">
                ⚠️Lưu ý: Hành động này không thể hoàn tác.
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
