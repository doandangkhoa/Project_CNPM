from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class TaiKhoan(AbstractUser):
    ROLE_CHOICES = [
        ('can_bo', 'Cán bộ'),
        ('nguoi_dan', 'Người dân'),
    ]
    CHUC_VU = [
        ('to_truong', 'Tổ trưởng'),
        ('to_pho', 'Tổ phó'),
        ('can_bo', 'Cán bộ'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='nguoi_dan')
    chuc_vu = models.CharField(max_length=20, choices=CHUC_VU, blank=True, null=True)

    # Override để tránh xung đột với auth.User
    groups = models.ManyToManyField(
        Group,
        related_name='tai_khoan_users',  # tên riêng biệt
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='tai_khoan_users_permissions',  # tên riêng biệt
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        if self.role == 'can_bo':
            return f"{self.username} ({self.get_chuc_vu_display()})"
        else:
            return f"{self.username} ({self.get_role_display()})"
        
    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = 'admin'
        super().save(*args, **kwargs)