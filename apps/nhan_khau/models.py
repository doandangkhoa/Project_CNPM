
from django.db import models

class NhanKhau(models.Model):
    ho_gia_dinh = models.ForeignKey('ho_gia_dinh.HoGiaDinh', on_delete=models.SET_NULL, related_name="nhan_khau", null=True, blank=True)
    ho_ten = models.CharField(max_length=100)
    bi_danh = models.CharField(max_length=50, null=True, blank=True)
    gioi_tinh = models.CharField(
        max_length=5, choices=[("Nam", "Nam"), ("Nữ", "Nữ")], default="Nam"
    )
    ngay_sinh = models.DateField()
    noi_sinh = models.CharField(max_length=100)
    nguyen_quan = models.CharField(max_length=100)
    dan_toc = models.CharField(max_length=50)
    nghe_nghiep = models.CharField(max_length=100, null=True, blank=True)
    noi_lam_viec = models.CharField(max_length=150, null=True, blank=True)
    so_cccd = models.CharField(max_length=20, null=True, blank=True, unique=True)
    ngay_cap = models.DateField(null=True, blank=True)
    noi_cap = models.CharField(max_length=100, null=True, blank=True)
    thoi_gian_dang_ki_thuong_tru = models.DateField(null=True, blank=True)
    # em be --> moi sinh
    dia_chi_thuong_tru_truoc_day = models.CharField(max_length=255, null=True, blank=True)
    trang_thai = models.CharField(
        max_length=20,
        choices=[("song", "còn sống"), 
                 ("chet", "đã chết"), 
                 ("tam_tru", "tạm trú"),
                 ("tam_vang", "tạm vắng"),
                 ("chuyen_di", "Đã chuyển đi"),
        ],
        default="song",
    ) 
    quan_he_voi_chu_ho = models.CharField(max_length=50)
    ghi_chu = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.ho_ten
    
class BienDongNhanKhau(models.Model):
    LOAI_BIEN_DONG = [
        ('TAO_MOI', 'Thêm nhân khẩu'),
        ('CAP_NHAT', 'Cập nhật thông tin'),
        ('XOA', 'Xóa nhân khẩu'),
        ('KHAI_TU', 'Khai tử'),
        ('TACH_HO', 'Tách hộ'),
        ('NHAP_HO', 'Nhập hộ'),
        ('TAM_VANG', 'Tạm vắng'),
        ('TAM_TRU', 'Tạm trú'),
        ('CHUYEN_KHAU', 'Chuyển khẩu'),
    ]

    nhan_khau = models.ForeignKey('nhan_khau.NhanKhau', on_delete=models.CASCADE, related_name='bien_dong_nhan_khau')
    ho_khau = models.ForeignKey('ho_gia_dinh.HoGiaDinh', on_delete=models.CASCADE, related_name='bien_dong_ho_khau', null=True, blank=True)
    can_bo_thuc_hien = models.ForeignKey('can_bo.CanBo', on_delete=models.SET_NULL, null=True, blank=True, related_name='thay_doi_bien_dong')
    loai_bien_dong = models.CharField(max_length=20, choices=LOAI_BIEN_DONG)
    mo_ta = models.TextField(null=True, blank=True)  # Ghi chú cụ thể: lý do, nơi chuyển đi/đến...
    ngay_thay_doi = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nhan_khau.ho_ten} - {self.get_loai_bien_dong_display()} ({self.ngay_thay_doi.date()})"    
    
class TamVang(models.Model):
    """
    Quản lý việc công dân địa phương đi vắng (cần giấy tạm vắng)
    """
    nhan_khau = models.ForeignKey(NhanKhau, on_delete=models.CASCADE, related_name='ds_tam_vang')
    ma_giay_tam_vang = models.CharField(max_length=20, unique=True)
    noi_tam_tru = models.CharField(max_length=200) # Nơi công dân chuyển đến tạm thời
    tu_ngay = models.DateField()
    den_ngay = models.DateField()
    ly_do = models.TextField(null=True, blank=True)
    
    # Optional: Cán bộ cấp giấy
    can_bo_cap = models.ForeignKey('can_bo.CanBo', on_delete=models.SET_NULL, null=True, blank=True)
    ngay_dang_ky = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Giấy tạm vắng: {self.nhan_khau.ho_ten} ({self.tu_ngay} - {self.den_ngay})"

class TamTru(models.Model):
    """
    Quản lý công dân từ nơi khác đến địa bàn (cần giấy tạm trú)
    """
    nhan_khau = models.ForeignKey(NhanKhau, on_delete=models.CASCADE, related_name='ds_tam_tru')
    ma_giay_tam_tru = models.CharField(max_length=20, unique=True)
    so_dien_thoai_nguoi_dang_ky = models.CharField(max_length=15, null=True, blank=True)
    
    tu_ngay = models.DateField()
    den_ngay = models.DateField()
    ly_do = models.TextField(null=True, blank=True)
    
    # Địa chỉ cụ thể họ đang ở tại địa bàn của mình (có thể trỏ tới HoGiaDinh hoặc nhập text)
    dia_chi_tam_tru = models.CharField(max_length=200, help_text="Địa chỉ nơi đang tạm trú")
    
    can_bo_cap = models.ForeignKey('can_bo.CanBo', on_delete=models.SET_NULL, null=True, blank=True)
    ngay_dang_ky = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Giấy tạm trú: {self.nhan_khau.ho_ten} ({self.tu_ngay} - {self.den_ngay})"
    