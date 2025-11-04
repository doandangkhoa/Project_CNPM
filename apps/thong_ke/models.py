from django.db import models
from apps.tai_khoan.models import TaiKhoan

class ThongKeNhanKhau(models.Model):
    NGUOI_TAO = models.ForeignKey(TaiKhoan, on_delete=models.SET_NULL, null=True)
    ngay_thong_ke = models.DateTimeField(auto_now_add=True)

    tong_nhan_khau = models.PositiveIntegerField(default=0)
    so_nam = models.PositiveIntegerField(default=0)
    so_nu = models.PositiveIntegerField(default=0)

    mam_non = models.PositiveIntegerField(default=0)
    mau_giao = models.PositiveIntegerField(default=0)
    cap_1 = models.PositiveIntegerField(default=0)
    cap_2 = models.PositiveIntegerField(default=0)
    cap_3 = models.PositiveIntegerField(default=0)
    lao_dong = models.PositiveIntegerField(default=0)
    nghi_huu = models.PositiveIntegerField(default=0)

    tam_tru = models.PositiveIntegerField(default=0)
    tam_vang = models.PositiveIntegerField(default=0)

    tu_ngay = models.DateField(null=True, blank=True)
    den_ngay = models.DateField(null=True, blank=True)

    ghi_chu = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Thống kê nhân khẩu"
        verbose_name_plural = "Các bản thống kê nhân khẩu"

    def __str__(self):
        return f"Thống kê ngày {self.ngay_thong_ke.date()} (Tổng: {self.tong_nhan_khau})"
