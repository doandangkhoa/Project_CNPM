from django.urls import path
from apps.tai_khoan import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.current_user_view, name='current_user'),
    path('manage-permissions/<int:user_id>/', views.manage_user_permissions, name='manage_user_permissions')
]