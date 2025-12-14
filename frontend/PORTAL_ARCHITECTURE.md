# 3-Portal Architecture Documentation

## Tổng quan

Dự án này được xây dựng với 3 Portal riêng biệt dành cho 3 loại người dùng khác nhau:

1. **Admin Portal (Quản Trị Hệ Thống)** - Cho người quản trị
2. **Officer Portal (Cổng Cán Bộ)** - Cho cán bộ quản lý dân cư
3. **Citizen Portal (Cổng Dịch Vụ Công)** - Cho người dân

---

## 1. Admin Portal

### 📌 Tính Năng
- **Quản Lý Tài Khoản**: CRUD tài khoản cán bộ, khóa/mở khóa tài khoản
- **Nhật Ký Hệ Thống**: Xem lịch sử hoạt động của tất cả người dùng
- **⚠️ KHÔNG CÓ**: Menu quản lý dân cư (Hộ Khẩu/Nhân Khẩu)

### 🎨 Thiết Kế UI
- **Theme**: Dark Mode (Xám kỹ thuật)
- **Layout**: Sidebar cố định bên trái + Header
- **Colors**: 
  - Background: #0f172a, #1e293b
  - Primary: #3b82f6 (Blue)
  - Accent: #8b5cf6 (Purple)

### 📁 File Structure
```
pages/admin/
├── DashboardPage.js       (Trang dashboard)
├── UsersPage.js          (Quản lý tài khoản)
└── AuditLogPage.js       (Nhật ký hệ thống)

components/admin/
├── Sidebar.js            (Menu bên trái)
├── Dashboard.js          (Component dashboard)
├── UserManagement.js     (Component quản lý users)
└── AuditLog.js          (Component nhật ký)

layouts/
└── AdminLayout.js        (Layout wrapper)

styles/
├── AdminLayout.css
├── AdminSidebar.css
├── AdminDashboard.css
├── AdminUserManagement.css
└── AdminAuditLog.css
```

### 🔐 Access Control
- Chỉ người dùng có `role='admin'` mới có thể truy cập
- Redirect tự động nếu không phải admin

---

## 2. Officer Portal

### 📌 Tính Năng
- **Dashboard**: Tổng quan thống kê (Tổng nhân khẩu, hộ khẩu, yêu cầu chờ)
- **Quản Lý Nhân Khẩu**: Tra cứu, thêm, sửa nhân khẩu (cũ: FindResidentPage)
- **Quản Lý Hộ Khẩu**: Bảng danh sách, tìm kiếm, xem chi tiết, phân trang
- **Phê Duyệt Yêu Cầu**: Duyệt/từ chối yêu cầu từ người dân (tạm trú, báo sai thông tin, tạm vắng)
- **Báo Cáo Thống Kê**: (Có menu, cần implement)

### 🎨 Thiết Kế UI
- **Theme**: Blue & White (Chuyên nghiệp)
- **Layout**: Sidebar cố định bên trái + Header
- **Colors**:
  - Primary: #2563eb (Blue)
  - Secondary: #1e3a8a (Dark Blue)
  - Background: #f5f7fa, white

### 📁 File Structure
```
pages/officer/
├── DashboardPage.js        (Trang dashboard)
├── HouseholdsPage.js       (Quản lý hộ khẩu)
└── RequestsPage.js        (Phê duyệt yêu cầu)

components/officer/
├── Sidebar.js              (Menu bên trái)
├── Dashboard.js            (Component dashboard)
├── HouseholdManagement.js  (Component quản lý hộ khẩu)
└── RequestApproval.js      (Component duyệt yêu cầu)

layouts/
└── OfficerLayout.js        (Layout wrapper)

styles/
├── OfficerLayout.css
├── OfficerSidebar.css
├── OfficerDashboard.css
├── OfficerHouseholdManagement.css
└── OfficerRequestApproval.css
```

### 🔐 Access Control
- Chỉ người dùng có `role='can_bo'` mới có thể truy cập
- Redirect tự động nếu không phải cán bộ

### 📊 Quản Lý Hộ Khẩu Features
- **Search**: Tìm theo tên chủ hộ, số hộ khẩu, CCCD, địa chỉ
- **Filter**: Lọc theo trạng thái (Hoạt động, Tạm dừng, Hủy)
- **Pagination**: Phân trang 10 items/page
- **Actions**: 
  - Xem chi tiết (modal)
  - Chỉnh sửa (integrate với API)

### 📋 Phê Duyệt Yêu Cầu Features
- **Filter Tabs**: Chờ Duyệt, Đã Duyệt, Từ Chối, Tất Cả
- **Card Layout**: Hiển thị dạng card
- **Comparison View**: Hiển thị thông tin cũ vs thông tin mới
- **Actions**: Duyệt (xanh), Từ Chối (đỏ) với ghi chú

---

## 3. Citizen Portal

### 📌 Tính Năng
- **Trang Chủ**: Thông tin tổng quan, dịch vụ, lịch sử yêu cầu
- **Sổ Hộ Khẩu**: Xem thông tin hộ gia đình và thành viên (Responsive table)
- **Dịch Vụ Công**: 
  - Đăng Ký Tạm Trú
  - Báo Sai Thông Tin
  - Khai Báo Tạm Vắng
  - Cấp Giấy Xác Nhận
