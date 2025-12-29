import React, { useState, useEffect } from 'react';
import '../../styles/BaoCaiThongTinForm.css';

const BaoCaiThongTinForm = ({ currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    nhan_khau: currentUser?.nhan_khau?.id || '',
    ngay_bat_dau: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    cac_truong_loi: [], // Array các trường sửa
    ly_do: '',
    ghi_chu: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nhanKhauInfo, setNhanKhauInfo] = useState(
    currentUser?.nhan_khau || null
  );

  // Các trường có thể sửa được
  const EDITABLE_FIELDS = [
    { key: 'ho_ten', label: 'Họ Tên' },
    { key: 'bi_danh', label: 'Bí Danh' },
    { key: 'ngay_sinh', label: 'Ngày Sinh' },
    { key: 'noi_sinh', label: 'Nơi Sinh' },
    { key: 'nguyen_quan', label: 'Nguyên Quán' },
    { key: 'dan_toc', label: 'Dân Tộc' },
    { key: 'nghe_nghiep', label: 'Nghề Nghiệp' },
    { key: 'noi_lam_viec', label: 'Nơi Làm Việc' },
    { key: 'so_cccd', label: 'Số CCCD' },
    { key: 'ngay_cap', label: 'Ngày Cấp' },
    { key: 'noi_cap', label: 'Nơi Cấp' },
    { key: 'gioi_tinh', label: 'Giới Tính' },
    { key: 'quan_he_voi_chu_ho', label: 'Quan Hệ Với Chủ Hộ' },
  ];

  // Kiểm tra xem người dùng có linked nhan_khau không
  useEffect(() => {
    if (!currentUser?.nhan_khau?.id) {
      setError(
        'Bạn chưa liên kết thông tin nhân khẩu. Vui lòng cập nhật hồ sơ trước.'
      );
    } else {
      setNhanKhauInfo(currentUser.nhan_khau);
      setFormData((prev) => ({
        ...prev,
        nhan_khau: currentUser.nhan_khau.id,
      }));
    }
  }, [currentUser]);

  const handleAddField = () => {
    setFormData((prev) => ({
      ...prev,
      cac_truong_loi: [
        ...prev.cac_truong_loi,
        { truong: '', gia_tri_cu: '', gia_tri_moi: '' },
      ],
    }));
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      cac_truong_loi: prev.cac_truong_loi.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.cac_truong_loi];

    if (field === 'truong') {
      // Khi chọn trường, tự động lấy giá trị cũ
      const oldValue = nhanKhauInfo[value] || '';
      newFields[index] = {
        ...newFields[index],
        truong: value,
        gia_tri_cu: oldValue,
      };
    } else {
      newFields[index] = {
        ...newFields[index],
        [field]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      cac_truong_loi: newFields,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.ngay_bat_dau) {
      setError('Vui lòng chọn ngày báo cáo');
      return false;
    }
    if (formData.cac_truong_loi.length === 0) {
      setError('Vui lòng thêm ít nhất một trường cần sửa');
      return false;
    }
    for (let field of formData.cac_truong_loi) {
      if (!field.truong) {
        setError('Vui lòng chọn trường cần sửa');
        return false;
      }
      if (!field.gia_tri_moi.trim()) {
        setError('Vui lòng nhập giá trị chính xác');
        return false;
      }
    }
    if (!formData.ly_do.trim()) {
      setError('Vui lòng nhập lý do báo cáo');
      return false;
    }
    return true;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        nhan_khau: parseInt(formData.nhan_khau),
        ngay_bat_dau: formData.ngay_bat_dau,
        cac_truong_loi: formData.cac_truong_loi,
        ly_do: formData.ly_do,
        ghi_chu: formData.ghi_chu || null,
      };

      const response = await fetch(
        'http://localhost:8000/api/bao-sai-thong-tin/tao-phieu/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
          body: JSON.stringify(submitData),
        }
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError('Lỗi server: ' + responseText.substring(0, 100));
        return;
      }

      if (response.ok && data.status === 'success') {
        setSuccess(
          'Báo cáo sai thông tin đã được tạo! Cần phê duyệt từ cán bộ trước khi áp dụng.'
        );

        // Reset form
        setFormData({
          nhan_khau: currentUser?.nhan_khau?.id || '',
          ngay_bat_dau: new Date().toISOString().split('T')[0],
          cac_truong_loi: [],
          ly_do: '',
          ghi_chu: '',
        });

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(data.data || null);
          }
        }, 2000);
      } else {
        setError(data.message || 'Báo cáo sai thông tin thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bao-sai-thong-tin-form-container">
      <h2>Báo Cáo Sai Thông Tin</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="bao-sai-thong-tin-form">
        {/* Thông tin nhân khẩu */}
        <div className="form-group">
          <label htmlFor="nhan_khau">Nhân khẩu báo cáo</label>
          <div className="info-field">
            <strong>{nhanKhauInfo?.ho_ten}</strong>
            {nhanKhauInfo?.so_cccd && (
              <span className="info-secondary"> ({nhanKhauInfo.so_cccd})</span>
            )}
          </div>
        </div>

        {/* Ngày báo cáo */}
        <div className="form-group">
          <label htmlFor="ngay_bat_dau">Ngày báo cáo</label>
          <input
            type="date"
            id="ngay_bat_dau"
            name="ngay_bat_dau"
            value={formData.ngay_bat_dau}
            onChange={handleInputChange}
            disabled={loading}
          />
          <small className="text-muted">Mặc định là ngày hôm nay</small>
        </div>

        {/* Lý do báo cáo */}
        <div className="form-group">
          <label htmlFor="ly_do">Lý do báo cáo *</label>
          <textarea
            id="ly_do"
            name="ly_do"
            value={formData.ly_do}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Mô tả chi tiết lý do sai thông tin"
            rows="4"
            required
          ></textarea>
        </div>

        {/* Các trường cần sửa */}
        <div className="form-section">
          <div className="section-header">
            <h3>Các Trường Cần Sửa *</h3>
            <button
              type="button"
              className="btn-add-field"
              onClick={handleAddField}
              disabled={loading}
            >
              + Thêm trường
            </button>
          </div>

          {formData.cac_truong_loi.length === 0 ? (
            <p className="text-muted">
              Chưa có trường nào. Hãy thêm trường cần sửa.
            </p>
          ) : (
            formData.cac_truong_loi.map((field, index) => (
              <div key={index} className="field-card">
                <div className="field-card-header">
                  <span className="field-number">Trường #{index + 1}</span>
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => handleRemoveField(index)}
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>

                {/* Chọn trường */}
                <div className="field-form-group">
                  <label>Chọn trường cần sửa *</label>
                  <select
                    value={field.truong}
                    onChange={(e) =>
                      handleFieldChange(index, 'truong', e.target.value)
                    }
                    disabled={loading}
                    required
                  >
                    <option value="">-- Chọn trường --</option>
                    {EDITABLE_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Giá trị cũ (display-only) */}
                {field.truong && (
                  <div className="field-form-group">
                    <label>Giá trị cũ</label>
                    <div className="info-field">
                      {field.gia_tri_cu || '(không có dữ liệu)'}
                    </div>
                  </div>
                )}

                {/* Giá trị chính xác */}
                <div className="field-form-group">
                  <label>Giá trị chính xác *</label>
                  <input
                    type="text"
                    value={field.gia_tri_moi}
                    onChange={(e) =>
                      handleFieldChange(index, 'gia_tri_moi', e.target.value)
                    }
                    disabled={loading}
                    placeholder="Nhập thông tin chính xác"
                    required
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ghi chú */}
        <div className="form-group">
          <label htmlFor="ghi_chu">Ghi chú (tùy chọn)</label>
          <textarea
            id="ghi_chu"
            name="ghi_chu"
            value={formData.ghi_chu}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Thông tin bổ sung"
            rows="3"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
          <button
            type="reset"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {
              setFormData({
                nhan_khau: currentUser?.nhan_khau?.id || '',
                ngay_bat_dau: new Date().toISOString().split('T')[0],
                cac_truong_loi: [],
                ly_do: '',
                ghi_chu: '',
              });
              setError('');
              setSuccess('');
            }}
          >
            Xóa
          </button>
        </div>

        {/* Note */}
        <div className="form-note">
          <strong>Lưu ý:</strong> Báo cáo cần được phê duyệt bởi cán bộ trước
          khi các thay đổi được áp dụng vào hệ thống.
        </div>
      </form>
    </div>
  );
};

export default BaoCaiThongTinForm;
