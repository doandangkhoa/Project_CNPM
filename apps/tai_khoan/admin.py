from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import TaiKhoan


@admin.register(TaiKhoan)
class TaiKhoanAdmin(UserAdmin):
    # Các trường hiển thị trên list, thêm avatar preview
    list_display = ('avatar_tag', 'username', 'email', 'role', 'chuc_vu', 'is_active', 'is_staff')

    # Trường tìm kiếm
    search_fields = ('username', 'email')

    # Filter theo role và chuc_vu
    list_filter = ('role', 'chuc_vu', 'is_active', 'is_staff')

    # Hiển thị avatar trong chi tiết (read-only preview)
    readonly_fields = ('avatar_preview',)

    # Các trường hiển thị trong form tạo user
    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung', {'fields': ('role', 'chuc_vu', 'avatar')}),
    )

    # Trường khi tạo user mới
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Thông tin bổ sung', {'fields': ('role', 'chuc_vu', 'avatar')}),
    )

    def avatar_tag(self, obj):
        if obj.avatar:
            try:
                return format_html('<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />', obj.avatar.url)
            except Exception:
                return '(no image)'
        return ''
    avatar_tag.short_description = 'Ảnh'

    def avatar_preview(self, obj):
        if obj.avatar:
            try:
                return format_html('<img src="{}" style="width:128px;height:128px;border-radius:8px;object-fit:cover;" />', obj.avatar.url)
            except Exception:
                return '(no image)'
        return '(chưa có)'
    avatar_preview.short_description = 'Xem trước ảnh'
