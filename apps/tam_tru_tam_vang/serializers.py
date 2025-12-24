from rest_framework import serializers
from .models import PhieuTamTruTamVang
from apps.nhan_khau.models import BienDongNhanKhau


class PhieuTamTruTamVangSerializer(serializers.ModelSerializer):
    nhan_khau_ho_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    dang_hieu_luc = serializers.BooleanField(read_only=True)

    class Meta:
        model = PhieuTamTruTamVang
        fields = [
            'id',
            'nhan_khau',
            'nhan_khau_ho_ten',
            'loai_phieu',
            'ngay_bat_dau',
            'ngay_ket_thuc',
            'ly_do',
            'dia_chi_tam_tru',
            'ghi_chu',
            'dang_hieu_luc',
            'trang_thai',
        ]

    def create(self, validated_data):
        # Luôn tạo phiếu với trạng thái 'cho_duyet'
        validated_data['trang_thai'] = 'cho_duyet'
        phieu = PhieuTamTruTamVang.objects.create(**validated_data)
        # Không tạo biến động nhân khẩu ở đây, chỉ tạo khi duyệt
        return phieu
