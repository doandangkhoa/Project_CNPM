from rest_framework import serializers
from .models import NhanKhau, BienDongNhanKhau
from apps.can_bo.models import CanBo

class NhanKhauSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhanKhau
        fields = '__all__'
        
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
        # user was calling api 
        user = self.context['request'].user
        try:
            can_bo = CanBo.objects.get(tai_khoan=user)    
        except CanBo.DoesNotExist:
            raise serializers.ValidationError("Người dùng hiện tại không phải cán bộ")
        
        validated_data['can_bo_thuc_hien'] = can_bo
        return super().create(validated_data)     # saving to database 

    # {
    # "nhan_khau": 5,
    # "ho_khau": 2,
    # "loai_bien_dong": "CAP_NHAT",
    # "mo_ta": "Cập nhật nghề nghiệp và nơi làm việc"
    # }