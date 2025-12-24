# Create your views here.
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from .models import PhieuTamTruTamVang
from .serializers import PhieuTamTruTamVangSerializer
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import PhieuTamTruTamVang
from .serializers import PhieuTamTruTamVangSerializer

# API: Cán bộ duyệt hoặc từ chối phiếu
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def officer_approve_phieu_view(request, id):
    from apps.nhan_khau.models import BienDongNhanKhau
    try:
        phieu = PhieuTamTruTamVang.objects.get(id=id)
    except PhieuTamTruTamVang.DoesNotExist:
        return Response({"status": "error", "message": "Không tìm thấy phiếu"}, status=status.HTTP_404_NOT_FOUND)

    action_type = request.data.get('action')  # 'approve' hoặc 'reject'
    note = request.data.get('note', '')
    if phieu.trang_thai != 'cho_duyet':
        return Response({"status": "error", "message": "Phiếu đã được xử lý"}, status=status.HTTP_400_BAD_REQUEST)

    if action_type == 'approve':
        phieu.trang_thai = 'da_duyet'
        phieu.save()
        # Ghi nhận biến động nhân khẩu
        BienDongNhanKhau.objects.create(
            nhan_khau=phieu.nhan_khau,
            loai_bien_dong='TAM_TRU' if phieu.loai_phieu == 'tam_tru' else 'TAM_VANG',
            mo_ta=phieu.ly_do,
        )
        return Response({"status": "success", "message": "Đã duyệt phiếu thành công"}, status=status.HTTP_200_OK)
    elif action_type == 'reject':
        if not note:
            return Response({"status": "error", "message": "Cần ghi chú lý do từ chối"}, status=status.HTTP_400_BAD_REQUEST)
        phieu.trang_thai = 'tu_choi'
        phieu.ghi_chu = note
        phieu.save()
        return Response({"status": "success", "message": "Đã từ chối phiếu"}, status=status.HTTP_200_OK)
    else:
        return Response({"status": "error", "message": "Hành động không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_danh_sach_phieu_view(request):
    trang_thai = request.GET.get('trang_thai', None)
    phieu_list = PhieuTamTruTamVang.objects.all()
    if trang_thai:
        phieu_list = phieu_list.filter(trang_thai=trang_thai)
    serializer = PhieuTamTruTamVangSerializer(phieu_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
from django.shortcuts import render

# API: Lấy danh sách phiếu tạm trú/tạm vắng của người dùng hiện tại
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

# GET /api/tam-tru-tam-vang/ (danh sách phiếu của user hiện tại)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def danh_sach_phieu_user_view(request):
    user = request.user
    nhan_khau = getattr(user, 'nhan_khau', None)
    if not nhan_khau:
        return Response({"status": "error", "message": "Tài khoản chưa liên kết nhân khẩu."}, status=status.HTTP_400_BAD_REQUEST)
    phieu_list = PhieuTamTruTamVang.objects.filter(nhan_khau=nhan_khau)
    serializer = PhieuTamTruTamVangSerializer(phieu_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Tạo phiếu tạm trú - tạm vắng
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tao_phieu_view(request):
    try:
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
            "message": "Dữ liệu không hợp lệ",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Lỗi server: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#Xem chi tiết phiếu
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chi_tiet_phieu_view(request, id):
    try:
        phieu = PhieuTamTruTamVang.objects.get(id=id)
    except PhieuTamTruTamVang.DoesNotExist:
        return Response({"status": "error", "message": "Không tìm thấy phiếu"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PhieuTamTruTamVangSerializer(phieu)
    return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)

#Lọc phiếu theo thời gian - hiệu lực 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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


 

