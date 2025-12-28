from rest_framework import serializers
from .models import ThongKeNhanKhau

class ThongKeNhanKhauSerializer(serializers.ModelSerializer):
    ten_nguoi_tao = serializers.CharField(source='nguoi_tao.__str__', read_only=True, default="Hệ thống")

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
            'tam_tru', 'tam_vang'
        ]