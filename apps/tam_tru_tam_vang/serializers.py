from rest_framework import serializers
from .models import PhieuTamTruTamVang
from apps.nhan_khau.models import BienDongNhanKhau


class PhieuTamTruTamVangSerializer(serializers.ModelSerializer):
    nhan_khau_ho_ten = serializers.CharField(source='nhan_khau.ho_ten', read_only=True)
    nhan_khau_cccd = serializers.CharField(source='nhan_khau.so_cccd', read_only=True)
    dang_hieu_luc = serializers.BooleanField(read_only=True)

    class Meta:
        model = PhieuTamTruTamVang
        fields = [
            'id',
            'nhan_khau',
            'nhan_khau_ho_ten',
            'nhan_khau_cccd',
            'loai_phieu',
            'ngay_bat_dau',
            'ngay_ket_thuc',
            'ly_do',
            'dia_chi_tam_tru',
            'ghi_chu',
            'dang_hieu_luc',
            'trang_thai',
            'created_at',
            'updated_at',
        ]
