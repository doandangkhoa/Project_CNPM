from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from apps.tai_khoan.models import TaiKhoan
from apps.tai_khoan.serializers import TaiKhoanRegisterSerializer, TaiKhoanDetailSerializer


@api_view(['POST'])
def register_view(request):
    print("Request data:", request.data)  
    """
    API đăng ký người dùng mới.
    """
    serializer = TaiKhoanRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'status': 'success',
            'message': f'Đăng ký thành công.',
            'user': TaiKhoanDetailSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    print("Serializer errors:", serializer.errors) 
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    print("Request data:", request.data)
    """
    API đăng nhập.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    print("Authenticated user:", user)
    if user is None:
        return Response({'status': 'error', 'message': 'Sai tên đăng nhập hoặc mật khẩu.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if not user.is_active:
        return Response({'status': 'error', 'message': 'Tài khoản đã bị vô hiệu hóa.'},
                        status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    serializer = TaiKhoanDetailSerializer(user)
    return Response({
        'status': 'success',
        'message': f'Đăng nhập thành công, xin chào {user.username}',
        'user': serializer.data
    })
    
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'status': 'success', 'message': 'Đăng xuất thành công.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Lấy thông tin người dùng hiện tại (đã đăng nhập).
    """
    serializer = TaiKhoanDetailSerializer(request.user)
    return Response({'status': 'success', 'user': serializer.data})