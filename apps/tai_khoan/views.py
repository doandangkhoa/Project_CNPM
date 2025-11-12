from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from apps.tai_khoan.models import TaiKhoan
import json

@csrf_exempt
def login_view(request):
    """
    Xử lý đăng nhập, sử dụng Model TaiKhoan làm đối tượng User.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')

            # 1. Kiểm tra xác thực trong database
            # Hàm authenticate TỰ ĐỘNG sử dụng TaiKhoan Model do đã khai báo AUTH_USER_MODEL
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # 2. Kiểm tra trạng thái hoạt động (Đây là bước bảo mật tốt)
                if user.is_active:
                    login(request, user)  # tạo session và lưu đối tượng TaiKhoan
                    
                    # 3. Trả về thông tin cần thiết (bao gồm chức vụ)
                    return JsonResponse({
                        'status': 'success',
                        'message': f'Đăng nhập thành công - Xin chào {user.username}',
                        'user_id': user.id,
                        # Trả về chức vụ để Frontend có thể phân quyền/chuyển hướng
                        'chuc_vu': user.chuc_vu, 
                        'chuc_vu_hien_thi': user.get_chuc_vu_display()
                    })
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Tài khoản của bạn đã bị vô hiệu hóa.'
                    }, status=403) # HTTP 403 Forbidden

            else:
                # Nếu user không tồn tại hoặc sai password
                return JsonResponse({
                    'status': 'error',
                    'message': 'Sai tên đăng nhập hoặc mật khẩu.'
                }, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Dữ liệu JSON không hợp lệ.'}, status=400)
        
    return JsonResponse({'status': 'error', 'message': 'Phương thức không hợp lệ.'}, status=405)


from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User # Cần import User Model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError # Cần để bắt lỗi username đã tồn tại
import json

@csrf_exempt
def register_view(request):
    """
    Xử lý yêu cầu POST để tạo tài khoản người dùng mới (đăng ký).
    Yêu cầu dữ liệu JSON: { "username": "...", "password": "...", "email": "..." }
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '') # Email là tùy chọn hoặc có thể bắt buộc tùy ý bạn

            # 1. Kiểm tra dữ liệu đầu vào cơ bản
            if not username or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Tên đăng nhập và mật khẩu không được để trống.'
                }, status=400)

            # 2. Tạo người dùng mới
            try:
                # Sử dụng create_user để đảm bảo mật khẩu được hash đúng cách
                user = TaiKhoan.objects.create_user(
                    username=username,
                    email=email,
                    password=password
                )
                
                # Có thể đăng nhập người dùng ngay sau khi tạo (tùy chọn)
                # user = authenticate(request, username=username, password=password)
                # if user is not None:
                #     login(request, user)
                
                return JsonResponse({
                    'status': 'success',
                    'message': f'Đăng ký thành công. Chào mừng {user.username}.',
                    'user_id': user.id
                }, status=201) # Sử dụng HTTP 201 Created

            except IntegrityError:
                # Bắt lỗi khi username đã tồn tại trong database (Django sẽ tự kiểm tra)
                return JsonResponse({
                    'status': 'error',
                    'message': 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'
                }, status=400)

            except Exception as e:
                # Bắt các lỗi khác (ví dụ: lỗi validate email)
                return JsonResponse({
                    'status': 'error',
                    'message': f'Lỗi không xác định khi tạo tài khoản: {str(e)}'
                }, status=500)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Dữ liệu JSON không hợp lệ.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Phương thức không hợp lệ.'}, status=405)