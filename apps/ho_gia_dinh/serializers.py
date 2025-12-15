from rest_framework import serializers
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.nhan_khau.models import NhanKhau
from datetime import date

# --- 1. Serializer Input (Giữ nguyên) ---
class HoGiaDinhCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoGiaDinh
        fields = '__all__'
        extra_kwargs = {
            'so_ho_khau': {'required': True},
            'ho_ten_chu_ho': {'required': True},
            'id_chu_ho': {'required': False, 'allow_null': True},
            'dia_chi': {'required': True},
            'phuong_xa': {'required': True},
            'so_dien_thoai': {'required': False, 'allow_null': True},
            'ghi_chu': {'required': False, 'allow_null': True},
        }

# --- 2. Serializer Thành viên ---
class ThanhVienSerializer(serializers.ModelSerializer):
    gioi_tinh_hien_thi = serializers.CharField(source='get_gioi_tinh_display', read_only=True)
    quan_he_voi_chu_ho_display = serializers.CharField(source='get_quan_he_voi_chu_ho_display', read_only=True)
    tuoi = serializers.SerializerMethodField()

    class Meta:
        model = NhanKhau
        fields = [
            'id',
            'ho_ten',
            'ngay_sinh',
            'gioi_tinh',            
            'gioi_tinh_hien_thi',   
            'quan_he_voi_chu_ho',           
            'quan_he_voi_chu_ho_display',   
            'so_cccd',
            'tuoi',
            'trang_thai'
        ]

    def get_tuoi(self, obj):
        if obj.ngay_sinh:
            today = date.today()
            return today.year - obj.ngay_sinh.year - ((today.month, today.day) < (obj.ngay_sinh.month, obj.ngay_sinh.day))
        return None

# --- 3. Serializer Hộ Gia Đình (Đã cập nhật theo related_name="nhan_khau") ---
class HoGiaDinhSerializer(serializers.ModelSerializer):
    ten_chu_ho_thuc = serializers.CharField(source='id_chu_ho.ho_ten', read_only=True, default="Chưa định danh")
    so_luong_thanh_vien = serializers.SerializerMethodField()
    danh_sach_thanh_vien = ThanhVienSerializer(source='nhan_khau', many=True, read_only=True)
    
    class Meta:
        model = HoGiaDinh
        fields = [
            'id', 
            'so_ho_khau', 
            'ho_ten_chu_ho',
            'id_chu_ho',
            'ten_chu_ho_thuc', # Dùng để đối chiếu với tên chủ hộ mà cán bộ nhập vào (trên màn hình)
            'so_dien_thoai', 
            'dia_chi', 
            'phuong_xa', 
            'ngay_tao', 
            'ghi_chu',
            'so_luong_thanh_vien',
            'danh_sach_thanh_vien'
        ]

        read_only_fields = ['id', 'ngay_tao', 'ten_chu_ho_thuc', 'so_luong_thanh_vien', 'danh_sach_thanh_vien']
    
    def get_so_luong_thanh_vien(self, obj):
        return obj.nhan_khau.count()