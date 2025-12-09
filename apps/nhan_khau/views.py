from django.shortcuts import render
from rest_framework.response import Response
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import date, datetime

from .models import NhanKhau, BienDongNhanKhau
from apps.can_bo.models import CanBo
from apps.ho_gia_dinh.models import HoGiaDinh
from .serializers import NhanKhauSerializer, BienDongNhanKhauSerializer, NhanKhauCreateUpdateSerializer


def _user_is_authorized_can_bo(user):
    """Return True if user is allowed to perform can_bo actions.
    Allowed when user is superuser OR user.role == 'can_bo' AND user.chuc_vu in allowed list.
    """
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if user.is_superuser:
        return True
    # positions that are considered authorized: tổ trưởng, tổ phó, cán bộ
    allowed_positions = ['to_truong', 'to_pho', 'can_bo']
    return getattr(user, 'role', None) == 'can_bo' and getattr(user, 'chuc_vu', None) in allowed_positions


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def them_moi_nhan_khau(request):
    """
    API thêm mới nhân khẩu.
    Tự động ghi log 'TAO_MOI' vào bảng BienDongNhanKhau.
    """
    data = request.data.copy() # Copy data để có thể chỉnh sửa trước khi đưa vào serializer

    # --- LOGIC XỬ LÝ MỚI SINH ---
    ngay_sinh_str = data.get('ngay_sinh')
    if ngay_sinh_str:
        try:
            # Parse ngày sinh từ chuỗi (VD: "2023-10-25")
            ngay_sinh = datetime.strptime(ngay_sinh_str, '%Y-%m-%d').date()
            today = date.today()
            
            
            # Tính tuổi
            tuoi = today.year - ngay_sinh.year - ((today.month, today.day) < (ngay_sinh.month, ngay_sinh.day))
            
            # Nếu dưới 1 tuổi (hoặc mới sinh)
            if tuoi <= 0:
                # Yêu cầu: Nơi thường trú trước đây ghi là "Mới sinh"
                data['dia_chi_thuong_tru_truoc_day'] = "Mới sinh"
                
                # Yêu cầu: Bỏ trống nghề nghiệp, nơi làm việc, CCCD
                if not data.get('nghe_nghiep'):
                    data['nghe_nghiep'] = None # Hoặc để None tùy bạn
                data['noi_lam_viec'] = None
                
                # Xử lý CCCD: Nếu gửi lên chuỗi rỗng "" thì set về None để tránh lỗi unique
                if 'so_cccd' in data and data['so_cccd'] == "":
                    data['so_cccd'] = None

        except ValueError:
            pass # Nếu ngày sinh sai định dạng thì để Serializer lo validate
        
    # 1. Validate dữ liệu đầu vào
    # NOTE: use the modified `data` (we adjusted newborn/default fields above)
    serializer = NhanKhauCreateUpdateSerializer(data=data)

    if serializer.is_valid():
        # 3. Kiểm tra quyền: chỉ `can_bo` (hoặc staff/superuser) được phép
        user = request.user
        if not _user_is_authorized_can_bo(user):
            return Response({'status': 'error', 'message': 'User không có quyền (chỉ cán bộ: tổ trưởng/tổ phó/cán bộ được phép)'}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                # 2. Lưu nhân khẩu mới
                nhan_khau = serializer.save()

                # 4. Lấy CanBo nếu tồn tại (một số tài khoản cán bộ có thể chưa có bản ghi CanBo)
                can_bo = CanBo.objects.filter(tai_khoan=user).first()

                # 5. Ghi log biến động TAO_MOI (can_bo có thể là None; field FK cho phép null)
                BienDongNhanKhau.objects.create(
                    nhan_khau=nhan_khau,
                    ho_khau=nhan_khau.ho_gia_dinh,
                    can_bo_thuc_hien=can_bo,
                    loai_bien_dong='TAO_MOI',
                    mo_ta=f"Thêm mới nhân khẩu: {nhan_khau.ho_ten}"
                )

            return Response({
                'status': 'success',
                'message': 'Thêm mới nhân khẩu thành công',
                'data': NhanKhauSerializer(nhan_khau).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Any unexpected error
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cap_nhat_nhan_khau(request, pk):
    """
    API cập nhật thông tin nhân khẩu.
    Tự động ghi log 'CAP_NHAT'.
    """
    try:
        nhan_khau = NhanKhau.objects.get(pk=pk)
    except NhanKhau.DoesNotExist:
        return Response({'status': 'error', 'message': 'Không tìm thấy nhân khẩu'}, status=status.HTTP_404_NOT_FOUND)

    serializer = NhanKhauCreateUpdateSerializer(nhan_khau, data=request.data, partial=True)

    if serializer.is_valid():
        # Kiểm tra quyền trước khi lưu
        user = request.user
        if not _user_is_authorized_can_bo(user):
            return Response({'status': 'error', 'message': 'Người dùng không có quyền (chỉ cán bộ: tổ trưởng/tổ phó/cán bộ được phép)'}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                serializer.save()

                # Ghi log CAP_NHAT
                can_bo = CanBo.objects.filter(tai_khoan=user).first()
                BienDongNhanKhau.objects.create(
                    nhan_khau=nhan_khau,
                    ho_khau=nhan_khau.ho_gia_dinh,
                    can_bo_thuc_hien=can_bo,
                    loai_bien_dong='CAP_NHAT',
                    mo_ta="Cập nhật thông tin nhân khẩu"
                )

            return Response({'status': 'success', 'message': 'Cập nhật thành công'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
    noi_sinh = request.query_params.get('noi_sinh', '').strip()
    nguyen_quan = request.query_params.get('nguyen_quan', '').strip()
    dan_toc = request.query_params.get('dan_toc', '').strip()
    nghe_nghiep = request.query_params.get('nghe_nghiep', '').strip()
    noi_lam_viec = request.query_params.get('noi_lam_viec', '').strip()
    dia_chi_thuong_tru_truoc_day = request.query_params.get('dia_chi_thuong_tru_truoc_day', '').strip()
    trang_thai = request.query_params.get('trang_thai', '').strip()
    quan_he_voi_chu_ho = request.query_params.get('quan_he_voi_chu_ho', '').strip()

    if ho_ten:
        queryset = queryset.filter(Q(ho_ten__icontains=ho_ten) | Q(bi_danh__icontains=ho_ten))
    if so_cccd:
        queryset = queryset.filter(so_cccd__icontains=so_cccd)
    if ngay_sinh:
        queryset = queryset.filter(ngay_sinh=ngay_sinh)
    if so_ho_khau:
        queryset = queryset.filter(ho_gia_dinh__so_ho_khau__icontains=so_ho_khau)

    # Additional filters: only apply when parameter provided (non-empty)
    if noi_sinh:
        queryset = queryset.filter(noi_sinh__icontains=noi_sinh)
    if nguyen_quan:
        queryset = queryset.filter(nguyen_quan__icontains=nguyen_quan)
    if dan_toc:
        queryset = queryset.filter(dan_toc__icontains=dan_toc)
    if nghe_nghiep:
        queryset = queryset.filter(nghe_nghiep__icontains=nghe_nghiep)
    if noi_lam_viec:
        queryset = queryset.filter(noi_lam_viec__icontains=noi_lam_viec)
    if dia_chi_thuong_tru_truoc_day:
        queryset = queryset.filter(dia_chi_thuong_tru_truoc_day__icontains=dia_chi_thuong_tru_truoc_day)
    if trang_thai:
        queryset = queryset.filter(trang_thai=trang_thai)
    if quan_he_voi_chu_ho:
        queryset = queryset.filter(quan_he_voi_chu_ho__icontains=quan_he_voi_chu_ho)

    # phân trang
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def xoa_nhan_khau(request, pk):
    """
    API Xóa nhân khẩu (Thực chất là Soft Delete - Đánh dấu là đã xóa).
    Dùng cho trường hợp nhập sai hoặc xóa nhầm, không phải chuyển đi/chết.
    """
    try:
        nhan_khau = NhanKhau.objects.get(pk=pk)
    except NhanKhau.DoesNotExist:
        return Response({'status': 'error', 'message': 'Không tìm thấy'}, status=status.HTTP_404_NOT_FOUND)

    ly_do = request.data.get('ly_do', 'Xóa nhân khẩu do nhập sai')

    try:
        with transaction.atomic():
            # 1. Tạo biến động loại XOA (kiểm tra quyền và lấy CanBo nếu có)
            user = request.user
            if not _user_is_authorized_can_bo(user):
                return Response({'status': 'error', 'message': 'User không có quyền (chỉ cán bộ: tổ trưởng/tổ phó/cán bộ được phép)'}, status=status.HTTP_403_FORBIDDEN)

            can_bo = CanBo.objects.filter(tai_khoan=user).first()
            BienDongNhanKhau.objects.create(
                nhan_khau=nhan_khau,
                ho_khau=nhan_khau.ho_gia_dinh,
                can_bo_thuc_hien=can_bo,
                loai_bien_dong='XOA',
                mo_ta=ly_do
            )

            # 2. Xử lý trạng thái (Có thể xóa hẳn record hoặc để Null hộ khẩu)
            # Ở đây mình chọn cách xóa quan hệ với Hộ khẩu nhưng giữ record
            nhan_khau.ho_gia_dinh = None
            nhan_khau.ghi_chu = f"Đã xóa. Lý do: {ly_do}"
            nhan_khau.save()

        return Response({'status': 'success', 'message': 'Đã xóa nhân khẩu khỏi hộ gia đình'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tao_bien_dong_nhan_khau(request):
    # Only allow cán bộ (to_truong/to_pho/can_bo) or superuser to create bien dong
    user = request.user
    if not _user_is_authorized_can_bo(user):
        return Response({'status': 'error', 'message': 'User không có quyền tạo biến động nhân khẩu'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BienDongNhanKhauSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        bien_dong = serializer.save()
        return Response({
            'status': 'success',
            'message': 'Tạo biến động nhân khẩu thành công',
            'bien_dong': BienDongNhanKhauSerializer(bien_dong).data
        }, status=status.HTTP_201_CREATED)
    return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lich_su_thay_doi_ho_khau(request, ho_khau_id):
    """
    API xem lịch sử biến động của một Hộ gia đình.
    Ví dụ: Hộ ông A có: 
    - 2023: Thêm con mới sinh
    - 2024: Con cả chuyển đi
    - 2025: Ông A qua đời
    """
    # 1. Kiểm tra hộ khẩu có tồn tại không
    try:
        ho_gia_dinh = HoGiaDinh.objects.get(pk=ho_khau_id)
    except HoGiaDinh.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Không tìm thấy hộ gia đình này.'
        }, status=status.HTTP_404_NOT_FOUND)

    # 2. Truy vấn bảng Biến động, lọc theo ho_khau
    # select_related để tối ưu truy vấn (tránh query lặp lại vào bảng NhanKhau và CanBo)
    lich_su = BienDongNhanKhau.objects.filter(ho_khau_id=ho_khau_id)\
                                      .select_related('nhan_khau', 'can_bo_thuc_hien')\
                                      .order_by('-ngay_thay_doi') # Mới nhất lên đầu

    # 3. Serialize dữ liệu
    serializer = BienDongNhanKhauSerializer(lich_su, many=True)

    return Response({
        'status': 'success',
        'ho_gia_dinh': ho_gia_dinh.so_ho_khau, # Trả về số sổ để frontend hiển thị tiêu đề
        'chu_ho': ho_gia_dinh.chu_ho.ho_ten if ho_gia_dinh.chu_ho else "Chưa có chủ hộ",
        'tong_so_bien_dong': lich_su.count(),
        'data': serializer.data
    }, status=status.HTTP_200_OK)