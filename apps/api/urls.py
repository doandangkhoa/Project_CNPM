# apps/api/urls.py
from django.urls import path
from apps.tai_khoan.views import register_view, login_view, logout_view, current_user_view
from apps.nhan_khau.views import tim_kiem_nhan_khau, chi_tiet_nhan_khau 

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', current_user_view, name='current_user'),

    # API Nhân khẩu – Sơn
    path('nhan-khau/tim-kiem/', tim_kiem_nhan_khau, name='nhan_khau_tim_kiem'),
    path('nhan-khau/<int:pk>/chi-tiet/', chi_tiet_nhan_khau, name='nhan_khau_chi_tiet'),
]