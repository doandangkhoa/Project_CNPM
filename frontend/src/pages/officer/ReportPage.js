import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

  // Lấy dữ liệu KPI
  const fetchKPIData = async () => {
    
    try {
      const data = await thongKeAPI.getKPI(fromDate || null, toDate || null);
      if (data.status === 'success') {
        setKpiData(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Lỗi:', err);
    }
  };

  // Lấy dữ liệu biểu đồ tuổi
  const fetchAgeChartData = async () => {
    try {
      const data = await thongKeAPI.getAgeChart(fromDate || null, toDate || null);
      if (data.status === 'success') {
        const chartData = data.labels.map((label, index) => ({
          name: label,
          value: data.data[index]
        }));
        setAgeChartData(chartData);
      }
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

  // Lấy dữ liệu Gia đình văn hóa
  const fetchCulturalFamilies = async () => {
    try {
      const data = await thongKeAPI.getCulturalFamilies(fromDate || null, toDate || null);
      if (data.status === 'success') {
        setCulturalFamilies(data);
      } else if (data.status === 'warning') {
        setCulturalFamilies({ danh_sach: [], so_ho_dat_tieu_chuan: 0, tong_so_buoi_hop: 0 });
      }
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

  // Lấy lịch sử báo cáo
  const fetchReportHistory = async () => {
    try {
      const data = await thongKeAPI.getReportHistory();
      if (data.status === 'success') {
        setReportHistory(data.data);
      }
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

  // Gọi API lập báo cáo
  const handleCreateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await thongKeAPI.createReport(
        fromDate || null,
        toDate || null,
        ''
      );

      if (data.status === 'success') {
        // Refresh dữ liệu
        await Promise.all([
          fetchKPIData(),
          fetchAgeChartData(),
          fetchCulturalFamilies(),
          fetchReportHistory()
        ]);
        setError(null);
        alert('Báo cáo đã được lập thành công!');
      }
    } catch (err) {
      setError(err.message);
      console.error('Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    // Sử dụng thư viện xlsx hoặc tạo CSV
    alert('Tính năng xuất Excel đang được phát triển!');
  };

  // Load dữ liệu khi component mount hoặc date thay đổi
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchKPIData(),
      fetchAgeChartData(),
      fetchCulturalFamilies(),
      fetchReportHistory()
    ]).finally(() => setLoading(false));
  }, []);

  // Tính tỉ lệ Gia đình văn hóa
  const culturalFamilyPercentage = kpiData && culturalFamilies
    ? Math.round((culturalFamilies.so_ho_dat_tieu_chuan / (kpiData.tong_nhan_khau / 3.5)) * 100) || 0
    : 0;

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <Container fluid className="report-page py-4">
      {/* Khu vực 1: Toolbar */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="toolbar-card">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Từ ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Đến ngày</Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleCreateReport}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Lập báo cáo ngay'
                    )}
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={handleExportExcel}
                  >
                    📊 Xuất Excel
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hiển thị lỗi */}
      {error && (
        <Row className="mb-3">
          <Col md={12}>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Khu vực 2: KPI Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <div className="kpi-number">
                {kpiData ? kpiData.tong_nhan_khau.toLocaleString() : '-'}
              </div>
              <div className="kpi-label">Tổng nhân khẩu</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <div className="kpi-stats">
                <div className="kpi-stat-item">
                  <div className="kpi-stat-number" style={{ color: '#3498db' }}>
                    {kpiData ? kpiData.so_nam : '-'}
                  </div>
                  <div className="kpi-stat-label">Nam</div>
                </div>
                <div className="kpi-stat-item">
                  <div className="kpi-stat-number" style={{ color: '#e74c3c' }}>
                    {kpiData ? kpiData.so_nu : '-'}
                  </div>
                  <div className="kpi-stat-label">Nữ</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <div className="kpi-number">
                {kpiData ? kpiData.so_tam_tru : '-'}
              </div>
              <div className="kpi-label">Hộ Tạm trú</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="kpi-card">
            <Card.Body className="text-center">
              <div className="kpi-number">
                {kpiData ? kpiData.so_tam_vang : '-'}
              </div>
              <div className="kpi-label">Hộ Tạm vắng</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Khu vực 3: Charts */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="chart-card">
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Phân bố độ tuổi</Card.Title>
            </Card.Header>
            <Card.Body>
              {ageChartData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">Đang tải dữ liệu...</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="chart-card">
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Tỉ lệ Gia đình văn hóa</Card.Title>
            </Card.Header>
            <Card.Body>
              {culturalFamilies ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Đạt tiêu chuẩn', value: culturalFamilies.so_ho_dat_tieu_chuan || 0 },
                        { name: 'Chưa đạt', value: Math.max(0, (culturalFamilies.danh_sach ? Math.ceil(kpiData?.tong_nhan_khau / 3.5) : 0) - (culturalFamilies.so_ho_dat_tieu_chuan || 0)) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#2ecc71" />
                      <Cell fill="#e74c3c" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">Đang tải dữ liệu...</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Khu vực 4: Data Tables */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="bg-light">
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Tab eventKey="overview" title="Lịch sử báo cáo">
                  {reportHistory ? (
                    <div className="mt-3">
                      {reportHistory.length > 0 ? (
                        <Table striped bordered hover responsive>
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Ngày lập</th>
                              <th>Từ ngày</th>
                              <th>Đến ngày</th>
                              <th>Tổng nhân khẩu</th>
                              <th>Nam/Nữ</th>
                              <th>Tạm trú/Tạm vắng</th>
                              <th>Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportHistory.map((report, index) => (
                              <tr key={report.id}>
                                <td>{index + 1}</td>
                                <td>{new Date(report.ngay_thong_ke).toLocaleDateString('vi-VN')}</td>
                                <td>{report.tu_ngay || '-'}</td>
                                <td>{report.den_ngay || '-'}</td>
                                <td className="fw-bold">{report.tong_nhan_khau}</td>
                                <td>{report.so_nam}/{report.so_nu}</td>
                                <td>{report.tam_tru}/{report.tam_vang}</td>
                                <td>{report.ghi_chu || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="alert alert-info">Chưa có báo cáo nào</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">Đang tải dữ liệu...</div>
                  )}
                </Tab>

                <Tab eventKey="cultural" title="Gia đình văn hóa">
                  {culturalFamilies ? (
                    <div className="mt-3">
                      <Alert variant="info">
                        Tổng buổi họp: <strong>{culturalFamilies.tong_so_buoi_hop}</strong> | 
                        Hộ đạt tiêu chuẩn: <strong>{culturalFamilies.so_ho_dat_tieu_chuan}</strong>
                      </Alert>
                      {culturalFamilies.danh_sach && culturalFamilies.danh_sach.length > 0 ? (
                        <Table striped bordered hover responsive>
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Chủ hộ</th>
                              <th>Địa chỉ</th>
                              <th>Số lần tham gia</th>
                              <th>Tỉ lệ đạt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {culturalFamilies.danh_sach.map((family, index) => (
                              <tr key={family.id}>
                                <td>{index + 1}</td>
                                <td>{family.chu_ho}</td>
                                <td>{family.dia_chi}</td>
                                <td>{family.so_lan_tham_gia}</td>
                                <td>
                                  <span className="badge bg-success">{family.ty_le_dat}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="alert alert-warning">Không có hộ nào đạt tiêu chuẩn Gia đình văn hóa</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">Đang tải dữ liệu...</div>
                  )}
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportPage;
