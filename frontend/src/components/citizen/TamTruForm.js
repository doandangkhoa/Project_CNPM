import React, { useState, useEffect } from 'react';
import '../../styles/TamTruForm.css';

const TamTruForm = ({ currentUser, onSuccess, loaiPhieu }) => {
  const [formData, setFormData] = useState({
    nhan_khau: currentUser?.nhan_khau?.id || '',
    loai_phieu: loaiPhieu || 'tam_tru',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    ly_do: '',
    dia_chi_tam_tru: '',
    ghi_chu: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nhanKhauInfo, setNhanKhauInfo] = useState(
    currentUser?.nhan_khau || null
  );

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

  // Sync loai_phieu when it changes from parent
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      loai_phieu: loaiPhieu || 'tam_tru',
    }));
  }, [loaiPhieu]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.ngay_bat_dau) {
      setError('Vui lòng chọn ngày bắt đầu');
      return false;
    }
    if (!formData.ly_do) {
      setError('Vui lòng nhập lý do');
      return false;
    }

    // Validate ngay_ket_thuc >= ngay_bat_dau nếu có nhập
    if (formData.ngay_ket_thuc) {
      const startDate = new Date(formData.ngay_bat_dau);
      const endDate = new Date(formData.ngay_ket_thuc);
      if (endDate < startDate) {
        setError('Ngày kết thúc phải >= ngày bắt đầu');
        return false;
      }
    }

    // Với tạm trú, bắt buộc có địa chỉ tạm trú
    if (formData.loai_phieu === 'tam_tru' && !formData.dia_chi_tam_tru) {
      setError('Vui lòng nhập địa chỉ tạm trú');
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
        loai_phieu: formData.loai_phieu,
        ngay_bat_dau: formData.ngay_bat_dau,
        ngay_ket_thuc: formData.ngay_ket_thuc || null,
        ly_do: formData.ly_do,
        dia_chi_tam_tru: formData.dia_chi_tam_tru || null,
        ghi_chu: formData.ghi_chu || null,
      };

      const response = await fetch(
        'http://localhost:8000/api/tam-tru-tam-vang/tao-phieu/',
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

      // Đọc response text trước, không parse JSON ngay
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError(
          'Lỗi server: ' + responseText.substring(0, 100)
        );
        return;
      }

      if (response.ok && data.status === 'success') {
        setSuccess(
          `Đăng ký ${
            formData.loai_phieu === 'tam_tru' ? 'tạm trú' : 'tạm vắng'
          } thành công!`
        );

        setFormData({
          nhan_khau: '',
          loai_phieu: 'tam_tru',
          ngay_bat_dau: '',
          ngay_ket_thuc: '',
          ly_do: '',
          dia_chi_tam_tru: '',
          ghi_chu: '',
        });

        if (onSuccess) {
          onSuccess(data.data);
        }

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(
          data.message ||
            `Đăng ký ${
              formData.loai_phieu === 'tam_tru' ? 'tạm trú' : 'tạm vắng'
            } thất bại`
        );
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tam-tru-form-container">
      <h2>
        {formData.loai_phieu === 'tam_tru'
          ? 'Đăng ký Tạm trú'
          : 'Khai báo Tạm vắng'}
      </h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="tam-tru-form">
        {/* Loại phiếu (display-only) */}
        <div className="form-group">
          <label htmlFor="loai_phieu">Loại phiếu *</label>
          <div className="info-field">
            <strong>
              {formData.loai_phieu === 'tam_tru' ? 'Tạm trú' : 'Tạm vắng'}
            </strong>
          </div>
        </div>

        {/* Thông tin nhân khẩu */}
        <div className="form-group">
          <label htmlFor="nhan_khau">Nhân khẩu đăng ký *</label>
          <div className="info-field">
            <strong>{nhanKhauInfo?.ho_ten}</strong>
            {nhanKhauInfo?.so_cccd && (
              <span className="info-secondary"> ({nhanKhauInfo.so_cccd})</span>
            )}
          </div>
        </div>

        {/* Ngày bắt đầu */}
        <div className="form-group">
          <label htmlFor="ngay_bat_dau">Ngày bắt đầu *</label>
          <input
            type="date"
            id="ngay_bat_dau"
            name="ngay_bat_dau"
            value={formData.ngay_bat_dau}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        {/* Ngày kết thúc */}
        <div className="form-group">
          <label htmlFor="ngay_ket_thuc">Ngày kết thúc (tùy chọn)</label>
          <input
            type="date"
            id="ngay_ket_thuc"
            name="ngay_ket_thuc"
            value={formData.ngay_ket_thuc}
            onChange={handleInputChange}
            disabled={loading}
            min={formData.ngay_bat_dau}
          />
          <small className="text-muted">
            Để trống nếu chưa biết ngày kết thúc
          </small>
        </div>

        {/* Lý do */}
        <div className="form-group">
          <label htmlFor="ly_do">Lý do *</label>
          <textarea
            id="ly_do"
            name="ly_do"
            value={formData.ly_do}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Nhập lý do tạm trú/tạm vắng"
            rows="4"
            required
          ></textarea>
        </div>

        {/* Địa chỉ tạm trú (bắt buộc nếu loai_phieu = tam_tru) */}
        {formData.loai_phieu === 'tam_tru' && (
          <div className="form-group">
            <label htmlFor="dia_chi_tam_tru">Địa chỉ tạm trú *</label>
            <input
              type="text"
              id="dia_chi_tam_tru"
              name="dia_chi_tam_tru"
              value={formData.dia_chi_tam_tru}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Nhập địa chỉ tạm trú"
              required
            />
          </div>
        )}

        {/* Ghi chú */}
        <div className="form-group">
          <label htmlFor="ghi_chu">Ghi chú (tùy chọn)</label>
          <textarea
            id="ghi_chu"
            name="ghi_chu"
            value={formData.ghi_chu}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Nhập ghi chú thêm"
            rows="3"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <button
            type="reset"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {
              setFormData({
                nhan_khau: currentUser?.nhan_khau?.id || '',
                loai_phieu: loaiPhieu || 'tam_tru',
                ngay_bat_dau: '',
                ngay_ket_thuc: '',
                ly_do: '',
                dia_chi_tam_tru: '',
                ghi_chu: '',
              });
              setError('');
              setSuccess('');
            }}
          >
            Xóa
          </button>
        </div>
      </form>
    </div>
  );
};

export default TamTruForm;
