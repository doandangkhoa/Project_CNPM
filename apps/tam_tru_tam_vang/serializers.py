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
        ]

    def create(self, validated_data):
        phieu = PhieuTamTruTamVang.objects.create(**validated_data)

        BienDongNhanKhau.objects.create(
            nhan_khau=validated_data['nhan_khau'],
            loai_bien_dong='TAM_TRU' if validated_data['loai_phieu'] == 'tam_tru' else 'TAM_VANG',
            mo_ta=validated_data.get('ly_do', ""),
        )
        return phieu
