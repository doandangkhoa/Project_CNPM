from django.urls import path
from . import views

urlpatterns = [
    # API cho LichSinhHoat
    path('lich-sinh-hoat/', views.xem_danh_sach_sinh_hoat, name='xem_danh_sach_sinh_hoat'),
    path('lich-sinh-hoat/tim-kiem/', views.tim_kiem_lich_sinh_hoat, name='tim_kiem_lich_sinh_hoat'),
    path('lich-sinh-hoat/them-moi/', views.them_moi_lich_sinh_hoat, name='them_moi_lich_sinh_hoat'),
    path('lich-sinh-hoat/<int:pk>/', views.xem_chi_tiet_lich_sinh_hoat, name='xem_chi_tiet_lich_sinh_hoat'),
    path('lich-sinh-hoat/<int:pk>/cap-nhat/', views.cap_nhat_lich_sinh_hoat, name='cap_nhat_lich_sinh_hoat'),
    path('lich-sinh-hoat/<int:pk>/xoa/', views.xoa_lich_sinh_hoat, name='xoa_lich_sinh_hoat'),

    # API cho ThamGiaSinhHoat (Điểm danh)
    path('diem-danh/cap-nhat/', views.tich_diem_danh_tung_nguoi, name='tich_diem_danh_tung_nguoi'),
    path('diem-danh/<int:lich_sinh_hoat_id>/', views.lay_danh_sach_diem_danh, name='lay_danh_sach_diem_danh'),

    # API cho ThuMoiSinhHoat (Thư mời)
    path('thu-moi/<int:lich_sinh_hoat_id>/gui-toan-bo/', views.gui_thu_moi_toan_bo, name='gui_thu_moi_toan_bo'),
    path('thu-moi/<int:lich_sinh_hoat_id>/gui-chon-loc/', views.gui_thu_moi_chon_loc, name='gui_thu_moi_chon_loc'),
    path('thu-moi/<int:lich_sinh_hoat_id>/danh-sach/', views.xem_danh_sach_thu_moi, name='xem_danh_sach_thu_moi'),
    path('thu-moi/<int:thu_moi_id>/cap-nhat-trang-thai/', views.cap_nhat_trang_thai_thu_moi, name='cap_nhat_trang_thai_thu_moi'),

    # API cho ChungChiGiaDinhVanHoa
    path('gia-dinh-van-hoa/<int:ho_id>/nam/<int:nam>/', views.xem_chung_chi_gia_dinh_van_hoa, name='xem_chung_chi_gia_dinh_van_hoa_theo_nam'),
    path('gia-dinh-van-hoa/<int:ho_id>/', views.xem_chung_chi_gia_dinh_van_hoa, name='xem_chung_chi_gia_dinh_van_hoa'),
    path('gia-dinh-van-hoa/cap-nhat-tieu-chi/', views.cap_nhat_tieu_chi_gia_dinh_van_hoa, name='cap_nhat_tieu_chi_gia_dinh_van_hoa'),
    path('gia-dinh-van-hoa/tinh-toan-nam/', views.tinh_toan_gia_dinh_van_hoa_theo_nam, name='tinh_toan_gia_dinh_van_hoa_theo_nam'),
    path('gia-dinh-van-hoa/danh-sach/nam/<int:nam>/', views.xem_danh_sach_gia_dinh_van_hoa, name='xem_danh_sach_gia_dinh_van_hoa'),
]