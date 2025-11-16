from django.urls import path
from apps.tai_khoan import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/change-password', views.change_password, name='change-password'),
    # admin url
    path('users/',views.list_users, name='admin-list-users'), 
    path('users/<int:user_id>/', views.user_detail, name='admin-user-detail'),
    path('users/<int:user_id>/update/', views.update_user, name='admin-update-user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='admin-delete-user'),
    path('users/<int:user_id>/manage-permissions/', views.manage_user_permissions, name='manage-user-permissions')
    
]