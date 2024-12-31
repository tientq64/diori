# Nhật ký thay đổi

## 1.8.0 (30-12-2024)

- Cải thiện trình soạn thảo.

## 1.7.2 (12-12-2024)

- Sửa xác định đối tượng không chính xác khi di chuột vào.

## 1.7.1 (07-12-2024)

- Cải thiện giao diện ứng dụng.
- Tách nhỏ code trong `EditPage` ra thành các hàm con.

## 1.7.0 (06-12-2024)

- Danh sách xem thiết kế lại chiếm toàn chiều cao, phần topbar và statusbar thành lớp phủ.
- Thêm tính năng hiện thông tin đối tượng khi di chuột vào, trong trình soạn thảo.

## 1.6.0 (29-11-2024)

- Đổi icon app.
- Cải thiện khả năng hiển thị âm lịch.
- Dùng `pnpm` thay `bun`, vì `bun` ngốn nhiều RAM.

## 1.5.0 (18-07-2024)

- Loại bỏ cú pháp tham chiếu link trong tiêu đề.
- Trình soạn thảo trên mobile sử dụng `TextArea` thay cho `monaco` editor.

## 1.4.0 (15-07-2024)

- Giao diện mới cho điện thoại. Cải thiện nhiều thứ và đẹp hơn rất nhiều.

## 1.3.1 (15-07-2024)

- Lọc file khi tải lên, chỉ lấy file hình ảnh.
- Trình xem ảnh đã được tối ưu.

## 1.3.0 (13-07-2024)

- Đã có thể xem ảnh đã lưu trên GitHub. Nhưng chưa được tối ưu.

## 1.2.0 (12-07-2024)

- Thêm chức năng tìm kiếm.
- Sửa lỗi giới hạn GitHub API còn lại bị nhảy lên xuống không đúng thứ tự. Bởi vì các request phản hồi không theo thứ tự.
- Sửa nhiều thứ linh tinh.
- Đổi icon trang đăng nhập.
- Dùng `bun` thay `pnpm`.

## 1.1.0 (14-04-2024)

- Hoàn thiện hầu hết chức năng của app, vẫn còn thiếu phần xem ảnh.

## 1.0.1 (08-04-2024)

- Lại quyết định không chuyển sang GraphQL nữa, tại thử nghiệm thấy GraphQL tuy trả về data nhỏ nhưng phản hồi khá chậm. Tạo repo bằng GraphQL cũng không có tùy chọn `auto_init`, nên không thể commit mà không tạo thủ công commit đầu tiên.
- Thêm tính năng "quản lý mọi người". Những người được thêm sẽ được tô sáng cú pháp tên trong trình chỉnh sửa.
- Có thể lưu cài đặt lên GitHub, lưu vào tập tin `settings.json`.

## 1.0.0 (04-04-2024)

- GitHub API không dùng [REST](https://octokit.github.io/rest.js/v18) nữa, chuyển sang dùng [GraphQL](https://docs.github.com/en/graphql/reference). Tại REST có vấn đề khi cache, nên dùng GraphQL nó không cache, lại còn linh hoạt nữa, tiết kiệm băng thông. Với cả nó cũng get được nội dung khi get danh sách file, nên không cần dùng tên file làm nội dung nữa, giúp có thể download repo về mà không bị không mở được do tên file quá dài. Như vậy repo cũng cần được cấu trúc lại, không dùng một repo lưu văn bản và các repo khác lưu hình ảnh nữa, mà mỗi repo bây giờ sẽ lưu một tháng trong năm.
