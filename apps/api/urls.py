from django.urls import path
from apps.tai_khoan import views

urlpatterns = [
    path('login/', views.login_view, name="login_view"),
    path('register/', views.register_view, name='register'),
]