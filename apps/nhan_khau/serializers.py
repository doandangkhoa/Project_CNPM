from rest_framework import serializers
from .models import NhanKhau, BienDongNhanKhau, TamTru, TamVang
from apps.can_bo.models import CanBo
from django.db import transaction # Cần cái này để đảm bảo dữ liệu toàn vẹn

class NhanKhauCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhanKhau
        fields = '__all__'
        extra_kwargs = {
            'ho_ten': {'required': False},
            'bi_danh': {'required': False, 'allow_blank': True},
            'so_cccd': {'required': False, 'allow_blank': True},
            'gioi_tinh': {'required': False},
            'ngay_sinh': {'required': False, 'allow_null': True},
            'noi_sinh': {'required': False, 'allow_blank': True},
            'nguyen_quan': {'required': False, 'allow_blank': True},
            'dan_toc': {'required': False, 'allow_blank': True},
            'nghe_nghiep': {'required': False, 'allow_blank': True},
            'noi_lam_viec': {'required': False, 'allow_blank': True},
            'ngay_cap': {'required': False, 'allow_null': True},
            'noi_cap': {'required': False, 'allow_blank': True},
            'thoi_gian_dang_ki_thuong_tru': {'required': False, 'allow_null': True},
            'quan_he_voi_chu_ho': {'required': False, 'allow_blank': True},
            'trang_thai': {'required': False},
            'ghi_chu': {'required': False, 'allow_blank': True},
            'ho_gia_dinh': {'required': False, 'allow_null': True},
            'ngay_chuyen_di': {'required': False, 'allow_null': True},
            'noi_chuyen': {'required': False, 'allow_blank': True},
        }
        
class BienDongNhanKhauSerializer(serializers.ModelSerializer):
    nhan_khau_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    loai_bien_dong_hien_thi = serializers.CharField(source='get_loai_bien_dong_display', read_only=True)
    
    class Meta:
        model = BienDongNhanKhau
        fields = ['id',
                  'nhan_khau',
                  'nhan_khau_ten',
                  'ho_khau',
                  'loai_bien_dong',
                  'loai_bien_dong_hien_thi',
                  'mo_ta',
                  'thoi_gian'
        ]
        # frontend không cần gửi các fields này 
        read_only_fields = ['id', 'thoi_gian', 'nhan_khau_ten',
                            'loai_bien_dong_hien_thi']
    
    def create(self, validated_data):
        # user called api 
        user = self.context['request'].user
        # Only allow cán bộ positions (tổ trưởng, tổ phó, cán bộ) or superuser
        allowed_positions = ['to_truong', 'to_pho', 'can_bo']
        if not (user.is_superuser or (getattr(user, 'role', None) == 'can_bo' and getattr(user, 'chuc_vu', None) in allowed_positions)):
            raise serializers.ValidationError("Người dùng hiện tại không có quyền")

        loai_bien_dong = validated_data.get('loai_bien_dong')
        nhan_khau = validated_data.get('nhan_khau')
        ho_khau = validated_data.get('ho_khau', None)
        ghi_chu = validated_data.get('mo_ta', '')
        
        with transaction.atomic(): # Đảm bảo cả 2 hành động cùng thành công
            # Tạo record biến động
            instance = super().create(validated_data)

            if loai_bien_dong == 'KHAI_TU':
                nhan_khau.trang_thai = 'da_chet'
                nhan_khau.ghi_chu = "Đã qua đời"
                nhan_khau.save()
            
            elif loai_bien_dong == 'CHUYEN_DI':
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
                
            elif loai_bien_dong == 'THAY_DOI_CHU_HO':
                if ho_khau:
                    ho_khau.id_chu_ho = nhan_khau # Gán nhân khẩu này làm chủ hộ
                    ho_khau.save()
                    nhan_khau.quan_he_voi_chu_ho = 'Chu Ho'
                else:
                    raise serializers.ValidationError({"ho_khau": "Cần chọn hộ khẩu để thay đổi chủ hộ."})

            elif loai_bien_dong in ['MOI_SINH', 'CHUYEN_DEN']:
                nhan_khau.trang_thai = 'thuong_tru'
                if ho_khau:
                    nhan_khau.ho_gia_dinh = ho_khau

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
            'ngay_cap', 'noi_cap', 'noi_lam_viec',
            'nghe_nghiep', 'quan_he_voi_chu_ho', 'trang_thai', 'trang_thai_hien_thi',
            'thoi_gian_dang_ki_thuong_tru', 'dia_chi_thuong_tru_truoc_day',
            'ngay_chuyen_di', 'noi_chuyen',
            'ten_ho_khau', 'dia_chi_ho_khau', 'ho_gia_dinh',
            'ghi_chu', 'created_at', 'updated_at', 'bien_dong'
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