from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q

from .models import PhieuTamTruTamVang
from .serializers import PhieuTamTruTamVangSerializer

# Lấy danh sách phiếu của người dùng hiện tại
@api_view(['GET'])
def danh_sach_phieu_view(request):
    """
    Lấy danh sách phiếu tạm trú/tạm vắng của người dùng hiện tại
    """
    if not request.user.is_authenticated:
        return Response(
            {"error": "Bạn cần đăng nhập"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        # Lấy nhân khẩu của người dùng hiện tại
        nhan_khau = request.user.nhan_khau
        if not nhan_khau:
            return Response({
                "status": "success",
                "results": []
            }, status=status.HTTP_200_OK)
        
        # Lấy tất cả phiếu của nhân khẩu này
        phieu_list = PhieuTamTruTamVang.objects.filter(
            nhan_khau=nhan_khau
        ).order_by('-ngay_bat_dau')
        
        serializer = PhieuTamTruTamVangSerializer(phieu_list, many=True)
        return Response({
            "status": "success",
            "results": serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

#Tạo phiếu tạm trú - tạm vắng
@api_view(['POST'])
def tao_phieu_view(request):
    serializer = PhieuTamTruTamVangSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "status": "success",
            "message": "Tạo phiếu thành công",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        "status": "error",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

#Xem chi tiết phiếu
@api_view(['GET'])
def chi_tiet_phieu_view(request, id):
    try:
        phieu = PhieuTamTruTamVang.objects.get(id=id)
    except PhieuTamTruTamVang.DoesNotExist:
        return Response({"error": "Không tìm thấy phiếu"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PhieuTamTruTamVangSerializer(phieu)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Lọc phiếu theo thời gian - hiệu lực 
@api_view(['GET'])
def loc_phieu_view(request):
    loai = request.GET.get("loai", "")
    tu_ngay = request.GET.get("from", "")
    den_ngay = request.GET.get("to", "")
    trang_thai = request.GET.get("trang_thai", "")

    phieu_list = PhieuTamTruTamVang.objects.all()

    if loai:
        phieu_list = phieu_list.filter(loai_phieu=loai)

    if tu_ngay:
        phieu_list = phieu_list.filter(ngay_bat_dau__gte=tu_ngay)

    if den_ngay:
        phieu_list = phieu_list.filter(ngay_bat_dau__lte=den_ngay)

    if trang_thai == "con_hieu_luc":
        today = timezone.now().date()
        phieu_list = phieu_list.filter(
            Q(ngay_ket_thuc__isnull=True) | Q(ngay_ket_thuc__gte=today)
        )

    serializer = PhieuTamTruTamVangSerializer(phieu_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Xuất danh sách người đang tạm trú / tạm vắng.
@api_view(['GET'])
def danh_sach_dang_hieu_luc_view(request):
    loai = request.GET.get("loai", "")
    today = timezone.now().date()

    phieu_list = PhieuTamTruTamVang.objects.filter(
        Q(ngay_ket_thuc__isnull=True) | Q(ngay_ket_thuc__gte=today)
    )

    if loai:
        phieu_list = phieu_list.filter(loai_phieu=loai)

    serializer = PhieuTamTruTamVangSerializer(phieu_list, many=True)

    return Response({
        "status": "success",
        "count": len(serializer.data),
        "data": serializer.data
    }, status=status.HTTP_200_OK)


 

