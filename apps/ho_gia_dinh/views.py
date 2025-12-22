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
    
    # Dùng Serializer CreateUpdate để validate input
    serializer = HoGiaDinhCreateUpdateSerializer(data=data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                ho_gia_dinh = serializer.save()
                
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
    queryset = HoGiaDinh.objects.select_related('id_chu_ho')\
                                .prefetch_related('nhan_khau')\
                                .annotate(so_luong_thanh_vien=Count('nhan_khau'))\
                                .all()
    
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
            
            if so_thanh_vien > 0:
                return Response({
                    'status':'error',
                    'message': f'Không thể xóa. Hộ này đang có {so_thanh_vien} nhân khẩu. Vui lòng tách/xóa nhân khẩu trước.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
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