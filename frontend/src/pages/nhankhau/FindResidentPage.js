import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FindResidentPage.css';

const SearchNhanKhau = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastQueryRef = useRef(null);
  const [searchId, setSearchId] = useState('');
  const [resident, setResident] = useState(null);
  const [searchParams, setSearchParams] = useState({
    ho_ten: '',
    so_cccd: '',
    ngay_sinh: '',
    so_ho_khau: '',
    noi_sinh: '',
    nguyen_quan: '',
    dan_toc: '',
    nghe_nghiep: '',
    noi_lam_viec: '',
    dia_chi_thuong_tru_truoc_day: '',
    trang_thai: '',
    quan_he_voi_chu_ho: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'song', label: 'Còn sống' },
    { value: 'chet', label: 'Đã chết' },
    { value: 'tam_tru', label: 'Tạm trú' },
    { value: 'tam_vang', label: 'Tạm vắng' },
    { value: 'chuyen_di', label: 'Đã chuyển đi' },
  ];

  const relationshipOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'chu_ho', label: 'Chủ hộ' },
    { value: 'vo_chong', label: 'Vợ/Chồng' },
    { value: 'con', label: 'Con' },
    { value: 'khac', label: 'Khác' },
  ];

  const canPerformAdminActions = currentUser && (currentUser.is_superuser || (currentUser.role === 'can_bo' && ['to_truong','to_pho','can_bo'].includes(currentUser.chuc_vu)));

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

  const handleSearch = async (e, page = 1, updateUrl = true, idForLookup = null) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setResident(null);

    // If an ID is provided, prioritize ID lookup
    const idToUse = idForLookup || searchId;
    if (idToUse && idToUse.toString().trim()) {
      // perform ID search
      if (!/^\d+$/.test(idToUse)) {
        setError('ID nhân khẩu phải là số');
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/nhan-khau/${idToUse}/chi-tiet/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': getCookie('csrftoken'),
          },
        });

        const data = await response.json();

        if (response.ok) {
          if (data.status === 'success') {
            setResident(data.nhan_khau);
            setSuccess('Đã tìm thấy thông tin nhân khẩu');
            setResults([]);
            setPagination({ ...pagination, page: 1, total: 1, totalPages: 1 });
          } else {
            setError(data.message || 'Không tìm thấy nhân khẩu');
          }
        } else {
          setError(data.message || `Lỗi: ${response.status}`);
        }
      } catch (err) {
        setError('Không thể kết nối đến server');
      } finally {
        setLoading(false);
      }

      // update url to reflect id lookup
      if (updateUrl) {
        const q = new URLSearchParams();
        q.set('id', idToUse);
        lastQueryRef.current = q.toString();
        navigate({ pathname: '/search', search: `?${q.toString()}` }, { replace: true });
      }

      return; // done
    }

    // Kiểm tra xem có ít nhất một tiêu chí tìm kiếm không
    if (!Object.values(searchParams).some((v) => v && v.toString().trim() !== '')) {
      setError('Vui lòng nhập ít nhất một tiêu chí tìm kiếm');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...searchParams,
        page: page,
        limit: pagination.limit,
      });

      const response = await fetch(
        `http://localhost:8000/api/nhan-khau/tim-kiem/?${params}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'success') {
          setResults(data.results);
          setPagination({
            ...pagination,
            page: data.page,
            total: data.total,
            totalPages: Math.ceil(data.total / data.limit),
          });
          setSuccess(`Tìm thấy ${data.total} kết quả phù hợp`);
        } else {
          setError(data.message || 'Không tìm thấy nhân khẩu nào');
        }
      } else {
        setError(data.message || `Lỗi: ${response.status}`);
      }
      // update url to reflect criteria search
      if (updateUrl) {
        const q = new URLSearchParams({ ...searchParams, page });
        lastQueryRef.current = q.toString();
        navigate({ pathname: '/search', search: `?${q.toString()}` }, { replace: true });
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchId('');
    setSearchParams({
      ho_ten: '',
      so_cccd: '',
      ngay_sinh: '',
      so_ho_khau: '',
      noi_sinh: '',
      nguyen_quan: '',
      dan_toc: '',
      nghe_nghiep: '',
      noi_lam_viec: '',
      dia_chi_thuong_tru_truoc_day: '',
      trang_thai: '',
      quan_he_voi_chu_ho: '',
    });
    setResults([]);
    setError('');
    setSuccess('');
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  };

  // When URL query changes, read params and perform search (but avoid double-navigating)
  useEffect(() => {
    const qs = location.search ? location.search.replace(/^\?/, '') : '';
    if (qs === lastQueryRef.current) return; // already handled

    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (id) {
      setSearchId(id);
      // run search without updating url (we came from URL) - pass id directly to avoid setState timing
      handleSearch(null, 1, false, id);
    } else {
      // populate criteria
      const newParams = {
        ho_ten: params.get('ho_ten') || '',
        so_cccd: params.get('so_cccd') || '',
        ngay_sinh: params.get('ngay_sinh') || '',
        so_ho_khau: params.get('so_ho_khau') || '',
        noi_sinh: params.get('noi_sinh') || '',
        nguyen_quan: params.get('nguyen_quan') || '',
        dan_toc: params.get('dan_toc') || '',
        nghe_nghiep: params.get('nghe_nghiep') || '',
        noi_lam_viec: params.get('noi_lam_viec') || '',
        dia_chi_thuong_tru_truoc_day: params.get('dia_chi_thuong_tru_truoc_day') || '',
        trang_thai: params.get('trang_thai') || '',
        quan_he_voi_chu_ho: params.get('quan_he_voi_chu_ho') || '',
      };
      setSearchParams(newParams);
      // If there's any search param present, perform the search
      if (Object.values(newParams).some((v) => v)) {
        handleSearch(null, parseInt(params.get('page') || '1', 10), false);
      }
    }
    lastQueryRef.current = qs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleSearch(null, newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (err) {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age <= 0) {
        const monthAge =
          today.getMonth() -
          birthDate.getMonth() +
          12 * (today.getFullYear() - birthDate.getFullYear());
        if (monthAge <= 0) {
          const dayAge = Math.floor(
            (today - birthDate) / (1000 * 60 * 60 * 24)
          );
          return `${dayAge} ngày tuổi`;
        }
        return `${monthAge} tháng tuổi`;
      }

      return `${age} tuổi`;
    } catch (err) {
      return '';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      song: 'Còn sống',
      chet: 'Đã chết',
      tam_tru: 'Tạm trú',
      tam_vang: 'Tạm vắng',
      chuyen_di: 'Đã chuyển đi',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'song':
        return '#2ecc71';
      case 'chet':
        return '#e74c3c';
      case 'tam_tru':
        return '#f39c12';
      case 'tam_vang':
        return '#3498db';
      case 'chuyen_di':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Tra cứu thông tin nhân khẩu</h1>

      

      {success && (
        <div className="success-message">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* top criteria moved into the single search form so all controls sit in one card */}

      {error && (
        <div className="error-message">
          <span>✗</span>
          {error}
        </div>
      )}

      <form className="search-form" onSubmit={handleSearch}>
        {/* Top: expanded criteria grid */}
        <div className="search-grid">
          <div className="search-field">
            <label>Nơi sinh</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.noi_sinh}
              onChange={(e) => setSearchParams({ ...searchParams, noi_sinh: e.target.value })}
              placeholder="Nhập nơi sinh..."
            />
          </div>

          <div className="search-field">
            <label>Nguyên quán</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.nguyen_quan}
              onChange={(e) => setSearchParams({ ...searchParams, nguyen_quan: e.target.value })}
              placeholder="Nhập nguyên quán..."
            />
          </div>

          <div className="search-field">
            <label>Dân tộc</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.dan_toc}
              onChange={(e) => setSearchParams({ ...searchParams, dan_toc: e.target.value })}
              placeholder="Nhập dân tộc..."
            />
          </div>

          <div className="search-field">
            <label>Nghề nghiệp</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.nghe_nghiep}
              onChange={(e) => setSearchParams({ ...searchParams, nghe_nghiep: e.target.value })}
              placeholder="Nhập nghề nghiệp..."
            />
          </div>

          <div className="search-field">
            <label>Nơi làm việc</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.noi_lam_viec}
              onChange={(e) => setSearchParams({ ...searchParams, noi_lam_viec: e.target.value })}
              placeholder="Nhập nơi làm việc..."
            />
          </div>

          <div className="search-field">
            <label>Địa chỉ trước khi đăng ký thường trú</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.dia_chi_thuong_tru_truoc_day}
              onChange={(e) => setSearchParams({ ...searchParams, dia_chi_thuong_tru_truoc_day: e.target.value })}
              placeholder="Nhập địa chỉ trước đây..."
            />
          </div>

          <div className="search-field">
            <label>Trạng thái</label>
            <select className="search-input" value={searchParams.trang_thai} onChange={(e) => setSearchParams({ ...searchParams, trang_thai: e.target.value })}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label>Quan hệ với chủ hộ</label>
            <select className="search-input" value={searchParams.quan_he_voi_chu_ho} onChange={(e) => setSearchParams({ ...searchParams, quan_he_voi_chu_ho: e.target.value })}>
              {relationshipOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>


        <div className="search-grid">
          <div className="search-field">
            <label>Họ và tên / Bí danh</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.ho_ten}
              onChange={(e) =>
                setSearchParams({ ...searchParams, ho_ten: e.target.value })
              }
              placeholder="Nhập họ tên hoặc bí danh..."
            />
          </div>

          <div className="search-field">
            <label>Số CCCD</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.so_cccd}
              onChange={(e) =>
                setSearchParams({ ...searchParams, so_cccd: e.target.value })
              }
              placeholder="Nhập số CCCD..."
            />
          </div>

          <div className="search-field">
            <label>Ngày sinh</label>
            <input
              type="date"
              className="search-input"
              value={searchParams.ngay_sinh}
              onChange={(e) =>
                setSearchParams({ ...searchParams, ngay_sinh: e.target.value })
              }
            />
          </div>

          <div className="search-field">
            <label>Số hộ khẩu</label>
            <input
              type="text"
              className="search-input"
              value={searchParams.so_ho_khau}
              onChange={(e) =>
                setSearchParams({ ...searchParams, so_ho_khau: e.target.value })
              }
              placeholder="Nhập số hộ khẩu..."
            />
          </div>
        </div>

        <div className="search-actions">
          <button
            type="submit"
            className="search-button primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang tìm...
              </>
            ) : (
              '🔍 Tìm kiếm'
            )}
          </button>
          <button
            type="button"
            className="search-button secondary"
            onClick={handleClear}
          >
            Xóa tất cả
          </button>
        </div>
      </form>

      <div className="search-results">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Đang tìm kiếm...</p>
          </div>
        ) : resident ? (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f1f3f5',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    color: '#2c3e50',
                    margin: '0 0 10px 0',
                    fontWeight: '600',
                  }}
                >
                  {resident.ho_ten}
                  {resident.bi_danh && (
                    <span
                      style={{
                        marginLeft: '10px',
                        fontSize: '16px',
                        color: '#7f8c8d',
                        fontStyle: 'italic',
                      }}
                    >
                      ({resident.bi_danh})
                    </span>
                  )}
                </h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span
                    style={{
                      backgroundColor: getStatusColor(resident.trang_thai),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {formatStatus(resident.trang_thai)}
                  </span>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>ID: {resident.id}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3
                style={{
                  color: '#3498db',
                  marginBottom: '15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderBottom: '2px solid #3498db',
                  paddingBottom: '5px',
                }}
              >
                Thông tin cá nhân
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                }}
              >
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        fontWeight: '600',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      Giới tính
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.gioi_tinh}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        fontWeight: '600',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      Ngày sinh
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>
                      {formatDate(resident.ngay_sinh)}
                      <span
                        style={{
                          marginLeft: '10px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {calculateAge(resident.ngay_sinh)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Nơi sinh
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.noi_sinh}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Nguyên quán
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.nguyen_quan}</div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Dân tộc
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.dan_toc}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Quan hệ với chủ hộ
                    </div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.quan_he_voi_chu_ho}</div>
                  </div>

                  {resident.nghe_nghiep && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Nghề nghiệp
                      </div>
                      <div style={{ fontSize: '16px', color: '#2c3e50', fontWeight: '500' }}>{resident.nghe_nghiep}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="results-header">
              <h3>Kết quả tìm kiếm</h3>
              <div className="results-info">Hiển thị {results.length}/{pagination.total} kết quả</div>
            </div>

            <div className="table-wrapper">
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Stt</th>
                    <th>Họ và tên</th>
                    <th>Bi danh</th>
                    <th>CCCD</th>
                    <th>Ngày sinh</th>
                    <th>Hộ khẩu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((residentItem, idx) => (
                    <tr key={residentItem.id}>
                      <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                      <td>{residentItem.ho_ten}</td>
                      <td>{residentItem.bi_danh || ''}</td>
                      <td>{residentItem.so_cccd || ''}</td>
                      <td>{formatDate(residentItem.ngay_sinh)}</td>
                      <td>{residentItem.ho_gia_dinh?.so_ho_khau || ''}</td>
                      <td><span className="status-badge" style={{ backgroundColor: getStatusColor(residentItem.trang_thai) }}>{formatStatus(residentItem.trang_thai)}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" onClick={() => { setSearchId(residentItem.id.toString()); handleSearch(null, 1, true, residentItem.id.toString()); }}>Chi tiết</button>
                          {canPerformAdminActions && (
                            <>
                              <button className="action-btn edit" onClick={() => navigate(`/nhan-khau/${residentItem.id}/cap-nhat`)}>Sửa</button>
                              <button className="action-btn delete" onClick={() => { if (window.confirm('Xác nhận xóa?')) { /* TODO: call delete */ } }}>Xóa</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="pagination-button" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>← Trước</button>

                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button key={pageNum} className={`pagination-button ${pagination.page === pageNum ? 'active' : ''}`} onClick={() => handlePageChange(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button className="pagination-button" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>Sau →</button>
              </div>
            )}
          </>
        ) : !error && !loading ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Chưa có kết quả tìm kiếm</h3>
            <p>Nhập ít nhất một tiêu chí tìm kiếm và nhấn "Tìm kiếm"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchNhanKhau;
