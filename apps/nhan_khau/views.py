from django.shortcuts import render
from .models import NhanKhau, BienDongNhanKhau
from .serializers import BienDongNhanKhauSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def xoa_nhan_khau(request, nhan_khau_id):
    pass


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tao_bien_dong_nhan_khau(request):
    serializer = BienDongNhanKhauSerializer(data=request.data, context={'request':request})
    if serializer.is_valid():
        bien_dong = serializer.save()
        return Response({
            'status':'success',
            'message': 'Tạo biến động nhân khẩu thành công',
            'bien_dong': BienDongNhanKhauSerializer(bien_dong).data
        }, status=status.HTTP_201_CREATED)
    return Response({'status':'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    