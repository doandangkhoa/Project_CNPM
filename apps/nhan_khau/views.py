from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import NhanKhau
from .serializers import NhanKhauSerializer

@api_view(['GET'])
def chi_tiet_nhan_khau(request, pk):
    """
    API xem chi tiết một nhân khẩu theo ID
    """
    try:
        nhan_khau = NhanKhau.objects.select_related('ho_gia_dinh').prefetch_related('bien_dong_nhan_khau').get(pk=pk)
    except NhanKhau.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Không tìm thấy nhân khẩu này.'
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = NhanKhauSerializer(nhan_khau)
    return Response({
        'status': 'success',
        'nhan_khau': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def tim_kiem_nhan_khau(request):
    """
    API tìm kiếm nhân khẩu
    ?ho_ten=Nguyễn Văn
    &so_cccd=0012
    &ngay_sinh=1990-05-20
    &so_ho_khau=HK001
    """
    queryset = NhanKhau.objects.select_related('ho_gia_dinh').prefetch_related('bien_dong_nhan_khau')

    ho_ten = request.query_params.get('ho_ten', '').strip()
    so_cccd = request.query_params.get('so_cccd', '').strip()
    ngay_sinh = request.query_params.get('ngay_sinh')
    so_ho_khau = request.query_params.get('so_ho_khau', '').strip()

    if ho_ten:
        queryset = queryset.filter(
            Q(ho_ten__icontains=ho_ten) | Q(bi_danh__icontains=ho_ten)
        )

    if so_cccd:
        queryset = queryset.filter(so_cccd__icontains=so_cccd)

    if ngay_sinh:
        queryset = queryset.filter(ngay_sinh=ngay_sinh)

    if so_ho_khau:
        queryset = queryset.filter(ho_gia_dinh__so_ho_khau__icontains=so_ho_khau)

    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 20))
    start = (page - 1) * limit
    end = start + limit

    results = queryset.order_by('ho_ten')[start:end]
    total = queryset.count()

    serializer = NhanKhauSerializer(results, many=True)

    return Response({
        'status': 'success',
        'total': total,
        'page': page,
        'limit': limit,
        'results': serializer.data
    }, status=status.HTTP_200_OK)

