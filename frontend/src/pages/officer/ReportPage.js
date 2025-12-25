import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import thongKeAPI from '../../utils/thongKeAPI';
import './ReportPage.css';

const ReportPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
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
      tong_nhan_khau: report.tong_so_nhan_khau || 0,
      so_nam: report.so_nam || 0,
      so_nu: report.so_nu || 0,
      so_tam_tru: report.tam_tru || 0,
      so_tam_vang: report.tam_vang || 0
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
        setCulturalFamilies({
          tong_so_buoi_hop: cultural.tong_so_buoi_hop || 0,
          so_ho_dat_tieu_chuan: cultural.so_ho_dat_tieu_chuan || 0,
          danh_sach: cultural.danh_sach || []
        });
      } else {
        console.warn('Cultural families error:', cultural);
        setCulturalFamilies({ 
          tong_so_buoi_hop: 0,
          so_ho_dat_tieu_chuan: 0, 
          danh_sach: [] 
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
                                value: Math.max(
                                  0,
                                  (culturalFamilies.danh_sach?.length || 1) - (culturalFamilies.so_ho_dat_tieu_chuan || 0)
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
                          <span className="summary-number">{culturalFamilies.danh_sach?.length || 0}</span>
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

            {/* Report History Table */}
            {reportHistory && reportHistory.length > 0 && (
              <Card className="history-card">
                <Card.Header>
                  <Card.Title>📋 Lịch sử báo cáo</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="history-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Ngày tạo</th>
                          <th>Người tạo</th>
                          <th>Tổng nhân khẩu</th>
                          <th>Thời gian báo cáo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportHistory.map((report, idx) => (
                          <tr key={report.id} className="history-row">
                            <td className="row-index">{idx + 1}</td>
                            <td className="date-created">
                              {report.created_at ? new Date(report.created_at).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="created-by">
                              {report.nguoi_tao?.ho_ten || report.nguoi_tao?.tai_khoan || 'Hệ thống'}
                            </td>
                            <td className="total-population">
                              <strong>{report.tong_so_nhan_khau || 0}</strong>
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
