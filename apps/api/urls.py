from django.urls import path
from apps.tai_khoan import views as tai_khoan_views
from apps.nhan_khau import views as nhan_khau_views
from apps.ho_gia_dinh import views as ho_gia_dinh_views
from apps.sinh_hoat import views as sinh_hoat_views
from apps.tam_tru_tam_vang import views as tam_tru_tam_vang_views
from apps.thong_ke import views as thong_ke_views

urlpatterns = [
    # Tai khoan
    path('register/', tai_khoan_views.register_view, name='register'),
    path('login/', tai_khoan_views.login_view, name='login'),
    path('logout/', tai_khoan_views.logout_view, name='logout'),
    path('me/change-password', tai_khoan_views.change_password, name='change-password'),
    path('me/', tai_khoan_views.me_view, name='me'),
    
    # admin url
    path('users/',tai_khoan_views.list_users, name='admin-list-users'), 
    path('users/<int:user_id>/', tai_khoan_views.user_detail, name='admin-user-detail'),
    path('users/<int:user_id>/update/', tai_khoan_views.update_user, name='admin-update-user'),
    path('users/<int:user_id>/delete/', tai_khoan_views.delete_user, name='admin-delete-user'),
    
    # nhan khau
    path('nhan-khau/', nhan_khau_views.danh_sach_nhan_khau, name='danh-sach-nhan-khau'),
    path('nhan-khau/them-moi/', nhan_khau_views.them_moi_nhan_khau, name='them-moi-nhan-khau'),
    path('nhan-khau/<int:pk>/cap-nhat/', nhan_khau_views.cap_nhat_nhan_khau, name='cap-nhat-nhan-khau'),
    path('nhan-khau/tim-kiem/', nhan_khau_views.tim_kiem_nhan_khau, name='tim-kiem-nhan-khau'),
    path('nhan-khau/<int:pk>/chi-tiet/', nhan_khau_views.chi_tiet_nhan_khau, name='chi-tiet-nhan-khau'),
    path('nhan-khau/bien-dong/', nhan_khau_views.tao_bien_dong_nhan_khau, name='tao-bien-dong-nhan-khau'),
    path('nhan-khau/<int:pk>/xoa/', nhan_khau_views.xoa_nhan_khau, name='xoa-nhan-khau'), # xóa do nhập sai
    path('nhan-khau/bien-dong/ho-khau/<int:ho_khau_id>/', nhan_khau_views.lich_su_thay_doi_ho_khau, name='lich-su-ho-khau'),
    path('nhan-khau/danh-sach-ho-khau/', nhan_khau_views.danh_sach_ho_gia_dinh, name='danh-sach-ho-khau'),
    path('citizen/profile/', nhan_khau_views.get_citizen_profile, name='citizen-profile'),
    path('bao-sai-thong-tin/', nhan_khau_views.get_bao_sai_thong_tin_list, name='danh-sach-bao-sai'),
    path('bao-sai-thong-tin/tao-phieu/', nhan_khau_views.create_bao_sai_thong_tin, name='tao-phieu-bao-sai'),
    path('bao-sai-thong-tin/<int:id>/duyet/', nhan_khau_views.approve_bao_sai_thong_tin, name='duyet-bao-sai'),
    path('bao-sai-thong-tin/<int:id>/', nhan_khau_views.delete_bao_sai_thong_tin, name='delete-bao-sai'),
    path('officer/bao-sai-thong-tin/', nhan_khau_views.officer_danh_sach_bao_sai_thong_tin, name='officer-danh-sach-bao-sai'),
    
    # xin cap giay xac nhan
    path('xin-cap-giay-xac-nhan/', nhan_khau_views.get_xin_cap_giay_xac_nhan_list, name='citizen-danh-sach-xin-cap'),
    path('xin-cap-giay-xac-nhan/tao-phieu/', nhan_khau_views.create_xin_cap_giay_xac_nhan, name='tao-phieu-xin-cap'),
    path('xin-cap-giay-xac-nhan/<int:id>/duyet/', nhan_khau_views.approve_xin_cap_giay_xac_nhan, name='duyet-xin-cap'),
    path('xin-cap-giay-xac-nhan/<int:id>/', nhan_khau_views.delete_xin_cap_giay_xac_nhan, name='delete-xin-cap'),
    path('officer/xin-cap-giay-xac-nhan/', nhan_khau_views.officer_danh_sach_xin_cap_giay_xac_nhan, name='officer-danh-sach-xin-cap'),
    
    # ho gia dinh
    path('ho-gia-dinh/', ho_gia_dinh_views.tim_kiem_ho_gia_dinh, name='danh-sach-ho-gia-dinh'),
    path('ho-gia-dinh/them-moi/', ho_gia_dinh_views.them_moi_ho_gia_dinh, name='them-moi-ho-gia-dinh'),
    path('ho-gia-dinh/nhan-khau-chua-co-ho/', ho_gia_dinh_views.danh_sach_nhan_khau_chua_co_ho_gia_dinh, name='danh-sach-nhan-khau-chua-co-ho'),
    path('ho-gia-dinh/nhan-khau/<int:nhan_khau_id>/chi-tiet/', ho_gia_dinh_views.chi_tiet_nhan_khau_cho_ho_gia_dinh, name='chi-tiet-nhan-khau-cho-ho'),
    path('ho-gia-dinh/<int:pk>/cap-nhat/', ho_gia_dinh_views.cap_nhat_ho_gia_dinh, name='cap-nhat-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/chi-tiet/', ho_gia_dinh_views.chi_tiet_ho_gia_dinh, name='chi-tiet-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/xoa/', ho_gia_dinh_views.xoa_ho_gia_dinh, name='xoa-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/tach-ho/', ho_gia_dinh_views.tach_ho_gia_dinh, name='tach-ho-gia-dinh'),

    #tam_tru_tam_vang
    path('tam-tru-tam-vang/', tam_tru_tam_vang_views.danh_sach_phieu_user_view, name='danh-sach-phieu-user'),
    path('tam-tru-tam-vang/gan-day/', tam_tru_tam_vang_views.yeu_cau_gan_day_view, name='yeu-cau-gan-day'),
    path('officer/tam-tru-tam-vang/', tam_tru_tam_vang_views.officer_danh_sach_phieu_view, name='officer-danh-sach-phieu'),
    path('tam-tru-tam-vang/tao-phieu/', tam_tru_tam_vang_views.tao_phieu_view, name='tao-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/<int:id>/chi-tiet/', tam_tru_tam_vang_views.chi_tiet_phieu_view, name='chi-tiet-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/loc/', tam_tru_tam_vang_views.loc_phieu_view, name='loc-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/dang-hieu-luc/', tam_tru_tam_vang_views.danh_sach_dang_hieu_luc_view, name='danh-sach-phieu-dang-hieu-luc'),
    path('officer/tam-tru-tam-vang/<int:id>/duyet/', tam_tru_tam_vang_views.officer_approve_phieu_view, name='officer-duyet-phieu'),
    path('officer/tam-tru-tam-vang/<int:id>/', tam_tru_tam_vang_views.delete_phieu_tam_tru_tam_vang, name='delete-tam-tru-tam-vang'),

	
    # sinh hoat - lich sinh hoat
    path('sinh-hoat/danh-sach-sinh-hoat/', sinh_hoat_views.xem_danh_sach_sinh_hoat, name='danh-sach-lich-sinh-hoat'),
    path('sinh-hoat/tim-kiem/', sinh_hoat_views.tim_kiem_lich_sinh_hoat, name='tim-kiem-lich-sinh-hoat'),
    path('sinh-hoat/them-moi/', sinh_hoat_views.them_moi_lich_sinh_hoat, name='them-moi-lich-sinh-hoat'),
    path('sinh-hoat/<int:pk>/cap-nhat/', sinh_hoat_views.cap_nhat_lich_sinh_hoat, name='cap-nhat-lich-sinh-hoat'),
    path('sinh-hoat/<int:pk>/chi-tiet/', sinh_hoat_views.xem_chi_tiet_lich_sinh_hoat, name='chi-tiet-lich-sinh-hoat'),
    path('sinh-hoat/<int:pk>/xoa/', sinh_hoat_views.xoa_lich_sinh_hoat, name='xoa-lich-sinh-hoat'),
    
    # sinh hoat - diem danh
    path('sinh-hoat/diem-danh/<int:lich_sinh_hoat_id>/', sinh_hoat_views.lay_danh_sach_diem_danh, name='xem-ds-diem-danh'),
    path('sinh-hoat/diem-danh/cap-nhat/', sinh_hoat_views.tich_diem_danh_tung_nguoi, name='diem-danh-tung-nguoi'),
    
    # sinh hoat - thu moi
    path('sinh-hoat/thu-moi/<int:lich_sinh_hoat_id>/gui-toan-bo/', sinh_hoat_views.gui_thu_moi_toan_bo, name='gui-thu-moi-toan-bo'),
    path('sinh-hoat/thu-moi/<int:lich_sinh_hoat_id>/gui-chon-loc/', sinh_hoat_views.gui_thu_moi_chon_loc, name='gui-thu-moi-chon-loc'),
    path('sinh-hoat/thu-moi/<int:lich_sinh_hoat_id>/danh-sach/', sinh_hoat_views.xem_danh_sach_thu_moi, name='xem-danh-sach-thu-moi'),
    path('sinh-hoat/thu-moi/<int:thu_moi_id>/cap-nhat-trang-thai/', sinh_hoat_views.cap_nhat_trang_thai_thu_moi, name='cap-nhat-trang-thai-thu-moi'),
    
    # sinh hoat - gia dinh van hoa
    path('sinh-hoat/gia-dinh-van-hoa/<int:ho_id>/nam/<int:nam>/', sinh_hoat_views.xem_chung_chi_gia_dinh_van_hoa, name='xem-gia-dinh-van-hoa-theo-nam'),
    path('sinh-hoat/gia-dinh-van-hoa/<int:ho_id>/', sinh_hoat_views.xem_chung_chi_gia_dinh_van_hoa, name='xem-gia-dinh-van-hoa'),
    path('sinh-hoat/gia-dinh-van-hoa/cap-nhat-tieu-chi/', sinh_hoat_views.cap_nhat_tieu_chi_gia_dinh_van_hoa, name='cap-nhat-tieu-chi-gia-dinh-van-hoa'),
    path('sinh-hoat/gia-dinh-van-hoa/tinh-toan-nam/', sinh_hoat_views.tinh_toan_gia_dinh_van_hoa_theo_nam, name='tinh-toan-gia-dinh-van-hoa-theo-nam'),
    path('sinh-hoat/gia-dinh-van-hoa/danh-sach/nam/<int:nam>/', sinh_hoat_views.xem_danh_sach_gia_dinh_van_hoa, name='xem-danh-sach-gia-dinh-van-hoa'),
    
    # thống kê
    path('thong-ke/tao-bao-cao/', thong_ke_views.tao_bao_cao_thong_ke_view, name='tao-bao-cao'),
    path('thong-ke/danh-sach/', thong_ke_views.danh_sach_thong_ke_view, name='danh-sach-thong-ke'),
    path('thong-ke/chi-tiet/<int:pk>/', thong_ke_views.chi_tiet_thong_ke_view, name='chi-tiet-thong-ke'),
    path('thong-ke/xoa/<int:pk>/', thong_ke_views.xoa_thong_ke_view, name='xoa-thong-ke'),
    path('thong-ke/gia-dinh-van-hoa/', thong_ke_views.bao_cao_gia_dinh_van_hoa_view, name='bao-cao-gia-dinh-van-hoa'),
    path('thong-ke/kpi/', thong_ke_views.lay_kpi_thong_ke_view, name='lay-kpi'),
    path('thong-ke/bieu-do-tuoi/', thong_ke_views.lay_bieu_do_tuoi_view, name='lay-bieu-do-tuoi'),
]