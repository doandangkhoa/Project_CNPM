import React, { useState } from 'react';
import '../../styles/XinCapGiayXacNhanForm.css';

const XinCapGiayXacNhanForm = ({ currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    loai_giay: 'nhan_khau',
    so_luong: 1,
    ly_do: '',
    ghi_chu: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loaiGiayOptions = [
    { value: 'nhan_khau', label: 'Giấy xác nhận nhân khẩu' },
    { value: 'ho_khau', label: 'Giấy xác nhận hộ khẩu' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
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
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/xin-cap-giay-xac-nhan/tao-phieu/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          loai_giay: 'nhan_khau',
          so_luong: 1,
          ly_do: '',
          ghi_chu: '',
        });
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        console.log('Error response data:', data);
        setError(data.message || 'Nộp đơn thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xin-cap-giay-form">
      <div className="form-container">
        <h2>Yêu Cầu Cấp Giấy Xác Nhận</h2>
        <p className="form-subtitle">
          Điền thông tin chi tiết để nộp yêu cầu cấp giấy xác nhận
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            ✓ Yêu cầu của bạn đã được nộp thành công! Vui lòng chờ xem xét.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loại Giấy Xác Nhận *</label>
            <select
              name="loai_giay"
              value={formData.loai_giay}
              onChange={handleInputChange}
              required
            >
              {loaiGiayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Số Lượng Bản *</label>
            <input
              type="number"
              name="so_luong"
              value={formData.so_luong}
              onChange={handleInputChange}
              min="1"
              max="100"
              required
            />
            <small>Nhập số lượng giấy xác nhận cần cấp</small>
          </div>

          <div className="form-group">
            <label>Lý Do Cấp Giấy *</label>
            <textarea
              name="ly_do"
              value={formData.ly_do}
              onChange={handleInputChange}
              placeholder="Nhập lý do cần cấp giấy xác nhận (ví dụ: Xin việc, học bổng...)"
              rows="5"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Ghi Chú Bổ Sung</label>
            <textarea
              name="ghi_chu"
              value={formData.ghi_chu}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm nếu cần thiết (không bắt buộc)"
              rows="3"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : '✓ Nộp Đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default XinCapGiayXacNhanForm;
