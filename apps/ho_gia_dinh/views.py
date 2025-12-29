from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q, Count
from datetime import datetime, date

# Import Models
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.nhan_khau.models import NhanKhau, BienDongNhanKhau
from apps.can_bo.models import CanBo

# Import Serializers
from apps.ho_gia_dinh.serializers import HoGiaDinhSerializer, HoGiaDinhCreateUpdateSerializer

def _user_is_authorized_can_bo(user):
    """Kiểm tra quyền cán bộ"""
    if not user or not getattr(user, 'is_authenticated', False): # user chưa login 
        return False
    if user.is_superuser: # user là admin
        return True
    allowed_positions = ['to_truong', 'to_pho', 'can_bo']
    return getattr(user, 'role', None) == 'can_bo' and getattr(user, 'chuc_vu', None) in allowed_positions 

# --- 1. THÊM MỚI ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def them_moi_ho_gia_dinh(request):
    # Kiểm tra quyền trước
    user = request.user
    if not _user_is_authorized_can_bo(user):
        return Response({
            'status': 'error',
            'message': 'Bạn không có quyền thực hiện hành động này.'
        }, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    cccd_chu_ho = data.pop('id_chu_ho', None)  # Lấy CCCD nếu có
    data['id_chu_ho'] = None  # Đảm bảo id_chu_ho được set là None trước serialize
    
    # Dùng Serializer CreateUpdate để validate input
    serializer = HoGiaDinhCreateUpdateSerializer(data=data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                ho_gia_dinh = serializer.save()
                
                # Nếu có CCCD chủ hộ, tìm và link nhân khẩu
                if cccd_chu_ho:
                    try:
                        # Tìm nhân khẩu với CCCD này
                        nhan_khau = NhanKhau.objects.get(so_cccd=cccd_chu_ho)
                        
                        # Kiểm tra nhân khẩu chưa thuộc hộ khẩu nào
                        if not nhan_khau.ho_gia_dinh:
                            # Cập nhật nhân khẩu thuộc vào hộ mới
                            nhan_khau.ho_gia_dinh = ho_gia_dinh
                            nhan_khau.quan_he_voi_chu_ho = 'Chủ hộ'
                            nhan_khau.save()
                            
                            # Cập nhật id_chu_ho cho hộ
                            ho_gia_dinh.id_chu_ho = nhan_khau
                            ho_gia_dinh.save()
                    except NhanKhau.DoesNotExist:
                        # Nhân khẩu không tồn tại với CCCD này - không lỗi, chỉ bỏ qua
                        pass
                
                # Trả về dữ liệu đầy đủ bằng Serializer hiển thị
                return Response({
                    'status': 'success',
                    'message': 'Thêm mới hộ gia đình thành công.',
                    'data': HoGiaDinhSerializer(ho_gia_dinh).data
                }, status=status.HTTP_201_CREATED)  
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# --- 2. CẬP NHẬT ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cap_nhat_ho_gia_dinh(request, pk):
    """
    Update theo ID (pk).
    """
    try:
        ho_gia_dinh = HoGiaDinh.objects.get(pk=pk)
    except HoGiaDinh.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Hộ gia đình không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra quyền
    user = request.user
    if not _user_is_authorized_can_bo(user):
        return Response({
            'status': 'error',
            'message': 'Bạn không có quyền thực hiện hành động này.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Dùng Serializer CreateUpdate để validate input
    serializer = HoGiaDinhCreateUpdateSerializer(ho_gia_dinh, data=request.data, partial=True)
        
    if serializer.is_valid():
        try:
            with transaction.atomic():
                updated_instance = serializer.save()
                
            # Trả về data sau khi update bằng Serializer hiển thị (để thấy thay đổi nếu có)
            return Response({
                'status': 'success',
                'message': 'Cập nhật hộ gia đình thành công.',
                'data': HoGiaDinhSerializer(updated_instance).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
# --- 3. CHI TIẾT ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chi_tiet_ho_gia_dinh(request, pk):
    '''API lấy chi tiết hộ gia đình theo ID'''
    try:
        # Quan trọng: prefetch_related('nhan_khau') để lấy danh sách thành viên
        # Quan trọng: select_related('id_chu_ho') để lấy tên chủ hộ thực
        ho_gia_dinh = HoGiaDinh.objects.select_related('id_chu_ho')\
                                       .prefetch_related('nhan_khau')\
                                       .get(pk=pk)
    except HoGiaDinh.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Hộ gia đình không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Dùng Serializer hiển thị (có nested danh sách thành viên)
    serializer = HoGiaDinhSerializer(ho_gia_dinh)
    return Response({
        'status':'success',
        'data': serializer.data
    }, status=status.HTTP_200_OK)
            
# --- 4. TÌM KIẾM ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tim_kiem_ho_gia_dinh(request):
    # Tối ưu query ngay từ đầu và annotate số thành viên
    # Chỉ đếm những thành viên có trang_thai = 'thuong_tru' (thường trú)
    from django.db.models import Q
    queryset = HoGiaDinh.objects.select_related('id_chu_ho')\
                                .prefetch_related('nhan_khau')\
                                .annotate(so_luong_thanh_vien=Count('nhan_khau', filter=Q(nhan_khau__trang_thai__in=['thuong_tru', 'tam_tru', 'tam_vang'])))\
                                .all()\
                                .order_by('so_ho_khau')
    
    # Fix lỗi: dùng get(..., '') để tránh lỗi NoneType has no attribute 'strip'
    so_ho_khau = request.query_params.get('so_ho_khau', '').strip()
    ho_ten_chu_ho = request.query_params.get('ho_ten_chu_ho', '').strip()
    dia_chi = request.query_params.get('dia_chi', '').strip()
    so_thanh_vien = request.query_params.get('so_thanh_vien', '').strip()

    if so_ho_khau:
        queryset = queryset.filter(so_ho_khau__icontains=so_ho_khau) # icontains linh hoạt hơn iexact
    
    if ho_ten_chu_ho:
        queryset = queryset.filter(ho_ten_chu_ho__icontains=ho_ten_chu_ho)
    if dia_chi:
        queryset = queryset.filter(dia_chi__icontains=dia_chi)
    if so_thanh_vien:
        try:
            so_thanh_vien_int = int(so_thanh_vien)
            queryset = queryset.filter(so_luong_thanh_vien=so_thanh_vien_int)
        except ValueError:
            # Nếu không phải số hợp lệ, bỏ qua filter này
            pass
    
    # Phân trang
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
    except ValueError:
        page = 1
        limit = 20

    start = (page - 1) * limit
    end = start + limit

    total = queryset.count()
    results = queryset.order_by('-ngay_tao')[start:end]

    serializer = HoGiaDinhSerializer(results, many=True)

    return Response({
        'status': 'success',
        'total': total,
        'page': page,
        'limit': limit,
        'results': serializer.data
    }, status=status.HTTP_200_OK)
    
# --- 5. XÓA ---
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def xoa_ho_gia_dinh(request, pk):
    try:
        ho_gia_dinh = HoGiaDinh.objects.get(pk=pk)
    except HoGiaDinh.DoesNotExist:
        return Response({
            'status':'error',
            'message':'Hộ gia đình không tồn tại.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Kiểm tra quyền
    user = request.user
    if not _user_is_authorized_can_bo(user):
        return Response({
            'status': 'error',
            'message': 'Bạn không có quyền thực hiện hành động này.'
        }, status=status.HTTP_403_FORBIDDEN)
        
    try:
        with transaction.atomic():
            # Kiểm tra xem hộ còn nhân khẩu không
            so_thanh_vien = NhanKhau.objects.filter(ho_gia_dinh=ho_gia_dinh).count()
            
            if so_thanh_vien > 1:
                return Response({
                    'status':'error',
                    'message': f'Không thể xóa. Hộ này đang có {so_thanh_vien} nhân khẩu. Vui lòng tách/xóa nhân khẩu trước.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Nếu hộ có 1 thành viên, xóa thành viên trước
            if so_thanh_vien == 1:
                nhan_khau = NhanKhau.objects.get(ho_gia_dinh=ho_gia_dinh)
                nhan_khau.delete()
                
            ho_gia_dinh.delete()
            
        return Response({
            'status':'success',
            'message':'Xóa hộ gia đình thành công.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status':'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# --- TÁCH HỘ ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tach_ho_gia_dinh(request, pk):
    """
    Tách hộ: Tạo hộ mới và chuyển những nhân khẩu được chọn sang hộ mới
    Request body:
    {
        "so_ho_khau": "...",
        "ho_ten_chu_ho": "...",
        "dia_chi": "...",
        "so_dien_thoai": "...",
        "phuong_xa": "...",
        "id_chu_ho": <id_chu_ho_moi>,
        "nhan_khau_ids": [1, 2, 3],  // IDs của nhân khẩu cần tách
        "quan_he": {
            "1": "Chủ hộ",
            "2": "Vợ/Chồng",
            ...
        }
    }
    """
    user = request.user
    if not _user_is_authorized_can_bo(user):
        return Response({
            'status': 'error',
            'message': 'Bạn không có quyền thực hiện hành động này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        ho_gia_dinh_cu = HoGiaDinh.objects.get(pk=pk)
        
        data = request.data
        nhan_khau_ids = data.get('nhan_khau_ids', [])
        quan_he = data.get('quan_he', {})
        id_chu_ho_moi = data.get('id_chu_ho')
        
        if not nhan_khau_ids:
            return Response({
                'status': 'error',
                'message': 'Vui lòng chọn ít nhất một nhân khẩu để tách.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Tạo hộ mới
            ho_gia_dinh_moi = HoGiaDinh.objects.create(
                so_ho_khau=data.get('so_ho_khau'),
                ho_ten_chu_ho=data.get('ho_ten_chu_ho'),
                dia_chi=data.get('dia_chi'),
                so_dien_thoai=data.get('so_dien_thoai'),
                phuong_xa=data.get('phuong_xa'),
                ghi_chu=data.get('ghi_chu', ''),
                id_chu_ho_id=id_chu_ho_moi
            )
            
            # Lấy danh sách nhân khẩu cần tách
            nhan_khau_list = NhanKhau.objects.filter(id__in=nhan_khau_ids)
            
            # Cập nhật từng nhân khẩu
            for nhan_khau in nhan_khau_list:
                # Cập nhật hộ gia đình
                nhan_khau.ho_gia_dinh = ho_gia_dinh_moi
                
                # Cập nhật quan hệ với chủ hộ
                nhan_khau.quan_he_voi_chu_ho = quan_he.get(str(nhan_khau.id), 'Khác')
                nhan_khau.save()
                
                # Tạo BienDongNhanKhau record cho hộ CŨ - TACH_HO
                BienDongNhanKhau.objects.create(
                    nhan_khau=nhan_khau,
                    ho_khau=ho_gia_dinh_cu,  # Lưu ở hộ cũ
                    loai_bien_dong='TACH_HO',
                    mo_ta=f"{nhan_khau.ho_ten} được tách sang hộ mới: {ho_gia_dinh_moi.so_ho_khau} - {ho_gia_dinh_moi.ho_ten_chu_ho}",
                    ngay_bat_dau=date.today(),
                    noi_chuyen=ho_gia_dinh_moi.dia_chi  # Địa chỉ hộ mới tách ra
                )
                
        
        return Response({
            'status': 'success',
            'message': 'Tách hộ thành công.',
            'data': {
                'ho_gia_dinh_cu': {
                    'id': ho_gia_dinh_cu.id,
                    'so_ho_khau': ho_gia_dinh_cu.so_ho_khau,
                    'ho_ten_chu_ho': ho_gia_dinh_cu.ho_ten_chu_ho,
                },
                'ho_gia_dinh_moi': {
                    'id': ho_gia_dinh_moi.id,
                    'so_ho_khau': ho_gia_dinh_moi.so_ho_khau,
                    'ho_ten_chu_ho': ho_gia_dinh_moi.ho_ten_chu_ho,
                }
            }
        }, status=status.HTTP_200_OK)
        
    except HoGiaDinh.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Hộ gia đình không tìm thấy.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
