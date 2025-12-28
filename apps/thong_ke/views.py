from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from datetime import date
from django.utils import timezone

# Import Models
from .models import ThongKeNhanKhau
from .serializers import ThongKeNhanKhauSerializer
from apps.nhan_khau.models import NhanKhau 
from apps.tam_tru_tam_vang.models import PhieuTamTruTamVang
from apps.ho_gia_dinh.models import HoGiaDinh
from apps.sinh_hoat.models import ThamGiaSinhHoat, LichSinhHoat
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def tao_bao_cao_thong_ke_view(request):
    try:
        # 1. Lấy dữ liệu từ request
        tu_ngay = request.data.get('tu_ngay', None)
        den_ngay = request.data.get('den_ngay', None)
        ghi_chu = request.data.get('ghi_chu', '')
        
        # 2. Thống kê số nhân khẩu & giới tính (Lấy từ bảng NhanKhau gốc)
        all_nhan_khau = NhanKhau.objects.all()
        tong_so_nhan_khau = all_nhan_khau.count()

        so_nam = all_nhan_khau.filter(gioi_tinh__iexact='Nam').count()
        so_nu = all_nhan_khau.filter(Q(gioi_tinh__iexact='Nữ') | Q(gioi_tinh__iexact='Nu')).count()
        
        # 3. Tính toán độ tuổi
        counts = {
            "mam_non": 0, "mau_giao": 0, "cap_1": 0,
            "cap_2": 0, "cap_3": 0, "lao_dong": 0, "nghi_huu": 0
        }
        current_year = date.today().year
        
        # Dùng values_list để tối ưu query (chỉ lấy cột ngày sinh)
        ds_ngay_sinh = all_nhan_khau.values_list('ngay_sinh', flat=True)
        
        for ngay_sinh in ds_ngay_sinh:
            if ngay_sinh:
                age = current_year - ngay_sinh.year
                if age < 3: 
                    counts["mam_non"] += 1
                elif age < 6:
                    counts["mau_giao"] += 1 
                elif age < 11:
                    counts["cap_1"] += 1
                elif age < 15:
                    counts["cap_2"] += 1
                elif age < 18:
                    counts["cap_3"] += 1
                elif age <= 60:
                    counts["lao_dong"] += 1
                else:
                    counts["nghi_huu"] += 1
        
        # 4. Thống kê Tạm trú / Tạm vắng (Trong khoảng thời gian)
        base_query = Q(trang_thai='da_duyet')
        if tu_ngay and den_ngay:
             time_query = Q(ngay_bat_dau__lte=den_ngay) & (Q(ngay_ket_thuc__gte=tu_ngay) | Q(ngay_ket_thuc__isnull=True))
             base_query &= time_query

        cnt_tam_tru = PhieuTamTruTamVang.objects.filter(loai_phieu='tam_tru').filter(base_query).count()
        cnt_tam_vang = PhieuTamTruTamVang.objects.filter(loai_phieu='tam_vang').filter(base_query).count()
        
        # 5. Lưu vào DB 
        nguoi_tao = request.user.tai_khoan if hasattr(request.user, 'tai_khoan') else None
        
        record = ThongKeNhanKhau.objects.create(
            nguoi_tao=nguoi_tao,
            tong_nhan_khau=tong_so_nhan_khau,
            so_nam=so_nam,
            so_nu=so_nu,
            
            # Map đúng key dictionary
            mam_non=counts["mam_non"],
            mau_giao=counts["mau_giao"],
            cap_1=counts["cap_1"],
            cap_2=counts["cap_2"],
            cap_3=counts["cap_3"],
            lao_dong=counts["lao_dong"],
            nghi_huu=counts["nghi_huu"],
            
            tam_tru=cnt_tam_tru,
            tam_vang=cnt_tam_vang,
            
            tu_ngay=tu_ngay,
            den_ngay=den_ngay,
            ghi_chu=ghi_chu
        )
        
        # 6. Trả về dữ liệu
        serializer = ThongKeNhanKhauSerializer(record)
        return Response({
            "status": "success",
            "message": "Đã tạo báo cáo thống kê thành công",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR in tao_bao_cao: {error_detail}")
        return Response({
            "status": "error",
            "message": f"Lỗi khi tạo thống kê: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def danh_sach_thong_ke_view(request):
    try:
        danh_sach = ThongKeNhanKhau.objects.all().order_by('-ngay_thong_ke')
        serializer = ThongKeNhanKhauSerializer(danh_sach, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def chi_tiet_thong_ke_view(request, pk):
    try:
        thong_ke = ThongKeNhanKhau.objects.get(pk=pk)
        serializer = ThongKeNhanKhauSerializer(thong_ke)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    except ThongKeNhanKhau.DoesNotExist:
        return Response({"status": "error", "message": "Không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE']) # Sửa lỗi: Thêm ký tự @
@permission_classes([AllowAny])
def xoa_thong_ke_view(request, pk):
    try:
        thong_ke = ThongKeNhanKhau.objects.get(pk=pk)
        thong_ke.delete()
        return Response({"status": "success", "message": "Đã xóa thành công"}, status=status.HTTP_200_OK)
    except ThongKeNhanKhau.DoesNotExist:
        return Response({"status": "error", "message": "Không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def bao_cao_gia_dinh_van_hoa_view(request):
    try:
        tu_ngay = request.query_params.get('tu_ngay', None)
        den_ngay = request.query_params.get('den_ngay', None)
        
        # 1. Lọc các buổi họp trong khoảng thời gian
        meetings_query = LichSinhHoat.objects.all()
        if tu_ngay and den_ngay:
            meetings_query = meetings_query.filter(ngay_to_chuc__range=[tu_ngay, den_ngay])
        
        total_meetings = meetings_query.count()
        
        # Convert to list of IDs to avoid SQL Server issues with __in in Count filter
        meeting_ids = list(meetings_query.values_list('id', flat=True))

        # 2. Kiểm tra division by zero
        if total_meetings == 0 or not meeting_ids:
            # Trả về danh sách tất cả hộ nhưng với 0 lần tham gia
            all_households = HoGiaDinh.objects.all()
            danh_sach = [{
                "id": ho.id,
                "chu_ho": ho.ho_ten_chu_ho if ho.ho_ten_chu_ho else "Chưa xác định",
                "dia_chi": ho.dia_chi,
                "so_lan_tham_gia": 0,
                "ty_le_dat": "0%"
            } for ho in all_households]
            
            return Response({
                "status": "success",
                "message": "Chưa có cuộc họp nào trong khoảng thời gian này.",
                "tong_so_buoi_hop": 0,
                "so_ho_dat_tieu_chuan": 0,
                "danh_sach": danh_sach
            }, status=status.HTTP_200_OK)

        # 3. Tối ưu Query: Dùng annotate để đếm số lần tham gia của mỗi hộ
        # Use meeting_ids instead of queryset to avoid SQL Server issues
        all_ho_gia_dinh = HoGiaDinh.objects.annotate(
            so_lan_tham_gia=Count(
                'tham_gia_hoat_dong', 
                filter=Q(
                    tham_gia_hoat_dong__lich_sinh_hoat_id__in=meeting_ids,
                    tham_gia_hoat_dong__da_tham_gia=True
                )
            )
        )

        count_dat = 0
        ds_ho_dat = []
        
        for ho in all_ho_gia_dinh:
            ty_le = ho.so_lan_tham_gia / total_meetings if total_meetings > 0 else 0
            
            if ty_le >= 0.8: # Tiêu chuẩn 80%
                count_dat += 1
            
            # Thêm vào danh sách nếu có tham gia hoặc đạt tiêu chuẩn
            if ho.so_lan_tham_gia > 0 or ty_le >= 0.8:
                ds_ho_dat.append({
                    "id": ho.id,
                    "chu_ho": ho.ho_ten_chu_ho if ho.ho_ten_chu_ho else "Chưa xác định",
                    "dia_chi": ho.dia_chi,
                    "so_lan_tham_gia": ho.so_lan_tham_gia,
                    "ty_le_dat": f"{round(ty_le * 100, 1)}%"
                })

        return Response({
            "status": "success",
            "tong_so_buoi_hop": total_meetings,
            "so_ho_dat_tieu_chuan": count_dat,
            "danh_sach": ds_ho_dat
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({
            "status": "error",
            "message": f"Lỗi hệ thống: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def lay_kpi_thong_ke_view(request):
    """Lấy các chỉ số KPI: Tổng nhân khẩu, Nam/Nữ, Tạm trú, Tạm vắng"""
    try:
        tu_ngay = request.query_params.get('tu_ngay', None)
        den_ngay = request.query_params.get('den_ngay', None)
        
        # 1. Tổng nhân khẩu & giới tính
        all_nhan_khau = NhanKhau.objects.all()
        tong_nhan_khau = all_nhan_khau.count()
        so_nam = all_nhan_khau.filter(gioi_tinh__iexact='Nam').count()
        so_nu = all_nhan_khau.filter(Q(gioi_tinh__iexact='Nữ') | Q(gioi_tinh__iexact='Nu')).count()
        
        # 2. Tạm trú / Tạm vắng
        base_query = Q(trang_thai='da_duyet')
        if tu_ngay and den_ngay:
            time_query = Q(ngay_bat_dau__lte=den_ngay) & (Q(ngay_ket_thuc__gte=tu_ngay) | Q(ngay_ket_thuc__isnull=True))
            base_query &= time_query
        
        so_tam_tru = PhieuTamTruTamVang.objects.filter(loai_phieu='tam_tru', trang_thai='da_duyet').count()
        so_tam_vang = PhieuTamTruTamVang.objects.filter(loai_phieu='tam_vang', trang_thai='da_duyet').count()
        
        return Response({
            "status": "success",
            "data": {
                "tong_nhan_khau": tong_nhan_khau,
                "so_nam": so_nam,
                "so_nu": so_nu,
                "so_tam_tru": so_tam_tru,
                "so_tam_vang": so_tam_vang
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Lỗi hệ thống: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def lay_bieu_do_tuoi_view(request):
    """Lấy dữ liệu biểu đồ phân bố độ tuổi"""
    try:
        tu_ngay = request.query_params.get('tu_ngay', None)
        den_ngay = request.query_params.get('den_ngay', None)
        
        all_nhan_khau = NhanKhau.objects.all()
        
        counts = {
            "mam_non": 0,
            "mau_giao": 0,
            "cap_1": 0,
            "cap_2": 0,
            "cap_3": 0,
            "lao_dong": 0,
            "nghi_huu": 0
        }
        
        current_year = date.today().year
        ds_ngay_sinh = all_nhan_khau.values_list('ngay_sinh', flat=True)
        
        for ngay_sinh in ds_ngay_sinh:
            if ngay_sinh:
                age = current_year - ngay_sinh.year
                if age < 3:
                    counts["mam_non"] += 1
                elif age < 6:
                    counts["mau_giao"] += 1
                elif age < 11:
                    counts["cap_1"] += 1
                elif age < 15:
                    counts["cap_2"] += 1
                elif age < 18:
                    counts["cap_3"] += 1
                elif age <= 60:
                    counts["lao_dong"] += 1
                else:
                    counts["nghi_huu"] += 1
        
        labels = ["Mầm non (0-3)", "Mầu giáo (3-6)", "Cấp 1 (6-11)", "Cấp 2 (11-15)", "Cấp 3 (15-18)", "Lao động (18-60)", "Nghỉ hưu (60+)"]
        data = [counts["mam_non"], counts["mau_giao"], counts["cap_1"], counts["cap_2"], counts["cap_3"], counts["lao_dong"], counts["nghi_huu"]]
        
        return Response({
            "status": "success",
            "labels": labels,
            "data": data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Lỗi hệ thống: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)