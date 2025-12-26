from rest_framework import serializers
from .models import LichSinhHoat, ThamGiaSinhHoat, ThuMoiSinhHoat, ChungChiGiaDinhVanHoa
from apps.ho_gia_dinh.models import HoGiaDinh

class LichSinhHoatSerializer(serializers.ModelSerializer):
    # Hiển thị thêm tên người tạo cho rõ ràng (nếu có)
    ten_nguoi_tao = serializers.CharField(source='nguoi_tao.ho_ten', read_only=True)
    
    # Đếm nhanh số hộ tham gia để hiển thị ra list
    so_luong_tham_gia = serializers.SerializerMethodField()
    so_luong_thu_moi = serializers.SerializerMethodField()

    class Meta:
        model = LichSinhHoat
        fields = [
            'id',
            'chu_de',
            'ngay_to_chuc',
            'gio_to_chuc',
            'dia_diem',
            'noi_dung',
            'ghi_chu',
            'trang_thai',
            'nguoi_tao',
            'created_at',
            'updated_at',
            'so_luong_tham_gia',
            'so_luong_thu_moi',
            'ten_nguoi_tao',
		]

    def get_so_luong_tham_gia(self, obj):
        # Đếm số bản ghi có da_tham_gia = True
        return obj.danh_sach_tham_gia.filter(da_tham_gia=True).count()
    
    def get_so_luong_thu_moi(self, obj):
        # Đếm số thư mời đã gửi
        return obj.danh_sach_thu_moi.filter(trang_thai='da_gui').count()

class ThamGiaSinhHoatSerializer(serializers.ModelSerializer):
    # Lấy thông tin hộ gia đình để hiển thị lên bảng điểm danh
    ten_chu_ho = serializers.CharField(source='ho_gia_dinh.ho_ten_chu_ho', read_only=True)
    so_ho_khau = serializers.CharField(source='ho_gia_dinh.so_ho_khau', read_only=True)
    dia_chi = serializers.CharField(source='ho_gia_dinh.dia_chi', read_only=True)

    class Meta:
        model = ThamGiaSinhHoat
        fields = ['id', 'lich_sinh_hoat', 'ho_gia_dinh', 'ten_chu_ho', 'so_ho_khau', 'dia_chi', 'da_tham_gia', 'ngay_tham_gia']

class ThuMoiSinhHoatSerializer(serializers.ModelSerializer):
    ten_chu_ho = serializers.CharField(source='ho_gia_dinh.ho_ten_chu_ho', read_only=True)
    so_ho_khau = serializers.CharField(source='ho_gia_dinh.so_ho_khau', read_only=True)
    chu_de = serializers.CharField(source='lich_sinh_hoat.chu_de', read_only=True)
    ngay_to_chuc = serializers.DateField(source='lich_sinh_hoat.ngay_to_chuc', read_only=True)
    gio_to_chuc = serializers.TimeField(source='lich_sinh_hoat.gio_to_chuc', read_only=True)

    class Meta:
        model = ThuMoiSinhHoat
        fields = [
            'id',
            'lich_sinh_hoat',
            'ho_gia_dinh',
            'ten_chu_ho',
            'so_ho_khau',
            'chu_de',
            'ngay_to_chuc',
            'gio_to_chuc',
            'trang_thai',
            'ngay_gui',
            'ngay_xem',
            'phan_hoi_tham_gia',
            'ngay_phan_hoi',
            'ghi_chu',
        ]

class ChungChiGiaDinhVanHoaSerializer(serializers.ModelSerializer):
    ten_chu_ho = serializers.CharField(source='ho_gia_dinh.ho_ten_chu_ho', read_only=True)
    so_ho_khau = serializers.CharField(source='ho_gia_dinh.so_ho_khau', read_only=True)
    ty_le_tham_gia = serializers.SerializerMethodField()

    class Meta:
        model = ChungChiGiaDinhVanHoa
        fields = [
            'id',
            'ho_gia_dinh',
            'ten_chu_ho',
            'so_ho_khau',
            'nam',
            'so_lan_tham_gia',
            'tong_so_buoi_sinh_hoat',
            'tieu_chi_tham_gia',
            'ty_le_tham_gia',
            'dat_chuan',
            'ghi_chu',
            'ngay_cap',
            'ngay_sua',
        ]

    def get_ty_le_tham_gia(self, obj):
        if obj.tong_so_buoi_sinh_hoat > 0:
            return round((obj.so_lan_tham_gia / obj.tong_so_buoi_sinh_hoat * 100), 2)
        return 0