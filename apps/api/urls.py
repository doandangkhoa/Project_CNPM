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
    path('nhan-khau/bien-dong/', nhan_khau_views.tao_bien_dong_nhan_khau, name='tao-bien-dong-nhan-khau'),
]