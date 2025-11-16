from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from apps.tai_khoan.models import TaiKhoan
from apps.tai_khoan.serializers import TaiKhoanRegisterSerializer, TaiKhoanDetailSerializer, ManageUserPermissionsSerializer


@api_view(['POST'])
def register_view(request):
    data = {
        'username': request.data.get('username'),
        'email': request.data.get('email'),
        'password': request.data.get('password'),
    }
    serializer = TaiKhoanRegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save() # role: nguoi_dan, chuc_vu: None
        return Response({
            'status': 'success',
            'message': 'Đăng ký thành công.',
            'user': TaiKhoanDetailSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'status': 'error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
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
@permission_classes([IsAdminUser])
def list_users(request):
    users = TaiKhoan.objects.all()
    serializer = TaiKhoanDetailSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_detail(request, user_id):
    try:
        user = TaiKhoan.objects.get(id=user_id)
    except TaiKhoan.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TaiKhoanDetailSerializer(user)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def manage_user_permissions(request, user_id):
    """
    API để admin phân quyền người dùng, thay đổi role và chuc_vu.
    """
    try:
        user = TaiKhoan.objects.get(id=user_id)
    except TaiKhoan.DoesNotExist:
        return Response({'status': 'error', 'message': 'Người dùng không tồn tại.'},
                        status=status.HTTP_404_NOT_FOUND)

    serializer = ManageUserPermissionsSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': 'success',
            'message': f'Người dùng {user.username} đã được cập nhật.',
            'user': TaiKhoanDetailSerializer(user).data
        })
    return Response({'status': 'error', 'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user(request, user_id):
    try: 
        user = TaiKhoan.objects.get(id=user_id)
    except TaiKhoan.DoesNotExist:
        return Response({'message':'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ManageUserPermissionsSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(TaiKhoanDetailSerializer(user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = TaiKhoan.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted'})
    except TaiKhoan.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)