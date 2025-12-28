/**
 * API Service - Xử lý tất cả calls API cho báo cáo thống kê
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Token ${getAuthToken()}`
};

export const thongKeAPI = {
  // Lấy KPI
  getKPI: async (fromDate = null, toDate = null) => {
    try {
      let url = `${API_URL}/thong-ke/kpi/`;
      if (fromDate && toDate) {
        url += `?tu_ngay=${fromDate}&den_ngay=${toDate}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi lấy KPI:', error);
      throw error;
    }
  },

  // Lấy biểu đồ độ tuổi
  getAgeChart: async (fromDate = null, toDate = null) => {
    try {
      let url = `${API_URL}/thong-ke/bieu-do-tuoi/`;
      if (fromDate && toDate) {
        url += `?tu_ngay=${fromDate}&den_ngay=${toDate}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi lấy biểu đồ độ tuổi:', error);
      throw error;
    }
  },

  // Lấy dữ liệu gia đình văn hóa
  getCulturalFamilies: async (fromDate = null, toDate = null) => {
    try {
      let url = `${API_URL}/thong-ke/gia-dinh-van-hoa/`;
      if (fromDate && toDate) {
        url += `?tu_ngay=${fromDate}&den_ngay=${toDate}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi lấy gia đình văn hóa:', error);
      throw error;
    }
  },

  // Lập báo cáo mới
  createReport: async (fromDate = null, toDate = null, note = '') => {
    try {
      const response = await fetch(`${API_URL}/thong-ke/tao-bao-cao/`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          tu_ngay: fromDate,
          den_ngay: toDate,
          ghi_chu: note
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi tạo báo cáo:', error);
      throw error;
    }
  },

  // Lấy danh sách lịch sử báo cáo
  getReportHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/thong-ke/danh-sach/`, {
        method: 'GET',
        headers: defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi lấy lịch sử báo cáo:', error);
      throw error;
    }
  },

  // Xóa báo cáo
  deleteReport: async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/thong-ke/xoa/${reportId}/`, {
        method: 'DELETE',
        headers: defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi xóa báo cáo:', error);
      throw error;
    }
  }
};

export default thongKeAPI;
