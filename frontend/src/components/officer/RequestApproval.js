import React, { useState, useEffect } from 'react';
import '../../styles/OfficerRequestApproval.css';

const OfficerRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Mock data
  useEffect(() => {
    const mockRequests = [
      {
        id: 'REQ-2024-001',
        type: 'tam_tru',
        name: 'Nguyễn Văn A',
        cccd: '12345678901',
        content: 'Đăng ký tạm trú tại địa chỉ 123 Đường Lê Lợi',
        old_info: '',
        new_info: 'Tạm trú từ 2024-12-15 đến 2024-12-31',
        status: 'pending',
        created_at: '2024-12-14 10:30:00',
        reason: 'Công tác',
      },
      {
        id: 'REQ-2024-002',
        type: 'update_info',
        name: 'Trần Thị B',
        cccd: '12345678902',
        content: 'Báo sai thông tin',
        old_info: 'Địa chỉ: 456 Đường Cũ',
        new_info: 'Địa chỉ: 456 Đường Mới, Phường 2',
        status: 'pending',
        created_at: '2024-12-14 11:15:00',
        reason: 'Chuyển nhà',
      },
      {
        id: 'REQ-2024-003',
        type: 'tam_vang',
        name: 'Lê Văn C',
        cccd: '12345678903',
        content: 'Khai báo tạm vắng',
        old_info: '',
        new_info: 'Tạm vắng từ 2024-12-15 đến 2025-01-15',
        status: 'pending',
        created_at: '2024-12-14 12:00:00',
        reason: 'Đi làm ăn',
      },
      {
        id: 'REQ-2024-004',
        type: 'update_info',
        name: 'Phạm Thị D',
        cccd: '12345678904',
        content: 'Báo sai thông tin',
        old_info: 'Nghề nghiệp: Giáo viên',
        new_info: 'Nghề nghiệp: Kiểm toán viên',
        status: 'approved',
        created_at: '2024-12-13 09:30:00',
        reason: 'Thay đổi công việc',
      },
      {
        id: 'REQ-2024-005',
        type: 'tam_tru',
        name: 'Hoàng Anh E',
        cccd: '12345678905',
        content: 'Đăng ký tạm trú',
        old_info: '',
        new_info: 'Tạm trú từ 2024-12-16 đến 2024-12-20',
        status: 'rejected',
        created_at: '2024-12-13 14:20:00',
        reason: 'Du lịch',
      },
    ];
    setRequests(mockRequests);
  }, []);

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetail(true);
    setApprovalNotes('');
  };

  const handleApprove = () => {
    if (selectedRequest) {
      setRequests(
        requests.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: 'approved' }
            : req
        )
      );
      setShowDetail(false);
      alert('Yêu cầu đã được duyệt!');
    }
  };

  const handleReject = () => {
    if (selectedRequest && approvalNotes.trim()) {
      setRequests(
        requests.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: 'rejected' }
            : req
        )
      );
      setShowDetail(false);
      alert('Yêu cầu đã bị từ chối!');
    } else {
      alert('Vui lòng nhập lý do từ chối!');
    }
  };

  const getRequestTypeBadge = (type) => {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">⏳ Chờ Duyệt</span>;
      case 'approved':
        return <span className="status-badge approved">✓ Đã Duyệt</span>;
      case 'rejected':
        return <span className="status-badge rejected">✗ Từ Chối</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="officer-request-approval">
      <div className="section-header">
        <h2>Phê Duyệt Yêu Cầu</h2>
        <p className="subtitle">
          Duyệt hoặc từ chối yêu cầu từ người dân
        </p>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            ⏳ Chờ Duyệt ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            ✓ Đã Duyệt ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            ✗ Từ Chối ({requests.filter(r => r.status === 'rejected').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất Cả ({requests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests.map(request => (
          <div key={request.id} className={`request-card status-${request.status}`}>
            <div className="request-header">
              <div className="request-title">
                <h4>{request.name}</h4>
                <p className="request-id">{request.id}</p>
              </div>
              <div className="request-badges">
                {getRequestTypeBadge(request.type)}
                {getStatusBadge(request.status)}
              </div>
            </div>

            <div className="request-body">
              <div className="request-info">
                <p>
                  <strong>CCCD:</strong> {request.cccd}
                </p>
                <p>
                  <strong>Loại yêu cầu:</strong> {request.content}
                </p>
                <p>
                  <strong>Ngày gửi:</strong> {request.created_at}
                </p>
              </div>

              {request.old_info && (
                <div className="comparison">
                  <div className="old-info">
                    <strong>Thông tin cũ:</strong>
                    <p>{request.old_info}</p>
                  </div>
                  <div className="new-info">
                    <strong>Thông tin mới:</strong>
                    <p>{request.new_info}</p>
                  </div>
                </div>
              )}

              {!request.old_info && (
                <div className="new-info">
                  <strong>Thông tin:</strong>
                  <p>{request.new_info}</p>
                </div>
              )}
            </div>

            <div className="request-footer">
              {request.status === 'pending' && (
                <button
                  className="btn btn-action"
                  onClick={() => handleViewDetail(request)}
                >
                  Xem Chi Tiết & Duyệt
                </button>
              )}
              {request.status !== 'pending' && (
                <span className="status-info">
                  {request.status === 'approved'
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
              {filterStatus === 'pending'
                ? 'Không có yêu cầu nào chờ duyệt'
                : `Không có yêu cầu ${filterStatus}`}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phê Duyệt Yêu Cầu {selectedRequest.id}</h3>
              <button className="close-btn" onClick={() => setShowDetail(false)}>
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
                      <td>{selectedRequest.name}</td>
                    </tr>
                    <tr>
                      <td className="label">CCCD:</td>
                      <td>{selectedRequest.cccd}</td>
                    </tr>
                    <tr>
                      <td className="label">Loại Yêu Cầu:</td>
                      <td>{selectedRequest.content}</td>
                    </tr>
                    <tr>
                      <td className="label">Lý Do:</td>
                      <td>{selectedRequest.reason}</td>
                    </tr>
                    <tr>
                      <td className="label">Ngày Gửi:</td>
                      <td>{selectedRequest.created_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedRequest.old_info && (
                <div className="comparison-detail">
                  <h4>So Sánh Thông Tin</h4>
                  <div className="comparison-grid">
                    <div className="old-section">
                      <h5>Thông Tin Cũ</h5>
                      <p>{selectedRequest.old_info}</p>
                    </div>
                    <div className="new-section">
                      <h5>Thông Tin Mới</h5>
                      <p>{selectedRequest.new_info}</p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedRequest.old_info && (
                <div className="info-detail">
                  <h4>Chi Tiết Yêu Cầu</h4>
                  <p>{selectedRequest.new_info}</p>
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
              <button
                className="btn btn-danger"
                onClick={handleReject}
              >
                ✗ Từ Chối
              </button>
              <button
                className="btn btn-success"
                onClick={handleApprove}
              >
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
