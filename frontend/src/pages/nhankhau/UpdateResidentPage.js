import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateResidentPage.css';

const UpdateResidentPage = () => {
  const navigate = useNavigate();

  // State cho các trạng thái
  const [searchId, setSearchId] = useState('');
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
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [age, setAge] = useState(null);
  const [isNewborn, setIsNewborn] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
  const getCookie = useCallback((name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key === name) cookieValue = decodeURIComponent(value);
      });
    }
    return cookieValue;
  }, []);

  // Fetch thông tin nhân khẩu
  const fetchResidentData = useCallback(
    async (residentId) => {
      setFetching(true);
      setError('');
      setSuccess('');
      setShowForm(false);
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
      });
      setOriginalData({});

      try {
        const response = await fetch(
          `http://localhost:8000/api/nhan-khau/${residentId}/chi-tiet/`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken'),
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.status === 'success') {
            const resident = data.nhan_khau;
            setOriginalData(resident);

            // Format dates cho input
            const formatDateForInput = (dateString) => {
              if (!dateString) return '';
              try {
                return new Date(dateString).toISOString().split('T')[0];
              } catch (err) {
                return '';
              }
            };

            const newFormData = {
              ho_ten: resident.ho_ten || '',
              bi_danh: resident.bi_danh || '',
              gioi_tinh: resident.gioi_tinh || 'Nam',
              ngay_sinh: formatDateForInput(resident.ngay_sinh),
              noi_sinh: resident.noi_sinh || '',
              nguyen_quan: resident.nguyen_quan || '',
              dan_toc: resident.dan_toc || '',
              nghe_nghiep: resident.nghe_nghiep || '',
              noi_lam_viec: resident.noi_lam_viec || '',
              so_cccd: resident.so_cccd || '',
              ngay_cap: formatDateForInput(resident.ngay_cap),
              noi_cap: resident.noi_cap || '',
              thoi_gian_dang_ki_thuong_tru: formatDateForInput(
                resident.thoi_gian_dang_ki_thuong_tru
              ),
              dia_chi_thuong_tru_truoc_day:
                resident.dia_chi_thuong_tru_truoc_day || '',
              trang_thai: resident.trang_thai || 'song',
              quan_he_voi_chu_ho: resident.quan_he_voi_chu_ho || '',
              ghi_chu: resident.ghi_chu || '',
            };

            setFormData(newFormData);
            setShowForm(true);
            setSuccess(`Đã tìm thấy nhân khẩu: ${resident.ho_ten}`);

            // Tính tuổi
            if (resident.ngay_sinh) {
              const birthDate = new Date(resident.ngay_sinh);
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
              setIsNewborn(calculatedAge <= 0);
            }
          } else {
            setError(data.message || 'Không tìm thấy nhân khẩu');
          }
        } else {
          setError(data.message || `Lỗi: ${response.status}`);
        }
      } catch (err) {
        setError(
          'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        );
        console.error('Error:', err);
      } finally {
        setFetching(false);
      }
    },
    [getCookie]
  );

  // Kiểm tra thay đổi
  const checkForChanges = useCallback(() => {
    if (!originalData || Object.keys(originalData).length === 0) {
      setHasChanges(false);
      return;
    }

    // So sánh từng trường
    const changedFields = Object.keys(formData).filter((key) => {
      const formValue = formData[key];
      let originalValue = originalData[key];

      // Xử lý định dạng ngày tháng
      if (key.includes('ngay') || key.includes('thoi_gian')) {
        if (formValue && originalValue) {
          const formDate = new Date(formValue).toISOString().split('T')[0];
          const originalDate = new Date(originalValue)
            .toISOString()
            .split('T')[0];
          return formDate !== originalDate;
        }
        return formValue !== (originalValue || '');
      }

      return formValue !== (originalValue || '');
    });

    setHasChanges(changedFields.length > 0);
  }, [formData, originalData]);

  // Theo dõi thay đổi form để xác định có thay đổi không
  useEffect(() => {
    if (showForm) {
      checkForChanges();
    }
  }, [formData, originalData, showForm, checkForChanges]);

  // Tính tuổi khi ngày sinh thay đổi
  useEffect(() => {
    if (formData.ngay_sinh && showForm) {
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
      setIsNewborn(calculatedAge <= 0);
    }
  }, [formData.ngay_sinh, showForm]);

  // Xử lý tìm kiếm nhân khẩu
  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!searchId.trim()) {
      setError('Vui lòng nhập ID nhân khẩu');
      return;
    }

    if (!/^\d+$/.test(searchId)) {
      setError('ID nhân khẩu phải là số');
      return;
    }

    fetchResidentData(searchId);
  };

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

    // Clear success message khi user thay đổi dữ liệu
    if (success) {
      setSuccess('');
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

    // CCCD validation
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

    if (!hasChanges) {
      setError('Không có thay đổi nào để cập nhật');
      return;
    }

    setLoading(true);

    try {
      // Lấy chỉ các trường đã thay đổi
      const changedData = {};
      Object.keys(formData).forEach((key) => {
        const formValue = formData[key];
        let originalValue = originalData[key] || '';

        // Xử lý định dạng ngày tháng
        if (key.includes('ngay') || key.includes('thoi_gian')) {
          if (formValue && originalValue) {
            const formDate = new Date(formValue).toISOString().split('T')[0];
            const originalDate = new Date(originalValue)
              .toISOString()
              .split('T')[0];
            if (formDate !== originalDate) {
              changedData[key] = formValue;
            }
          } else if (formValue !== originalValue) {
            changedData[key] = formValue;
          }
        } else if (formValue !== originalValue) {
          changedData[key] = formValue;
        }
      });

      // Nếu không có trường nào thay đổi thực sự
      if (Object.keys(changedData).length === 0) {
        setError('Không có thay đổi nào để cập nhật');
        setLoading(false);
        return;
      }

      // Format data đúng với API
      const submitData = {
        ...changedData,
        // Format dates
        ngay_sinh: changedData.ngay_sinh || undefined,
        ngay_cap: changedData.ngay_cap || undefined,
        thoi_gian_dang_ki_thuong_tru:
          changedData.thoi_gian_dang_ki_thuong_tru || undefined,
        // Convert empty strings to null
        bi_danh: changedData.bi_danh === '' ? null : changedData.bi_danh,
        nghe_nghiep:
          changedData.nghe_nghiep === '' ? null : changedData.nghe_nghiep,
        noi_lam_viec:
          changedData.noi_lam_viec === '' ? null : changedData.noi_lam_viec,
        so_cccd: changedData.so_cccd === '' ? null : changedData.so_cccd,
        noi_cap: changedData.noi_cap === '' ? null : changedData.noi_cap,
        dia_chi_thuong_tru_truoc_day:
          changedData.dia_chi_thuong_tru_truoc_day === ''
            ? null
            : changedData.dia_chi_thuong_tru_truoc_day,
        ghi_chu: changedData.ghi_chu === '' ? null : changedData.ghi_chu,
      };

      console.log('Updating with data:', submitData); // Debug

      const response = await fetch(
        `http://localhost:8000/api/nhan-khau/${searchId}/cap-nhat/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
          body: JSON.stringify(submitData),
        }
      );

      const data = await response.json();
      console.log('Response:', data); // Debug

      if (response.ok) {
        if (data.status === 'success') {
          setSuccess(data.message || 'Cập nhật thông tin nhân khẩu thành công');
          // Fetch lại data mới sau khi cập nhật thành công
          setTimeout(() => {
            fetchResidentData(searchId);
          }, 1000);
        } else {
          setError(data.message || 'Có lỗi xảy ra khi cập nhật nhân khẩu');
        }
      } else {
        if (response.status === 400) {
          // Hiển thị lỗi từ server
          if (data.errors) {
            setErrors(data.errors);
          } else if (data.message) {
            setError(data.message);
          } else {
            setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
          }
        } else if (response.status === 403) {
          setError('Chỉ cán bộ mới có quyền cập nhật nhân khẩu');
        } else if (response.status === 401) {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          console.log('Unauthorized, redirecting to login');
          navigate('/login');
        } else if (response.status === 404) {
          setError('Không tìm thấy nhân khẩu');
          setShowForm(false);
        } else {
          setError(`Lỗi server: ${response.status}`);
        }
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    if (originalData) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          return new Date(dateString).toISOString().split('T')[0];
        } catch (err) {
          return '';
        }
      };

      setFormData({
        ho_ten: originalData.ho_ten || '',
        bi_danh: originalData.bi_danh || '',
        gioi_tinh: originalData.gioi_tinh || 'Nam',
        ngay_sinh: formatDateForInput(originalData.ngay_sinh),
        noi_sinh: originalData.noi_sinh || '',
        nguyen_quan: originalData.nguyen_quan || '',
        dan_toc: originalData.dan_toc || '',
        nghe_nghiep: originalData.nghe_nghiep || '',
        noi_lam_viec: originalData.noi_lam_viec || '',
        so_cccd: originalData.so_cccd || '',
        ngay_cap: formatDateForInput(originalData.ngay_cap),
        noi_cap: originalData.noi_cap || '',
        thoi_gian_dang_ki_thuong_tru: formatDateForInput(
          originalData.thoi_gian_dang_ki_thuong_tru
        ),
        dia_chi_thuong_tru_truoc_day:
          originalData.dia_chi_thuong_tru_truoc_day || '',
        trang_thai: originalData.trang_thai || 'song',
        quan_he_voi_chu_ho: originalData.quan_he_voi_chu_ho || '',
        ghi_chu: originalData.ghi_chu || '',
      });
    }
    setErrors({});
    setError('');
  };

  const handleNewSearch = () => {
    setSearchId('');
    setShowForm(false);
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
    });
    setOriginalData({});
    setSuccess('');
    setError('');
    setHasChanges(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewDetail = () => {
    if (searchId) {
      navigate(`/nhan-khau/${searchId}`);
    }
  };

  return (
    <div className="update-resident-container">
      <button className="back-button" onClick={handleBack}>
        ← Quay lại
      </button>

      <h1 className="update-resident-title">Cập Nhật Thông Tin Nhân Khẩu</h1>

      {/* Phần tìm kiếm */}
      <div className="search-section">
        <h3 className="section-title">🔍 Tìm Kiếm Nhân Khẩu</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập ID nhân khẩu..."
              className="search-input"
              disabled={fetching}
            />
            <button
              type="submit"
              className="search-btn"
              disabled={fetching || !searchId.trim()}
            >
              {fetching ? (
                <>
                  <span className="loading-spinner small"></span>
                  Đang tìm...
                </>
              ) : (
                '🔍 Tìm kiếm'
              )}
            </button>
            {showForm && (
              <button
                type="button"
                className="search-btn secondary"
                onClick={handleNewSearch}
              >
                🔄 Tìm mới
              </button>
            )}
          </div>
          <p className="search-hint">
            Nhập ID số của nhân khẩu cần cập nhật (VD: 1, 2, 3...)
          </p>
        </form>
      </div>

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

      {/* Hiển thị form chỉ khi đã tìm thấy nhân khẩu */}
      {showForm && !fetching && (
        <>
          <div className="resident-info-header">
            <div className="resident-info">
              <h3>
                {formData.ho_ten}
                {formData.bi_danh && (
                  <span className="resident-alias"> ({formData.bi_danh})</span>
                )}
              </h3>
              <div className="resident-meta">
                <span className="resident-id">ID: {searchId}</span>
                <button className="view-detail-btn" onClick={handleViewDetail}>
                  👁 Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          {!hasChanges && !loading && (
            <div className="alert info">
              <span>ℹ</span>
              Không có thay đổi nào so với dữ liệu gốc. Hãy chỉnh sửa các trường
              cần cập nhật.
            </div>
          )}

          {isNewborn && (
            <div className="newborn-warning">
              <span>⚠</span>
              <div>
                <strong>Trẻ mới sinh:</strong> Các trường nghề nghiệp, nơi làm
                việc và CCCD có thể không áp dụng.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="update-resident-form">
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
                        className={`age-indicator ${
                          isNewborn ? 'newborn' : ''
                        }`}
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
                  <label>Thông tin hộ gia đình</label>
                  <div className="household-info">
                    {originalData.ho_gia_dinh ? (
                      <>
                        <div className="info-item">
                          <strong>Số hộ khẩu:</strong>{' '}
                          {originalData.ho_gia_dinh.so_ho_khau || 'Chưa có'}
                        </div>
                        <div className="info-item">
                          <strong>Chủ hộ:</strong>{' '}
                          {originalData.ho_gia_dinh.ten_chu_ho || 'Chưa có'}
                        </div>
                        <div className="info-item">
                          <strong>Địa chỉ:</strong>{' '}
                          {originalData.ho_gia_dinh.dia_chi || 'Chưa có'}
                        </div>
                      </>
                    ) : (
                      <span className="no-household">
                        Chưa có thông tin hộ gia đình
                      </span>
                    )}
                  </div>
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
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang cập nhật...
                  </>
                ) : (
                  '💾 Lưu Thay Đổi'
                )}
              </button>

              <button
                type="button"
                className="reset-btn"
                onClick={handleResetForm}
              >
                ↺ Khôi Phục Gốc
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={handleNewSearch}
              >
                🔄 Nhân khẩu khác
              </button>
            </div>

            <div className="change-indicator">
              {hasChanges ? (
                <span className="has-changes">⚠ Có thay đổi chưa được lưu</span>
              ) : (
                <span className="no-changes">✓ Không có thay đổi</span>
              )}
            </div>
          </form>
        </>
      )}

      {/* Hiển thị khi chưa tìm kiếm */}
      {!showForm && !fetching && !error && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Chưa có thông tin nhân khẩu</h3>
          <p>Nhập ID nhân khẩu và nhấn "Tìm kiếm" để bắt đầu cập nhật</p>
        </div>
      )}

      {/* Hiển thị loading khi đang tìm kiếm */}
      {fetching && (
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Đang tải thông tin nhân khẩu ID: {searchId}...</p>
        </div>
      )}
    </div>
  );
};

export default UpdateResidentPage;
