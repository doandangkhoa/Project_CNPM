from django.db import models

class HoGiaDinh(models.Model):
    so_ho_khau = models.CharField(max_length=20, unique=True)
    ho_ten_chu_ho = models.CharField(max_length=100)
    so_dien_thoai = models.CharField(max_length=50, null=True, blank=True)
    so_nha = models.CharField(max_length=50)
    duong_pho = models.CharField(max_length=100)
    phuong_xa = models.CharField(max_length=100)
    quan_huyen = models.CharField(max_length=100)
    ngay_tao = models.DateField(auto_now_add=True)
    ghi_chu = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Hộ {self.ho_ten_chu_ho} ({self.so_ho_khau})"
