import React, { useState, useEffect } from 'react';
import '../../styles/GiaDinhVanHoaManagement.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getCsrfToken = () => {
  const name = 'csrftoken';
  if (!document.cookie) return '';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
};

const GiaDinhVanHoaManagement = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [criteria, setCriteria] = useState(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qualifiedFamilies, setQualifiedFamilies] = useState([]);
  const [unqualifiedFamilies, setUnqualifiedFamilies] = useState([]);
  const [activeTab, setActiveTab] = useState('qualified');
  const [showCalculateModal, setShowCalculateModal] = useState(false);

  const years = [];
  for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
    years.push(y);
  }

  // Fetch both lists từ API thống kê
  const fetchBothLists = async (selectedYear, selectedCriteria) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = `01-01-${selectedYear}`;
      const endDate = `31-12-${selectedYear}`;
      
      const res = await fetch(
        `${API_BASE_URL}/thong-ke/gia-dinh-van-hoa/?tu_ngay=${startDate}&den_ngay=${endDate}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Lỗi khi tải danh sách');
      const data = await res.json();
      
      // Tách danh sách thành đã đạt và chưa đạt dựa trên ty_le_dat so với criteria
      const all_families = data.danh_sach || [];
      const qualified = all_families.filter(f => {
        const tyLe = parseFloat(f.ty_le_dat) || 0;
        return tyLe >= selectedCriteria;
      });
      const unqualified = all_families.filter(f => {
        const tyLe = parseFloat(f.ty_le_dat) || 0;
        return tyLe < selectedCriteria;
      });
      
      setQualifiedFamilies(qualified);
      setUnqualifiedFamilies(unqualified);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBothLists(year, criteria);
  }, [year, criteria]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/sinh-hoat/gia-dinh-van-hoa/tinh-toan-nam/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          credentials: 'include',
          body: JSON.stringify({
            nam: year,
            tieu_chi_tham_gia: criteria,
          }),
        }
      );

      if (!res.ok) throw new Error('Lỗi khi tính toán');
      await res.json();

      setShowCalculateModal(false);
      
      // Fetch updated data to show actual results
      await fetchBothLists(year, criteria);
      
      // Success message will show after data is loaded
      setSuccess(`Tính toán thành công!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const FamilyTable = ({ families, title, isQualified }) => (
    <div className="family-table-section">
      <h3>{title}</h3>
      {families.length === 0 ? (
        <p className="no-data">Không có dữ liệu</p>
      ) : (
        <div className="table-wrapper">
          <table className="family-table">
            <thead>
              <tr>
                <th>Tên Chủ Hộ</th>
                <th>Địa Chỉ</th>
                <th>Số Lần Tham Gia</th>
                <th>Tỷ Lệ Tham Gia</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {families.map((family) => (
                <tr key={family.id}>
                  <td>{family.chu_ho || 'Chưa xác định'}</td>
                  <td>{family.dia_chi || '-'}</td>
                  <td>{family.so_lan_tham_gia}</td>
                  <td>{family.ty_le_dat || '0%'}</td>
                  <td>
                    <span
                      className={`status-badge ${isQualified ? 'qualified' : 'unqualified'}`}
                    >
                      {isQualified ? '✓ Đạt' : '✗ Chưa đạt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="gia-dinh-van-hoa-container">
      <div className="giah-header">
        <h1>Quản Lý Chứng Chỉ Gia Đình Văn Hóa</h1>
        <button
          className="btn-calculate"
          onClick={() => setShowCalculateModal(true)}
        >
          Tính Toán Lại
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="controls-section">
        <div className="year-selector">
          <label>Chọn năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Đạt tiêu chí</span>
            <span className="stat-value qualified">
              {qualifiedFamilies.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Chưa đạt tiêu chí</span>
            <span className="stat-value unqualified">
              {unqualifiedFamilies.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tổng cộng</span>
            <span className="stat-value total">
              {qualifiedFamilies.length + unqualifiedFamilies.length}
            </span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'qualified' ? 'active' : ''}`}
          onClick={() => setActiveTab('qualified')}
        >
          Đạt Tiêu Chí ({qualifiedFamilies.length})
        </button>
        <button
          className={`tab ${activeTab === 'unqualified' ? 'active' : ''}`}
          onClick={() => setActiveTab('unqualified')}
        >
          Chưa Đạt Tiêu Chí ({unqualifiedFamilies.length})
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : activeTab === 'qualified' ? (
          <FamilyTable families={qualifiedFamilies} title="Danh Sách Gia Đình Đạt Tiêu Chí" isQualified={true} />
        ) : (
          <FamilyTable families={unqualifiedFamilies} title="Danh Sách Gia Đình Chưa Đạt Tiêu Chí" isQualified={false} />
        )}
      </div>

      {showCalculateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCalculateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tính Toán Lại Gia Đình Văn Hóa</h3>

            <div className="form-group">
              <label>Năm:</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tỷ Lệ Tham Gia Tối Thiểu (%):</label>
              <input
                type="number"
                min="1"
                max="100"
                value={criteria}
                onChange={(e) => setCriteria(parseInt(e.target.value))}
              />
              <small>Tỷ lệ phần trăm tham gia so với tổng số buổi sinh hoạt để đạt tiêu chí gia đình văn hóa (danh sách sẽ cập nhật tự động)</small>
            </div>

            <p className="modal-info">
              Hệ thống sẽ tính lại cho tất cả hộ gia đình trong năm {year}. Các
              hộ có số lần tham gia ≥ {criteria}% tổng số buổi sinh hoạt sẽ được
              ghi nhận đạt tiêu chí.
            </p>

            <div className="modal-actions">
              <button
                className="btn-confirm"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? 'Đang tính toán...' : 'Tính Toán'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowCalculateModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiaDinhVanHoaManagement;
