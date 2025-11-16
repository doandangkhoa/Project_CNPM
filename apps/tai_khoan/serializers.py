from rest_framework import serializers
from apps.tai_khoan.models import TaiKhoan


# Serializer dùng khi đăng ký
class TaiKhoanRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = TaiKhoan
        # Người dân đăng ký, role mặc định là 'nguoi_dan', chuc_vu không cần
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        """
        Ghi đè create để đảm bảo mật khẩu được hash đúng cách.
        """
        user = TaiKhoan.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role='nguoi_dan',
            chuc_vu=None
        )
        return user


# Serializer trả về thông tin chi tiết user (ẩn mật khẩu)
class TaiKhoanDetailSerializer(serializers.ModelSerializer):
    role_hien_thi = serializers.CharField(source='get_role_display', read_only=True)
    chuc_vu_hien_thi = serializers.CharField(source='get_chuc_vu_display', read_only=True)
    class Meta:
        model = TaiKhoan
        fields = ['id', 'username', 'email', 'role', 'rol_hien_thi', 'chuc_vu', 'chuc_vu_hien_thi', 'is_active', 'date_joined']


# Serializer cho admin (CRUD đầy đủ)
class TaiKhoanAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaiKhoan
        fields = '__all__'

class ManageUserPermissionsSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=TaiKhoan.ROLE_CHOICES, required=False)
    chuc_vu = serializers.ChoiceField(choices=TaiKhoan.CHUC_VU, required=False, allow_null=True)

    class Meta:
        model = TaiKhoan
        fields = ['role', 'chuc_vu']

    def validate(self, attrs):
        role = attrs.get('role', self.instance.role)
        chuc_vu = attrs.get('chuc_vu', self.instance.chuc_vu)

        # Nếu role là người dân thì chuc_vu phải None
        if role == 'nguoi_dan' and chuc_vu is not None:
            raise serializers.ValidationError("Người dân không có chức vụ.")
        return attrs

    def update(self, instance, validated_data):
        role = validated_data.get('role', instance.role)
        chuc_vu = validated_data.get('chuc_vu', instance.chuc_vu)

        instance.role = role
        instance.chuc_vu = chuc_vu if role == 'can_bo' else None
        instance.save()
        return instance