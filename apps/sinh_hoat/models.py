from django.db import models
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.can_bo.models import CanBo 

class LichSinhHoat(models.Model):
    chu_de = models.CharField(max_length=255)
    ngay_to_chuc = models.DateField()
    gio_to_chuc = models.TimeField()
    dia_diem = models.CharField(max_length=255)
    noi_dung = models.TextField()
    ghi_chu = models.TextField(null=True, blank=True)
    nguoi_tao = models.ForeignKey(CanBo, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.chu_de} ({self.ngay_to_chuc})"

class ThamGiaSinhHoat(models.Model):
    ho_gia_dinh = models.ForeignKey(HoGiaDinh, on_delete=models.CASCADE)
    lich_sinh_hoat = models.ForeignKey(LichSinhHoat, on_delete=models.CASCADE)
    da_tham_gia = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.ho_gia_dinh.ho_ten_chu_ho} - {self.lich_sinh_hoat.chu_de}"

