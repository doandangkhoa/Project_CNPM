import React, { useState, useEffect, useRef } from 'react';
import '../../styles/OfficerPopulationManagement.css';
import './HouseholdManagement.css';

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

const HouseholdManagement = () => {
  const [households, setHouseholds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    so_ho_khau: '',
    ho_ten_chu_ho: '',
    dia_chi: '',
    so_thanh_vien: '',
  });
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState(null);
  const [formType, setFormType] = useState('household'); // 'household' or 'member'
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const searchTimeoutRef = useRef(null);

  const itemsPerPage = 10;

  // Fetch households from API
  const fetchHouseholds = async (page = 1, search = '', advSearch = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });

      if (search) {
        params.append('search', search);
      }

      if (advSearch) {
        if (advSearch.so_ho_khau) params.append('so_ho_khau', advSearch.so_ho_khau);
        if (advSearch.ho_ten_chu_ho) params.append('ho_ten_chu_ho', advSearch.ho_ten_chu_ho);
        if (advSearch.dia_chi) params.append('dia_chi', advSearch.dia_chi);
        if (advSearch.so_thanh_vien) params.append('so_thanh_vien', advSearch.so_thanh_vien);
      }

      const response = await fetch(`${API_BASE_URL}/ho-gia-dinh/?${params}`, {
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
      setHouseholds(data.results || []);
      setTotalCount(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
      console.error('Error fetching households:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchHouseholds(1, value);
    }, 500);
  };

  const handleAdvancedSearch = (e) => {
    const { name, value } = e.target;
    setAdvancedSearch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyAdvancedSearch = () => {
    fetchHouseholds(1, '', advancedSearch);
    setShowAdvancedSearch(false);
  };

  const handleViewMemberDetail = async (member) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/nhan-khau/${member.id}/chi-tiet/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Member detail response:', responseData);
      // API trả về cấu trúc: { status: 'success', nhan_khau: {...} }
      const memberData = responseData.nhan_khau || responseData.data || responseData;
      console.log('Setting selected member:', memberData);
      setSelectedMember(memberData);
      setShowMemberDetail(true);
    } catch (err) {
      setError('Lỗi khi tải chi tiết thành viên: ' + err.message);
      console.error('Error fetching member detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setFormData({
      ho_ten: member.ho_ten || '',
      gioi_tinh: member.gioi_tinh || 'Nam',
      ngay_sinh: member.ngay_sinh || '',
      noi_sinh: member.noi_sinh || '',
      nguyen_quan: member.nguyen_quan || '',
      dan_toc: member.dan_toc || 'Kinh',
      bi_danh: member.bi_danh || '',
      so_cccd: member.so_cccd || '',
      ngay_cap: member.ngay_cap || '',
      noi_cap: member.noi_cap || '',
      quan_he_voi_chu_ho: member.quan_he_voi_chu_ho || '',
      nghe_nghiep: member.nghe_nghiep || '',
      noi_lam_viec: member.noi_lam_viec || '',
      trang_thai: member.trang_thai || 'thuong_tru',
      thoi_gian_dang_ki_thuong_tru: member.thoi_gian_dang_ki_thuong_tru || '',
      dia_chi_thuong_tru_truoc_day: member.dia_chi_thuong_tru_truoc_day || '',
      ghi_chu: member.ghi_chu || '',
      ngay_chuyen_di: member.ngay_chuyen_di || '',
      noi_chuyen: member.noi_chuyen || '',
    });
    setEditingId(member.id);
    setFormType('member');
    setIsEditMode(true);
    setFormErrors({});
    setShowMemberDetail(false);
    setShowFormModal(true);
  };

  const handleAddNewMember = () => {
    if (!selectedHousehold) {
      setError('Vui lòng chọn hộ khẩu trước');
      return;
    }
    setFormData({
      ho_ten: '',
      gioi_tinh: 'Nam',
      ngay_sinh: '',
      noi_sinh: '',
      nguyen_quan: '',
      dan_toc: 'Kinh',
      bi_danh: '',
      so_cccd: '',
      ngay_cap: '',
      noi_cap: '',
      quan_he_voi_chu_ho: '',
      nghe_nghiep: '',
      noi_lam_viec: '',
      trang_thai: 'thuong_tru',
      thoi_gian_dang_ki_thuong_tru: '',
      dia_chi_thuong_tru_truoc_day: '',
      ghi_chu: '',
      ngay_chuyen_di: '',
      noi_chuyen: '',
      ho_gia_dinh: selectedHousehold.id,
    });
    setEditingId(null);
    setFormType('member');
    setIsEditMode(false);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleResetAdvancedSearch = () => {
    setAdvancedSearch({
      so_ho_khau: '',
      ho_ten_chu_ho: '',
      dia_chi: '',
      so_thanh_vien: '',
    });
    fetchHouseholds(1, '');
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/ho-gia-dinh/`, {
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      console.log('CSRF initialized');
    }).catch(err => console.error('Error initializing CSRF:', err));
    
    fetchHouseholds(1, '');
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = (newPage) => {
    fetchHouseholds(newPage, searchTerm);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewDetail = async (household) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/ho-gia-dinh/${household.id}/chi-tiet/`,
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
      setSelectedHousehold(data.data || data);
      setShowDetail(true);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải chi tiết');
      console.error('Error fetching detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setFormData({
      so_ho_khau: '',
      ho_ten_chu_ho: '',
      id_chu_ho: '',
      so_dien_thoai: '',
      dia_chi: '',
      phuong_xa: '',
      ghi_chu: '',
    });
    setIsEditMode(false);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleEditHousehold = (household) => {
    setFormData({
      so_ho_khau: household.so_ho_khau || '',
      ho_ten_chu_ho: household.ho_ten_chu_ho || '',
      id_chu_ho: household.id_chu_ho || '',
      so_dien_thoai: household.so_dien_thoai || '',
      dia_chi: household.dia_chi || '',
      phuong_xa: household.phuong_xa || '',
      ghi_chu: household.ghi_chu || '',
    });
    setFormType('household');
    setIsEditMode(true);
    setEditingId(household.id);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate theo loại form
    if (formType === 'household') {
      if (!formData.so_ho_khau || !formData.ho_ten_chu_ho || !formData.dia_chi || !formData.phuong_xa) {
        setFormErrors({
          so_ho_khau: !formData.so_ho_khau ? 'Số hộ khẩu là bắt buộc' : null,
          ho_ten_chu_ho: !formData.ho_ten_chu_ho ? 'Tên chủ hộ là bắt buộc' : null,
          dia_chi: !formData.dia_chi ? 'Địa chỉ là bắt buộc' : null,
          phuong_xa: !formData.phuong_xa ? 'Phường/xã là bắt buộc' : null,
        });
        return;
      }
    } else if (formType === 'member') {
      if (!formData.ho_ten || !formData.ngay_sinh) {
        setFormErrors({
          ho_ten: !formData.ho_ten ? 'Họ tên là bắt buộc' : null,
          ngay_sinh: !formData.ngay_sinh ? 'Ngày sinh là bắt buộc' : null,
        });
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode && !editingId) {
        throw new Error('Không tìm thấy ID để cập nhật');
      }

      let url, method, submitData;

      if (formType === 'household') {
        url = isEditMode
          ? `${API_BASE_URL}/ho-gia-dinh/${editingId}/cap-nhat/`
          : `${API_BASE_URL}/ho-gia-dinh/them-moi/`;
        method = isEditMode ? 'PATCH' : 'POST';
        submitData = {
          ...formData,
          id_chu_ho: formData.id_chu_ho || null,
        };
      } else if (formType === 'member') {
        if (isEditMode) {
          url = `${API_BASE_URL}/nhan-khau/${editingId}/cap-nhat/`;
          method = 'PATCH';
        } else {
          url = `${API_BASE_URL}/nhan-khau/them-moi/`;
          method = 'POST';
        }
        submitData = {
          ...formData,
          ho_gia_dinh: formData.ho_gia_dinh || selectedHousehold?.id,
        };
      }

      const csrfToken = getCsrfToken();

      console.log('Sending data:', submitData);

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
        const errorMsg = errorData.errors 
          ? Object.entries(errorData.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
          : (errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      alert(isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công');
      
      if (formType === 'household') {
        fetchHouseholds(currentPage, searchTerm);
      } else if (formType === 'member') {
        // Refresh household detail to get updated member list
        if (selectedHousehold) {
          const response = await fetch(`${API_BASE_URL}/ho-gia-dinh/${selectedHousehold.id}/chi-tiet/`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          const detailData = await response.json();
          setSelectedHousehold(detailData.data || detailData);
        }
      }
      
      setShowFormModal(false);
      setFormData(null);
      setEditingId(null);
      setFormType('household');
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

  const handleDeleteClick = (household) => {
    setDeleteConfirmId(household.id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      setLoading(true);
      const csrfToken = getCsrfToken();

      const response = await fetch(
        `${API_BASE_URL}/ho-gia-dinh/${deleteConfirmId}/xoa/`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-CSRFToken': csrfToken || '',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      alert('Xóa hộ khẩu thành công');
      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
      if (showDetail) {
        setShowDetail(false);
      }
      fetchHouseholds(currentPage, searchTerm);
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa');
      console.error('Error deleting household:', err);
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmId(null);
  };

  return (
    <div className="officer-population-management">
      <div className="section-header">
        <h2>Quản Lý Hộ Khẩu</h2>
        <button className="btn btn-primary" onClick={handleAddNewClick}>+ Thêm Hộ Khẩu Mới</button>
      </div>

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

      <div className="search-filter" style={{ marginBottom: '15px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Tìm Kiếm Hộ Khẩu</h4>
      </div>

      <div className="advanced-search" style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px', border: '1px solid #dee2e6' }}>
        <h5 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Tiêu Chí Tìm Kiếm</h5>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Số Hộ Khẩu:</label>
            <input
              type="text"
              name="so_ho_khau"
              value={advancedSearch.so_ho_khau}
              onChange={handleAdvancedSearch}
              placeholder="Số hộ khẩu"
              style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Tên Chủ Hộ:</label>
            <input
              type="text"
              name="ho_ten_chu_ho"
              value={advancedSearch.ho_ten_chu_ho}
              onChange={handleAdvancedSearch}
              placeholder="Tên chủ hộ"
              style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Địa Chỉ:</label>
            <input
              type="text"
              name="dia_chi"
              value={advancedSearch.dia_chi}
              onChange={handleAdvancedSearch}
              placeholder="Địa chỉ"
              style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block' }}>Số Thành Viên:</label>
            <input
              type="number"
              name="so_thanh_vien"
              value={advancedSearch.so_thanh_vien}
              onChange={(e) => setAdvancedSearch(prev => ({ ...prev, so_thanh_vien: e.target.value }))}
              placeholder="Số thành viên"
              min="1"
              style={{ width: '70%', padding: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleApplyAdvancedSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Tìm Kiếm
          </button>
          <button
            onClick={handleResetAdvancedSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Xóa Bộ Lọc
          </button>
        </div>
      </div>

      <div className="populations-table-container">
        {loading && <div className="loading">Đang tải dữ liệu...</div>}

        {!loading && households.length === 0 ? (
          <div className="loading">Không tìm thấy hộ khẩu nào</div>
        ) : (
          <>
            <table className="populations-table">
              <thead>
                <tr>
                  <th>Số Hộ Khẩu</th>
                  <th>Tên Chủ Hộ</th>
                  <th>Địa Chỉ</th>
                  <th>Phường/Xã</th>
                  <th>Số Thành Viên</th>
                  <th>Điện Thoại</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {households.map(household => (
                  <tr key={household.id}>
                    <td className="household-id">{household.so_ho_khau}</td>
                    <td className="name">{household.ho_ten_chu_ho}</td>
                    <td className="address">{household.dia_chi}</td>
                    <td className="ward">{household.phuong_xa}</td>
                    <td className="members">{household.so_luong_thanh_vien || 0} thành viên</td>
                    <td className="phone">{household.so_dien_thoai || '-'}</td>
                    <td className="actions">
                      <button
                        className="btn-action"
                        title="Xem chi tiết"
                        onClick={() => handleViewDetail(household)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action"
                        title="Chỉnh sửa"
                        onClick={() => handleEditHousehold(household)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action"
                        title="Xóa"
                        onClick={() => handleDeleteClick(household)}
                        style={{ color: '#e74c3c' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                }}
              >
                ← Trước
              </button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                }}
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedHousehold && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Hộ Khẩu</h3>
              <button className="close-btn" onClick={() => setShowDetail(false)}>✕</button>
            </div>

            <div className="modal-body detail-view">
              <div className="detail-section">
                <h4>Thông Tin Hộ Khẩu</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Số Hộ Khẩu:</label>
                    <span>{selectedHousehold.so_ho_khau}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên Chủ Hộ:</label>
                    <span>{selectedHousehold.ho_ten_chu_ho}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ:</label>
                    <span>{selectedHousehold.dia_chi}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phường/Xã:</label>
                    <span>{selectedHousehold.phuong_xa}</span>
                  </div>
                  <div className="detail-item">
                    <label>Điện Thoại:</label>
                    <span>{selectedHousehold.so_dien_thoai || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{selectedHousehold.ngay_tao ? new Date(selectedHousehold.ngay_tao).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                </div>
              </div>

              {selectedHousehold.ghi_chu && (
                <div className="detail-section">
                  <h4>Ghi Chú</h4>
                  <p>{selectedHousehold.ghi_chu}</p>
                </div>
              )}

              {selectedHousehold.danh_sach_thanh_vien && selectedHousehold.danh_sach_thanh_vien.length > 0 && (
                <div className="detail-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>Danh Sách Thành Viên ({selectedHousehold.so_luong_thanh_vien})</h4>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleAddNewMember}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      + Thêm Thành Viên
                    </button>
                  </div>
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>Họ Tên</th>
                        <th>Ngày Sinh</th>
                        <th>Giới Tính</th>
                        <th>Quan Hệ</th>
                        <th>Tuổi</th>
                        <th>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHousehold.danh_sach_thanh_vien.map(member => {
                        const isChief = member.id === selectedHousehold.id_chu_ho;
                        return (
                          <tr key={member.id}>
                            <td>{member.ho_ten}</td>
                            <td>{new Date(member.ngay_sinh).toLocaleDateString('vi-VN')}</td>
                            <td>{member.gioi_tinh_hien_thi || member.gioi_tinh}</td>
                            <td>
                              {isChief ? (
                                <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>Chủ Hộ</span>
                              ) : (
                                member.quan_he_voi_chu_ho_display || member.quan_he_voi_chu_ho
                              )}
                            </td>
                            <td>{member.tuoi || '-'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleViewMemberDetail(member)}
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                              >
                                Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowDetail(false);
                  handleEditHousehold(selectedHousehold);
                }}
              >
                Chỉnh Sửa
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowDetail(false);
                  handleDeleteClick(selectedHousehold);
                }}
              >
                Xóa Hộ Khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && formData && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {formType === 'household' 
                  ? (isEditMode ? 'Chỉnh Sửa Hộ Khẩu' : 'Thêm Hộ Khẩu Mới')
                  : (isEditMode ? 'Chỉnh Sửa Nhân Khẩu' : 'Thêm Nhân Khẩu Mới')
                }
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>✕</button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
                  <strong>Lỗi:</strong> {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                {/* HOUSEHOLD FORM */}
                {formType === 'household' && (
                  <>
                    <div className="form-section">
                      <h4>Thông Tin Hộ Khẩu</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Số Hộ Khẩu *</label>
                          <input
                            type="text"
                            name="so_ho_khau"
                            value={formData.so_ho_khau}
                            onChange={handleFormChange}
                            placeholder="Số hộ khẩu"
                            className={formErrors.so_ho_khau ? 'error' : ''}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                          {formErrors.so_ho_khau && <span className="error-text">{formErrors.so_ho_khau}</span>}
                        </div>

                        <div className="detail-item">
                          <label>Tên Chủ Hộ *</label>
                          <input
                            type="text"
                            name="ho_ten_chu_ho"
                            value={formData.ho_ten_chu_ho}
                            onChange={handleFormChange}
                            placeholder="Tên chủ hộ"
                            className={formErrors.ho_ten_chu_ho ? 'error' : ''}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                          {formErrors.ho_ten_chu_ho && <span className="error-text">{formErrors.ho_ten_chu_ho}</span>}
                        </div>

                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label>Địa Chỉ *</label>
                          <input
                            type="text"
                            name="dia_chi"
                            value={formData.dia_chi}
                            onChange={handleFormChange}
                            placeholder="Địa chỉ"
                            className={formErrors.dia_chi ? 'error' : ''}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                          {formErrors.dia_chi && <span className="error-text">{formErrors.dia_chi}</span>}
                        </div>

                        <div className="detail-item">
                          <label>Phường/Xã *</label>
                          <input
                            type="text"
                            name="phuong_xa"
                            value={formData.phuong_xa}
                            onChange={handleFormChange}
                            placeholder="Phường/xã"
                            className={formErrors.phuong_xa ? 'error' : ''}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                          {formErrors.phuong_xa && <span className="error-text">{formErrors.phuong_xa}</span>}
                        </div>

                        <div className="detail-item">
                          <label>Điện Thoại</label>
                          <input
                            type="text"
                            name="so_dien_thoai"
                            value={formData.so_dien_thoai}
                            onChange={handleFormChange}
                            placeholder="Số điện thoại"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>ID Chủ Hộ (Nhân Khẩu)</label>
                          <input
                            type="number"
                            name="id_chu_ho"
                            value={formData.id_chu_ho}
                            onChange={handleFormChange}
                            placeholder="ID của chủ hộ (nếu có)"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>

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
                  </>
                )}

                {/* MEMBER FORM */}
                {formType === 'member' && (
                  <>
                    <div className="form-section">
                      <h4>Thông Tin Cơ Bản</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Họ Tên *</label>
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
                        
                        <div className="detail-item">
                          <label>Biệt Danh</label>
                          <input
                            type="text"
                            name="bi_danh"
                            value={formData.bi_danh}
                            onChange={handleFormChange}
                            placeholder="Biệt danh"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>
                        
                        <div className="detail-item">
                          <label>Giới Tính</label>
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

                        <div className="detail-item">
                          <label>Ngày Sinh *</label>
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
                        
                        <div className="detail-item">
                          <label>Nơi Sinh</label>
                          <input
                            type="text"
                            name="noi_sinh"
                            value={formData.noi_sinh}
                            onChange={handleFormChange}
                            placeholder="Nơi sinh"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Quê Quán</label>
                          <input
                            type="text"
                            name="nguyen_quan"
                            value={formData.nguyen_quan}
                            onChange={handleFormChange}
                            placeholder="Quê quán"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Dân Tộc</label>
                          <input
                            type="text"
                            name="dan_toc"
                            value={formData.dan_toc}
                            onChange={handleFormChange}
                            placeholder="Dân tộc"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>CCCD</label>
                          <input
                            type="text"
                            name="so_cccd"
                            value={formData.so_cccd}
                            onChange={handleFormChange}
                            placeholder="Số CCCD"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Ngày Cấp CCCD</label>
                          <input
                            type="date"
                            name="ngay_cap"
                            value={formData.ngay_cap}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>
                        
                        <div className="detail-item">
                          <label>Nơi Cấp CCCD</label>
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
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Nghề Nghiệp</label>
                          <input
                            type="text"
                            name="nghe_nghiep"
                            value={formData.nghe_nghiep}
                            onChange={handleFormChange}
                            placeholder="Nghề nghiệp"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Nơi Làm Việc</label>
                          <input
                            type="text"
                            name="noi_lam_viec"
                            value={formData.noi_lam_viec}
                            onChange={handleFormChange}
                            placeholder="Nơi làm việc"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Hộ Khẩu</label>
                          <input
                            type="text"
                            name="ho_gia_dinh_ten"
                            value={selectedHousehold?.ho_ten_chu_ho || ''}
                            readOnly
                            placeholder="Hộ khẩu"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Quan Hệ với Chủ Hộ</label>
                          <input
                            type="text"
                            name="quan_he_voi_chu_ho"
                            value={formData.quan_he_voi_chu_ho}
                            onChange={handleFormChange}
                            placeholder="Ví dụ: Chủ hộ, Vợ, Con"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Địa Chỉ Hộ Khẩu</label>
                          <input
                            type="text"
                            name="dia_chi_ho_khau"
                            value={selectedHousehold?.dia_chi || ''}
                            readOnly
                            placeholder="Địa chỉ hộ khẩu"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Địa Chỉ Thường Trú Trước Đây</label>
                          <input
                            type="text"
                            name="dia_chi_thuong_tru_truoc_day"
                            value={formData.dia_chi_thuong_tru_truoc_day}
                            onChange={handleFormChange}
                            placeholder="Địa chỉ thường trú trước đây (Ví dụ: Mới sinh)"
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Thời Gian Đăng Kí Thường Trú</label>
                          <input
                            type="date"
                            name="thoi_gian_dang_ki_thuong_tru"
                            value={formData.thoi_gian_dang_ki_thuong_tru}
                            onChange={handleFormChange}
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div className="detail-item">
                          <label>Trạng Thái</label>
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

                        {formData.trang_thai === 'chuyen_di' && (
                          <>
                            <div className="detail-item">
                              <label>Ngày Chuyển Đi</label>
                              <input
                                type="date"
                                name="ngay_chuyen_di"
                                value={formData.ngay_chuyen_di}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                              />
                            </div>

                            <div className="detail-item">
                              <label>Nơi Chuyển</label>
                              <input
                                type="text"
                                name="noi_chuyen"
                                value={formData.noi_chuyen}
                                onChange={handleFormChange}
                                placeholder="Nơi chuyển đi"
                                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Ghi Chú</h4>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  </>
                )}

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
                    {loading ? 'Đang lưu...' : (isEditMode ? 'Cập Nhật' : 'Thêm Mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác Nhận Xóa</h3>
              <button className="close-btn" onClick={handleCancelDelete}>✕</button>
            </div>

            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa hộ khẩu này không? Hành động này không thể hoàn tác.</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberDetail && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowMemberDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Thành Viên - {selectedMember.ho_ten}</h3>
              <button className="close-btn" onClick={() => setShowMemberDetail(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông Tin Cơ Bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Họ Tên:</label>
                    <span>{selectedMember.ho_ten}</span>
                  </div>
                  <div className="detail-item">
                    <label>Biệt Danh:</label>
                    <span>{selectedMember.bi_danh || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giới Tính:</label>
                    <span>{selectedMember.gioi_tinh_hien_thi || selectedMember.gioi_tinh}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Sinh:</label>
                    <span>
                      {new Date(selectedMember.ngay_sinh).toLocaleDateString('vi-VN')}
                      {' '}({selectedMember.tuoi} tuổi)
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Sinh:</label>
                    <span>{selectedMember.noi_sinh || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quê Quán:</label>
                    <span>{selectedMember.nguyen_quan || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Dân Tộc:</label>
                    <span>{selectedMember.dan_toc || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>CCCD:</label>
                    <span>{selectedMember.so_cccd || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Cấp CCCD:</label>
                    <span>{selectedMember.ngay_cap ? new Date(selectedMember.ngay_cap).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Cấp CCCD:</label>
                    <span>{selectedMember.noi_cap || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông Tin Công Việc & Nơi Ở</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nghề Nghiệp:</label>
                    <span>{selectedMember.nghe_nghiep || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nơi Làm Việc:</label>
                    <span>{selectedMember.noi_lam_viec || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hộ Khẩu:</label>
                    <span>{selectedMember.ten_ho_khau || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Quan Hệ với Chủ Hộ:</label>
                    <span>{selectedMember.quan_he_voi_chu_ho}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ Hộ Khẩu:</label>
                    <span>{selectedMember.dia_chi_ho_khau || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Địa Chỉ Thường Trú Trước Đây:</label>
                    <span>{selectedMember.dia_chi_thuong_tru_truoc_day || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thời Gian Đăng Kí Thường Trú:</label>
                    <span>{selectedMember.thoi_gian_dang_ki_thuong_tru ? new Date(selectedMember.thoi_gian_dang_ki_thuong_tru).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`status-badge ${selectedMember.trang_thai}`}>
                      {selectedMember.trang_thai_hien_thi || selectedMember.trang_thai}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relocation Info */}
              {selectedMember.trang_thai === 'chuyen_di' && (
                <div className="detail-section">
                  <h4>Thông Tin Chuyển Đi</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Ngày Chuyển Đi:</label>
                      <span>{selectedMember.ngay_chuyen_di ? new Date(selectedMember.ngay_chuyen_di).toLocaleDateString('vi-VN') : '-'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Nơi Chuyển:</label>
                      <span>{selectedMember.noi_chuyen || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Thông Tin Hệ Thống</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Cập Nhật:</label>
                    <span>{selectedMember.updated_at ? new Date(selectedMember.updated_at).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                </div>
              </div>

              {selectedMember.ghi_chu && (
                <div className="detail-section">
                  <h4>Ghi Chú</h4>
                  <p>{selectedMember.ghi_chu}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowMemberDetail(false)}
              >
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleEditMember(selectedMember)}
              >
                Chỉnh Sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdManagement;
