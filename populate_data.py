#!/usr/bin/env python
"""
Populate Household and Population Data
Automatically creates sample households and residents based on requirements
"""

import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quan_li_khu_dan_cu.settings')
django.setup()

from django.contrib.auth.models import User
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.nhan_khau.models import NhanKhau, BienDongNhanKhau

# Vietnamese names for generating realistic data
FIRST_NAMES = ['Nguyễn', 'Trần', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đinh', 'Lý', 'Dương']
MIDDLE_NAMES = ['Văn', 'Thị', 'Thanh', 'Minh', 'Hồng', 'Tuấn', 'Huy', 'Linh', 'Anh', 'Tâm', 'Kiên', 'Đức']
LAST_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'Anh', 'Hương', 'Hạnh', 'Khoa', 'Quân']

OCCUPATIONS = ['Công nhân', 'Nông dân', 'Giáo viên', 'Bác sĩ', 'Kỹ sư', 'Tài chính', 'Bán hàng', 'Công chức', 'Thương nhân', 'Quản lý']
WARDS = ['Phường 1, Quận 1', 'Phường 2, Quận 1', 'Phường 3, Quận 1', 'Phường 4, Quận 1', 'Phường 5, Quận 1']
STREETS = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Võ Văn Kiệt', 'Đinh Tiên Hoàng', 'Lê Thanh Tôn', 'Pasteur', 'Tôn Đức Thắng']

RELATIONSHIP_CHOICES = ['Chính chủ', 'Vợ', 'Chồng', 'Con', 'Cha', 'Mẹ', 'Anh', 'Em', 'Cháu', 'Cô', 'Chú']
STATUS_CHOICES = ['thuong_tru', 'tam_tru', 'tam_vang', 'da_chet']

def generate_name():
    """Generate a Vietnamese name"""
    first = random.choice(FIRST_NAMES)
    middle = random.choice(MIDDLE_NAMES)
    last = random.choice(LAST_NAMES)
    return f"{first} {middle} {last}"

def generate_cccd():
    """Generate a valid CCCD number (12 digits)"""
    return ''.join([str(random.randint(0, 9)) for _ in range(12)])

def generate_address():
    """Generate a realistic address"""
    number = random.randint(1, 500)
    street = random.choice(STREETS)
    ward = random.choice(WARDS)
    return f"{number} {street}, {ward}"

