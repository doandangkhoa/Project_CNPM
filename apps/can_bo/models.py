# apps/can_bo/models.py
from django.db import models
from apps.tai_khoan.models import TaiKhoan

class CanBo(models.Model):
    tai_khoan = models.OneToOneField(TaiKhoan, on_delete=models.CASCADE)
    chuc_danh = models.CharField(max_length=100)
    so_dien_thoai = models.CharField(max_length=15)
    nhiem_vu_phu_trach = models.CharField(max_length=100)
    ngay_nhan_chuc = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.tai_khoan.username} - {self.chuc_danh}"
