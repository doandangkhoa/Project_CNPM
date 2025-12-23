from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from apps.tai_khoan.models import TaiKhoan
from apps.tai_khoan.serializers import TaiKhoanRegisterSerializer, TaiKhoanDetailSerializer, ManageUserPermissionsSerializer, ChangePassWordSerializer
from apps.tai_khoan.serializers import MeUpdateSerializer
from rest_framework.parsers import MultiPartParser, FormParser


def _user_is_authorized_admin(user):
    """Return True if user is allowed to perform admin actions.
    Allowed when user is superuser OR user.role == 'can_bo' AND user.chuc_vu in allowed list.
    """
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if user.is_superuser:
        return True
    # positions that are considered authorized: tổ trưởng, tổ phó
    allowed_positions = ['to_truong', 'to_pho']
    return getattr(user, 'role', None) == 'can_bo' and getattr(user, 'chuc_vu', None) in allowed_positions


@api_view(['POST'])
def register_view(request):
    data = {
        'username': request.data.get('username'),
        'email': request.data.get('email'),
        'password': request.data.get('password'),
        'cccd': request.data.get('cccd'),
    }
    serializer = TaiKhoanRegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save() # role: nguoi_dan, chuc_vu: None
        # Try to auto-link with NhanKhau by CCCD
        if user.cccd:
            try:
                from apps.nhan_khau.models import NhanKhau
                nhan_khau = NhanKhau.objects.get(so_cccd=user.cccd)
                user.nhan_khau = nhan_khau
                user.save()
            except:
                pass
        return Response({
            'status': 'success',
            'message': 'Đăng ký thành công.',
            'user': TaiKhoanDetailSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'status': 'error',
        'message': 'Đăng ký thất bại',
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
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'status': 'success', 'message': 'Đăng xuất thành công.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    if not _user_is_authorized_admin(request.user):
        return Response({'status': 'error', 'message': 'Bạn không có quyền truy cập danh sách tài khoản'}, status=status.HTTP_403_FORBIDDEN)
    
    users = TaiKhoan.objects.all()
    serializer = TaiKhoanDetailSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    if not _user_is_authorized_admin(request.user):
        return Response({'status': 'error', 'message': 'Bạn không có quyền truy cập thông tin tài khoản'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = TaiKhoan.objects.get(id=user_id)
    except TaiKhoan.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TaiKhoanDetailSerializer(user)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    if not _user_is_authorized_admin(request.user):
        return Response({'status': 'error', 'message': 'Bạn không có quyền cập nhật tài khoản'}, status=status.HTTP_403_FORBIDDEN)
    
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
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if not _user_is_authorized_admin(request.user):
        return Response({'status': 'error', 'message': 'Bạn không có quyền xóa tài khoản'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = TaiKhoan.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted'})
    except TaiKhoan.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePassWordSerializer(
        data = request.data,
        context={"user": user}
    )
    
    if serializer.is_valid():
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        return Response({"status":"success", "message":"Đổi mật khẩu thành công"})
    return Response({"status": "error", "errors": serializer.errors}, status=400)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def me_view(request):
    user = request.user
    if request.method == 'GET':
        serializer = TaiKhoanDetailSerializer(user)
        return Response({'user': serializer.data})

    # For PUT/PATCH allow multipart form (avatar)
    # Use serializer that accepts avatar
    parser_classes = (MultiPartParser, FormParser)
    # Build serializer with files + data
    data = {**request.data}
    # If file present, it will be in request.FILES and included by serializer when passed request.data
    serializer = MeUpdateSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'success', 'user': TaiKhoanDetailSerializer(user).data})
    return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)