def create_household(ho_khau_id):
    """Create a single household with members"""
    household_number = f"HK{str(ho_khau_id).zfill(3)}"
    head_name = generate_name()
    address = generate_address()
    phone = f"0{random.randint(1, 9)}{random.randint(0, 9)}{random.randint(10000000, 99999999)}"
    
    # Create household
    household = HoGiaDinh.objects.create(
        so_ho_khau=household_number,
        ho_ten_chu_ho=head_name,
        dia_chi=address,
        phuong_xa=address.split(',')[-1].strip(),
        so_dien_thoai=phone,
        ghi_chu=f"Hộ khẩu tạo tự động - {datetime.now().strftime('%Y-%m-%d')}"
    )
    
    print(f"✅ Created household: {household_number} - {head_name}")
    
    # Create head of household (chính chủ)
    dob = datetime(random.randint(1950, 1980), random.randint(1, 12), random.randint(1, 28))
    head = NhanKhau.objects.create(
        ho_gia_dinh=household,
        ho_ten=head_name,
        ngay_sinh=dob.date(),
        gioi_tinh='Nam' if random.random() > 0.5 else 'Nữ',
        so_cccd=generate_cccd(),
        quan_he_voi_chu_ho='Chính chủ',
        nghe_nghiep=random.choice(OCCUPATIONS),
        noi_sinh=random.choice(WARDS),
        trang_thai='thuong_tru',
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    # Link head to household
    household.id_chu_ho = head
    household.save()
    
    print(f"   ├─ Head: {head_name} (DOB: {dob.date()}, CCCD: {head.so_cccd})")
    
    # Create family members (2-4 members per household)
    num_members = random.randint(1, 4)
    
    for i in range(num_members):
        member_name = generate_name()
        member_dob = datetime(random.randint(1980, 2020), random.randint(1, 12), random.randint(1, 28))
        relationship = random.choice([r for r in RELATIONSHIP_CHOICES if r != 'Chính chủ'])
        
        member = NhanKhau.objects.create(
            ho_gia_dinh=household,
            ho_ten=member_name,
            ngay_sinh=member_dob.date(),
            gioi_tinh='Nam' if random.random() > 0.5 else 'Nữ',
            so_cccd=generate_cccd(),
            quan_he_voi_chu_ho=relationship,
            nghe_nghiep=random.choice(OCCUPATIONS) if member_dob.year <= 2006 else 'Học sinh',
            noi_sinh=random.choice(WARDS),
            trang_thai='thuong_tru',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        print(f"   ├─ Member {i+1}: {member_name} ({relationship}, DOB: {member_dob.date()})")
    
    print(f"   └─ Total members: {num_members + 1}\n")
    
    return household

def create_population_changes(household, num_changes=2):
    """Create population movement records for a household"""
    members = household.nhan_khau.all()
    
    for i in range(min(num_changes, len(members))):
        member = random.choice(members)
        change_type = random.choice(['them_moi', 'tach_ho', 'tam_tru', 'tam_vang', 'qua_doi'])
        
        if change_type == 'them_moi':
            description = f"Thêm mới nhân khẩu {member.ho_ten}"
        elif change_type == 'tach_ho':
            description = f"Tách hộ - {member.ho_ten} chuyển đi nơi khác"
        elif change_type == 'tam_tru':
            description = f"{member.ho_ten} tạm trú tại địa chỉ khác"
        elif change_type == 'tam_vang':
            description = f"{member.ho_ten} tạm vắng"
        else:  # qua_doi
            description = f"{member.ho_ten} qua đời"
        
        BienDongNhanKhau.objects.create(
            ho_gia_dinh=household,
            nhan_khau=member,
            loai_bien_dong=change_type,
            ngay_bien_dong=datetime.now() - timedelta(days=random.randint(1, 365)),
            ghi_chu=description,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

def main():
    print("\n" + "="*70)
    print("  POPULATE HOUSEHOLD AND POPULATION DATA")
    print("="*70 + "\n")
    
    # Clear existing data (optional)
    confirm = input("Clear existing households? (y/n): ").lower()
    if confirm == 'y':
        HoGiaDinh.objects.all().delete()
        NhanKhau.objects.all().delete()
        BienDongNhanKhau.objects.all().delete()
        print("✅ Cleared existing data\n")
    
    # Create households
    num_households = int(input("Number of households to create (default 20): ") or "20")
    
    print(f"\n📝 Creating {num_households} households...\n")
    
    households = []
    for i in range(1, num_households + 1):
        try:
            household = create_household(i)
            households.append(household)
            
            # Create population changes for some households
            if random.random() > 0.5:
                create_population_changes(household, num_changes=random.randint(1, 3))
        
        except Exception as e:
            print(f"❌ Error creating household {i}: {e}\n")
    
    # Print summary
    print("\n" + "="*70)
    print("  SUMMARY")
    print("="*70)
    
    total_households = HoGiaDinh.objects.count()
    total_residents = NhanKhau.objects.count()
    total_changes = BienDongNhanKhau.objects.count()
    
    print(f"✅ Total households created: {total_households}")
    print(f"✅ Total residents created: {total_residents}")
    print(f"✅ Total population changes: {total_changes}")
    
    # Show sample data
    print("\n📊 Sample Data:")
    print("-" * 70)
    
    sample_households = HoGiaDinh.objects.all()[:3]
    for household in sample_households:
        members = household.nhan_khau.count()
        print(f"\n  Household: {household.so_ho_khau}")
        print(f"  Head: {household.ho_ten_chu_ho}")
        print(f"  Address: {household.dia_chi}")
        print(f"  Members: {members}")
        print(f"  Phone: {household.so_dien_thoai}")
    
    print("\n" + "="*70)
    print("✅ Data population complete!")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
