import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddResidentPage.css';

const AddResidentPage = ({ currentUser }) => {
  const navigate = useNavigate();

  // State cho form data
  const [formData, setFormData] = useState({
    ho_ten: '',
    bi_danh: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    noi_sinh: '',
    nguyen_quan: '',
    dan_toc: '',
    nghe_nghiep: '',
    noi_lam_viec: '',
    so_cccd: '',
    ngay_cap: '',
    noi_cap: '',
    thoi_gian_dang_ki_thuong_tru: '',
    dia_chi_thuong_tru_truoc_day: '',
    trang_thai: 'song',
    quan_he_voi_chu_ho: '',
    ghi_chu: '',
    id_chu_ho: '', // Thay đổi từ ho_gia_dinh sang id_chu_ho
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [age, setAge] = useState(null);
  const [isNewborn, setIsNewborn] = useState(false);

  // Danh sách option cho các select
  const genderOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
  ];

  const statusOptions = [
    { value: 'song', label: 'Còn sống' },
    { value: 'chet', label: 'Đã chết' },
    { value: 'tam_tru', label: 'Tạm trú' },
    { value: 'tam_vang', label: 'Tạm vắng' },
    { value: 'chuyen_di', label: 'Đã chuyển đi' },
  ];

  const relationshipOptions = [
    { value: 'CHU_HO', label: 'Chủ hộ' },
    { value: 'VO_CHONG', label: 'Vợ/Chồng' },
    { value: 'CON', label: 'Con' },
    { value: 'CHA_ME', label: 'Cha/Mẹ' },
    { value: 'ONG_BA', label: 'Ông/Bà' },
    { value: 'CHAU', label: 'Cháu' },
    { value: 'KHAC', label: 'Khác' },
  ];

  // Hàm lấy CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key === name) cookieValue = decodeURIComponent(value);
      });
    }
    return cookieValue;
  }

  // Tính tuổi khi ngày sinh thay đổi
  useEffect(() => {
    if (formData.ngay_sinh) {
      const birthDate = new Date(formData.ngay_sinh);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge);

      // Nếu là trẻ mới sinh (dưới 1 tuổi)
      if (calculatedAge <= 0) {
        setIsNewborn(true);
        // Tự động set các trường theo yêu cầu API
        setFormData((prev) => ({
          ...prev,
          dia_chi_thuong_tru_truoc_day: 'Mới sinh',
          nghe_nghiep: '',
          noi_lam_viec: '',
          so_cccd: '',
          ngay_cap: '',
          noi_cap: '',
        }));
      } else {
        setIsNewborn(false);
      }
    } else {
      setAge(null);
      setIsNewborn(false);
    }
  }, [formData.ngay_sinh]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    // Required fields theo model
    if (!formData.ho_ten.trim()) validationErrors.ho_ten = 'Họ tên là bắt buộc';
    if (!formData.ngay_sinh)
      validationErrors.ngay_sinh = 'Ngày sinh là bắt buộc';
    if (!formData.noi_sinh.trim())
      validationErrors.noi_sinh = 'Nơi sinh là bắt buộc';
    if (!formData.nguyen_quan.trim())
      validationErrors.nguyen_quan = 'Nguyên quán là bắt buộc';
    if (!formData.dan_toc.trim())
      validationErrors.dan_toc = 'Dân tộc là bắt buộc';
    if (!formData.quan_he_voi_chu_ho)
      validationErrors.quan_he_voi_chu_ho = 'Quan hệ với chủ hộ là bắt buộc';
    if (!formData.id_chu_ho.trim())
      validationErrors.id_chu_ho = 'ID chủ hộ là bắt buộc';

    // Kiểm tra ID chủ hộ phải là số
    if (formData.id_chu_ho && !/^\d+$/.test(formData.id_chu_ho)) {
      validationErrors.id_chu_ho = 'ID chủ hộ phải là số';
    }

    // CCCD validation - unique trong model
    if (formData.so_cccd && formData.so_cccd.length !== 12) {
      validationErrors.so_cccd = 'Số CCCD phải có 12 chữ số';
    }

    // Date validations
    if (formData.ngay_sinh) {
      const birthDate = new Date(formData.ngay_sinh);
      const today = new Date();
      if (birthDate > today) {
        validationErrors.ngay_sinh = 'Ngày sinh không thể ở tương lai';
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('currentUser at submit:', currentUser);
      if (!currentUser) {
        setError('Vui lòng đăng nhập để thực hiện thao tác này.');
        setLoading(false);
        return;
      }
      if (currentUser.role !== 'can_bo') {
        setError('Bạn không có quyền. Chỉ tài khoản "Cán bộ" được phép thêm nhân khẩu.');
        setLoading(false);
        return;
      }
      // Format data đúng với API
      const submitData = {
        ...formData,
        // Format dates
        ngay_sinh: formData.ngay_sinh,
        ngay_cap: formData.ngay_cap || null,
        thoi_gian_dang_ki_thuong_tru:
          formData.thoi_gian_dang_ki_thuong_tru || null,
        // Convert empty strings to null
        bi_danh: formData.bi_danh || null,
        nghe_nghiep: formData.nghe_nghiep || null,
        noi_lam_viec: formData.noi_lam_viec || null,
        so_cccd: formData.so_cccd || null,
        noi_cap: formData.noi_cap || null,
        dia_chi_thuong_tru_truoc_day:
          formData.dia_chi_thuong_tru_truoc_day || null,
        ghi_chu: formData.ghi_chu || null,
        // Chuyển id_chu_ho thành số
        id_chu_ho: parseInt(formData.id_chu_ho),
      };

      console.log('Submitting data:', submitData); // Debug

      const csrftoken = getCookie('csrftoken');
      if (!csrftoken) {
        console.warn('CSRF token not found. If backend requires CSRF, request may be rejected.');
      }

      // Build headers and include Authorization if a token (JWT) exists
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken || '',
      };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Authorization header with token');
      }

      const response = await fetch('http://localhost:8000/api/nhan-khau/them-moi/', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      // Parse response safely (handle non-JSON responses)
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (err) {
          console.warn('Failed to parse JSON response', err);
          data = { message: 'Không thể đọc dữ liệu phản hồi từ server' };
        }
      } else {
        // try to read text and coerce to object
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : { message: text || '' };
        } catch (err) {
          data = { message: text };
        }
      }

      console.log('Response status', response.status, 'data', data); // Debug

      if (response.ok) {
        if (data && data.status === 'success') {
          setSuccess(data.message || 'Thêm mới nhân khẩu thành công');
          // Reset form sau 2 giây
          setTimeout(() => {
            handleReset();
          }, 2000);
        } else {
          setError((data && data.message) || 'Có lỗi xảy ra khi thêm nhân khẩu');
        }
      } else {
        // Non-OK responses
        if (response.status === 400) {
          if (data && data.errors) {
            setErrors(data.errors);
          } else if (data && data.message) {
            setError(data.message);
          } else {
            setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
          }
        } else if (response.status === 403) {
          setError((data && data.message) || 'Chỉ cán bộ mới có quyền thêm mới nhân khẩu');
        } else if (response.status === 401) {
          setError((data && data.message) || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          console.log('Unauthorized, redirecting to login');
          navigate('/login');
        } else {
          setError((data && data.message) || `Lỗi server: ${response.status}`);
        }
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ho_ten: '',
      bi_danh: '',
      gioi_tinh: 'Nam',
      ngay_sinh: '',
      noi_sinh: '',
      nguyen_quan: '',
      dan_toc: '',
      nghe_nghiep: '',
      noi_lam_viec: '',
      so_cccd: '',
      ngay_cap: '',
      noi_cap: '',
      thoi_gian_dang_ki_thuong_tru: '',
      dia_chi_thuong_tru_truoc_day: '',
      trang_thai: 'song',
      quan_he_voi_chu_ho: '',
      ghi_chu: '',
      id_chu_ho: '',
    });
    setErrors({});
    setAge(null);
    setIsNewborn(false);
    setError('');
    setSuccess('');
  };

  const handleBack = () => {
    console.log('Navigating back');
    navigate(-1);
  };

  return (
    <div className="add-resident-container">
      <button className="back-button" onClick={handleBack}>
        ← Quay lại
      </button>

      <h1 className="add-resident-title">Thêm Mới Nhân Khẩu</h1>

      {success && (
        <div className="alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="alert error">
          <span>✗</span>
          {error}
        </div>
      )}

      {isNewborn && (
        <div className="newborn-warning">
          <span>⚠</span>
          <div>
            <strong>Trẻ mới sinh:</strong> Địa chỉ thường trú trước đây đã được
            đặt là "Mới sinh". Nghề nghiệp, nơi làm việc và CCCD đã được bỏ
            trống theo yêu cầu hệ thống.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-resident-form">
        {/* Phần 1: Thông tin cá nhân */}
        <div className="form-section">
          <h3 className="section-title">📋 Thông Tin Cá Nhân</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Họ và tên</label>
              <input
                type="text"
                name="ho_ten"
                value={formData.ho_ten}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className={errors.ho_ten ? 'error' : ''}
              />
              {errors.ho_ten && (
                <span className="error-message">{errors.ho_ten}</span>
              )}
            </div>

            <div className="form-group">
              <label>Bí danh</label>
              <input
                type="text"
                name="bi_danh"
                value={formData.bi_danh}
                onChange={handleChange}
                placeholder="Nhập bí danh (nếu có)"
              />
            </div>

            <div className="form-group">
              <label className="required">Giới tính</label>
              <select
                name="gioi_tinh"
                value={formData.gioi_tinh}
                onChange={handleChange}
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="required">
                Ngày sinh
                {age !== null && (
                  <span
                    className={`age-indicator ${isNewborn ? 'newborn' : ''}`}
                  >
                    {isNewborn ? 'Mới sinh' : `${age} tuổi`}
                  </span>
                )}
              </label>
              <input
                type="date"
                name="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
                className={errors.ngay_sinh ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.ngay_sinh && (
                <span className="error-message">{errors.ngay_sinh}</span>
              )}
            </div>

            <div className="form-group">
              <label className="required">Nơi sinh</label>
              <input
                type="text"
                name="noi_sinh"
                value={formData.noi_sinh}
                onChange={handleChange}
                placeholder="Nhập nơi sinh"
                className={errors.noi_sinh ? 'error' : ''}
              />
              {errors.noi_sinh && (
                <span className="error-message">{errors.noi_sinh}</span>
              )}
            </div>

            <div className="form-group">
              <label className="required">Nguyên quán</label>
              <input
                type="text"
                name="nguyen_quan"
                value={formData.nguyen_quan}
                onChange={handleChange}
                placeholder="Nhập nguyên quán"
                className={errors.nguyen_quan ? 'error' : ''}
              />
              {errors.nguyen_quan && (
                <span className="error-message">{errors.nguyen_quan}</span>
              )}
            </div>

            <div className="form-group">
              <label className="required">Dân tộc</label>
              <input
                type="text"
                name="dan_toc"
                value={formData.dan_toc}
                onChange={handleChange}
                placeholder="Nhập dân tộc"
                className={errors.dan_toc ? 'error' : ''}
              />
              {errors.dan_toc && (
                <span className="error-message">{errors.dan_toc}</span>
              )}
            </div>
          </div>
        </div>

        {/* Phần 2: Thông tin nghề nghiệp */}
        <div className="form-section">
          <h3 className="section-title">💼 Thông Tin Nghề Nghiệp</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nghề nghiệp</label>
              <input
                type="text"
                name="nghe_nghiep"
                value={formData.nghe_nghiep}
                onChange={handleChange}
                placeholder="Nhập nghề nghiệp"
                disabled={isNewborn}
              />
            </div>

            <div className="form-group">
              <label>Nơi làm việc</label>
              <input
                type="text"
                name="noi_lam_viec"
                value={formData.noi_lam_viec}
                onChange={handleChange}
                placeholder="Nhập nơi làm việc"
                disabled={isNewborn}
              />
            </div>
          </div>
        </div>

        {/* Phần 3: Thông tin căn cước */}
        <div className="form-section">
          <h3 className="section-title">🪪 Thông Tin Căn Cước</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Số CCCD/CMND</label>
              <input
                type="text"
                name="so_cccd"
                value={formData.so_cccd}
                onChange={handleChange}
                placeholder="Nhập 12 số CCCD"
                maxLength="12"
                disabled={isNewborn}
                className={errors.so_cccd ? 'error' : ''}
              />
              {errors.so_cccd && (
                <span className="error-message">{errors.so_cccd}</span>
              )}
            </div>

            <div className="form-group">
              <label>Ngày cấp</label>
              <input
                type="date"
                name="ngay_cap"
                value={formData.ngay_cap}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                disabled={isNewborn}
              />
            </div>

            <div className="form-group">
              <label>Nơi cấp</label>
              <input
                type="text"
                name="noi_cap"
                value={formData.noi_cap}
                onChange={handleChange}
                placeholder="Nhập nơi cấp"
                disabled={isNewborn}
              />
            </div>
          </div>
        </div>

        {/* Phần 4: Thông tin đăng ký */}
        <div className="form-section">
          <h3 className="section-title">📝 Thông Tin Đăng Ký</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Thời gian đăng ký thường trú</label>
              <input
                type="date"
                name="thoi_gian_dang_ki_thuong_tru"
                value={formData.thoi_gian_dang_ki_thuong_tru}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ thường trú trước</label>
              <input
                type="text"
                name="dia_chi_thuong_tru_truoc_day"
                value={formData.dia_chi_thuong_tru_truoc_day}
                onChange={handleChange}
                placeholder="Nhập địa chỉ thường trú trước"
                disabled={isNewborn}
              />
            </div>

            <div className="form-group">
              <label className="required">Trạng thái</label>
              <select
                name="trang_thai"
                value={formData.trang_thai}
                onChange={handleChange}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Phần 5: Thông tin gia đình */}
        <div className="form-section">
          <h3 className="section-title">🏠 Thông Tin Gia Đình</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">ID Chủ Hộ</label>
              <input
                type="text"
                name="id_chu_ho"
                value={formData.id_chu_ho}
                onChange={handleChange}
                placeholder="Nhập ID của chủ hộ (số)"
                className={errors.id_chu_ho ? 'error' : ''}
              />
              {errors.id_chu_ho && (
                <span className="error-message">{errors.id_chu_ho}</span>
              )}
              <small className="help-text">
                Nhập ID số của chủ hộ. VD: 1, 2, 3...
              </small>
            </div>

            <div className="form-group">
              <label className="required">Quan hệ với chủ hộ</label>
              <select
                name="quan_he_voi_chu_ho"
                value={formData.quan_he_voi_chu_ho}
                onChange={handleChange}
                className={errors.quan_he_voi_chu_ho ? 'error' : ''}
              >
                <option value="">--- Chọn quan hệ ---</option>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.quan_he_voi_chu_ho && (
                <span className="error-message">
                  {errors.quan_he_voi_chu_ho}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Phần 6: Ghi chú */}
        <div className="form-section">
          <h3 className="section-title">📝 Ghi Chú</h3>
          <div className="form-group">
            <textarea
              name="ghi_chu"
              value={formData.ghi_chu}
              onChange={handleChange}
              placeholder="Nhập ghi chú (nếu có)"
              rows="4"
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang xử lý...
              </>
            ) : (
              '➕ Thêm Mới'
            )}
          </button>

          <button type="button" className="reset-btn" onClick={handleReset}>
            ↺ Làm Mới
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResidentPage;
