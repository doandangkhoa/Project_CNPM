import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenLayout from '../../layouts/CitizenLayout';
import '../../styles/CitizenTamTruPage.css';

const LichSuYeuCau = ({ currentUser }) => {
  const [phieuList, setPhieuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhieuList();
    // eslint-disable-next-line
  }, []);

  const fetchPhieuList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        'http://localhost:8000/api/tam-tru-tam-vang/',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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
    if (phieu.trang_thai === 'da_duyet') {
      return <span className="badge badge-success">Đã duyệt</span>;
    } else if (phieu.trang_thai === 'cho_duyet') {
      return <span className="badge badge-warning">Đang chờ xử lý</span>;
    } else {
      return <span className="badge badge-secondary">Bị từ chối</span>;
    }
  };

  return (
    <div className="citizen-tam-tru-page">
      <div className="page-content">
        <h2>Lịch sử yêu cầu</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : phieuList.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa có phiếu tạm trú hoặc tạm vắng nào</p>
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
                  <div className="phieu-status">{getStatusBadge(phieu)}</div>
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
                      <span className="value">{phieu.dia_chi_tam_tru}</span>
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
    </div>
  );
};

const LichSuYeuCauPage = ({ currentUser, onLogout }) => {
  return (
    <CitizenLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="citizen-page-content">
        <LichSuYeuCau currentUser={currentUser} onLogout={onLogout} />
      </div>
    </CitizenLayout>
  );
};

export default LichSuYeuCauPage;
