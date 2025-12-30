from rest_framework import serializers
from .models import NhanKhau, BienDongNhanKhau, TamTru, TamVang, BaoCaiThongTin, XinCapGiayXacNhan
from apps.can_bo.models import CanBo
from apps.ho_gia_dinh.models import HoGiaDinh
from django.db import transaction # Cần cái này để đảm bảo dữ liệu toàn vẹn

class NhanKhauCreateUpdateSerializer(serializers.ModelSerializer):
    # Allow frontend to send household name to find and link the household
    ten_ho_khau = serializers.CharField(write_only=True, required=False, allow_blank=True)
    dia_chi_ho_khau = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # Fields for BienDongNhanKhau when status changes
    ngay_bat_dau = serializers.DateField(write_only=True, required=False, allow_null=True)
    ngay_ket_thuc = serializers.DateField(write_only=True, required=False, allow_null=True)
    noi_chuyen = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = NhanKhau
        fields = ['id', 'ho_ten', 'bi_danh', 'gioi_tinh', 'ngay_sinh', 'noi_sinh', 'nguyen_quan', 
                  'dan_toc', 'nghe_nghiep', 'noi_lam_viec', 'so_cccd', 'ngay_cap', 'noi_cap',
                  'quan_he_voi_chu_ho', 'thoi_gian_dang_ki_thuong_tru', 'dia_chi_thuong_tru_truoc_day',
                  'trang_thai', 'ghi_chu', 'ho_gia_dinh',
                  'created_at', 'updated_at', 'ten_ho_khau', 'dia_chi_ho_khau',
                  'ngay_bat_dau', 'ngay_ket_thuc', 'noi_chuyen']
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
            'ngay_bat_dau': {'required': False, 'allow_null': True},
            'ngay_ket_thuc': {'required': False, 'allow_null': True},
            'noi_chuyen': {'required': False, 'allow_blank': True, 'allow_null': True},
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def create(self, validated_data):
        # Extract household name if provided
        ten_ho_khau = validated_data.pop('ten_ho_khau', None)
        dia_chi_ho_khau = validated_data.pop('dia_chi_ho_khau', None)
        # Extract BienDongNhanKhau related fields (not part of NhanKhau model)
        ngay_bat_dau = validated_data.pop('ngay_bat_dau', None)
        ngay_ket_thuc = validated_data.pop('ngay_ket_thuc', None)
        noi_chuyen = validated_data.pop('noi_chuyen', None)
        
        # Find and link household if household name is provided
        if ten_ho_khau:
            try:
                ho_gia_dinh = HoGiaDinh.objects.get(ho_ten_chu_ho=ten_ho_khau)
                validated_data['ho_gia_dinh'] = ho_gia_dinh
            except HoGiaDinh.DoesNotExist:
                raise serializers.ValidationError(f"Không tìm thấy hộ khẩu '{ten_ho_khau}'")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Extract household name if provided
        ten_ho_khau = validated_data.pop('ten_ho_khau', None)
        dia_chi_ho_khau = validated_data.pop('dia_chi_ho_khau', None)
        # Extract BienDongNhanKhau related fields
        ngay_bat_dau = validated_data.pop('ngay_bat_dau', None)
        ngay_ket_thuc = validated_data.pop('ngay_ket_thuc', None)
        noi_chuyen = validated_data.pop('noi_chuyen', None)
        
        # Find and link household if household name is provided
        if ten_ho_khau:
            try:
                ho_gia_dinh = HoGiaDinh.objects.get(ho_ten_chu_ho=ten_ho_khau)
                validated_data['ho_gia_dinh'] = ho_gia_dinh
            except HoGiaDinh.DoesNotExist:
                raise serializers.ValidationError(f"Không tìm thấy hộ khẩu '{ten_ho_khau}'")
        
        # Detect status changes and create corresponding BienDongNhanKhau record
        old_status = instance.trang_thai
        old_status_display = instance.get_trang_thai_display()
        new_status = validated_data.get('trang_thai', old_status)
        with transaction.atomic():
            # Update the instance
            updated_instance = super().update(instance, validated_data)
            
            # If status changed, create a BienDongNhanKhau record
            if old_status != new_status:
                loai_bien_dong_map = {
                    'da_chet': 'KHAI_TU',
                    'chuyen_di': 'CHUYEN_DI',
                    'tam_vang': 'TAM_VANG',
                    'tam_tru': 'TAM_TRU',
                    'thuong_tru': 'CHUYEN_DEN',  # Chuyển từ tạm thú sang thường trú
                }
                new_status_display = updated_instance.get_trang_thai_display()
                loai_bien_dong = loai_bien_dong_map.get(new_status)
                if loai_bien_dong:
                    # Tạo mô tả phù hợp với loại biến động
                    if loai_bien_dong == 'KHAI_TU':
                        mo_ta = f"{updated_instance.ho_ten} đã qua đời."
                    elif loai_bien_dong == 'CHUYEN_DI':
                        noi_chuyen_text = noi_chuyen or "chưa xác định"
                        mo_ta = f"{updated_instance.ho_ten} chuyển đi {noi_chuyen_text}."
                    elif loai_bien_dong == 'TAM_VANG':
                        mo_ta = f"{updated_instance.ho_ten} đăng ký tạm vắng."
                    elif loai_bien_dong == 'TAM_TRU':
                        mo_ta = f"{updated_instance.ho_ten} đăng ký tạm trú."
                    elif loai_bien_dong == 'CHUYEN_DEN':
                        mo_ta = f"{updated_instance.ho_ten} chuyển đến."
                    else:
                        mo_ta = f"Thay đổi trạng thái từ {old_status_display} sang {new_status_display}."
                        
                    BienDongNhanKhau.objects.create(
                        nhan_khau=updated_instance,
                        ho_khau=updated_instance.ho_gia_dinh,
                        loai_bien_dong=loai_bien_dong,
                        mo_ta=mo_ta,
                        ngay_bat_dau=ngay_bat_dau,
                        ngay_ket_thuc=ngay_ket_thuc,
                        noi_chuyen=noi_chuyen
                    )
        
        return updated_instance
        
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
                  'ngay_bat_dau',
                  'ngay_ket_thuc',
                  'noi_chuyen',
                  'ngay_chuyen_di',
                  'thoi_gian'
        ]
        # frontend không cần gửi các fields này 
        read_only_fields = ['id', 'thoi_gian', 'nhan_khau_ten',
                            'loai_bien_dong_hien_thi']
        extra_kwargs = {
            'ngay_bat_dau': {'required': False, 'allow_null': True},
            'ngay_ket_thuc': {'required': False, 'allow_null': True},
            'noi_chuyen': {'required': False, 'allow_blank': True},
            'ngay_chuyen_di': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
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
        fields = '_all_'

class TamVangSerializer(serializers.ModelSerializer):
    nhan_khau_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)

    class Meta:
        model = TamVang
        fields = '_all_'

