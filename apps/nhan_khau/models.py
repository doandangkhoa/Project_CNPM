
from django.db import models
from apps.ho_gia_dinh.models import HoGiaDinh

class NhanKhau(models.Model):
    ho_gia_dinh = models.ForeignKey(HoGiaDinh, on_delete=models.CASCADE, related_name="nhan_khau")
    ho_ten = models.CharField(max_length=100)
    bi_danh = models.CharField(max_length=50, null=True, blank=True)
    ngay_sinh = models.DateField()
    noi_sinh = models.CharField(max_length=100)
    nguyen_quan = models.CharField(max_length=100)
    dan_toc = models.CharField(max_length=50)
    nghe_nghiep = models.CharField(max_length=100, null=True, blank=True)
    noi_lam_viec = models.CharField(max_length=150, null=True, blank=True)
    so_cccd = models.CharField(max_length=20, null=True, blank=True)
    ngay_cap = models.DateField(null=True, blank=True)
    noi_cap = models.CharField(max_length=100, null=True, blank=True)
    quan_he_voi_chu_ho = models.CharField(max_length=50)
    ghi_chu = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.ho_ten
    
class BienDongNhanKhau(models.Model):
    LOAI_BIEN_DONG = [
        ('TAO_MOI', 'Thêm nhân khẩu'),
        ('XOA', 'Xóa nhân khẩu'),
        ('TACH_HO', 'Tách hộ'),
        ('NHAP_HO', 'Nhập hộ'),
        ('TAM_VANG', 'Tạm vắng'),
        ('TAM_TRU', 'Tạm trú'),
        ('CHUYEN_KHAU', 'Chuyển khẩu'),
    ]

    nhan_khau = models.ForeignKey(NhanKhau, on_delete=models.CASCADE, related_name='lich_su_bien_dong')
    loai_bien_dong = models.CharField(max_length=20, choices=LOAI_BIEN_DONG)
    mo_ta = models.TextField(null=True, blank=True)  # Ghi chú cụ thể: lý do, nơi chuyển đi/đến...
    ngay_thay_doi = models.DateTimeField(auto_now_add=True)
    can_bo_thuc_hien = models.ForeignKey('can_bo.CanBo', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.nhan_khau.ho_ten} - {self.get_loai_bien_dong_display()} ({self.ngay_thay_doi.date()})"    
    
    