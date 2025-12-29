import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenLayout from '../../layouts/CitizenLayout';
import TamTruForm from '../../components/citizen/TamTruForm';
import '../../styles/CitizenLayout.css';

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

  const handleSelectAndNavigate = () => {
    if (loaiPhieu === 'bao_sai_thong_tin') {
      navigate('/citizen/bao-sai-thong-tin');
    } else if (loaiPhieu === 'xin_cap_giay_xac_nhan') {
      navigate('/citizen/xin-cap-giay-xac-nhan');
    } else {
      setShowForm(true);
    }
  };

  return (
    <div className="citizen-tam-tru-page">
      {/* Main Content */}
      <div className="page-content">
        {!showForm ? (
          <>
            {/* Action Section */}
            <div className="action-section">
              <h2>Đăng ký thủ tục</h2>
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
                    <option value="bao_sai_thong_tin">Báo sai thông tin</option>
                    <option value="xin_cap_giay_xac_nhan">
                      Xin cấp giấy xác nhận
                    </option>
                  </select>
                  <button
                    className="btn-submit-register"
                    onClick={handleSelectAndNavigate}
                  >
                    Nộp đơn
                  </button>
                </div>
              </div>
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
