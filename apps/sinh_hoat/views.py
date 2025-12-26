from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from datetime import datetime
from .models import LichSinhHoat, ThamGiaSinhHoat, ThuMoiSinhHoat, ChungChiGiaDinhVanHoa
from apps.ho_gia_dinh.models import HoGiaDinh
from .serializers import (
    LichSinhHoatSerializer, 
    ThamGiaSinhHoatSerializer,
    ThuMoiSinhHoatSerializer,
    ChungChiGiaDinhVanHoaSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xem_danh_sach_sinh_hoat(request):
    # API để xem danh sách tất cả các buổi sinh hoạt
	sinh_hoat_list = LichSinhHoat.objects.all().order_by('-ngay_to_chuc', '-gio_to_chuc')
	serializer = LichSinhHoatSerializer(sinh_hoat_list, many=True)
	return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tim_kiem_lich_sinh_hoat(request):
	"""
	API để tìm kiếm buổi sinh hoạt theo chủ đề hoặc ngày tổ chức
	Query Params:
	- chu_de: Từ khóa tìm kiếm trong chủ đề
	- ngay_to_chuc: Ngày tổ chức (định dạng YYYY-MM-DD)
	"""
	chu_de = request.query_params.get('chu_de', None)
	ngay_to_chuc = request.query_params.get('ngay_to_chuc', None)

	queryset = LichSinhHoat.objects.all()

	if chu_de:
		queryset = queryset.filter(chu_de__icontains=chu_de)
	if ngay_to_chuc:
		queryset = queryset.filter(ngay_to_chuc=ngay_to_chuc)

	serializer = LichSinhHoatSerializer(queryset, many=True)
	return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def them_moi_lich_sinh_hoat(request):
	"""
	JSON Input:
	{
	"chu_de": "Họp triển khai Tết Nguyên Đán",
    "ngay_to_chuc": "2024-02-10",
    "gio_to_chuc": "08:00",
    "dia_diem": "Nhà văn hóa khu 5",
    "noi_dung": "Bàn về việc trang trí và tặng quà"
	}
	"""
	serializer = LichSinhHoatSerializer(data=request.data)
	if serializer.is_valid():
		# Gán người tạo là cán bộ hiện tại (nếu có)
		try:
			can_bo = request.user.canbo
			serializer.save(nguoi_tao=can_bo)
		except:
			serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	#Nếu dữ liệu không hợp lệ, trả về lỗi
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xem_chi_tiet_lich_sinh_hoat(request, pk):
    try:
        sinh_hoat = LichSinhHoat.objects.get(pk=pk)
    except LichSinhHoat.DoesNotExist:
        return Response({"error": "Không tìm thấy buổi sinh hoạt để xem"}, status=status.HTTP_404_NOT_FOUND)

    serializer = LichSinhHoatSerializer(sinh_hoat)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def cap_nhat_lich_sinh_hoat(request, pk):
	"""
	JSON:
	{
		"chu_de": "Họp triển khai Tết Nguyên Đán (Đã sửa)",
		"ngay_to_chuc": "2024-02-10",
		"gio_to_chuc": "14:00",
		"dia_diem": "Nhà văn hóa khu 5",
		"noi_dung": "Sửa lại giờ họp nhé bà con"
	}
	"""
	try:
		sinh_hoat = LichSinhHoat.objects.get(pk=pk)
	except LichSinhHoat.DoesNotExist:
		return Response({"error": "Không tìm thấy buổi sinh hoạt để cập nhật"}, status=status.HTTP_404_NOT_FOUND)

	serializer = LichSinhHoatSerializer(sinh_hoat, data=request.data, partial=(request.method == 'PATCH'))
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def xoa_lich_sinh_hoat(request, pk):
	try:
		sinh_hoat = LichSinhHoat.objects.get(pk=pk)
	except LichSinhHoat.DoesNotExist:
		return Response({"error": "Không tìm thấy buổi sinh hoạt để xóa"}, status=status.HTTP_404_NOT_FOUND)

	sinh_hoat.delete()
	return Response({"message": "Đã xóa buổi sinh hoạt thành công!"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tich_diem_danh_tung_nguoi(request):
    """
	API để tích điểm danh từng hộ gia đình (Auto-save)
    Frontend gọi API này ngay sự kiện onClick / onChange của checkbox
    Input JSON:
    {
    "lich_id": 1,
    "ho_id": 10,
    "trang_thai": true #hoac false
    }
	"""
    lich_id = request.data.get('lich_id')
    ho_id = request.data.get('ho_id')
    trang_thai = request.data.get('trang_thai') # True la co mat, False la vang
    # Kiểm tra dữ liệu đầu vào
    if not all([lich_id, ho_id, trang_thai is not None]):
        return Response({"error": "Thiếu dữ liệu bắt buộc"}, status=400)
     # Cập nhật hoặc tạo mới bản ghi điểm danh
    obj, created = ThamGiaSinhHoat.objects.update_or_create(
        lich_sinh_hoat_id=lich_id,
        ho_gia_dinh_id=ho_id,
        defaults={'da_tham_gia': trang_thai}
	)
    return Response({
        "message": f"Đã cập nhật hộ {ho_id}: {'Có mặt' if trang_thai else 'Vắng'}",
        "created": created
    })

# . API Lấy danh sách để hiển thị bảng điểm danh
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lay_danh_sach_diem_danh(request, lich_sinh_hoat_id):
    """
    Trả về danh sách tất cả các hộ kèm trạng thái đã tham gia hay chưa của buổi họp đó
    """
    # Nếu chưa điểm danh bao giờ, trả về list hộ để người dùng tích
    # Nếu đã điểm danh rồi, trả về kết quả cũ
    
    records = ThamGiaSinhHoat.objects.filter(lich_sinh_hoat_id=lich_sinh_hoat_id).select_related('ho_gia_dinh')
    
    if not records.exists():
        # Trường hợp chưa điểm danh lần nào: Trả về danh sách hộ gia đình thô
        # Frontend sẽ hiển thị tất cả là chưa tích
        ds_ho = HoGiaDinh.objects.all()
        data = [{'ho_gia_dinh': ho.id, 
                 'ten_chu_ho': ho.ho_ten_chu_ho, 
                 'so_ho_khau': ho.so_ho_khau, 
                 'da_tham_gia': False} for ho in ds_ho]
        return Response(data)
    
    serializer = ThamGiaSinhHoatSerializer(records, many=True)
    return Response(serializer.data)


# ============ API GỬI THƯ MỜI ============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gui_thu_moi_toan_bo(request, lich_sinh_hoat_id):
    """
    API để gửi thư mời cho TẤT CẢ các hộ gia đình cho buổi sinh hoạt
    Tự động tạo các bản ghi ThuMoiSinhHoat
    """
    try:
        lich_sinh_hoat = LichSinhHoat.objects.get(pk=lich_sinh_hoat_id)
    except LichSinhHoat.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy buổi sinh hoạt"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Lấy tất cả hộ gia đình
    ds_ho = HoGiaDinh.objects.all()
    
    # Tạo hoặc cập nhật bản ghi thư mời
    tao_moi = 0
    cap_nhat = 0
    
    with transaction.atomic():
        for ho in ds_ho:
            obj, created = ThuMoiSinhHoat.objects.update_or_create(
                lich_sinh_hoat=lich_sinh_hoat,
                ho_gia_dinh=ho,
                defaults={'trang_thai': 'da_gui'}
            )
            if created:
                tao_moi += 1
            else:
                cap_nhat += 1

    return Response({
        "message": "Gửi thư mời thành công",
        "tao_moi": tao_moi,
        "cap_nhat": cap_nhat,
        "tong_cong": tao_moi + cap_nhat
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gui_thu_moi_chon_loc(request, lich_sinh_hoat_id):
    """
    API để gửi thư mời cho những hộ gia đình được chọn
    Input JSON:
    {
        "danh_sach_ho_id": [1, 2, 3, ...]
    }
    """
    try:
        lich_sinh_hoat = LichSinhHoat.objects.get(pk=lich_sinh_hoat_id)
    except LichSinhHoat.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy buổi sinh hoạt"},
            status=status.HTTP_404_NOT_FOUND
        )

    danh_sach_ho_id = request.data.get('danh_sach_ho_id', [])
    
    if not danh_sach_ho_id:
        return Response(
            {"error": "Danh sách hộ không được để trống"},
            status=status.HTTP_400_BAD_REQUEST
        )

    tao_moi = 0
    cap_nhat = 0

    with transaction.atomic():
        for ho_id in danh_sach_ho_id:
            try:
                ho = HoGiaDinh.objects.get(pk=ho_id)
                obj, created = ThuMoiSinhHoat.objects.update_or_create(
                    lich_sinh_hoat=lich_sinh_hoat,
                    ho_gia_dinh=ho,
                    defaults={'trang_thai': 'da_gui'}
                )
                if created:
                    tao_moi += 1
                else:
                    cap_nhat += 1
            except HoGiaDinh.DoesNotExist:
                pass

    return Response({
        "message": "Gửi thư mời thành công",
        "tao_moi": tao_moi,
        "cap_nhat": cap_nhat,
        "tong_cong": tao_moi + cap_nhat
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xem_danh_sach_thu_moi(request, lich_sinh_hoat_id):
    """
    API để xem danh sách thư mời của một buổi sinh hoạt
    Query params:
    - trang_thai: Lọc theo trạng thái (chua_gui, da_gui, da_xem, da_phan_hoi)
    """
    try:
        lich_sinh_hoat = LichSinhHoat.objects.get(pk=lich_sinh_hoat_id)
    except LichSinhHoat.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy buổi sinh hoạt"},
            status=status.HTTP_404_NOT_FOUND
        )

    trang_thai = request.query_params.get('trang_thai', None)
    
    thu_moi = ThuMoiSinhHoat.objects.filter(lich_sinh_hoat=lich_sinh_hoat)
    
    if trang_thai:
        thu_moi = thu_moi.filter(trang_thai=trang_thai)

    serializer = ThuMoiSinhHoatSerializer(thu_moi, many=True)
    return Response({
        "danh_sach": serializer.data,
        "tong_so": thu_moi.count()
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def cap_nhat_trang_thai_thu_moi(request, thu_moi_id):
    """
    API để cập nhật trạng thái thư mời
    Input JSON:
    {
        "trang_thai": "da_xem",  // hoặc "da_phan_hoi"
        "phan_hoi_tham_gia": true,  // true: sẽ đi, false: không đi
        "ghi_chu": "Sẽ đi cùng gia đình"
    }
    """
    try:
        thu_moi = ThuMoiSinhHoat.objects.get(pk=thu_moi_id)
    except ThuMoiSinhHoat.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy thư mời"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Cập nhật trạng thái nếu có
    if 'trang_thai' in request.data:
        thu_moi.trang_thai = request.data['trang_thai']
        
        # Nếu là "da_xem", cập nhật ngay_xem
        if request.data['trang_thai'] == 'da_xem' and not thu_moi.ngay_xem:
            thu_moi.ngay_xem = datetime.now()

    # Cập nhật phản hồi tham gia
    if 'phan_hoi_tham_gia' in request.data:
        thu_moi.phan_hoi_tham_gia = request.data['phan_hoi_tham_gia']
        if not thu_moi.ngay_phan_hoi:
            thu_moi.ngay_phan_hoi = datetime.now()
            thu_moi.trang_thai = 'da_phan_hoi'

    # Cập nhật ghi chú
    if 'ghi_chu' in request.data:
        thu_moi.ghi_chu = request.data['ghi_chu']

    thu_moi.save()
    
    serializer = ThuMoiSinhHoatSerializer(thu_moi)
    return Response(serializer.data)


# ============ API QUẢN LÝ CHỨNG CHỈ GIA ĐÌNH VĂN HÓA ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xem_chung_chi_gia_dinh_van_hoa(request, ho_id, nam=None):
    """
    API để xem chứng chỉ "Gia đình văn hóa" của một hộ
    """
    try:
        ho = HoGiaDinh.objects.get(pk=ho_id)
    except HoGiaDinh.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy hộ gia đình"},
            status=status.HTTP_404_NOT_FOUND
        )

    if nam:
        chung_chi = ChungChiGiaDinhVanHoa.objects.filter(ho_gia_dinh=ho, nam=nam)
    else:
        chung_chi = ChungChiGiaDinhVanHoa.objects.filter(ho_gia_dinh=ho)

    serializer = ChungChiGiaDinhVanHoaSerializer(chung_chi, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cap_nhat_tieu_chi_gia_dinh_van_hoa(request):
    """
    API để cập nhật tiêu chí "Gia đình văn hóa" dựa trên 80% tổng số buổi sinh hoạt
    Input JSON:
    {
        "ho_id": 1,
        "nam": 2024,
        "tieu_chi_tham_gia": 80  // Tỷ lệ tham gia tối thiểu (%)
    }
    """
    ho_id = request.data.get('ho_id')
    nam = request.data.get('nam')
    tieu_chi_tham_gia = request.data.get('tieu_chi_tham_gia', 80)

    if not ho_id or not nam:
        return Response(
            {"error": "Thiếu thông tin hộ hoặc năm"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        ho = HoGiaDinh.objects.get(pk=ho_id)
    except HoGiaDinh.DoesNotExist:
        return Response(
            {"error": "Không tìm thấy hộ gia đình"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Đếm tổng số buổi sinh hoạt trong năm
    tong_so_buoi = LichSinhHoat.objects.filter(
        ngay_to_chuc__year=nam
    ).count()

    # Đếm số lần tham gia trong năm
    so_lan_tham_gia = ThamGiaSinhHoat.objects.filter(
        ho_gia_dinh=ho,
        lich_sinh_hoat__ngay_to_chuc__year=nam,
        da_tham_gia=True
    ).count()

    # Tính tỷ lệ tham gia
    ty_le_tham_gia = (so_lan_tham_gia / tong_so_buoi * 100) if tong_so_buoi > 0 else 0

    # Kiểm tra đạt tiêu chí hay không (>= tieu_chi_tham_gia %)
    dat_chuan = ty_le_tham_gia >= tieu_chi_tham_gia

    # Cập nhật hoặc tạo mới bản ghi
    chung_chi, created = ChungChiGiaDinhVanHoa.objects.update_or_create(
        ho_gia_dinh=ho,
        nam=nam,
        defaults={
            'so_lan_tham_gia': so_lan_tham_gia,
            'tong_so_buoi_sinh_hoat': tong_so_buoi,
            'tieu_chi_tham_gia': tieu_chi_tham_gia,
            'dat_chuan': dat_chuan
        }
    )

    serializer = ChungChiGiaDinhVanHoaSerializer(chung_chi)
    return Response({
        "message": "Cập nhật thành công",
        "created": created,
        "so_lan_tham_gia": so_lan_tham_gia,
        "tong_so_buoi": tong_so_buoi,
        "ty_le_tham_gia": round(ty_le_tham_gia, 2),
        "data": serializer.data
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tinh_toan_gia_dinh_van_hoa_theo_nam(request):
    """
    API để tính toán lại "Gia đình văn hóa" cho tất cả hộ của một năm
    Tiêu chí: >= 80% tổng số buổi sinh hoạt
    Input JSON:
    {
        "nam": 2024,
        "tieu_chi_tham_gia": 80  // Tỷ lệ tham gia tối thiểu (%), mặc định 80%
    }
    """
    nam = request.data.get('nam')
    tieu_chi_tham_gia = request.data.get('tieu_chi_tham_gia', 80)

    if not nam:
        return Response(
            {"error": "Thiếu năm"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Lấy tất cả hộ gia đình
    ds_ho = HoGiaDinh.objects.all()

    # Đếm tổng số buổi sinh hoạt trong năm
    tong_so_buoi = LichSinhHoat.objects.filter(
        ngay_to_chuc__year=nam
    ).count()

    cap_nhat = 0
    dat_chuan = 0
    chua_dat = 0

    with transaction.atomic():
        for ho in ds_ho:
            # Đếm số lần tham gia trong năm
            so_lan_tham_gia = ThamGiaSinhHoat.objects.filter(
                ho_gia_dinh=ho,
                lich_sinh_hoat__ngay_to_chuc__year=nam,
                da_tham_gia=True
            ).count()

            # Tính tỷ lệ tham gia
            ty_le_tham_gia = (so_lan_tham_gia / tong_so_buoi * 100) if tong_so_buoi > 0 else 0

            # Kiểm tra đạt tiêu chí hay không
            dat = ty_le_tham_gia >= tieu_chi_tham_gia

            # Cập nhật hoặc tạo mới bản ghi
            chung_chi, created = ChungChiGiaDinhVanHoa.objects.update_or_create(
                ho_gia_dinh=ho,
                nam=nam,
                defaults={
                    'so_lan_tham_gia': so_lan_tham_gia,
                    'tong_so_buoi_sinh_hoat': tong_so_buoi,
                    'tieu_chi_tham_gia': tieu_chi_tham_gia,
                    'dat_chuan': dat
                }
            )

            if created or chung_chi.dat_chuan != dat:
                cap_nhat += 1

            if dat:
                dat_chuan += 1
            else:
                chua_dat += 1

    return Response({
        "message": f"Tính toán xong cho năm {nam}",
        "cap_nhat": cap_nhat,
        "tong_so_ho": ds_ho.count(),
        "tong_so_buoi_sinh_hoat": tong_so_buoi,
        "dat_chuan": dat_chuan,
        "chua_dat": chua_dat,
        "tieu_chi_tham_gia": tieu_chi_tham_gia
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xem_danh_sach_gia_dinh_van_hoa(request, nam):
    """
    API để xem danh sách các hộ gia đình đạt "Gia đình văn hóa" của một năm
    Query params:
    - dat_chuan: true/false để lọc đạt hoặc chưa đạt
    """
    dat_chuan_param = request.query_params.get('dat_chuan', None)

    chung_chi = ChungChiGiaDinhVanHoa.objects.filter(nam=nam)

    if dat_chuan_param is not None:
        dat_chuan = dat_chuan_param.lower() == 'true'
        chung_chi = chung_chi.filter(dat_chuan=dat_chuan)

    serializer = ChungChiGiaDinhVanHoaSerializer(chung_chi, many=True)
    return Response({
        "nam": nam,
        "danh_sach": serializer.data,
        "tong_so": chung_chi.count()
    })