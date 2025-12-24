from rest_framework import serializers
from .models import LichSinhHoat, ThamGiaSinhHoat
from apps.ho_gia_dinh.models import HoGiaDinh

class LichSinhHoatSerializer(serializers.ModelSerializer):
    # Hiển thị thêm tên người tạo cho rõ ràng (nếu có)
    ten_nguoi_tao = serializers.CharField(source='nguoi_tao.ho_ten', read_only=True)
    
    # Đếm nhanh số hộ tham gia để hiển thị ra list
    so_luong_tham_gia = serializers.SerializerMethodField()

    class Meta:
        model = LichSinhHoat
        fields = [
            'id',
            'chu_de',
            'ngay_to_chuc',
            'gio_to_chuc',
            'dia_diem',
            'noi_dung',
            'ghi_chu',
            'nguoi_tao',
            'created_at',
            'so_luong_tham_gia',
            'ten_nguoi_tao',
		]

    def get_so_luong_tham_gia(self, obj):
        # Đếm số bản ghi có da_tham_gia = True
        return obj.thamgiasinhhoat_set.filter(da_tham_gia=True).count()

class ThamGiaSinhHoatSerializer(serializers.ModelSerializer):
    # Lấy thông tin hộ gia đình để hiển thị lên bảng điểm danh
    ten_chu_ho = serializers.CharField(source='ho_gia_dinh.ho_ten_chu_ho', read_only=True)
    so_ho_khau = serializers.CharField(source='ho_gia_dinh.so_ho_khau', read_only=True)
    dia_chi = serializers.CharField(source='ho_gia_dinh.dia_chi', read_only=True)

    class Meta:
        model = ThamGiaSinhHoat
        fields = ['id', 'lich_sinh_hoat', 'ho_gia_dinh', 'ten_chu_ho', 'so_ho_khau', 'dia_chi', 'da_tham_gia']