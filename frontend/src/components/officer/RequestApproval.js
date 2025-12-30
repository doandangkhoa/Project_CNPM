import React, { useState, useEffect } from 'react';
import '../../styles/OfficerRequestApproval.css';

const OfficerRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('cho_duyet');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load thực tế từ API
  useEffect(() => {
    console.log('DEBUG: OfficerRequestApproval mounted, fetching from API...');
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch cả tam trú/tam vắng, báo cáo sai thông tin và xin cấp giấy xác nhận
      const [tamTruResponse, baoCaiResponse, giayXacNhanResponse] =
        await Promise.all([
          fetch('http://localhost:8000/api/officer/tam-tru-tam-vang/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('http://localhost:8000/api/officer/bao-sai-thong-tin/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('http://localhost:8000/api/officer/xin-cap-giay-xac-nhan/', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
        ]);

      let combinedRequests = [];

      if (tamTruResponse.ok) {
        const tamTruData = await tamTruResponse.json();
        const tamTruRequests = (
          Array.isArray(tamTruData) ? tamTruData : tamTruData.results || []
        ).map((req) => ({
          ...req,
          request_type: 'tam_tru_tam_vang',
        }));
        combinedRequests = combinedRequests.concat(tamTruRequests);
      }

      if (baoCaiResponse.ok) {
        const baoCaiData = await baoCaiResponse.json();
        const baoCaiRequests = (
          Array.isArray(baoCaiData) ? baoCaiData : baoCaiData.results || []
        ).map((req) => ({
          ...req,
          request_type: 'bao_sai_thong_tin',
        }));
        combinedRequests = combinedRequests.concat(baoCaiRequests);
      }

      if (giayXacNhanResponse.ok) {
        const giayXacNhanData = await giayXacNhanResponse.json();
        const giayXacNhanRequests = (
          Array.isArray(giayXacNhanData)
            ? giayXacNhanData
            : giayXacNhanData.results || []
        ).map((req) => ({
          ...req,
          request_type: 'xin_cap_giay_xac_nhan',
        }));
        combinedRequests = combinedRequests.concat(giayXacNhanRequests);
      }

      setRequests(combinedRequests);
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.trang_thai === filterStatus;
  });

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetail(true);
    setApprovalNotes('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      let endpoint;
      if (selectedRequest.request_type === 'bao_sai_thong_tin') {
        endpoint = `http://localhost:8000/api/bao-sai-thong-tin/${selectedRequest.id}/duyet/`;
      } else if (selectedRequest.request_type === 'xin_cap_giay_xac_nhan') {
        endpoint = `http://localhost:8000/api/xin-cap-giay-xac-nhan/${selectedRequest.id}/duyet/`;
      } else {
        endpoint = `http://localhost:8000/api/officer/tam-tru-tam-vang/${selectedRequest.id}/duyet/`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setRequests(
          requests.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, trang_thai: 'da_duyet' }
              : req
          )
        );
        setShowDetail(false);
        alert('Yêu cầu đã được duyệt!');
      } else {
        alert(data.message || 'Duyệt thất bại!');
      }
    } catch (err) {
      alert('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !approvalNotes.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    setLoading(true);
    try {
      let endpoint;
      if (selectedRequest.request_type === 'bao_sai_thong_tin') {
        endpoint = `http://localhost:8000/api/bao-sai-thong-tin/${selectedRequest.id}/duyet/`;
      } else if (selectedRequest.request_type === 'xin_cap_giay_xac_nhan') {
        endpoint = `http://localhost:8000/api/xin-cap-giay-xac-nhan/${selectedRequest.id}/duyet/`;
      } else {
        endpoint = `http://localhost:8000/api/officer/tam-tru-tam-vang/${selectedRequest.id}/duyet/`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'reject', note: approvalNotes }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        alert(`Server trả về lỗi không phải JSON:\n${responseText}`);
        return;
      }

      if (response.ok && data.status === 'success') {
        setRequests(
          requests.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, trang_thai: 'tu_choi', ghi_chu: approvalNotes }
              : req
          )
        );
        setShowDetail(false);
        setApprovalNotes('');
        alert('Yêu cầu đã bị từ chối!');
      } else {
        alert(
          `Từ chối thất bại! (Mã ${response.status})\nLý do: ${
            data.message || JSON.stringify(data)
          }`
        );
      }
    } catch (err) {
      alert('Lỗi kết nối server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeBadge = (request) => {
    // Xác định loại request từ request_type
    if (request.request_type === 'bao_sai_thong_tin') {
      return <span className="type-badge bao-sai">⚠️ Báo Sai Thông Tin</span>;
    }

    if (request.request_type === 'xin_cap_giay_xac_nhan') {
      return <span className="type-badge xin-cap">📋 Xin Cấp Giấy</span>;
    }

    // Nếu là tam_tru_tam_vang, sử dụng loai_phieu
    const type = request.loai_phieu || request.type;
    switch (type) {
      case 'tam_tru':
        return <span className="type-badge tam-tru">Tạm Trú</span>;
      case 'tam_vang':
        return <span className="type-badge tam-vang">Tạm Vắng</span>;
      case 'update_info':
        return <span className="type-badge update">Cập Nhật Thông Tin</span>;
      default:
        return <span className="type-badge">Khác</span>;
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'cho_duyet':
        return <span className="status-badge pending">⏳ Chờ Duyệt</span>;
      case 'da_duyet':
        return <span className="status-badge approved">✓ Đã Duyệt</span>;
      case 'tu_choi':
        return <span className="status-badge rejected">✗ Từ Chối</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="officer-request-approval">
      <div className="section-header">
        <h2>Phê Duyệt Yêu Cầu</h2>
        <p className="subtitle">Duyệt hoặc từ chối yêu cầu từ người dân</p>
      </div>
      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${
              filterStatus === 'cho_duyet' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('cho_duyet')}
          >
            ⏳ Chờ Duyệt (
            {requests.filter((r) => r.trang_thai === 'cho_duyet').length})
          </button>
          <button
            className={`filter-btn ${
              filterStatus === 'da_duyet' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('da_duyet')}
          >
            ✓ Đã Duyệt (
            {requests.filter((r) => r.trang_thai === 'da_duyet').length})
          </button>
          <button
            className={`filter-btn ${
              filterStatus === 'tu_choi' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('tu_choi')}
          >
            ✗ Từ Chối (
            {requests.filter((r) => r.trang_thai === 'tu_choi').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất Cả ({requests.length})
          </button>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="loading">Đang tải dữ liệu...</div>}
      <div className="requests-list">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`request-card status-${request.trang_thai}`}
          >
            <div className="request-header">
              <div className="request-title">
                <h4>{request.nhan_khau_ho_ten || request.name}</h4>
                <p className="request-id">#{request.id}</p>
              </div>
              <div className="request-badges">
                {getRequestTypeBadge(request)}
                {getStatusBadge(request.trang_thai)}
              </div>
            </div>
            <div className="request-body">
              <div className="request-info">
                <p>
                  <strong>CCCD:</strong> {request.nhan_khau_cccd || ''}
                </p>
                <p>
                  <strong>Loại yêu cầu:</strong>{' '}
                  {request.request_type === 'bao_sai_thong_tin'
                    ? 'Báo cáo sai thông tin'
                    : request.ly_do || request.content}
                </p>
                <p>
                  <strong>Ngày gửi:</strong>{' '}
                  {request.ngay_bat_dau || request.created_at}
                </p>
              </div>
              {/* Hiển thị các trường sai nếu là báo cáo sai thông tin */}
              {request.request_type === 'bao_sai_thong_tin' &&
                request.cac_truong_loi && (
                  <div className="fields-error">
                    <strong>Các trường báo cáo sai:</strong>
                    <ul>
                      {request.cac_truong_loi.map((field, idx) => (
                        <li key={idx}>
                          {field.truong}: "{field.gia_tri_cu}" → "
                          {field.gia_tri_moi}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              {/* Hiển thị thông tin giấy xác nhận nếu là xin cấp giấy */}
              {request.request_type === 'xin_cap_giay_xac_nhan' && (
                <div className="certificate-info">
                  <strong>Loại giấy:</strong>
                  <p>
                    {request.loai_giay === 'nhan_khau' &&
                      'Giấy xác nhận nhân khẩu'}
                    {request.loai_giay === 'ho_khau' && 'Giấy xác nhận hộ khẩu'}
                    {request.loai_giay === 'muc_dich_khac' && 'Mục đích khác'}
                  </p>
                  <strong>Số lượng:</strong>
                  <p>{request.so_luong} bản</p>
                  <strong>Ngày gửi:</strong>
                  <p>{formatDateOnly(request.created_at)}</p>
                </div>
              )}
              {/* Hiển thị địa chỉ tạm trú nếu là tạm trú/tạm vắng */}
              {request.dia_chi_tam_tru && (
                <div className="new-info">
                  <strong>Địa chỉ tạm trú:</strong>
                  <p>{request.dia_chi_tam_tru}</p>
                </div>
              )}
              {request.ghi_chu && (
                <div className="new-info">
                  <strong>Ghi chú:</strong>
                  <p>{request.ghi_chu}</p>
                </div>
              )}
            </div>
            <div className="request-footer">
              {request.trang_thai === 'cho_duyet' && (
                <button
                  className="btn btn-action"
                  onClick={() => handleViewDetail(request)}
                >
                  Xem Chi Tiết & Duyệt
                </button>
              )}
              {request.trang_thai !== 'cho_duyet' && (
                <span className="status-info">
                  {request.trang_thai === 'da_duyet'
                    ? 'Yêu cầu này đã được duyệt'
                    : 'Yêu cầu này đã bị từ chối'}
                </span>
              )}
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="empty-state">
            <p>
              {filterStatus === 'cho_duyet'
                ? 'Không có yêu cầu nào chờ duyệt'
                : `Không có yêu cầu ${filterStatus}`}
            </p>
          </div>
        )}
      </div>
      {/* Detail Modal */}
      {showDetail && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div
            className="modal-content approval-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Phê Duyệt Yêu Cầu #{selectedRequest.id}</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="request-detail">
                <h4>Thông Tin Yêu Cầu</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td className="label">Mã Yêu Cầu:</td>
                      <td>{selectedRequest.id}</td>
                    </tr>
                    <tr>
                      <td className="label">Người Gửi:</td>
                      <td>
                        {selectedRequest.nhan_khau_ho_ten ||
                          selectedRequest.name}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Loại Yêu Cầu:</td>
                      <td>
                        {selectedRequest.request_type === 'bao_sai_thong_tin'
                          ? 'Báo cáo sai thông tin'
                          : selectedRequest.request_type ===
                            'xin_cap_giay_xac_nhan'
                          ? 'Xin cấp giấy xác nhận'
                          : selectedRequest.loai_phieu || selectedRequest.type}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Lý Do:</td>
                      <td>{selectedRequest.ly_do || ''}</td>
                    </tr>
                    {selectedRequest.request_type ===
                      'xin_cap_giay_xac_nhan' && (
                      <>
                        <tr>
                          <td className="label">Loại Giấy:</td>
                          <td>
                            {selectedRequest.loai_giay === 'nhan_khau' &&
                              'Giấy xác nhận nhân khẩu'}
                            {selectedRequest.loai_giay === 'ho_khau' &&
                              'Giấy xác nhận hộ khẩu'}
                            {selectedRequest.loai_giay === 'muc_dich_khac' &&
                              'Mục đích khác'}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Số Lượng:</td>
                          <td>{selectedRequest.so_luong} bản</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="label">Ngày Gửi:</td>
                      <td>
                        {selectedRequest.request_type ===
                        'xin_cap_giay_xac_nhan'
                          ? formatDateOnly(selectedRequest.created_at)
                          : selectedRequest.ngay_bat_dau ||
                            selectedRequest.created_at}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Hiển thị chi tiết các trường sai nếu là báo cáo */}
              {selectedRequest.request_type === 'bao_sai_thong_tin' &&
                selectedRequest.cac_truong_loi && (
                  <div className="info-detail">
                    <h4>Chi Tiết Các Trường Sai</h4>
                    <div className="fields-list">
                      {selectedRequest.cac_truong_loi.map((field, idx) => (
                        <div key={idx} className="field-item">
                          <p>
                            <strong>Trường:</strong> {field.truong}
                          </p>
                          <p>
                            <strong>Giá trị cũ:</strong>{' '}
                            <span className="old-value">
                              "{field.gia_tri_cu}"
                            </span>
                          </p>
                          <p>
                            <strong>Giá trị mới:</strong>{' '}
                            <span className="new-value">
                              "{field.gia_tri_moi}"
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {selectedRequest.dia_chi_tam_tru && (
                <div className="info-detail">
                  <h4>Địa chỉ tạm trú</h4>
                  <p>{selectedRequest.dia_chi_tam_tru}</p>
                </div>
              )}
              {selectedRequest.ghi_chu && (
                <div className="info-detail">
                  <h4>Ghi chú</h4>
                  <p>{selectedRequest.ghi_chu}</p>
                </div>
              )}
              <div className="approval-actions">
                <h4>Quyết Định</h4>
                <div className="form-group">
                  <label>Ghi Chú (Bắt buộc nếu từ chối):</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Nhập ghi chú hoặc lý do từ chối..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                ✗ Từ Chối
              </button>
              <button className="btn btn-success" onClick={handleApprove}>
                ✓ Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerRequestApproval;
