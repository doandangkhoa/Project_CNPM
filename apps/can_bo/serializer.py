from rest_framework import serializers
from .models import CanBo

class CanBoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='tai_khoan.username', read_only=True)
    
    class Meta:
        model = CanBo
        fields = ['id', 'username', 'chuc_danh', 'so_dien_thoai', 'nhiem_vu_phu_trach', 'ngay_nhan_chuc']
         