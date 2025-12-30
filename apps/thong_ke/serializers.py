from rest_framework import serializers
from .models import ThongKeNhanKhau
from apps.tai_khoan.models import TaiKhoan

class TaiKhoanSerializer(serializers.ModelSerializer):
    chuc_vu_display = serializers.CharField(source='get_chuc_vu_display', read_only=True)
    ho_ten = serializers.SerializerMethodField()
    
    def get_ho_ten(self, obj):
        """Return full name or username as fallback"""
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username
    
    class Meta:
        model = TaiKhoan
        fields = ['id', 'username', 'first_name', 'last_name', 'ho_ten', 'chuc_vu', 'chuc_vu_display']

class ThongKeNhanKhauSerializer(serializers.ModelSerializer):
    ten_nguoi_tao = serializers.SerializerMethodField()
    nguoi_tao = serializers.SerializerMethodField()

    def get_ten_nguoi_tao(self, obj):
        if obj.nguoi_tao:
            return str(obj.nguoi_tao)
        return "Hệ thống"

    def get_nguoi_tao(self, obj):
        if obj.nguoi_tao:
            return TaiKhoanSerializer(obj.nguoi_tao).data
        return None

    class Meta:
        model = ThongKeNhanKhau
        fields = '__all__'
        
        # Thiết lập các trường chỉ đọc (Frontend không được phép gửi dữ liệu lên để sửa các số này)
        read_only_fields = [
            'id', 
            'ngay_thong_ke', 
            'nguoi_tao',
            'tong_nhan_khau', 
            'so_nam', 'so_nu',
            'mam_non', 'mau_giao', 'cap_1', 'cap_2', 'cap_3', 'lao_dong', 'nghi_huu',
            'tam_tru', 'tam_vang', 'nguoi_tao', 'ten_nguoi_tao'
        ]