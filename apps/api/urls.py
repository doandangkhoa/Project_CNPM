from django.urls import path
from apps.tai_khoan import views as tai_khoan_views
from apps.nhan_khau import views as nhan_khau_views
from apps.ho_gia_dinh import views as ho_gia_dinh_views
from apps.tam_tru_tam_vang import views as tam_tru_tam_vang_views

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
    
    # ho gia dinh
    path('ho-gia-dinh/', ho_gia_dinh_views.tim_kiem_ho_gia_dinh, name='danh-sach-ho-gia-dinh'),
    path('ho-gia-dinh/them-moi/', ho_gia_dinh_views.them_moi_ho_gia_dinh, name='them-moi-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/cap-nhat/', ho_gia_dinh_views.cap_nhat_ho_gia_dinh, name='cap-nhat-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/chi-tiet/', ho_gia_dinh_views.chi_tiet_ho_gia_dinh, name='chi-tiet-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/xoa/', ho_gia_dinh_views.xoa_ho_gia_dinh, name='xoa-ho-gia-dinh'),
    path('ho-gia-dinh/<int:pk>/tach-ho/', ho_gia_dinh_views.tach_ho_gia_dinh, name='tach-ho-gia-dinh'),

    #tam_tru_tam_vang
    path('tam-tru-tam-vang/', tam_tru_tam_vang_views.danh_sach_phieu_user_view, name='danh-sach-phieu-user'),
    path('officer/tam-tru-tam-vang/', tam_tru_tam_vang_views.officer_danh_sach_phieu_view, name='officer-danh-sach-phieu'),
    path('tam-tru-tam-vang/tao-phieu/', tam_tru_tam_vang_views.tao_phieu_view, name='tao-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/<int:id>/chi-tiet/', tam_tru_tam_vang_views.chi_tiet_phieu_view, name='chi-tiet-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/loc/', tam_tru_tam_vang_views.loc_phieu_view, name='loc-phieu-tam-tru-tam-vang'),
    path('tam-tru-tam-vang/dang-hieu-luc/', tam_tru_tam_vang_views.danh_sach_dang_hieu_luc_view, name='danh-sach-phieu-dang-hieu-luc'),
    path('officer/tam-tru-tam-vang/<int:id>/duyet/', tam_tru_tam_vang_views.officer_approve_phieu_view, name='officer-duyet-phieu'),

]