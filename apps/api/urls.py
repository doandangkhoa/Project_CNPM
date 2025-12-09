from django.urls import path
from apps.tai_khoan import views as tai_khoan_views
from apps.nhan_khau import views as nhan_khau_views

urlpatterns = [
    # Tai khoan
    path('register/', tai_khoan_views.register_view, name='register'),
    path('login/', tai_khoan_views.login_view, name='login'),
    path('logout/', tai_khoan_views.logout_view, name='logout'),
    path('me/change-password', tai_khoan_views.change_password, name='change-password'),
    
    # admin url
    path('users/',tai_khoan_views.list_users, name='admin-list-users'), 
    path('users/<int:user_id>/', tai_khoan_views.user_detail, name='admin-user-detail'),
    path('users/<int:user_id>/update/', tai_khoan_views.update_user, name='admin-update-user'),
    path('users/<int:user_id>/delete/', tai_khoan_views.delete_user, name='admin-delete-user'),
    path('users/<int:user_id>/manage-permissions/', tai_khoan_views.manage_user_permissions, name='manage-user-permissions'),
    
    # nhan khau
    path('nhan-khau/them-moi/', nhan_khau_views.them_moi_nhan_khau, name='them-moi-nhan-khau'),
    path('nhan-khau/<int:pk>/cap-nhat/', nhan_khau_views.cap_nhat_nhan_khau, name='cap-nhat-nhan-khau'),
    path('nhan-khau/tim-kiem/', nhan_khau_views.tim_kiem_nhan_khau, name='tim-kiem-nhan-khau'),
    path('nhan-khau/<int:pk>/chi-tiet/', nhan_khau_views.chi_tiet_nhan_khau, name='chi-tiet-nhan-khau'),
    path('nhan-khau/bien-dong/', nhan_khau_views.tao_bien_dong_nhan_khau, name='tao-bien-dong-nhan-khau'),
    path('nhan-khau/<int:pk>/xoa/', nhan_khau_views.xoa_nhan_khau, name='xoa-nhan-khau'), # xóa do nhập sai
    path('nhan-khau/bien-dong/ho-khau/<int:ho_khau_id>/', nhan_khau_views.lich_su_thay_doi_ho_khau, name='lich-su-ho-khau'),
]