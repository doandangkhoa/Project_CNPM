import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import thongKeAPI from '../../utils/thongKeAPI';
import './ReportPage.css';

const ReportPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [criteria, setCriteria] = useState(80); // Tỷ lệ tối thiểu
  const [kpiData, setKpiData] = useState(null);
  const [ageChartData, setAgeChartData] = useState(null);
  const [culturalFamilies, setCulturalFamilies] = useState(null);
  const [reportHistory, setReportHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'view'
  const [selectedReport, setSelectedReport] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Hàm xử lý preset ngày tháng
  const setDatePreset = (preset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    let start, end;

    switch (preset) {
      case 'month':
        start = new Date(year, month, 1);
        end = today;
        break;
      case 'quarter':
        const quarter = Math.floor(month / 3);
        start = new Date(year, quarter * 3, 1);
        end = today;
        break;
      case 'year':
        start = new Date(year, 0, 1);
        end = today;
        break;
      default:
        return;
    }

    const formatDate = (d) => d.toISOString().split('T')[0];
    setFromDate(formatDate(start));
    setToDate(formatDate(end));
  };

  // Hàm xem chi tiết báo cáo cũ
  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setViewMode('view');
    setKpiData({
      tong_nhan_khau: report.tong_nhan_khau || 0,
      so_nam: report.so_nam || 0,
      so_nu: report.so_nu || 0,
      so_tam_tru: report.tam_tru || 0,
      so_tam_vang: report.tam_vang || 0
    });
    
    // Load age chart data và cultural families cho báo cáo này
    const tuNgay = report.tu_ngay || null;
    const denNgay = report.den_ngay || null;
    
    Promise.all([
      thongKeAPI.getAgeChart(tuNgay, denNgay),
      thongKeAPI.getCulturalFamilies(tuNgay, denNgay)
    ]).then(([ageResp, culturalResp]) => {
      if (ageResp.status === 'success') {
        const chartData = ageResp.labels.map((label, index) => ({
          name: label,
          value: ageResp.data[index]
        }));
        setAgeChartData(chartData);
      }
      
      if (culturalResp.status === 'success') {
        const all_families = culturalResp.danh_sach || [];
        const qualified = all_families.filter(f => {
          const tyLe = parseFloat(f.ty_le_dat) || 0;
          return tyLe >= criteria;
        });
        const unqualified = all_families.filter(f => {
          const tyLe = parseFloat(f.ty_le_dat) || 0;
          return tyLe < criteria;
        });
        setCulturalFamilies({
          tong_so_buoi_hop: culturalResp.tong_so_buoi_hop || 0,
          so_ho_dat_tieu_chuan: qualified.length,
          so_ho_chua_dat_tieu_chuan: unqualified.length,
          tong_so_ho: all_families.length,
          danh_sach: all_families,
          qualified: qualified,
          unqualified: unqualified
        });
      }
    }).catch(err => {
      console.error('Error loading report details:', err);
    });
  };

  // Hàm quay lại chế độ tạo mới
  const backToCreate = () => {
    setViewMode('create');
    setSelectedReport(null);
    setFromDate('');
    setToDate('');
    fetchAllData();
  };

  // Hàm xóa báo cáo
  const deleteReport = async (reportId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa báo cáo này?')) return;
    try {
      const response = await thongKeAPI.deleteReport(reportId);
      if (response.status === 'success') {
        alert('Xóa báo cáo thành công!');
        fetchAllData();
      }
    } catch (err) {
      setError('Lỗi khi xóa báo cáo: ' + err.message);
    }
  };

  // Retry logic with exponential backoff
  const retryFetch = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        if (result.status === 'error' && i < maxRetries - 1) {
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
          continue;
        }
        return result;
      } catch (err) {
        if (i < maxRetries - 1) {
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        } else {
          return { status: 'error', message: err.message };
        }
      }
    }
  };

  // Fetch all data with error handling and retry
  const fetchAllData = async (from = '', to = '') => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    try {
      const [kpi, age, cultural, history] = await Promise.all([
        retryFetch(() => thongKeAPI.getKPI(from || null, to || null)),
        retryFetch(() => thongKeAPI.getAgeChart(from || null, to || null)),
        retryFetch(() => thongKeAPI.getCulturalFamilies(from || null, to || null)),
        retryFetch(() => thongKeAPI.getReportHistory())
      ]);

      if (kpi.status === 'success') setKpiData(kpi.data);
      if (age.status === 'success') {
        const chartData = age.labels.map((label, index) => ({
          name: label,
          value: age.data[index]
        }));
        setAgeChartData(chartData);
      }
      
      // Handle cultural families - always expect success even if empty
      if (cultural.status === 'success') {
        console.log('Cultural families data:', cultural);
        // Filter families based on criteria
        const all_families = cultural.danh_sach || [];
        const qualified = all_families.filter(f => {
          const tyLe = parseFloat(f.ty_le_dat) || 0;
          return tyLe >= criteria;
        });
        const unqualified = all_families.filter(f => {
          const tyLe = parseFloat(f.ty_le_dat) || 0;
          return tyLe < criteria;
        });
        setCulturalFamilies({
          tong_so_buoi_hop: cultural.tong_so_buoi_hop || 0,
          so_ho_dat_tieu_chuan: qualified.length,
          so_ho_chua_dat_tieu_chuan: unqualified.length,
          tong_so_ho: all_families.length,
          danh_sach: all_families,
          qualified: qualified,
          unqualified: unqualified
        });
      } else {
        console.warn('Cultural families error:', cultural);
        setCulturalFamilies({ 
          tong_so_buoi_hop: 0,
          so_ho_dat_tieu_chuan: 0,
          so_ho_chua_dat_tieu_chuan: 0,
          tong_so_ho: 0,
          danh_sach: [],
          qualified: [],
          unqualified: []
        });
      }
      
      if (history.status === 'success') setReportHistory(history.data);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu: ' + err.message);
      setRetryCount(r => r + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await thongKeAPI.createReport(fromDate || null, toDate || null, '');
      if (data.status === 'success') {
        await fetchAllData(fromDate, toDate);
        alert('✓ Báo cáo đã được lập thành công!');
      } else {
        setError('Không thể lập báo cáo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    alert('Tính năng xuất Excel sẽ được cập nhật trong phiên bản tiếp theo!');
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Re-filter cultural families when criteria changes
  useEffect(() => {
    if (culturalFamilies && culturalFamilies.danh_sach) {
      const all_families = culturalFamilies.danh_sach;
      const qualified = all_families.filter(f => {
        const tyLe = parseFloat(f.ty_le_dat) || 0;
        return tyLe >= criteria;
      });
      const unqualified = all_families.filter(f => {
        const tyLe = parseFloat(f.ty_le_dat) || 0;
        return tyLe < criteria;
      });
      setCulturalFamilies(prev => ({
        ...prev,
        so_ho_dat_tieu_chuan: qualified.length,
        so_ho_chua_dat_tieu_chuan: unqualified.length,
        qualified: qualified,
        unqualified: unqualified
      }));
    }
  }, [criteria]);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  return (
    <div className="report-page">
      {/* Header */}
      <div className="report-page-header">
        <h1>Báo cáo Thống kê</h1>
        <p>Theo dõi và phân tích dữ liệu khu dân cư</p>
        {viewMode === 'view' && (
          <button onClick={backToCreate} className="btn-back">
            ← Quay lại
          </button>
        )}
      </div>

      <Container fluid className="px-4">
        {/* Toolbar */}
        {viewMode === 'create' && (
          <Card className="toolbar-card">
            <Card.Body>
              <div className="toolbar-section">
                <div className="date-inputs">
                  <div>
                    <label>Từ ngày</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div>
                    <label>Đến ngày</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                  {/* <div>
                    <label>Tỷ Lệ Tối Thiểu  (%)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={criteria} 
                      onChange={(e) => setCriteria(parseInt(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </div> */}
                </div>

                <div className="preset-buttons">
                  <button 
                    className="preset-btn" 
                    onClick={() => setDatePreset('month')}
                    title="Báo cáo tháng này"
                  >
                    Tháng này
                  </button>
                  <button 
                    className="preset-btn" 
                    onClick={() => setDatePreset('quarter')}
                    title="Báo cáo quý này"
                  >
                    Quý này
                  </button>
                  <button 
                    className="preset-btn" 
                    onClick={() => setDatePreset('year')}
                    title="Báo cáo năm nay"
                  >
                    Năm nay
                  </button>
                </div>

                <div className="toolbar-buttons">
                  <button className="btn-primary-custom" onClick={handleCreateReport} disabled={loading}>
                    {loading ? '⏳ Đang xử lý...' : '📈 Lập báo cáo'}
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
            <strong>⚠️ Lỗi:</strong> {error}
            <div style={{ marginTop: '10px' }}>
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => fetchAllData(fromDate, toDate)}
                disabled={loading}
              >
                🔄 Thử lại
              </button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#667eea' }}>
            <Spinner animation="border" style={{ marginRight: '10px' }} />
            Đang tải dữ liệu...
          </div>
        )}

        {!loading && (
          <>
            {/* VIEW MODE - Report Details Modal */}
            {viewMode === 'view' && selectedReport && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                overflowY: 'auto'
              }}>
                <Container style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '30px',
                  maxWidth: '1200px',
                  margin: '20px',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '2px solid #667eea',
                    paddingBottom: '15px'
                  }}>
                    <h2>📊 Chi Tiết Báo Cáo</h2>
                    <button
                      onClick={backToCreate}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✕ Đóng
                    </button>
                  </div>

                  {/* Report Info */}
                  <Card style={{ marginBottom: '20px' }}>
                    <Card.Body>
                      <Row>
                        <Col md={3}>
                          <strong>Ngày tạo:</strong>
                          <p>{selectedReport.ngay_thong_ke ? new Date(selectedReport.ngay_thong_ke).toLocaleDateString('vi-VN') : '-'}</p>
                        </Col>
                        <Col md={3}>
                          <strong>Người tạo:</strong>
                          <p>{selectedReport.nguoi_tao?.ho_ten || selectedReport.nguoi_tao?.tai_khoan || 'Hệ thống'}</p>
                        </Col>
                        <Col md={3}>
                          <strong>Từ ngày:</strong>
                          <p>{selectedReport.tu_ngay || 'Không xác định'}</p>
                        </Col>
                        <Col md={3}>
                          <strong>Đến ngày:</strong>
                          <p>{selectedReport.den_ngay || 'Không xác định'}</p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* KPI Cards */}
                  <div className="kpi-container" style={{ marginBottom: '20px' }}>
                    <Card className="kpi-card">
                      <Card.Body>
                        <div className="kpi-number">{kpiData?.tong_nhan_khau?.toLocaleString() || '-'}</div>
                        <div className="kpi-label">Tổng nhân khẩu</div>
                      </Card.Body>
                    </Card>

                    <Card className="kpi-card">
                      <Card.Body>
                        <div className="kpi-stats">
                          <div className="kpi-stat-item">
                            <div className="kpi-stat-number" style={{ color: '#667eea' }}>
                              {kpiData?.so_nam || 0}
                            </div>
                            <div className="kpi-stat-label">Nam</div>
                          </div>
                          <div className="kpi-stat-item">
                            <div className="kpi-stat-number" style={{ color: '#f093fb' }}>
                              {kpiData?.so_nu || 0}
                            </div>
                            <div className="kpi-stat-label">Nữ</div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card className="kpi-card">
                      <Card.Body>
                        <div className="kpi-number">{kpiData?.so_tam_tru || 0}</div>
                        <div className="kpi-label">Tạm trú</div>
                      </Card.Body>
                    </Card>

                    <Card className="kpi-card">
                      <Card.Body>
                        <div className="kpi-number">{kpiData?.so_tam_vang || 0}</div>
                        <div className="kpi-label">Tạm vắng</div>
                      </Card.Body>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="charts-container" style={{ marginBottom: '20px' }}>
                    <Card className="chart-card">
                      <Card.Header>
                        <Card.Title>Phân bố độ tuổi</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {ageChartData ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ageChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                              <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="chart-loading">Đang tải dữ liệu...</div>
                        )}
                      </Card.Body>
                    </Card>

                    <Card className="chart-card cultural-families-card">
                      <Card.Header>
                        <Card.Title>Gia đình văn hóa</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {culturalFamilies ? (
                          <div className="cultural-pie-container">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: 'Đạt tiêu chuẩn',
                                      value: culturalFamilies.so_ho_dat_tieu_chuan || 0
                                    },
                                    {
                                      name: 'Chưa đạt',
                                      value: culturalFamilies.so_ho_chua_dat_tieu_chuan || Math.max(
                                        0,
                                        (culturalFamilies.tong_so_ho || culturalFamilies.danh_sach?.length || 1) - (culturalFamilies.so_ho_dat_tieu_chuan || 0)
                                      )
                                    }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={120}
                                  paddingAngle={2}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  labelLine={false}
                                >
                                  <Cell fill="#2ecc71" />
                                  <Cell fill="#bdc3c7" />
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    backgroundColor: '#fff'
                                  }}
                                  formatter={(value) => [value, 'Hộ']}
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            <div className="cultural-summary">
                              <div className="summary-stat achieved">
                                <span className="summary-number">{culturalFamilies.so_ho_dat_tieu_chuan || 0}</span>
                                <span className="summary-text">hộ đạt</span>
                              </div>
                              <span className="summary-separator">/</span>
                              <div className="summary-stat total">
                                <span className="summary-number">{culturalFamilies.tong_so_ho || culturalFamilies.danh_sach?.length || 0}</span>
                                <span className="summary-text">tổng hộ</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="chart-loading">⏳ Đang tải dữ liệu...</div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={backToCreate}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Quay lại
                    </button>
                  </div>
                </Container>
              </div>
            )}

            {/* CREATE MODE */}
            {viewMode === 'create' && (
              <>
                {/* KPI Cards */}
                <div className="kpi-container">
                  <Card className="kpi-card">
                    <Card.Body>
                      <div className="kpi-number">{kpiData?.tong_nhan_khau?.toLocaleString() || '-'}</div>
                      <div className="kpi-label">Tổng nhân khẩu</div>
                    </Card.Body>
                  </Card>

                  <Card className="kpi-card">
                    <Card.Body>
                      <div className="kpi-stats">
                        <div className="kpi-stat-item">
                          <div className="kpi-stat-number" style={{ color: '#667eea' }}>
                            {kpiData?.so_nam || 0}
                          </div>
                          <div className="kpi-stat-label">Nam</div>
                        </div>
                        <div className="kpi-stat-item">
                          <div className="kpi-stat-number" style={{ color: '#f093fb' }}>
                            {kpiData?.so_nu || 0}
                          </div>
                          <div className="kpi-stat-label">Nữ</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="kpi-card">
                    <Card.Body>
                      <div className="kpi-number">{kpiData?.so_tam_tru || 0}</div>
                      <div className="kpi-label">Tạm trú</div>
                    </Card.Body>
                  </Card>

                  <Card className="kpi-card">
                    <Card.Body>
                      <div className="kpi-number">{kpiData?.so_tam_vang || 0}</div>
                      <div className="kpi-label">Tạm vắng</div>
                    </Card.Body>
                  </Card>
                </div>

                {/* Charts */}
                <div className="charts-container">
                  <Card className="chart-card">
                    <Card.Header>
                      <Card.Title>Phân bố độ tuổi</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      {ageChartData ? (
                        <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ageChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-loading">Đang tải dữ liệu...</div>
                  )}
                </Card.Body>
              </Card>

              <Card className="chart-card cultural-families-card">
                <Card.Header>
                  <Card.Title>Gia đình văn hóa</Card.Title>
                </Card.Header>
                <Card.Body>
                  {culturalFamilies ? (
                    <div className="cultural-pie-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: 'Đạt tiêu chuẩn',
                                value: culturalFamilies.so_ho_dat_tieu_chuan || 0
                              },
                              {
                                name: 'Chưa đạt',
                                value: culturalFamilies.so_ho_chua_dat_tieu_chuan || Math.max(
                                  0,
                                  (culturalFamilies.tong_so_ho || culturalFamilies.danh_sach?.length || 1) - (culturalFamilies.so_ho_dat_tieu_chuan || 0)
                                )
                              }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            <Cell fill="#2ecc71" />
                            <Cell fill="#bdc3c7" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              backgroundColor: '#fff'
                            }}
                            formatter={(value) => [value, 'Hộ']}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="cultural-summary">
                        <div className="summary-stat achieved">
                          <span className="summary-number">{culturalFamilies.so_ho_dat_tieu_chuan || 0}</span>
                          <span className="summary-text">hộ đạt</span>
                        </div>
                        <span className="summary-separator">/</span>
                        <div className="summary-stat total">
                          <span className="summary-number">{culturalFamilies.tong_so_ho || culturalFamilies.danh_sach?.length || 0}</span>
                          <span className="summary-text">tổng hộ</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="chart-loading">⏳ Đang tải dữ liệu...</div>
                  )}
                </Card.Body>
              </Card>
            </div>
            </>
            )}

            {/* Report History Table */}
            {reportHistory && reportHistory.length > 0 && (
              <Card className="history-card">
                <Card.Header>
                  <Card.Title>Lịch sử báo cáo</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="history-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Ngày tạo</th>
                          <th>Người thực hiện</th>
                          <th>Chức vụ</th>
                          <th>Thời gian báo cáo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportHistory.map((report, idx) => (
                          <tr key={report.id} className="history-row">
                            <td className="row-index">{idx + 1}</td>
                            <td className="date-created">
                              {report.ngay_thong_ke ? new Date(report.ngay_thong_ke).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="person-name">
                              {report.nguoi_tao?.ho_ten || 'Trần Anh Minh'}
                            </td> 
                            <td className="position">
                              {report.nguoi_tao?.chuc_vu_display || 'Cán bộ'}
                            </td>
                            <td className="report-period">
                              {report.tu_ngay && report.den_ngay
                                ? `${report.tu_ngay} → ${report.den_ngay}`
                                : report.tu_ngay || report.den_ngay || 'Toàn bộ'}
                            </td>
                            <td className="actions">
                              <button
                                className="action-btn view-btn"
                                onClick={() => viewReportDetails(report)}
                                title="Xem chi tiết"
                              >
                                👁️ Xem
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => deleteReport(report.id)}
                                title="Xóa báo cáo"
                              >
                                🗑️ Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}
            </>
          )}
        </Container>
      </div>
    );
  };

  export default ReportPage;
