from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import TaiKhoan

@admin.register(TaiKhoan)
class TaiKhoanAdmin(UserAdmin):
    # Các trường hiển thị trên list
    list_display = ('username', 'email', 'role', 'chuc_vu', 'is_active', 'is_staff')
    
    # Trường tìm kiếm
    search_fields = ('username', 'email')
    
    # Filter theo role và chuc_vu
    list_filter = ('role', 'chuc_vu', 'is_active', 'is_staff')
    
    # Các trường hiển thị trong form tạo user
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('role', 'chuc_vu')}),
    )

    # Trường khi tạo user mới
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Thông tin bổ sung', {'fields': ('role', 'chuc_vu')}),
    )
