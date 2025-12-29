"""
Script to generate sample data for all models.
Dữ liệu được sinh ra dựa trên thông tin thực tế của
Phường La Khê, Quận Hà Đông, Hà Nội.

Chạy với: python seed_data.py
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from random import randint, choice, choices, shuffle

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quan_li_khu_dan_cu.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.nhan_khau.models import NhanKhau, BienDongNhanKhau
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.tai_khoan.models import TaiKhoan
from apps.can_bo.models import CanBo
from apps.sinh_hoat.models import LichSinhHoat, ThamGiaSinhHoat
from apps.tam_tru_tam_vang.models import PhieuTamTruTamVang
from apps.thong_ke.models import ThongKeNhanKhau

# ========== HỌ TÊN TIẾNG VIỆT ==========
HO_VIET = [
    'Nguyễn', 'Trần', 'Hoàng', 'Phạm', 'Đặng', 'Bùi', 'Dương', 'Đỗ',
    'Vũ', 'Võ', 'Tô', 'Lê', 'Hồ', 'Phan', 'Đinh', 'Lý', 'Ngô', 'Hà'
]

TEN_DEM_NAM = ['Văn', 'Đức', 'Hữu', 'Quang', 'Minh', 'Hoàng', 'Tuấn', 'Anh', 'Duy', 'Khắc', 'Đình', 'Công', 'Xuân']
TEN_DEM_NU = ['Thị', 'Phương', 'Thu', 'Hương', 'Thanh', 'Ngọc', 'Ánh', 'Mai', 'Lan', 'Kim', 'Diệu']

TEN_VIET_NAM = [
    'Anh', 'Bình', 'Cường', 'Đạt', 'Gia', 'Hải', 'Hùng', 'Kiên', 'Lâm',
    'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Tiến', 'Tuấn', 'Việt',
    'Vĩnh', 'Xuân', 'Yên', 'Long', 'Khoa', 'Thắng', 'Dũng'
]

TEN_VIET_NU = [
    'Anh', 'Bích', 'Chi', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hương', 'Huyền',
    'Khánh', 'Kim', 'Lan', 'Linh', 'Loan', 'Ly', 'Mỹ', 'Nhi', 'Nhung',
    'Phương', 'Quyên', 'Thanh', 'Thảo', 'Tuyết', 'Uyên', 'Vân', 'Xuân', 'Yến'
]

# ========== ĐỊA CHỈ THỰC TẾ PHƯỜNG LA KHÊ ==========
DUONG_PHO_LA_KHE = [
    'Lê Trọng Tấn', 'Tố Hữu', 'Quang Trung', 'Nguyễn Thanh Bình',
    'Phan Đình Giót', 'Ngô Thì Nhậm', 'Văn Khê', 'Yên Lộ', 'Lê Văn Lương'
]

KHU_DO_THI = [
    'KĐT Văn Khê', 'KĐT Dương Nội', 'KĐT An Hưng', 
    'KĐT ParkCity', 'KĐT Geleximco', 'The Pride', 'Anland Complex', 'Anland Premium'
]

# Tạo danh sách địa chỉ chi tiết
DIA_CHI_LA_KHE = []

# Địa chỉ đường phố
for duong in DUONG_PHO_LA_KHE:
    for so in range(1, 200, 2):  # Số lẻ
        DIA_CHI_LA_KHE.append(f"{so} {duong}, Phường La Khê, Quận Hà Đông, Hà Nội")

# Địa chỉ khu đô thị
for kdt in KHU_DO_THI:
    # Chung cư (CT)
    for so in range(1, 20):
        DIA_CHI_LA_KHE.append(f"CT{so} {kdt}, Phường La Khê, Quận Hà Đông, Hà Nội")
    # Biệt thự (BT)
    for so in range(1, 15):
        DIA_CHI_LA_KHE.append(f"BT{so} {kdt}, Phường La Khê, Quận Hà Đông, Hà Nội")
    # Liền kề (LK)
    for so in range(1, 25):
        DIA_CHI_LA_KHE.append(f"LK{so} {kdt}, Phường La Khê, Quận Hà Đông, Hà Nội")

# ========== NGÀNH NGHỀ ==========
NGHE_NGHIEP = [
    'Nông dân', 'Công nhân', 'Giáo viên', 'Bác sĩ', 'Y tá', 'Dược sĩ',
    'Kỹ sư', 'Kỹ sư xây dựng', 'Kiến trúc sư', 'Thợ cơ khí', 'Thợ điện', 'Thợ điện tử',
    'Công chức', 'Nhân viên văn phòng', 'Kế toán', 'Nhân viên ngân hàng',
    'Tài xế', 'Shipper', 'Grab/Be', 'Thợ xây', 'Thợ sửa chữa', 'Bảo vệ', 'Lao công',
    'Giúp việc', 'Kinh doanh', 'Kinh doanh online', 'Buôn bán', 'Bán hàng',
    'Nội trợ', 'Thợ dệt the', 'Thợ thủ công mỹ nghệ',
    'Lập trình viên', 'Nhân viên IT', 'Marketing', 'Thiết kế đồ họa',
]

NOI_LAM_VIEC = [
    'Công ty Cổ phần Điện lực Hà Nội',
    'Công ty Cổ phần Nước sạch Hà Nội',
    'Trường Mầm Non Tuệ Đức',
    'Trường Tiểu Học Văn Khê',
    'Trường THCS Văn Khê',
    'Bệnh viện Thanh Xuân',
    'Bệnh viện Hà Đông',
    'Trạm Y Tế Phường La Khê',
    'UBND Phường La Khê',
    'UBND Quận Hà Đông',
    'Công ty Cổ phần Tập đoàn Nam Cường',
    'Công ty CP Hải Phát Land',
    'Nhà Hàng Lá Cọ KĐT Văn Khê',
    'Siêu thị BigC Hà Đông',
    'Chợ La Khê',
    'Không rõ địa chỉ',
    'Làm việc tự do',
    'Kinh doanh online',
]

NOI_SINH = [
    'Hà Nội', 'Hà Nội', 'Hà Nội', 'Hà Nội',  # Hà Nội chiếm đa số
    'Hải Phòng', 'Hải Dương', 'Hưng Yên', 'Thái Bình',
    'Nam Định', 'Ninh Bình', 'Bắc Ninh', 'Vĩnh Phúc'
]

NGUYEN_QUAN = NOI_SINH + ['Hà Đông', 'Thanh Xuân', 'Đống Đa', 'Ba Đình']

NOI_CAP_CCCD = [
    'Công an Quận Hà Đông',
    'Công an Thành phố Hà Nội',
    'Cục Cảnh sát quản lý hành chính về trật tự xã hội',
]

DAN_TOC = [
    'Kinh', 'Kinh', 'Kinh', 'Kinh', 'Kinh', 'Kinh',  # Kinh chiếm 90%
    'Tày', 'Thái', 'Mường', 'Hoa', 'Khmer'
]

QUAN_HE_VOI_CHU_HO = [
    'Chủ hộ', 'Vợ', 'Chồng', 'Con', 'Con gái', 'Con trai',
    'Bố', 'Mẹ', 'Ông', 'Bà', 'Anh', 'Chị', 'Em', 'Cháu'
]

TRANG_THAI = ['thuong_tru', 'thuong_tru', 'thuong_tru', 'tam_tru', 'tam_vang']

# ========== CÁN BỘ & SINH HOẠT ==========
CHUC_DANH_CAN_BO = [
    'Tổ trưởng dân phố',
    'Tổ phó dân phố',
    'Cán bộ quản lý dân số',
    'Cán bộ tư vấn pháp luật',
    'Cán bộ y tế',
]

NHIEM_VU = [
    'Quản lý nhân khẩu',
    'Quản lý hộ khẩu',
    'Y tế cộng đồng',
    'Truyền thông',
    'Tổng hợp báo cáo',
]

CHU_DE_SINH_HOAT = [
    'Hội họp cư dân tháng',
    'Buổi hướng dẫn vệ sinh môi trường',
    'Tuyên truyền pháp luật an toàn giao thông',
    'Buổi sinh hoạt cộng đồng La Khê',
    'Kỷ niệm Ngày thành lập Đoàn thanh niên',
    'Lễ tổng kết năm phường La Khê',
    'Tuyên truyền nghề dệt the truyền thống La Khê',
    'Lớp học tiếng Anh cho trẻ em',
    'Lớp kỹ năng sống cho thanh niên',
    'Chương trình chăm sóc sức khỏe người cao tuổi',
    'Sinh hoạt văn hóa thể thao cộng đồng',
    'Hội thi nấu ăn gia đình',
    'Ngày hội Đại đoàn kết toàn dân',
]

# ========== HELPER FUNCTIONS ==========
def gen_ho_ten(gioi_tinh):
    """Sinh ngẫu nhiên họ tên tiếng Việt."""
    ho = choice(HO_VIET)
    if gioi_tinh == 'Nam':
        ten_dem = choice(TEN_DEM_NAM)
        ten = choice(TEN_VIET_NAM)
    else:
        ten_dem = choice(TEN_DEM_NU)
        ten = choice(TEN_VIET_NU)
    return f"{ho} {ten_dem} {ten}"

def gen_ngay_sinh(min_age=18, max_age=85):
    """Sinh ngẫu nhiên ngày sinh."""
    today = date.today()
    days_ago = randint(min_age * 365, max_age * 365)
    return today - timedelta(days=days_ago)

def gen_so_cccd():
    """Sinh ngẫu nhiên số CCCD 12 chữ số (format mới VN)."""
    # 001: Hà Nội, sau đó là các số ngẫu nhiên
    return f"001{randint(0, 9)}{randint(70, 99)}{randint(100000, 999999)}"

def gen_so_ho_khau():
    """Sinh ngẫu nhiên số hộ khẩu."""
    return f"HN{randint(100000, 999999)}"

def gen_so_dien_thoai():
    """Sinh ngẫu nhiên số điện thoại Việt Nam."""
    dau_so = choice(['032', '033', '034', '035', '036', '037', '038', '039', 
                     '086', '096', '097', '098', '070', '079', '077', '076', '078'])
    return f"{dau_so}{randint(1000000, 9999999)}"

# ========== DATA GENERATION ==========
def clear_data():
    """Xóa tất cả dữ liệu cũ."""
    print("\n🗑️  Đang xóa dữ liệu cũ...")
    CanBo.objects.all().delete()
    TaiKhoan.objects.filter(is_superuser=False).delete()
    BienDongNhanKhau.objects.all().delete()
    NhanKhau.objects.all().delete()
    ThamGiaSinhHoat.objects.all().delete()
    LichSinhHoat.objects.all().delete()
    PhieuTamTruTamVang.objects.all().delete()
    HoGiaDinh.objects.all().delete()
    ThongKeNhanKhau.objects.all().delete()
    print("✅ Đã xóa dữ liệu cũ")

def seed_tai_khoan():
    """Sinh dữ liệu tài khoản."""
    print("\n=== 👤 Tạo tài khoản ===")
    
    accounts = [
        {
            'username': 'admin',
            'email': 'admin@lakhequan.vn',
            'first_name': 'Admin',
            'last_name': 'Hệ thống',
            'password': 'admin@2024',
            'is_staff': True,
            'is_superuser': True,
            'role': 'can_bo',
            'chuc_vu': 'quan_tri_vien',
            'cccd': gen_so_cccd(),
        },
        {
            'username': 'to_truong_lakhe',
            'email': 'totruong@lakhequan.vn',
            'first_name': 'Trần Văn',
            'last_name': 'Anh',
            'password': 'totruong@2024',
            'is_staff': True,
            'role': 'can_bo',
            'chuc_vu': 'to_truong',
            'cccd': gen_so_cccd(),
        },
        {
            'username': 'to_pho_lakhe',
            'email': 'topho@lakhequan.vn',
            'first_name': 'Nguyễn Thị',
            'last_name': 'Bình',
            'password': 'topho@2024',
            'is_staff': True,
            'role': 'can_bo',
            'chuc_vu': 'to_pho',
            'cccd': gen_so_cccd(),
        },
    ]
    
    created_accounts = {}
    for acc in accounts:
        password = acc.pop('password')
        user, created = TaiKhoan.objects.get_or_create(
            username=acc['username'],
            defaults=acc
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"  ✅ {acc['username']} - {acc['last_name']} {acc['first_name']}")
        created_accounts[acc['username']] = user
    
    return created_accounts

def seed_can_bo(accounts):
    """Sinh dữ liệu cán bộ."""
    print("\n=== 👮 Tạo cán bộ ===")
    
    can_bo_info = [
        {
            'user': 'to_truong_lakhe',
            'chuc_danh': 'Tổ trưởng dân phố',
            'nhiem_vu': 'Quản lý chung phường La Khê',
        },
        {
            'user': 'to_pho_lakhe',
            'chuc_danh': 'Tổ phó dân phố',
            'nhiem_vu': 'Hỗ trợ quản lý phường La Khê',
        },
    ]
    
    can_bos = {}
    for info in can_bo_info:
        user = accounts[info['user']]
        can_bo, created = CanBo.objects.get_or_create(
            tai_khoan=user,
            defaults={
                'chuc_danh': info['chuc_danh'],
                'so_dien_thoai': gen_so_dien_thoai(),
                'nhiem_vu_phu_trach': info['nhiem_vu'],
                'ngay_nhan_chuc': date(2022, 1, 1),
            }
        )
        if created:
            print(f"  ✅ {info['chuc_danh']} - {user.last_name} {user.first_name}")
        can_bos[info['user']] = can_bo
    
    return can_bos

def seed_nhan_khau(so_ho=20):
    """Sinh dữ liệu nhân khẩu."""
    print(f"\n=== 👥 Tạo nhân khẩu ({so_ho} hộ gia đình) ===")
    
    nhan_khau_list = []
    
    for h_idx in range(so_ho):
        # Số thành viên mỗi hộ: 2-6 người
        so_thanh_vien = randint(2, 6)
        chu_ho_hien_tai = None  # Lưu chủ hộ hiện tại
        
        for idx in range(so_thanh_vien):
            if idx == 0:
                # Chủ hộ
                quan_he = 'Chủ hộ'
                gioi_tinh = choice(['Nam', 'Nữ'])
                tuoi = randint(35, 70)
            elif idx == 1 and so_thanh_vien > 1 and chu_ho_hien_tai:
                # Vợ/Chồng
                quan_he = 'Vợ' if chu_ho_hien_tai.gioi_tinh == 'Nam' else 'Chồng'
                gioi_tinh = 'Nữ' if quan_he == 'Vợ' else 'Nam'
                tuoi = randint(30, 65)
            else:
                # Con cái hoặc người thân
                quan_he = choice(['Con', 'Con gái', 'Con trai', 'Bố', 'Mẹ', 'Ông', 'Bà'])
                gioi_tinh = choice(['Nam', 'Nữ'])
                if 'Con' in quan_he:
                    tuoi = randint(0, 25)
                elif quan_he in ['Bố', 'Mẹ']:
                    tuoi = randint(60, 85)
                else:
                    tuoi = randint(65, 90)
            
            ngay_sinh = date.today() - timedelta(days=tuoi * 365 + randint(0, 364))
            
            # Trẻ dưới 14 tuổi chưa có CCCD
            co_cccd = tuoi >= 14
            
            nhan_khau = NhanKhau.objects.create(
                ho_ten=gen_ho_ten(gioi_tinh),
                gioi_tinh=gioi_tinh,
                ngay_sinh=ngay_sinh,
                noi_sinh=choice(NOI_SINH),
                nguyen_quan=choice(NGUYEN_QUAN),
                dan_toc=choice(DAN_TOC),
                nghe_nghiep=choice(NGHE_NGHIEP) if tuoi >= 18 else None,
                noi_lam_viec=choice(NOI_LAM_VIEC) if tuoi >= 18 else None,
                so_cccd=gen_so_cccd() if co_cccd else None,
                ngay_cap=ngay_sinh + timedelta(days=14*365) if co_cccd else None,
                noi_cap=choice(NOI_CAP_CCCD) if co_cccd else None,
                thoi_gian_dang_ki_thuong_tru=ngay_sinh if tuoi < 5 else date(2015, randint(1, 12), randint(1, 28)),
                trang_thai=choice(TRANG_THAI),
                quan_he_voi_chu_ho=quan_he,
            )
            nhan_khau_list.append(nhan_khau)
            
            # Lưu chủ hộ để tham chiếu sau
            if idx == 0:
                chu_ho_hien_tai = nhan_khau
    
    print(f"  ✅ Đã tạo {len(nhan_khau_list)} nhân khẩu")
    return nhan_khau_list

def seed_ho_gia_dinh(nhan_khau_list, so_ho=20):
    """Sinh dữ liệu hộ gia đình."""
    print(f"\n=== 🏠 Tạo hộ gia đình ({so_ho} hộ) ===")
    
    ho_gia_dinh_list = []
    
    # Nhóm nhân khẩu theo hộ
    so_nguoi_moi_ho = len(nhan_khau_list) // so_ho
    
    for i in range(so_ho):
        start_idx = i * so_nguoi_moi_ho
        end_idx = start_idx + so_nguoi_moi_ho if i < so_ho - 1 else len(nhan_khau_list)
        
        thanh_vien = nhan_khau_list[start_idx:end_idx]
        chu_ho = thanh_vien[0]
        
        ho = HoGiaDinh.objects.create(
            id_chu_ho=chu_ho,
            so_ho_khau=gen_so_ho_khau(),
            ho_ten_chu_ho=chu_ho.ho_ten,
            so_dien_thoai=gen_so_dien_thoai(),
            dia_chi=choice(DIA_CHI_LA_KHE),
            phuong_xa='Phường La Khê',
            ghi_chu=None,
        )
        
        # Liên kết nhân khẩu với hộ
        for nk in thanh_vien:
            nk.ho_gia_dinh = ho
            nk.save()
        
        ho_gia_dinh_list.append(ho)
        
        if (i + 1) % 5 == 0:
            print(f"  ✅ Đã tạo {i + 1}/{so_ho} hộ...")
    
    print(f"  ✅ Hoàn thành {len(ho_gia_dinh_list)} hộ gia đình")
    return ho_gia_dinh_list

def seed_bien_dong_nhan_khau(nhan_khau_list):
    """Sinh dữ liệu biến động nhân khẩu."""
    print(f"\n=== 📝 Tạo biến động nhân khẩu ===")
    
    bien_dong_list = []
    today = date.today()
    
    # Chỉ tạo cho 20% nhân khẩu
    for nk in nhan_khau_list[:len(nhan_khau_list)//5]:
        if randint(0, 1) == 0:
            loai_bien_dong = choice(['MOI_SINH', 'CHUYEN_DEN', 'TAM_VANG', 'TAM_TRU'])
            
            if loai_bien_dong == 'MOI_SINH':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Đăng ký khai sinh',
                    ngay_bat_dau=nk.ngay_sinh,
                )
            elif loai_bien_dong == 'CHUYEN_DEN':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Chuyển đến từ nơi khác',
                    ngay_bat_dau=today - timedelta(days=randint(30, 365)),
                    noi_chuyen=choice(['Từ Thanh Xuân', 'Từ Đống Đa', 'Từ tỉnh khác']),
                )
            elif loai_bien_dong == 'TAM_VANG':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Đi công tác, du lịch',
                    ngay_bat_dau=today - timedelta(days=randint(7, 30)),
                    ngay_ket_thuc=today + timedelta(days=randint(7, 60)),
                )
            else:  # TAM_TRU
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta=f'Đăng ký tạm trú tại {choice(DIA_CHI_LA_KHE)}',
                    ngay_bat_dau=today - timedelta(days=randint(30, 180)),
                    ngay_ket_thuc=today + timedelta(days=randint(30, 180)),
                )
            
            bien_dong_list.append(bd)
    
    print(f"  ✅ Đã tạo {len(bien_dong_list)} biến động")
    return bien_dong_list

def seed_phieu_tam_tru_tam_vang(nhan_khau_list):
    """Sinh dữ liệu phiếu tạm trú/tạm vắng."""
    print(f"\n=== 📄 Tạo phiếu tạm trú/tạm vắng ===")
    
    phieu_list = []
    today = date.today()
    
    # Chỉ tạo cho 15% nhân khẩu trưởng thành
    nhan_khau_lon = [nk for nk in nhan_khau_list if (today - nk.ngay_sinh).days >= 18*365]
    
    for nk in nhan_khau_lon[:len(nhan_khau_lon)//7]:
        loai_phieu = choice(['tam_tru', 'tam_vang'])
        ngay_bat_dau = today - timedelta(days=randint(30, 180))
        
        phieu = PhieuTamTruTamVang.objects.create(
            nhan_khau=nk,
            loai_phieu=loai_phieu,
            ngay_bat_dau=ngay_bat_dau,
            ngay_ket_thuc=ngay_bat_dau + timedelta(days=randint(30, 180)),
            ly_do='Công tác' if loai_phieu == 'tam_tru' else 'Thăm gia đình',
            dia_chi_tam_tru=choice(DIA_CHI_LA_KHE) if loai_phieu == 'tam_tru' else None,
            trang_thai=choice(['cho_duyet', 'da_duyet', 'da_duyet']),
        )
        phieu_list.append(phieu)
    
    print(f"  ✅ Đã tạo {len(phieu_list)} phiếu")
    return phieu_list

def seed_lich_sinh_hoat(can_bos):
    """Sinh dữ liệu lịch sinh hoạt."""
    print(f"\n=== 📅 Tạo lịch sinh hoạt ===")
    
    lich_list = []
    today = date.today()
    can_bo_obj = list(can_bos.values())[0]
    
    for i in range(10):
        ngay_to_chuc = today + timedelta(days=randint(7, 90))
        
        lich = LichSinhHoat.objects.create(
            chu_de=choice(CHU_DE_SINH_HOAT),
            ngay_to_chuc=ngay_to_chuc,
            gio_to_chuc=choice(['09:00:00', '14:00:00', '18:00:00', '19:00:00']),
            dia_diem='Hội trường Phường La Khê',
            noi_dung='Nội dung chi tiết buổi sinh hoạt cộng đồng...',
            ghi_chu=None,
            nguoi_tao=can_bo_obj,
        )
        lich_list.append(lich)
    
    print(f"  ✅ Đã tạo {len(lich_list)} lịch sinh hoạt")
    return lich_list

def seed_tham_gia_sinh_hoat(ho_gia_dinh_list, lich_sinh_hoat_list):
    """Sinh dữ liệu tham gia sinh hoạt."""
    print(f"\n=== ✅ Tạo thông tin tham gia sinh hoạt ===")
    
    tham_gia_list = []
    
    for ho in ho_gia_dinh_list:
        for lich in lich_sinh_hoat_list:
            # 70% hộ tham gia
            if randint(0, 9) < 7:
                tham_gia = ThamGiaSinhHoat.objects.create(
                    ho_gia_dinh=ho,
                    lich_sinh_hoat=lich,
                    da_tham_gia=choice([True, True, False]),
                )
                tham_gia_list.append(tham_gia)
    
    print(f"  ✅ Đã tạo {len(tham_gia_list)} bản ghi")
    return tham_gia_list

def seed_thong_ke(accounts, nhan_khau_list, ho_gia_dinh_list):
    """Sinh dữ liệu thống kê nhân khẩu."""
    print(f"\n=== 📊 Tạo thống kê nhân khẩu ===")
    
    today = date.today()
    tong_nhan_khau = len(nhan_khau_list)
    so_nam = len([nk for nk in nhan_khau_list if nk.gioi_tinh == 'Nam'])
    so_nu = tong_nhan_khau - so_nam
    
    # Phân loại theo độ tuổi
    mam_non = len([nk for nk in nhan_khau_list if (today - nk.ngay_sinh).days < 3*365])
    mau_giao = len([nk for nk in nhan_khau_list if 3*365 <= (today - nk.ngay_sinh).days < 6*365])
    cap_1 = len([nk for nk in nhan_khau_list if 6*365 <= (today - nk.ngay_sinh).days < 11*365])
    cap_2 = len([nk for nk in nhan_khau_list if 11*365 <= (today - nk.ngay_sinh).days < 14*365])
    cap_3 = len([nk for nk in nhan_khau_list if 14*365 <= (today - nk.ngay_sinh).days < 18*365])
    lao_dong = len([nk for nk in nhan_khau_list if 18*365 <= (today - nk.ngay_sinh).days < 60*365])
    nghi_huu = len([nk for nk in nhan_khau_list if (today - nk.ngay_sinh).days >= 60*365])
    
    tam_tru = len([nk for nk in nhan_khau_list if nk.trang_thai == 'tam_tru'])
    tam_vang = len([nk for nk in nhan_khau_list if nk.trang_thai == 'tam_vang'])
    
    user = accounts['to_truong_lakhe']
    
    thong_ke = ThongKeNhanKhau.objects.create(
        nguoi_tao=user,
        tong_nhan_khau=tong_nhan_khau,
        so_nam=so_nam,
        so_nu=so_nu,
        mam_non=mam_non,
        mau_giao=mau_giao,
        cap_1=cap_1,
        cap_2=cap_2,
        cap_3=cap_3,
        lao_dong=lao_dong,
        nghi_huu=nghi_huu,
        tam_tru=tam_tru,
        tam_vang=tam_vang,
        tu_ngay=date(2025, 1, 1),
        den_ngay=today,
        ghi_chu='Thống kê dân cư Phường La Khê, Quận Hà Đông, Hà Nội',
    )
    
    print(f"  ✅ Tổng số: {tong_nhan_khau} người (Nam: {so_nam}, Nữ: {so_nu})")
    return thong_ke

def main():
    """Hàm chính."""
    print("=" * 70)
    print("  SINH DỮ LIỆU MẪU - PHƯỜNG LA KHÊ, QUẬN HÀ ĐÔNG, HÀ NỘI")
    print("=" * 70)
    print("📍 Địa chỉ: Phường La Khê, Quận Hà Đông, Hà Nội")
    print("📊 Diện tích: 2,60 km² | Dân số thực tế: ~18.000 người")
    print("🏛️  Di tích: Đình, Chùa, Bia Bà La Khê (Di tích Quốc gia)")
    print("🎭 Nghề truyền thống: Dệt the La Khê nổi tiếng")
    print("=" * 70)
    
    try:
        # Hỏi xóa dữ liệu cũ
        xoa = input("\n⚠️  Xóa dữ liệu cũ? (y/n): ").lower().strip()
        if xoa == 'y':
            clear_data()
        
        # Hỏi số hộ gia đình
        so_ho_input = input("\nSố hộ gia đình muốn tạo (mặc định 20): ").strip()
        so_ho = int(so_ho_input) if so_ho_input and so_ho_input.isdigit() else 20
        
        # Tạo dữ liệu
        accounts = seed_tai_khoan()
        can_bos = seed_can_bo(accounts)
        nhan_khau_list = seed_nhan_khau(so_ho)
        ho_gia_dinh_list = seed_ho_gia_dinh(nhan_khau_list, so_ho)
        bien_dong_list = seed_bien_dong_nhan_khau(nhan_khau_list)
        phieu_list = seed_phieu_tam_tru_tam_vang(nhan_khau_list)
        lich_list = seed_lich_sinh_hoat(can_bos)
        tham_gia_list = seed_tham_gia_sinh_hoat(ho_gia_dinh_list, lich_list)
        thong_ke = seed_thong_ke(accounts, nhan_khau_list, ho_gia_dinh_list)
        
        # Tổng kết
        print("\n" + "=" * 70)
        print("✅ HOÀN THÀNH SINH DỮ LIỆU MẪU")
        print("=" * 70)
        print(f"\n📊 THỐNG KÊ DỮ LIỆU ĐÃ TẠO:")
        print(f"  • Tài khoản: {len(accounts)}")
        print(f"  • Cán bộ: {len(can_bos)}")
        print(f"  • Nhân khẩu: {len(nhan_khau_list)}")
        print(f"  • Hộ gia đình: {len(ho_gia_dinh_list)}")
        print(f"  • Biến động nhân khẩu: {len(bien_dong_list)}")
        print(f"  • Phiếu tạm trú/tạm vắng: {len(phieu_list)}")
        print(f"  • Lịch sinh hoạt: {len(lich_list)}")
        print(f"  • Tham gia sinh hoạt: {len(tham_gia_list)}")
        
        print(f"\n👤 TÀI KHOẢN ĐĂNG NHẬP:")
        print(f"  • Username: admin")
        print(f"  • Password: admin@2024")
        print(f"  • Hoặc username: to_truong, password: to_truong@2024")
        print(f"  • Hoặc username: to_pho, password: to_pho@2024")
        
        print(f"\n📝 GHI CHÚ:")
        print(f"  • Dữ liệu dựa trên thông tin thực tế Phường La Khê")
        print(f"  • Địa chỉ: Lê Trọng Tấn, Tố Hữu, Quang Trung...")
        print(f"  • Khu đô thị: Văn Khê, Dương Nội, An Hưng, ParkCity...")
        print(f"  • Nghề truyền thống: Dệt the La Khê")
        print(f"  • Tất cả họ tên, CCCD, SĐT đều là tiếng Việt tự nhiên")
        
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ LỖI: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()