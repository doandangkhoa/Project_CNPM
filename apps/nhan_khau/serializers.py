from rest_framework import serializers
from .models import NhanKhau, BienDongNhanKhau, TamTru, TamVang
from apps.can_bo.models import CanBo
from django.db import transaction # Cần cái này để đảm bảo dữ liệu toàn vẹn

class NhanKhauCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhanKhau
        fields = '__all__'
        
class BienDongNhanKhauSerializer(serializers.ModelSerializer):
    nhan_khau_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    loai_bien_dong_hien_thi = serializers.CharField(source='get_loai_bien_dong_display', read_only=True)
    can_bo_thuc_hien_ten = serializers.CharField(source='can_bo_thuc_hien.tai_khoan.username', read_only=True)
    
    class Meta:
        model = BienDongNhanKhau
        fields = ['id',
                  'nhan_khau',
                  'nhan_khau_ten',
                  'ho_khau',
                  'can_bo_thuc_hien',
                  'can_bo_thuc_hien_ten',
                  'loai_bien_dong',
                  'loai_bien_dong_hien_thi',
                  'mo_ta',
                  'ngay_thay_doi'
        ]
        # frontend không cần gửi các fields này 
        read_only_fields = ['ngay_thay_doi', 'can_bo_thuc_hien', 'nhan_khau_ten',
                            'loai_bien_dong_hien_thi', 'can_bo_thuc_hien_ten']
    
    def create(self, validated_data):
        # user called api 
        user = self.context['request'].user
        try:
            can_bo = CanBo.objects.get(tai_khoan=user)    
        except CanBo.DoesNotExist:
            raise serializers.ValidationError("Người dùng hiện tại không phải cán bộ")
        
        validated_data['can_bo_thuc_hien'] = can_bo
        loai_bien_dong = validated_data.get('loai_bien_dong')
        nhan_khau = validated_data.get('nhan_khau')
        ghi_chu = validated_data.get('mo_ta', '')
        
        with transaction.atomic(): # Đảm bảo cả 2 hành động cùng thành công
            # Tạo record biến động
            instance = super().create(validated_data)

            if loai_bien_dong == 'KHAI_TU':
                nhan_khau.trang_thai = 'chet'
                nhan_khau.ghi_chu = "Đã qua đời" 
                nhan_khau.ngay_xoa = instance.ngay_thay_doi
                nhan_khau.save()
            
            elif loai_bien_dong == 'CHUYEN_KHAU':
                nhan_khau.trang_thai = 'chuyen_di'
                nhan_khau.ghi_chu = f"Chuyển đi: {ghi_chu}"
                nhan_khau.save()
                
            elif loai_bien_dong == 'TAM_VANG':
                nhan_khau.trang_thai = 'tam_vang'
                nhan_khau.ghi_chu = f"Đang tạm vắng: {ghi_chu}"
                nhan_khau.save()
            
            elif loai_bien_dong == 'TAM_TRU':
                nhan_khau.trang_thai = 'tam_tru'
                nhan_khau.ghi_chu = f"Đang tạm trú: {ghi_chu}"
                nhan_khau.save()

        return instance

    # {
    # "nhan_khau": 5,
    # "ho_khau": 2,
    # "loai_bien_dong": "CAP_NHAT",
    # "mo_ta": "Cập nhật nghề nghiệp và nơi làm việc"
    # }

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
    
class TamTruSerializer(serializers.ModelSerializer):
    nhan_khau_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    
    class Meta:
        model = TamTru
        fields = '__all__'

class TamVangSerializer(serializers.ModelSerializer):
    nhan_khau_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)

    class Meta:
        model = TamVang
        fields = '__all__'