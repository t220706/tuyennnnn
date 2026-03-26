
# Ứng dụng AI Thị giác Máy tính - Phân tích Chuyển động Cơ học từ Video

## Tổng quan
Web app chuyên nghiệp cho phép giảng viên/nghiên cứu sinh upload video thí nghiệm cơ học, sử dụng AI để phân tích và trích xuất các thông số chuyển động.

## Các trang chính

### 1. Trang chủ (Dashboard)
- Header với tên nghiên cứu, logo
- Thống kê tổng quan: số video đã phân tích, các loại chuyển động đã nhận dạng
- Danh sách các phiên phân tích gần đây
- Nút "Upload Video Mới" nổi bật

### 2. Trang Upload & Phân tích Video
- Khu vực kéo thả hoặc chọn file video
- Video player hiển thị video đã upload
- Nút "Phân tích bằng AI" - gửi video lên AI (Lovable AI với Gemini) để:
  - Nhận dạng loại chuyển động (thẳng đều, biến đổi đều, tròn, ném xiên, dao động, v.v.)
  - Trích xuất quỹ đạo chuyển động
  - Ước lượng các thông số: vận tốc, gia tốc, chu kỳ, biên độ...
  - Mô tả chi tiết chuyển động quan sát được
- Thanh tiến trình phân tích

### 3. Trang Kết quả Phân tích
- **Video gốc** với overlay quỹ đạo (nếu có)
- **Thông tin chuyển động**: loại chuyển động được AI nhận dạng, độ tin cậy
- **Bảng thông số**: vận tốc, gia tốc, quãng đường, thời gian, v.v.
- **Biểu đồ**: 
  - Đồ thị vị trí - thời gian (s-t)
  - Đồ thị vận tốc - thời gian (v-t)
  - Đồ thị gia tốc - thời gian (a-t)
  - Quỹ đạo chuyển động (x-y)
- **Phân tích AI**: mô tả chi tiết bằng văn bản về chuyển động
- Nút xuất báo cáo (PDF-style view)

### 4. Trang Lịch sử Phân tích
- Bảng danh sách tất cả video đã phân tích
- Lọc theo loại chuyển động, ngày phân tích
- Xem lại kết quả chi tiết

## Thiết kế
- Giao diện chuyên nghiệp, tông màu xanh dương đậm + trắng (học thuật)
- Typography rõ ràng, phù hợp trình bày nghiên cứu
- Responsive nhưng ưu tiên desktop
- Biểu đồ sử dụng Recharts

## Backend
- Lovable Cloud (Supabase) để lưu trữ video và kết quả
- Edge function gọi Lovable AI (Gemini 2.5 Pro - hỗ trợ multimodal video) để phân tích video
- Storage bucket cho video uploads
