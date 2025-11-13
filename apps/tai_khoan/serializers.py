from rest_framework import serializers
from apps.tai_khoan.models import TaiKhoan


# Serializer dùng khi đăng ký
class TaiKhoanRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = TaiKhoan
        fields = ['username', 'email', 'password', 'chuc_vu']

    def create(self, validated_data):
        """
        Ghi đè create để đảm bảo mật khẩu được hash đúng cách.
        """
        user = TaiKhoan.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            chuc_vu=validated_data.get('chuc_vu', 'can_bo')
        )
        return user


# Serializer trả về thông tin chi tiết user (ẩn mật khẩu)
class TaiKhoanDetailSerializer(serializers.ModelSerializer):
    chuc_vu_hien_thi = serializers.CharField(source='get_chuc_vu_display', read_only=True)

    class Meta:
        model = TaiKhoan
        fields = ['id', 'username', 'email', 'chuc_vu', 'chuc_vu_hien_thi', 'is_active', 'date_joined']


# Serializer cho admin (nếu bạn cần thao tác CRUD đầy đủ)
class TaiKhoanAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaiKhoan
        fields = '__all__'