class BaoCaiThongTinSerializer(serializers.ModelSerializer):
    nhan_khau_ho_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    nhan_khau_cccd = serializers.CharField(source='nhan_khau.so_cccd', read_only=True)

    class Meta:
        model = BaoCaiThongTin
        fields = [
            'id',
            'nhan_khau',
            'nhan_khau_ho_ten',
            'nhan_khau_cccd',
            'ngay_bat_dau',
            'cac_truong_loi',
            'ly_do',
            'ghi_chu',
            'trang_thai',
            'created_at',
            'updated_at',
        ]

    def create(self, validated_data):
        # Luôn tạo báo cáo với trạng thái 'cho_duyet'
        validated_data['trang_thai'] = 'cho_duyet'
        bao_cao = BaoCaiThongTin.objects.create(**validated_data)
        return bao_cao

class XinCapGiayXacNhanSerializer(serializers.ModelSerializer):
    nhan_khau_ho_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    nhan_khau_cccd = serializers.CharField(source='nhan_khau.so_cccd', read_only=True)

    class Meta:
        model = XinCapGiayXacNhan
        fields = [
            'id',
            'nhan_khau',
            'nhan_khau_ho_ten',
            'nhan_khau_cccd',
            'loai_giay',
            'so_luong',
            'ly_do',
            'ghi_chu',
            'trang_thai',
            'created_at',
            'updated_at',
        ]

    def create(self, validated_data):
        # Luôn tạo yêu cầu với trạng thái 'cho_duyet'
        validated_data['trang_thai'] = 'cho_duyet'
        xin_cap = XinCapGiayXacNhan.objects.create(**validated_data)
        return xin_cap