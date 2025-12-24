from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import LichSinhHoat, ThamGiaSinhHoat
from apps.ho_gia_dinh.models import HoGiaDinh
from .serializers import LichSinhHoatSerializer, ThamGiaSinhHoatSerializer


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
    Luôn trả về FULL danh sách hộ, kèm trạng thái tick (True/False)
    """
    # 1. Lấy tất cả hộ gia đình trong khu dân cư (Ví dụ 100 hộ)
    tat_ca_ho = HoGiaDinh.objects.all().order_by('so_ho_khau') # Sắp xếp cho dễ nhìn
    
    # 2. Lấy danh sách ID của những hộ ĐÃ điểm danh trong buổi này
    # values_list('ho_gia_dinh_id', flat=True) sẽ trả về list dạng [1, 5, 9...] giúp tra cứu cực nhanh
    cac_ho_da_tham_gia = set(
        ThamGiaSinhHoat.objects.filter(lich_sinh_hoat_id=lich_sinh_hoat_id)
        .values_list('ho_gia_dinh_id', flat=True)
    )
    
    # 3. Ghép dữ liệu (Mapping)
    ket_qua = []
    for ho in tat_ca_ho:
        ket_qua.append({
            'ho_gia_dinh_id': ho.id,
            'so_ho_khau': ho.so_ho_khau,
            'ten_chu_ho': ho.ho_ten_chu_ho, # Hoặc trường tên chủ hộ của bạn
            # Kiểm tra xem ID hộ này có nằm trong danh sách đã tham gia không
            'da_tham_gia': ho.id in cac_ho_da_tham_gia 
        })
        
    return Response(ket_qua)