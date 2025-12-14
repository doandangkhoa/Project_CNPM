import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/NhanKhauDetail.css';

function NhanKhauDetailPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nhanKhau, setNhanKhau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchNhanKhauDetail();
  }, [id]);

  const fetchNhanKhauDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/nhan-khau/${id}/chi-tiet/`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNhanKhau(data);
        setFormData(data);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError('Không thể tải thông tin nhân khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/nhan-khau/${id}/cap-nhat/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setNhanKhau(data);
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        setError('Lỗi cập nhật thông tin');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!nhanKhau) {
    return <div className="error-message">Không tìm thấy nhân khẩu</div>;
  }

  return (
    <div className="nhan-khau-detail-container">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Quay lại</button>
        <h1>{nhanKhau.ho_ten}</h1>
        {!isEditing && (
          <button className="btn-edit-detail" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </button>
        )}
      </div>

      <div className="detail-card">
        {isEditing ? (
          <form onSubmit={handleSave} className="detail-form">
            <div className="form-section">
              <h3>Thông Tin Cá Nhân</h3>
              
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="ho_ten"
                  value={formData.ho_ten || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Biệt danh</label>
                <input
                  type="text"
                  name="bi_danh"
                  value={formData.bi_danh || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giới tính</label>
                  <select name="gioi_tinh" value={formData.gioi_tinh || ''} onChange={handleChange}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="ngay_sinh"
                    value={formData.ngay_sinh || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nơi sinh</label>
                <input
                  type="text"
                  name="noi_sinh"
                  value={formData.noi_sinh || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Quê quán</label>
                <input
                  type="text"
                  name="nguyen_quan"
                  value={formData.nguyen_quan || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dân tộc</label>
                <input
                  type="text"
                  name="dan_toc"
                  value={formData.dan_toc || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Thông Tin Việc Làm</h3>
              
              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input
                  type="text"
                  name="nghe_nghiep"
                  value={formData.nghe_nghiep || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Nơi làm việc</label>
                <input
                  type="text"
                  name="noi_lam_viec"
                  value={formData.noi_lam_viec || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Thông Tin CCCD</h3>
              
              <div className="form-group">
                <label>Số CCCD</label>
                <input
                  type="text"
                  name="so_cccd"
                  value={formData.so_cccd || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày cấp</label>
                  <input
                    type="date"
                    name="ngay_cap"
                    value={formData.ngay_cap || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Nơi cấp</label>
                  <input
                    type="text"
                    name="noi_cap"
                    value={formData.noi_cap || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">Lưu</button>
              <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
            </div>
          </form>
        ) : (
          <div className="detail-view">
            <div className="detail-section">
              <h3>Thông Tin Cá Nhân</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Họ và tên</label>
                  <p>{nhanKhau.ho_ten}</p>
                </div>
                <div className="detail-item">
                  <label>Biệt danh</label>
                  <p>{nhanKhau.bi_danh || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Giới tính</label>
                  <p>{nhanKhau.gioi_tinh_hien_thi || nhanKhau.gioi_tinh}</p>
                </div>
                <div className="detail-item">
                  <label>Ngày sinh</label>
                  <p>{nhanKhau.ngay_sinh ? new Date(nhanKhau.ngay_sinh).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Nơi sinh</label>
                  <p>{nhanKhau.noi_sinh || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Quê quán</label>
                  <p>{nhanKhau.nguyen_quan || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Dân tộc</label>
                  <p>{nhanKhau.dan_toc || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Thông Tin Việc Làm</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Nghề nghiệp</label>
                  <p>{nhanKhau.nghe_nghiep || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Nơi làm việc</label>
                  <p>{nhanKhau.noi_lam_viec || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Thông Tin CCCD</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Số CCCD</label>
                  <p>{nhanKhau.so_cccd || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Ngày cấp</label>
                  <p>{nhanKhau.ngay_cap ? new Date(nhanKhau.ngay_cap).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Nơi cấp</label>
                  <p>{nhanKhau.noi_cap || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Thông Tin Khác</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Trạng thái</label>
                  <p>{nhanKhau.trang_thai_hien_thi}</p>
                </div>
                <div className="detail-item">
                  <label>Quan hệ với chủ hộ</label>
                  <p>{nhanKhau.quan_he_voi_chu_ho || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NhanKhauDetailPage;
