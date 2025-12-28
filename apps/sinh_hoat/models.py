from django.db import models
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.can_bo.models import CanBo 

class LichSinhHoat(models.Model):
    TRANG_THAI_CHOICES = [
        ('chua_dien_ra', 'Chưa diễn ra'),
        ('dang_dien_ra', 'Đang diễn ra'),
        ('da_ket_thuc', 'Đã kết thúc'),
    ]
    
    chu_de = models.CharField(max_length=255)
    ngay_to_chuc = models.DateField()
    gio_to_chuc = models.TimeField()
    dia_diem = models.CharField(max_length=255)
    noi_dung = models.TextField()
    ghi_chu = models.TextField(null=True, blank=True)
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_CHOICES, default='chua_dien_ra')
    nguoi_tao = models.ForeignKey(CanBo, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.chu_de} ({self.ngay_to_chuc})"
    
    class Meta:
        ordering = ['-ngay_to_chuc', '-gio_to_chuc']

class ThamGiaSinhHoat(models.Model):
    ho_gia_dinh = models.ForeignKey(HoGiaDinh, on_delete=models.CASCADE, related_name='tham_gia_hoat_dong')
    lich_sinh_hoat = models.ForeignKey(LichSinhHoat, on_delete=models.CASCADE, related_name='danh_sach_tham_gia')
    da_tham_gia = models.BooleanField(default=False)
    ngay_tham_gia = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('ho_gia_dinh', 'lich_sinh_hoat')

    def __str__(self):
        return f"{self.ho_gia_dinh.ho_ten_chu_ho} - {self.lich_sinh_hoat.chu_de}"

class ThuMoiSinhHoat(models.Model):
    """Model để quản lý việc gửi thư mời cho các hộ gia đình"""
    TRANG_THAI_THU_MOI = [
        ('chua_gui', 'Chưa gửi'),
        ('da_gui', 'Đã gửi'),
        ('da_xem', 'Đã xem'),
        ('da_phan_hoi', 'Đã phản hồi'),
    ]
    
    lich_sinh_hoat = models.ForeignKey(LichSinhHoat, on_delete=models.CASCADE, related_name='danh_sach_thu_moi')
    ho_gia_dinh = models.ForeignKey(HoGiaDinh, on_delete=models.CASCADE, related_name='thu_moi_sinh_hoat')
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_THU_MOI, default='chua_gui')
    ngay_gui = models.DateTimeField(auto_now_add=True)
    ngay_xem = models.DateTimeField(null=True, blank=True)
    phan_hoi_tham_gia = models.BooleanField(null=True, blank=True)  # True: sẽ đi, False: không đi
    ngay_phan_hoi = models.DateTimeField(null=True, blank=True)
    ghi_chu = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('lich_sinh_hoat', 'ho_gia_dinh')
        ordering = ['-ngay_gui']

    def __str__(self):
        return f"Thư mời: {self.ho_gia_dinh.ho_ten_chu_ho} - {self.lich_sinh_hoat.chu_de}"

class ChungChiGiaDinhVanHoa(models.Model):
    """Model để quản lý chứng chỉ "Gia đình văn hóa" dựa trên tham gia hoạt động"""
    NAM_CHOICES = [(year, str(year)) for year in range(2020, 2030)]
    
    ho_gia_dinh = models.ForeignKey(HoGiaDinh, on_delete=models.CASCADE, related_name='chung_chi_gia_dinh_van_hoa')
    nam = models.IntegerField(choices=NAM_CHOICES)
    so_lan_tham_gia = models.IntegerField(default=0)
    tong_so_buoi_sinh_hoat = models.IntegerField(default=0, help_text="Tổng số buổi sinh hoạt trong năm")
    tieu_chi_tham_gia = models.IntegerField(default=80, help_text="Tỷ lệ tham gia tối thiểu (%)")
    dat_chuan = models.BooleanField(default=False)
    ghi_chu = models.TextField(null=True, blank=True)
    ngay_cap = models.DateTimeField(auto_now_add=True)
    ngay_sua = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('ho_gia_dinh', 'nam')
        ordering = ['-nam']

    def __str__(self):
        trang_thai = "Đạt" if self.dat_chuan else "Chưa đạt"
        return f"{self.ho_gia_dinh.ho_ten_chu_ho} - {self.nam} ({trang_thai})"

