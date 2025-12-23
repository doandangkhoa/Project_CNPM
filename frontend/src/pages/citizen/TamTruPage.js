import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenLayout from '../../layouts/CitizenLayout';
import TamTruForm from '../../components/citizen/TamTruForm';
import '../../styles/CitizenTamTruPage.css';

const TamTruPageContent = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false); // true/false instead of null
  const [loaiPhieu, setLoaiPhieu] = useState('tam_tru'); // Loại phiếu selected by user
  const [phieuList, setPhieuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPhieuList();
  }, []);

  const fetchPhieuList = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:8000/api/tam-tru-tam-vang/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhieuList(data.results || data || []);
      } else {
        setError('Không thể tải danh sách phiếu');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getLoaiPhieuLabel = (loai) => {
    return loai === 'tam_tru' ? 'Tạm trú' : 'Tạm vắng';
  };

  const getStatusBadge = (phieu) => {
    if (phieu.dang_hieu_luc) {
      return <span className="badge badge-success">Còn hiệu lực</span>;
    } else {
      return <span className="badge badge-secondary">Hết hiệu lực</span>;
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowForm(false);
    fetchPhieuList();
  };

  return (
    <div className="citizen-tam-tru-page">
      {/* Main Content */}
      <div className="page-content">
        {!showForm ? (
          <>
            {/* Action Section */}
            <div className="action-section">
              <h2>Đăng ký Tạm trú / Tạm vắng</h2>
              <div className="register-form-wrapper">
                <div className="form-group-inline">
                  <label htmlFor="loai_phieu">Chọn loại đăng ký:</label>
                  <select
                    id="loai_phieu"
                    value={loaiPhieu}
                    onChange={(e) => setLoaiPhieu(e.target.value)}
                    className="loai-phieu-select"
                  >
                    <option value="tam_tru">Tạm trú</option>
                    <option value="tam_vang">Tạm vắng</option>
                  </select>
                  <button
                    className="btn-submit-register"
                    onClick={() => setShowForm(true)}
                  >
                    Nộp đơn
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách phiếu */}
            <div className="danh-sach-section">
              <h2>Danh sách phiếu đã đăng ký</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              {loading ? (
                <div className="loading">Đang tải dữ liệu...</div>
              ) : phieuList.length === 0 ? (
                <div className="empty-state">
                  <p>Bạn chưa có phiếu tạm trú hoặc tạm vắng nào</p>
                  <p className="text-muted">
                    Hãy bấm vào nút bên trên để đăng ký phiếu mới
                  </p>
                </div>
              ) : (
                <div className="phieu-list">
                  {phieuList.map((phieu) => (
                    <div key={phieu.id} className="phieu-card">
                      <div className="phieu-header">
                        <div className="phieu-title">
                          <h3>{phieu.nhan_khau_ho_ten}</h3>
                          <span className="phieu-loai">
                            {getLoaiPhieuLabel(phieu.loai_phieu)}
                          </span>
                        </div>
                        <div className="phieu-status">
                          {getStatusBadge(phieu)}
                        </div>
                      </div>

                      <div className="phieu-content">
                        <div className="phieu-info-row">
                          <span className="label">Ngày bắt đầu:</span>
                          <span className="value">
                            {formatDate(phieu.ngay_bat_dau)}
                          </span>
                        </div>

                        {phieu.ngay_ket_thuc && (
                          <div className="phieu-info-row">
                            <span className="label">Ngày kết thúc:</span>
                            <span className="value">
                              {formatDate(phieu.ngay_ket_thuc)}
                            </span>
                          </div>
                        )}

                        <div className="phieu-info-row">
                          <span className="label">Lý do:</span>
                          <span className="value">{phieu.ly_do}</span>
                        </div>

                        {phieu.dia_chi_tam_tru && (
                          <div className="phieu-info-row">
                            <span className="label">Địa chỉ tạm trú:</span>
                            <span className="value">
                              {phieu.dia_chi_tam_tru}
                            </span>
                          </div>
                        )}

                        {phieu.ghi_chu && (
                          <div className="phieu-info-row">
                            <span className="label">Ghi chú:</span>
                            <span className="value">{phieu.ghi_chu}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button className="btn-back" onClick={() => setShowForm(false)}>
              ← Quay lại
            </button>

            {/* Form */}
            <div className="form-wrapper">
              <TamTruForm
                currentUser={currentUser}
                onSuccess={handleFormSubmitSuccess}
                loaiPhieu={loaiPhieu}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CitizenTamTruPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="citizen-page-content">
        <TamTruPageContent currentUser={currentUser} onLogout={onLogout} />
      </div>
    </CitizenLayout>
  );
};

export default CitizenTamTruPage;
