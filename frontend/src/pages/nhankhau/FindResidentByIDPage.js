import React, { useState } from 'react';
import './FindResidentByIDPage.css';

const SearchPage = () => {
  const [searchId, setSearchId] = useState('');
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResident(null);

    if (!searchId.trim()) {
      setError('Vui lòng nhập ID nhân khẩu để tìm kiếm');
      return;
    }

    if (!/^\d+$/.test(searchId)) {
      setError('ID nhân khẩu phải là số');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/nhan-khau/${searchId}/chi-tiet/`,
        {
          method: 'GET',
          credentials: 'include', // để gửi session cookie
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
          setResident(data.nhan_khau);
          setSuccess('Đã tìm thấy thông tin nhân khẩu');
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
  };

  const handleClear = () => {
    setSearchId('');
    setResident(null);
    setError('');
    setSuccess('');
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
        <div
          style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>✓</span>
          {success}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>✗</span>
          {error}
        </div>
      )}

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Nhập ID nhân khẩu"
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !searchId.trim()}
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
            className="search-button"
            onClick={handleClear}
            style={{ background: '#95a5a6' }}
          >
            Xóa
          </button>
        </div>
      </form>

      <div className="search-results">
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
            }}
          >
            <div
              className="loading-spinner"
              style={{
                width: '40px',
                height: '40px',
                margin: '0 auto 20px',
                borderWidth: '3px',
              }}
            ></div>
            <p>Đang tìm kiếm nhân khẩu ID: {searchId}</p>
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
                <div
                  style={{ display: 'flex', gap: '15px', alignItems: 'center' }}
                >
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
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    ID: {resident.id}
                  </span>
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
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.gioi_tinh}
                    </div>
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
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
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
                      Nơi sinh
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.noi_sinh}
                    </div>
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
                      Nguyên quán
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.nguyen_quan}
                    </div>
                  </div>
                </div>

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
                      Dân tộc
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.dan_toc}
                    </div>
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
                      Quan hệ với chủ hộ
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.quan_he_voi_chu_ho}
                    </div>
                  </div>

                  {resident.nghe_nghiep && (
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
                        Nghề nghiệp
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#2c3e50',
                          fontWeight: '500',
                        }}
                      >
                        {resident.nghe_nghiep}
                      </div>
                    </div>
                  )}

                  {resident.noi_lam_viec && (
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
                        Nơi làm việc
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#2c3e50',
                          fontWeight: '500',
                        }}
                      >
                        {resident.noi_lam_viec}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {resident.so_cccd && (
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
                  🪪 Thông tin căn cước
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                  }}
                >
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
                      <span>🆔</span> Số CCCD/CMND
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                      }}
                    >
                      {resident.so_cccd}
                    </div>
                  </div>

                  {resident.ngay_cap && (
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
                        <span>📅</span> Ngày cấp
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#2c3e50',
                          fontWeight: '500',
                        }}
                      >
                        {formatDate(resident.ngay_cap)}
                      </div>
                    </div>
                  )}

                  {resident.noi_cap && (
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
                        <span>🏛️</span> Nơi cấp
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          color: '#2c3e50',
                          fontWeight: '500',
                        }}
                      >
                        {resident.noi_cap}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resident.ho_gia_dinh && (
              <div
                style={{
                  backgroundColor: '#e8f4fc',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '30px',
                  borderLeft: '4px solid #2ecc71',
                }}
              >
                <h3
                  style={{
                    color: '#27ae60',
                    marginBottom: '15px',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  🏠 Thông tin hộ gia đình
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        fontWeight: '600',
                        marginBottom: '5px',
                      }}
                    >
                      Mã hộ khẩu
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                        fontFamily: 'monospace',
                      }}
                    >
                      {resident.ho_gia_dinh.ma_ho_khau || 'Chưa có mã'}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        fontWeight: '600',
                        marginBottom: '5px',
                      }}
                    >
                      Chủ hộ
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.ho_gia_dinh.ten_chu_ho}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        fontWeight: '600',
                        marginBottom: '5px',
                      }}
                    >
                      Địa chỉ
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        fontWeight: '500',
                      }}
                    >
                      {resident.ho_gia_dinh.dia_chi}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resident.ghi_chu && (
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #3498db',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: '600',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span>📝</span> Ghi chú
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#2c3e50',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {resident.ghi_chu}
                </div>
              </div>
            )}
          </div>
        ) : (
          !error &&
          !loading && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#7f8c8d',
              }}
            >
              <div
                style={{
                  fontSize: '64px',
                  marginBottom: '20px',
                  color: '#bdc3c7',
                }}
              >
                🔍
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  marginBottom: '10px',
                  color: '#95a5a6',
                }}
              >
                Chưa có kết quả tìm kiếm
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}
              >
                Nhập ID nhân khẩu và nhấn "Tìm kiếm"
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPage;
