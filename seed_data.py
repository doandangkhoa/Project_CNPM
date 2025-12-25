"""
Script to generate sample data for all models.
Dữ liệu được sinh ra dựa trên thông tin dân cư của Tổ dân phố số 7, 
phường La Khê, thành phố Hà Nội, Việt Nam.

Chạy với: python manage.py shell < seed_data.py
hoặc:     python manage.py shell
           >>> exec(open('seed_data.py').read())
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from random import randint, choice, choices, shuffle
from django.utils import timezone

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
    'Vũ', 'Võ', 'Tô', 'Lê', 'Hồ', 'Phan', 'Đinh', 'Lý'
]

TEN_VIET_NAM = [
    'Anh', 'Bình', 'Cường', 'Đạt', 'Gia', 'Hải', 'Hùng', 'Kiên', 'Lâm',
    'Minh', 'Nam', 'Phong', 'Quân', 'Sanh', 'Tâm', 'Tiến', 'Tuấn', 'Việt',
    'Vĩnh', 'Xuân', 'Yên'
]

TEN_VIET_NU = [
    'Anh', 'Bích', 'Chân', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hương', 'Huyền',
    'Khánh', 'Kim', 'Lan', 'Linh', 'Loan', 'Ly', 'Mỹ', 'Nhi', 'Nhung',
    'Phương', 'Quyền', 'Thanh', 'Thảo', 'Tuyết', 'Uyên', 'Vân', 'Vui', 'Xuân'
]

# ========== NGÀNH NGHỀ ==========
NGHE_NGHIEP = [
    'Nông dân', 'Công nhân', 'Giáo viên', 'Bác sĩ', 'Kỹ sư', 'Thợ cơ khí',
    'Điện lực', 'Công chức', 'Nhân viên văn phòng',
    'Tài xế', 'Thợ xây', 'Thợ sửa chữa', 'Bảo vệ', 'Lao công',
    'Giúp việc', 'Kinh doanh', 'Nội trợ'
]

TRANG_THAI_CHOICES = [
    'thuong_tru',  # Thường trú
    'thuong_tru',  # Tăng xác suất thường trú
    'thuong_tru',
    'tam_tru',     # Tạm trú
    'tam_vang',    # Tạm vắng
]

QUAN_HE_VOI_CHU_HO = [
    'Chủ hộ', 'Vợ', 'Chồng', 'Con', 'Con dâu', 'Nàng dâu',
    'Rể', 'Mẹ', 'Cha', 'Ông', 'Bà', 'Anh', 'Chị', 'Em',
    'Cháu', 'Bác', 'Chú', 'Cô', 'Dì', 'Mợ'
]

DAN_TOC = [
    'Kinh', 'Kinh', 'Kinh', 'Kinh', 'Kinh',  # Kinh chiếm 85-90%
    'Tày', 'Thái', 'Mường', 'Hoa', 'Khmer'
]

# ========== HÀNG XÓMS (địa chỉ) - Tổ dân phố số 7, Phường La Khê ==========
DIA_CHI_TO_7 = [
    '42 Phạm Văn Bạch',
    '44 Phạm Văn Bạch',
    '46 Phạm Văn Bạch',
    '48 Phạm Văn Bạch',
    '50 Phạm Văn Bạch',
    '52 Phạm Văn Bạch',
    '54 Phạm Văn Bạch',
    '56 Phạm Văn Bạch',
    '58 Phạm Văn Bạch',
    '60 Phạm Văn Bạch',
    '62 Phạm Văn Bạch',
    '64 Phạm Văn Bạch',
    '66 Phạm Văn Bạch',
    '68 Phạm Văn Bạch',
    '70 Phạm Văn Bạch',
    '72 Phạm Văn Bạch',
    '74 Phạm Văn Bạch',
    '76 Phạm Văn Bạch',
]

NOI_SINH = [
    'Hà Nội',
    'Hà Nội',
    'Hà Nội',
    'Hải Phòng',
    'Hải Dương',
    'Hưng Yên',
    'Thái Bình',
    'Nam Định',
]

NGUYEN_QUAN = NOI_SINH + [
    'Hà Tây',
    'Sơn Tây',
]

NOI_LAM_VIEC = [
    'Công ty Cổ phần Điện lực Hà Nội',
    'Công ty Cổ phần Nước sạch Hà Nội',
    'Trường Tiểu học La Khê',
    'Trường THCS La Khê',
    'Bệnh viện Thanh Xuân',
    'UBND Phường La Khê',
    'Không rõ địa chỉ',
    'Làm việc tự do',
]

NOI_CAP_CCCD = [
    'Công an Quận Thanh Xuân',
    'Công an Hà Nội',
    'Công an Tỉnh Hà Tây',
]

CHUC_DANH_CAN_BO = [
    'Tổ trưởng dân phố',
    'Tổ phó dân phố',
    'Cán bộ quản lý dân số',
    'Cán bộ tư vấn pháp luật',
    'Cán bộ hộ tế',
]

NHIEM_VU = [
    'Quản lý nhân khẩu',
    'Quản lý hộ khẩu',
    'Hộ tế cộng đồng',
    'Truyền thông',
    'Tổng hợp báo cáo',
]

CHU_DE_SINH_HOAT = [
    'Hội họp cư dân tháng',
    'Buổi hướng dẫn vệ sinh',
    'Tuyên truyền pháp luật',
    'Buổi sinh hoạt cộng đồng',
    'Kỷ niệm Ngày thành lập Đoàn thanh niên',
    'Lễ tổng kết năm',
    'Lớp học tiếng Anh cơ bản',
    'Lớp kỹ năng sống cho thanh niên',
]

# ========== HELPER FUNCTIONS ==========
def gen_ho_ten(gioi_tinh):
    """Sinh ngẫu nhiên họ tên tiếng Việt."""
    ho = choice(HO_VIET)
    if gioi_tinh == 'Nam':
        ten = choice(TEN_VIET_NAM)
    else:
        ten = choice(TEN_VIET_NU)
    return f"{ho} {ten}"

def gen_ngay_sinh(min_age=18, max_age=85):
    """Sinh ngẫu nhiên ngày sinh."""
    today = date.today()
    days_ago = randint(min_age * 365, max_age * 365)
    return today - timedelta(days=days_ago)

def gen_so_cccd():
    """Sinh ngẫu nhiên số CCCD."""
    return ''.join([str(randint(0, 9)) for _ in range(12)])

def gen_so_ho_khau():
    """Sinh ngẫu nhiên số hộ khẩu."""
    return f"00200{randint(1000, 9999)}"

def gen_so_dien_thoai():
    """Sinh ngẫu nhiên số điện thoại."""
    return f"0{choice([9, 8, 7])}{''.join([str(randint(0, 9)) for _ in range(8)])}"

# ========== DATA GENERATION ==========
def clear_data():
    """Xóa tất cả dữ liệu cũ."""
    print("Xóa dữ liệu cũ...")
    CanBo.objects.all().delete()
    TaiKhoan.objects.all().delete()
    BienDongNhanKhau.objects.all().delete()
    NhanKhau.objects.all().delete()
    ThamGiaSinhHoat.objects.all().delete()
    LichSinhHoat.objects.all().delete()
    PhieuTamTruTamVang.objects.all().delete()
    HoGiaDinh.objects.all().delete()
    ThongKeNhanKhau.objects.all().delete()
    print("✓ Dữ liệu cũ đã được xóa")

def seed_tai_khoan():
    """Sinh dữ liệu tài khoản."""
    print("\n=== Tạo tài khoản ===")
    
    accounts = [
        {
            'username': 'admin',
            'email': 'admin@lakhequan.vn',
            'first_name': 'Admin',
            'last_name': 'System',
            'password': 'admin@2024',
            'is_staff': True,
            'is_superuser': True,
            'role': 'can_bo',
            'chuc_vu': 'to_truong',
            'cccd': '001201234567',
        },
        {
            'username': 'to_truong',
            'email': 'to_truong@lakhequan.vn',
            'first_name': 'Trần',
            'last_name': 'Văn Anh',
            'password': 'to_truong@2024',
            'is_staff': True,
            'role': 'can_bo',
            'chuc_vu': 'to_truong',
            'cccd': '001201234568',
        },
        {
            'username': 'to_pho',
            'email': 'to_pho@lakhequan.vn',
            'first_name': 'Nguyễn',
            'last_name': 'Thị Bình',
            'password': 'to_pho@2024',
            'is_staff': True,
            'role': 'can_bo',
            'chuc_vu': 'to_pho',
            'cccd': '001201234569',
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
            print(f"✓ Tạo tài khoản: {acc['username']}")
        created_accounts[acc['username']] = user
    
    return created_accounts

def seed_can_bo(accounts):
    """Sinh dữ liệu cán bộ."""
    print("\n=== Tạo cán bộ ===")
    
    can_bo_info = [
        {
            'user': 'to_truong',
            'chuc_danh': 'Tổ trưởng dân phố',
            'nhiem_vu': 'Quản lý chung dân phố',
        },
        {
            'user': 'to_pho',
            'chuc_danh': 'Tổ phó dân phố',
            'nhiem_vu': 'Hỗ trợ quản lý dân phố',
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
            print(f"✓ Tạo cán bộ: {user.username} - {info['chuc_danh']}")
        can_bos[info['user']] = can_bo
    
    return can_bos

def seed_nhan_khau():
    """Sinh dữ liệu nhân khẩu."""
    print("\n=== Tạo nhân khẩu ===")
    
    nhan_khau_list = []
    num_households = 15  # 15 hộ
    
    for h_idx in range(num_households):
        # Chủ hộ (chọn ngẫu nhiên là Nam hoặc Nữ, 50-50)
        gioi_tinh_chu_ho = choice(['Nam', 'Nữ'])
        ngay_sinh_chu_ho = gen_ngay_sinh(30, 70)
        
        chu_ho = NhanKhau.objects.create(
            ho_ten=gen_ho_ten(gioi_tinh_chu_ho),
            gioi_tinh=gioi_tinh_chu_ho,
            ngay_sinh=ngay_sinh_chu_ho,
            noi_sinh=choice(NOI_SINH),
            nguyen_quan=choice(NGUYEN_QUAN),
            dan_toc=choice(DAN_TOC),
            nghe_nghiep=choice(NGHE_NGHIEP),
            noi_lam_viec=choice(NOI_LAM_VIEC),
            so_cccd=gen_so_cccd(),
            ngay_cap=ngay_sinh_chu_ho + timedelta(days=18*365),
            noi_cap=choice(NOI_CAP_CCCD),
            thoi_gian_dang_ki_thuong_tru=date(2010, 1, 1),
            trang_thai='thuong_tru',
            quan_he_voi_chu_ho='Chủ hộ',
        )
        nhan_khau_list.append(chu_ho)
        
        # Vợ/chồng (nếu nam thì thêm vợ, nếu nữ thêm chồng)
        if randint(0, 1) == 0:  # 50% có vợ/chồng
            gioi_tinh_vo = 'Nữ' if gioi_tinh_chu_ho == 'Nam' else 'Nam'
            ngay_sinh_vo = ngay_sinh_chu_ho + timedelta(days=randint(-365*5, 365*5))
            
            vo = NhanKhau.objects.create(
                ho_ten=gen_ho_ten(gioi_tinh_vo),
                gioi_tinh=gioi_tinh_vo,
                ngay_sinh=ngay_sinh_vo,
                noi_sinh=choice(NOI_SINH),
                nguyen_quan=choice(NGUYEN_QUAN),
                dan_toc=choice(DAN_TOC),
                nghe_nghiep=choice(NGHE_NGHIEP),
                noi_lam_viec=choice(NOI_LAM_VIEC),
                so_cccd=gen_so_cccd(),
                ngay_cap=ngay_sinh_vo + timedelta(days=18*365),
                noi_cap=choice(NOI_CAP_CCCD),
                thoi_gian_dang_ki_thuong_tru=date(2010, 1, 1),
                trang_thai='thuong_tru',
                quan_he_voi_chu_ho='Vợ' if gioi_tinh_vo == 'Nữ' else 'Chồng',
            )
            nhan_khau_list.append(vo)
        
        # Con em (từ 0-5 con)
        num_children = randint(0, 5)
        for c_idx in range(num_children):
            gioi_tinh_con = choice(['Nam', 'Nữ'])
            ngay_sinh_con = date.today() - timedelta(days=randint(0, 18*365))
            
            con = NhanKhau.objects.create(
                ho_ten=gen_ho_ten(gioi_tinh_con),
                gioi_tinh=gioi_tinh_con,
                ngay_sinh=ngay_sinh_con,
                noi_sinh=choice(NOI_SINH),
                nguyen_quan=choice(NGUYEN_QUAN),
                dan_toc=choice(DAN_TOC),
                nghe_nghiep=None,
                noi_lam_viec=None,
                so_cccd=None if ngay_sinh_con + timedelta(days=18*365) > date.today() else gen_so_cccd(),
                ngay_cap=None,
                noi_cap=None,
                thoi_gian_dang_ki_thuong_tru=ngay_sinh_con,
                trang_thai='thuong_tru',
                quan_he_voi_chu_ho='Con',
            )
            nhan_khau_list.append(con)
    
    print(f"✓ Tạo {len(nhan_khau_list)} nhân khẩu")
    return nhan_khau_list

def seed_ho_gia_dinh(nhan_khau_list):
    """Sinh dữ liệu hộ gia đình."""
    print("\n=== Tạo hộ gia đình ===")
    
    ho_gia_dinh_list = []
    chu_ho_set = set()
    
    # Nhóm nhân khẩu thành hộ (mỗi hộ từ 1-10 người)
    for i in range(0, len(nhan_khau_list), randint(3, 6)):
        chu_ho = nhan_khau_list[i]
        
        if chu_ho.id in chu_ho_set:
            continue
        
        chu_ho_set.add(chu_ho.id)
        
        ho = HoGiaDinh.objects.create(
            id_chu_ho=chu_ho,
            so_ho_khau=gen_so_ho_khau(),
            ho_ten_chu_ho=chu_ho.ho_ten,
            so_dien_thoai=gen_so_dien_thoai(),
            dia_chi=choice(DIA_CHI_TO_7),
            phuong_xa='Phường La Khê',
            ghi_chu=choice([None, 'Hộ chính trị dân tộc', 'Hộ ưu tiên', None, None]),
        )
        ho_gia_dinh_list.append(ho)
        
        # Liên kết nhân khẩu với hộ
        for nk in nhan_khau_list:
            if randint(0, 2) == 0 or nk.id == chu_ho.id:  # Một số người trong cùng hộ
                nk.ho_gia_dinh = ho
                nk.save()
    
    print(f"✓ Tạo {len(ho_gia_dinh_list)} hộ gia đình")
    return ho_gia_dinh_list

def seed_bien_dong_nhan_khau(nhan_khau_list):
    """Sinh dữ liệu biến động nhân khẩu."""
    print("\n=== Tạo biến động nhân khẩu ===")
    
    bien_dong_list = []
    today = date.today()
    
    for nk in nhan_khau_list[:10]:  # Chỉ tạo cho 10 nhân khẩu
        if randint(0, 1) == 0:  # 50% người có biến động
            loai_bien_dong = choice([
                'MOI_SINH',
                'CHUYEN_DEN',
                'TAM_VANG',
                'TAM_TRU',
            ])
            
            if loai_bien_dong == 'MOI_SINH':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Đứa trẻ được sinh ra trong gia đình',
                    ngay_bat_dau=nk.ngay_sinh,
                )
            elif loai_bien_dong == 'CHUYEN_DEN':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Chuyển đến ở cùng gia đình',
                    ngay_bat_dau=today - timedelta(days=randint(30, 365)),
                    noi_chuyen='Từ nơi khác ở Hà Nội',
                )
            elif loai_bien_dong == 'TAM_VANG':
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Đi vắng tạm thời',
                    ngay_bat_dau=today - timedelta(days=randint(7, 60)),
                    ngay_ket_thuc=today + timedelta(days=randint(7, 30)),
                )
            else:  # TAM_TRU
                bd = BienDongNhanKhau.objects.create(
                    nhan_khau=nk,
                    ho_khau=nk.ho_gia_dinh,
                    loai_bien_dong=loai_bien_dong,
                    mo_ta='Đăng ký tạm trú',
                    ngay_bat_dau=today - timedelta(days=randint(30, 180)),
                    ngay_ket_thuc=today + timedelta(days=randint(30, 180)),
                    dia_chi_tam_tru=choice(DIA_CHI_TO_7),
                )
            
            bien_dong_list.append(bd)
    
    print(f"✓ Tạo {len(bien_dong_list)} biến động nhân khẩu")
    return bien_dong_list

def seed_phieu_tam_tru_tam_vang(nhan_khau_list):
    """Sinh dữ liệu phiếu tạm trú/tạm vắng."""
    print("\n=== Tạo phiếu tạm trú/tạm vắng ===")
    
    phieu_list = []
    today = date.today()
    
    for nk in nhan_khau_list[:15]:  # Chỉ tạo cho 15 nhân khẩu
        if randint(0, 2) == 0:  # 33% người có phiếu
            loai_phieu = choice(['tam_tru', 'tam_vang'])
            ngay_bat_dau = today - timedelta(days=randint(30, 180))
            
            phieu = PhieuTamTruTamVang.objects.create(
                nhan_khau=nk,
                loai_phieu=loai_phieu,
                ngay_bat_dau=ngay_bat_dau,
                ngay_ket_thuc=ngay_bat_dau + timedelta(days=randint(30, 180)),
                ly_do='Công tác' if loai_phieu == 'tam_tru' else 'Đi thăm huyện',
                dia_chi_tam_tru=choice(DIA_CHI_TO_7) if loai_phieu == 'tam_tru' else None,
                trang_thai=choice(['cho_duyet', 'da_duyet', 'da_duyet']),  # Hầu hết đã duyệt
            )
            phieu_list.append(phieu)
    
    print(f"✓ Tạo {len(phieu_list)} phiếu tạm trú/tạm vắng")
    return phieu_list

def seed_lich_sinh_hoat(can_bos):
    """Sinh dữ liệu lịch sinh hoạt."""
    print("\n=== Tạo lịch sinh hoạt ===")
    
    lich_list = []
    today = date.today()
    can_bo_obj = list(can_bos.values())[0]  # Lấy cán bộ đầu tiên
    
    for i in range(8):
        ngay_to_chuc = today + timedelta(days=randint(7, 60))
        
        lich = LichSinhHoat.objects.create(
            chu_de=choice(CHU_DE_SINH_HOAT),
            ngay_to_chuc=ngay_to_chuc,
            gio_to_chuc=choice(['09:00:00', '14:00:00', '18:00:00']),
            dia_diem='Trạm bán hàng tổ dân phố số 7',
            noi_dung='Nội dung buổi sinh hoạt...',
            ghi_chu=None,
            nguoi_tao=can_bo_obj,
        )
        lich_list.append(lich)
    
    print(f"✓ Tạo {len(lich_list)} lịch sinh hoạt")
    return lich_list

def seed_tham_gia_sinh_hoat(ho_gia_dinh_list, lich_sinh_hoat_list):
    """Sinh dữ liệu tham gia sinh hoạt."""
    print("\n=== Tạo thông tin tham gia sinh hoạt ===")
    
    tham_gia_list = []
    
    for ho in ho_gia_dinh_list:
        for lich in lich_sinh_hoat_list:
            tham_gia = ThamGiaSinhHoat.objects.create(
                ho_gia_dinh=ho,
                lich_sinh_hoat=lich,
                da_tham_gia=choice([True, True, False]),  # 66% tham gia
            )
            tham_gia_list.append(tham_gia)
    
    print(f"✓ Tạo {len(tham_gia_list)} bản ghi tham gia sinh hoạt")
    return tham_gia_list

def seed_thong_ke(accounts, nhan_khau_list, ho_gia_dinh_list):
    """Sinh dữ liệu thống kê nhân khẩu."""
    print("\n=== Tạo thống kê nhân khẩu ===")
    
    # Tính toán thống kê
    tong_nhan_khau = len(nhan_khau_list)
    so_nam = len([nk for nk in nhan_khau_list if nk.gioi_tinh == 'Nam'])
    so_nu = tong_nhan_khau - so_nam
    
    # Tính tuổi
    today = date.today()
    mam_non = len([nk for nk in nhan_khau_list if (today - nk.ngay_sinh).days < 3*365])
    mau_giao = len([nk for nk in nhan_khau_list if 3*365 <= (today - nk.ngay_sinh).days < 6*365])
    cap_1 = len([nk for nk in nhan_khau_list if 6*365 <= (today - nk.ngay_sinh).days < 11*365])
    cap_2 = len([nk for nk in nhan_khau_list if 11*365 <= (today - nk.ngay_sinh).days < 14*365])
    cap_3 = len([nk for nk in nhan_khau_list if 14*365 <= (today - nk.ngay_sinh).days < 18*365])
    lao_dong = len([nk for nk in nhan_khau_list if 18*365 <= (today - nk.ngay_sinh).days < 60*365])
    nghi_huu = len([nk for nk in nhan_khau_list if (today - nk.ngay_sinh).days >= 60*365])
    
    tam_tru = len([nk for nk in nhan_khau_list if nk.trang_thai == 'tam_tru'])
    tam_vang = len([nk for nk in nhan_khau_list if nk.trang_thai == 'tam_vang'])
    
    user = accounts['to_truong']
    
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
        ghi_chu='Thống kê dân cư Tổ dân phố số 7, Phường La Khê',
    )
    
    print(f"✓ Tạo thống kê nhân khẩu (Tổng: {tong_nhan_khau} người)")
    return thong_ke

def main():
    """Hàm chính."""
    print("=" * 60)
    print("SINH DỮ LIỆU MẪU - TỔ DÂN PHỐ SỐ 7, PHƯỜNG LA KHÊ, HÀ NỘI")
    print("=" * 60)
    
    try:
        clear_data()
        
        accounts = seed_tai_khoan()
        can_bos = seed_can_bo(accounts)
        nhan_khau_list = seed_nhan_khau()
        ho_gia_dinh_list = seed_ho_gia_dinh(nhan_khau_list)
        bien_dong_list = seed_bien_dong_nhan_khau(nhan_khau_list)
        phieu_list = seed_phieu_tam_tru_tam_vang(nhan_khau_list)
        lich_list = seed_lich_sinh_hoat(can_bos)
        tham_gia_list = seed_tham_gia_sinh_hoat(ho_gia_dinh_list, lich_list)
        thong_ke = seed_thong_ke(accounts, nhan_khau_list, ho_gia_dinh_list)
        
        print("\n" + "=" * 60)
        print("✓ HOÀN THÀNH SINH DỮ LIỆU MẪU")
        print("=" * 60)
        print(f"\n📊 THỐNG KÊ DỮ LIỆU ĐÃ TẠO:")
        print(f"  • Tài khoản: {len(accounts)}")
        print(f"  • Cán bộ: {len(can_bos)}")
        print(f"  • Nhân khẩu: {len(nhan_khau_list)}")
        print(f"  • Hộ gia đình: {len(ho_gia_dinh_list)}")
        print(f"  • Biến động nhân khẩu: {len(bien_dong_list)}")
        print(f"  • Phiếu tạm trú/tạm vắng: {len(phieu_list)}")
        print(f"  • Lịch sinh hoạt: {len(lich_list)}")
        print(f"  • Tham gia sinh hoạt: {len(tham_gia_list)}")
        
        print(f"\n👤 TÀI KHOẢN ĐĂNG NHẬP MẬC ĐỊNH:")
        print(f"  • Username: admin")
        print(f"  • Password: admin@2024")
        print(f"  • Hoặc username: to_truong, password: to_truong@2024")
        print(f"  • Hoặc username: to_pho, password: to_pho@2024")
        
        print("\n💡 GHI CHÚ:")
        print("  • Dữ liệu được sinh ra ngẫu nhiên nhưng khớp với địa chỉ:")
        print("    Tổ dân phố số 7, Phường La Khê, Quận Thanh Xuân, Hà Nội")
        print("  • Tất cả tên người và các thông tin đều là tiếng Việt tự nhiên")
        
    except Exception as e:
        print(f"\n❌ LỖI: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
