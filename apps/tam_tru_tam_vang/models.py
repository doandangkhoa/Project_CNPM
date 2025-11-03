
from django.db import models
from apps.nhan_khau.models import NhanKhau
from django.utils import timezone

class PhieuTamTruTamVang(models.Model):
    LOAI_PHIEU = [
        ('tam_tru', 'Tạm trú'),
        ('tam_vang', 'Tạm vắng'),
    ]

    nhan_khau = models.ForeignKey(NhanKhau, on_delete=models.CASCADE)
    loai_phieu = models.CharField(max_length=10, choices=LOAI_PHIEU)
    ngay_bat_dau = models.DateField()
    ngay_ket_thuc = models.DateField(null=True, blank=True)
    ly_do = models.TextField()
    dia_chi_tam_tru = models.CharField(max_length=255, null=True, blank=True)
    ghi_chu = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.nhan_khau.ho_ten} - {self.get_loai_phieu_display()}"
    
    @property
    def dang_hieu_luc(self):
        # Trả về True nếu phiếu vẫn còn hiệu lực.
        today = timezone.now().date()
        return self.ngay_ket_thuc is None or self.ngay_ket_thuc >= today