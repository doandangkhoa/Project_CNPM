import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenLayout from '../../layouts/CitizenLayout';
import '../../styles/LichSuYeuCauPage.css';

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

      // Lấy cả tam trú/tam vắng, báo cáo sai thông tin và xin cấp giấy xác nhận
      const [tamTruResponse, baoCaiResponse, xinCapResponse] =
        await Promise.all([
          fetch('http://localhost:8000/api/tam-tru-tam-vang/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('http://localhost:8000/api/bao-sai-thong-tin/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('http://localhost:8000/api/xin-cap-giay-xac-nhan/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
        ]);

      let combinedList = [];

      if (tamTruResponse.ok) {
        const tamTruData = await tamTruResponse.json();
        const tamTruItems = (tamTruData.results || tamTruData || []).map(
          (item) => ({
            ...item,
            request_type: 'tam_tru_tam_vang',
          })
        );
        combinedList = combinedList.concat(tamTruItems);
      }

      if (baoCaiResponse.ok) {
        const baoCaiData = await baoCaiResponse.json();
        const baoCaiItems = (baoCaiData.results || baoCaiData || []).map(
          (item) => ({
            ...item,
            request_type: 'bao_sai_thong_tin',
          })
        );
        combinedList = combinedList.concat(baoCaiItems);
      }

      if (xinCapResponse.ok) {
        const xinCapData = await xinCapResponse.json();
        const xinCapItems = (xinCapData.results || xinCapData || []).map(
          (item) => ({
            ...item,
            request_type: 'xin_cap_giay_xac_nhan',
          })
        );
        combinedList = combinedList.concat(xinCapItems);
      }

      // Sắp xếp theo ngày gần nhất
      combinedList.sort((a, b) => {
        const dateA = new Date(a.ngay_bat_dau || a.created_at);
        const dateB = new Date(b.ngay_bat_dau || b.created_at);
        return dateB - dateA;
      });

      setPhieuList(combinedList);
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

  const getLoaiPhieuLabel = (phieu) => {
    if (phieu.request_type === 'bao_sai_thong_tin') {
      return 'Báo cáo sai thông tin';
    }
    if (phieu.request_type === 'xin_cap_giay_xac_nhan') {
      return 'Xin cấp giấy xác nhận';
    }
    return phieu.loai_phieu === 'tam_tru' ? 'Tạm trú' : 'Tạm vắng';
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
            <p>
              Bạn chưa có phiếu tạm trú, tạm vắng, báo cáo sai thông tin hoặc
              yêu cầu cấp giấy xác nhận nào
            </p>
          </div>
        ) : (
          <div className="phieu-list">
            {phieuList.map((phieu) => (
              <div
                key={`${phieu.request_type}-${phieu.id}`}
                className="phieu-card"
              >
                <div className="phieu-header">
                  <div className="phieu-title">
                    <h3>{phieu.nhan_khau_ho_ten}</h3>
                    <span className="phieu-loai">
                      {getLoaiPhieuLabel(phieu)}
                    </span>
                  </div>
                  <div className="phieu-status">{getStatusBadge(phieu)}</div>
                </div>
                <div className="phieu-content">
                  <div className="phieu-info-row">
                    <span className="label">CCCD:</span>
                    <span className="value">
                      {phieu.nhan_khau_cccd || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="phieu-info-row">
                    <span className="label">Ngày báo cáo:</span>
                    <span className="value">
                      {formatDate(phieu.ngay_bat_dau)}
                    </span>
                  </div>
                  <div className="phieu-info-row">
                    <span className="label">Lý do:</span>
                    <span className="value">{phieu.ly_do}</span>
                  </div>
                  {/* Hiển thị các trường sai nếu là báo cáo sai thông tin */}
                  {phieu.request_type === 'bao_sai_thong_tin' &&
                    phieu.cac_truong_loi &&
                    phieu.cac_truong_loi.length > 0 && (
                      <div className="phieu-info-row">
                        <span className="label">Các trường báo cáo sai:</span>
                        <div className="value fields-list">
                          {phieu.cac_truong_loi.map((field, idx) => (
                            <div key={idx} className="field-item">
                              <strong>{field.truong}:</strong> "
                              {field.gia_tri_cu}" → "{field.gia_tri_moi}"
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* Hiển thị thông tin giấy xác nhận nếu là xin cấp giấy */}
                  {phieu.request_type === 'xin_cap_giay_xac_nhan' && (
                    <>
                      <div className="phieu-info-row">
                        <span className="label">Loại giấy:</span>
                        <span className="value">
                          {phieu.loai_giay === 'nhan_khau' &&
                            'Giấy xác nhận nhân khẩu'}
                          {phieu.loai_giay === 'ho_khau' &&
                            'Giấy xác nhận hộ khẩu'}
                          {phieu.loai_giay === 'muc_dich_khac' &&
                            'Mục đích khác'}
                        </span>
                      </div>
                      <div className="phieu-info-row">
                        <span className="label">Số lượng:</span>
                        <span className="value">{phieu.so_luong} bản</span>
                      </div>
                    </>
                  )}
                  {phieu.ngay_ket_thuc && (
                    <div className="phieu-info-row">
                      <span className="label">Ngày kết thúc:</span>
                      <span className="value">
                        {formatDate(phieu.ngay_ket_thuc)}
                      </span>
                    </div>
                  )}
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