- **Lịch Sử Yêu Cầu**: Xem các yêu cầu đã gửi

### 🎨 Thiết Kế UI
- **Theme**: Hiện đại, Tối giản, Thân thiện
- **Colors**: 
  - Primary: #10b981 (Green)
  - Secondary: #059669 (Dark Green)
  - Background: #f9fafb, white

### 📁 File Structure
```
pages/citizen/
├── HomePage.js             (Trang chủ)
├── HouseholdPage.js        (Sổ hộ khẩu)
└── ServicesPage.js        (Nộp dịch vụ công)

components/citizen/
├── Home.js                 (Component trang chủ)
├── Household.js            (Component sổ hộ khẩu)
└── Services.js            (Component nộp yêu cầu)

layouts/
└── CitizenLayout.js        (Layout wrapper)

styles/
├── CitizenLayout.css
├── CitizenHome.css
├── CitizenHousehold.css
└── CitizenServices.css
```

### 🔐 Access Control
- Chỉ người dùng có `role='nguoi_dan'` mới có thể truy cập
- Redirect tự động nếu không phải người dân

### 📋 Form Dịch Vụ Công Features
- **Wizard Multi-Step**:
  - Bước 1: Chọn thành viên
  - Bước 2: Nhập thông tin chi tiết
  - Bước 3: Xác nhận thông tin
- **Dynamic Fields**: Các trường thay đổi theo loại dịch vụ
- **Validation**: Kiểm tra bắt buộc các trường cần thiết
- **Success Message**: Hiển thị mã yêu cầu sau khi gửi

---

## Routing Structure

```
/login                    → LoginPage (Public)
/register                → RegisterPage (Public)

/admin/dashboard         → AdminDashboardPage (Admin only)
/admin/users            → AdminUsersPage (Admin only)
/admin/audit-log        → AdminAuditLogPage (Admin only)

/officer/dashboard       → OfficerDashboardPage (Officer only)
/officer/households      → OfficerHouseholdsPage (Officer only)
/officer/requests        → OfficerRequestsPage (Officer only)

/citizen/home           → CitizenHomePage (Citizen only)
/citizen/household      → CitizenHouseholdPage (Citizen only)
/citizen/services       → CitizenServicesPage (Citizen only)

/                       → Redirect based on role
```

---

## ProtectedRoute Component

```javascript
<ProtectedRoute 
  currentUser={currentUser} 
  requiredRoles={['admin']}
>
  <AdminDashboardPage currentUser={currentUser} />
</ProtectedRoute>
```

- Kiểm tra authentication (currentUser có tồn tại)
- Kiểm tra authorization (role có nằm trong requiredRoles)
- Redirect tự động nếu không hợp lệ

---

## Global Styling

### Colors Across Portals
- **Admin**: Dark theme (#0f172a, #1e293b, #3b82f6)
- **Officer**: Blue theme (#1e3a8a, #2563eb, white)
- **Citizen**: Green theme (#10b981, #059669, white)

### Common CSS Classes
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- `.status-badge` (với các biến thể)
- `.modal-overlay`, `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`
- `.form-group`, `.form-row`, `.search-filter`
- `.empty-state`, `.loading`

---

## API Integration Points (Cần implement)

### Admin Portal
- `GET /api/admin/metrics` - Lấy metrics hệ thống
- `GET /api/admin/users` - Danh sách tài khoản
- `POST /api/admin/users` - Tạo tài khoản
- `PUT /api/admin/users/:id` - Cập nhật tài khoản
- `DELETE /api/admin/users/:id` - Xóa tài khoản
- `GET /api/admin/audit-logs` - Nhật ký hệ thống

### Officer Portal
- `GET /api/officer/statistics` - Thống kê
- `GET /api/officer/households` - Danh sách hộ khẩu
- `GET /api/officer/households/:id/members` - Thành viên hộ khẩu
- `PUT /api/officer/households/:id` - Cập nhật hộ khẩu
- `GET /api/officer/requests` - Danh sách yêu cầu
- `PUT /api/officer/requests/:id/approve` - Duyệt yêu cầu
- `PUT /api/officer/requests/:id/reject` - Từ chối yêu cầu

### Citizen Portal
- `GET /api/me/ho-khau` - Thông tin hộ khẩu của user
- `POST /api/services/submit` - Nộp yêu cầu dịch vụ
- `GET /api/services/my-requests` - Lịch sử yêu cầu

---

## Notes for Development

1. **Mock Data**: Hiện tại tất cả dữ liệu đều là mock (useState)
   - Cần thay thế bằng API calls (axios/fetch)

2. **Authentication**: 
   - Cần implement JWT tokens hoặc session-based auth
   - Lưu currentUser vào localStorage/sessionStorage
   - Kiểm tra auth khi app load

3. **Mobile Responsive**: 
   - Tất cả portal đều responsive
   - Sidebar collapse trên mobile
   - Navigation bar sticky

4. **Performance**:
   - Implement pagination cho các bảng lớn
   - Lazy loading cho images
   - Debounce search input

5. **Error Handling**:
   - Toast notifications cho success/error messages
   - Error boundaries cho React errors
   - Fallback UI cho loading states

6. **Testing**:
   - Unit tests cho components
   - E2E tests cho user flows
   - Test authentication flows

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

---

**Version**: 1.0.0  
**Last Updated**: December 14, 2025
