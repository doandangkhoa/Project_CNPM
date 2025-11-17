# apps/api/nhan_khau/serializers.py
from rest_framework import serializers
from apps.nhan_khau.models import NhanKhau, BienDongNhanKhau


class BienDongNhanKhauSerializer(serializers.ModelSerializer):
    loai_hien_thi = serializers.CharField(source='get_loai_bien_dong_display')
    ngay = serializers.DateTimeField(source='ngay_thay_doi', format='%d/%m/%Y %H:%M')

    class Meta:
        model = BienDongNhanKhau
        fields = ['loai_hien_thi', 'mo_ta', 'ngay']


class NhanKhauSerializer(serializers.ModelSerializer):
    tuoi = serializers.SerializerMethodField()
    gioi_tinh_hien_thi = serializers.CharField(source='get_gioi_tinh_display')
    trang_thai_hien_thi = serializers.CharField(source='get_trang_thai_display')
    ten_ho_khau = serializers.CharField(source='ho_gia_dinh.so_ho_khau', read_only=True)
    dia_chi_ho_khau = serializers.CharField(source='ho_gia_dinh.dia_chi', read_only=True, allow_null=True, default='')

    bien_dong = BienDongNhanKhauSerializer(many=True, read_only=True, source='bien_dong_nhan_khau')

    class Meta:
        model = NhanKhau
        fields = [
            'id', 'ho_ten', 'bi_danh', 'so_cccd', 'gioi_tinh', 'gioi_tinh_hien_thi',
            'ngay_sinh', 'tuoi', 'noi_sinh', 'nguyen_quan', 'dan_toc',
            'nghe_nghiep', 'quan_he_voi_chu_ho', 'trang_thai', 'trang_thai_hien_thi',
            'ten_ho_khau', 'dia_chi_ho_khau', 'ghi_chu', 'bien_dong'
        ]

    def get_tuoi(self, obj):
        from datetime import date
        if not obj.ngay_sinh:
            return None
        today = date.today()
        age = today.year - obj.ngay_sinh.year - (
            (today.month, today.day) < (obj.ngay_sinh.month, obj.ngay_sinh.day)
        )
        return age