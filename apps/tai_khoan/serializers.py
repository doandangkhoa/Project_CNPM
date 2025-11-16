from rest_framework import serializers
from apps.tai_khoan.models import TaiKhoan
from django.contrib.auth.hashers import check_password

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
        fields = ['id', 'username', 'email', 'role', 'role_hien_thi', 'chuc_vu', 'chuc_vu_hien_thi', 'is_active', 'date_joined']
        
class ManageUserPermissionsSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=TaiKhoan.ROLE_CHOICES, required=False)
    chuc_vu = serializers.ChoiceField(choices=TaiKhoan.CHUC_VU, required=False, allow_null=True)

    class Meta:
        model = TaiKhoan
        fields = [
            'username',
            'email',
            'role',
            'chuc_vu',
            'is_active',
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
        }

    def validate(self, attrs):
        role = attrs.get('role', self.instance.role)
        chuc_vu = attrs.get('chuc_vu', self.instance.chuc_vu)

        # Người dân không có chức vụ
        if role == 'nguoi_dan' and chuc_vu is not None:
            raise serializers.ValidationError("Người dân không có chức vụ.")

        return attrs

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        # Cập nhật role
        new_role = validated_data.get('role', instance.role)
        instance.role = new_role

        # Nếu role là người dân → xóa chức vụ
        if new_role == 'nguoi_dan':
            instance.chuc_vu = None
        else:
            instance.chuc_vu = validated_data.get('chuc_vu', instance.chuc_vu)

        instance.is_active = validated_data.get('is_active', instance.is_active)

        instance.save()
        return instance

class ChangePassWordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['user']
        old = attrs.get('old_password')
        new = attrs.get('new_password')

        # Kiểm tra mật khẩu cũ
        if not check_password(old, user.password):
            raise serializers.ValidationError("Mật khẩu cũ không chính xác.")

        # Kiểm tra mật khẩu mới
        if len(new) < 6:
            raise serializers.ValidationError("Mật khẩu mới phải ít nhất 6 ký tự.")

        if old == new:
            raise serializers.ValidationError("Mật khẩu mới không được trùng với mật khẩu cũ.")

        return attrs
    