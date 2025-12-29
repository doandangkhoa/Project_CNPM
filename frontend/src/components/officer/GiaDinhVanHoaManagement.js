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

  // Fetch qualified families
  const fetchQualifiedFamilies = async (selectedYear) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/sinh-hoat/gia-dinh-van-hoa/danh-sach/nam/${selectedYear}/?dat_chuan=true`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Lỗi khi tải danh sách');
      const data = await res.json();
      setQualifiedFamilies(data.danh_sach || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unqualified families
  const fetchUnqualifiedFamilies = async (selectedYear) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/sinh-hoat/gia-dinh-van-hoa/danh-sach/nam/${selectedYear}/?dat_chuan=false`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Lỗi khi tải danh sách');
      const data = await res.json();
      setUnqualifiedFamilies(data.danh_sach || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch both lists
  const fetchBothLists = (selectedYear) => {
    fetchQualifiedFamilies(selectedYear);
    fetchUnqualifiedFamilies(selectedYear);
  };

  useEffect(() => {
    fetchBothLists(year);
  }, [year]);

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
      const result = await res.json();

      setSuccess(
        `Tính toán thành công! Đạt: ${result.dat_chuan}, Chưa đạt: ${result.chua_dat}`
      );
      setShowCalculateModal(false);
      fetchBothLists(year);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const FamilyTable = ({ families, title }) => (
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
                <th>Số Hộ Khẩu</th>
                <th>Số Lần Tham Gia</th>
                <th>Tỷ Lệ Tham Gia</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {families.map((family) => (
                <tr key={family.id}>
                  <td>{family.ten_chu_ho}</td>
                  <td>{family.so_ho_khau}</td>
                  <td>
                    {family.so_lan_tham_gia} / {family.tong_so_buoi_sinh_hoat}
                  </td>
                  <td>
                    {family.ty_le_tham_gia
                      ? family.ty_le_tham_gia.toFixed(1)
                      : 0}
                    %
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        family.dat_chuan ? 'qualified' : 'unqualified'
                      }`}
                    >
                      {family.dat_chuan ? '✓ Đạt' : '✗ Chưa đạt'}
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
          <FamilyTable
            families={qualifiedFamilies}
            title="Danh Sách Gia Đình Đạt Tiêu Chí"
          />
        ) : (
          <FamilyTable
            families={unqualifiedFamilies}
            title="Danh Sách Gia Đình Chưa Đạt Tiêu Chí"
          />
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
              <small>
                Tỷ lệ phần trăm tham gia so với tổng số buổi sinh hoạt để đạt
                tiêu chí gia đình văn hóa
              </small>
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
