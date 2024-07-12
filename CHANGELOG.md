# Nhật ký thay đổi

## 1.2.0 (12-07-2024)

* Thêm chức năng tìm kiếm.
* Sửa lỗi giới hạn GitHub API còn lại bị nhảy lên xuống không đúng thứ tự. Bởi vì các request phản hồi không theo thứ tự.
* Sửa nhiều thứ linh tinh.
* Đổi icon trang đăng nhập.

## 1.1.0 (14-04-2024)

* Hoàn thiện hầu hết chức năng của app, vẫn còn thiếu phần xem ảnh.

## 1.0.1 (08-04-2024)

* Lại quyết định không chuyển sang GraphQL nữa, tại thử nghiệm thấy GraphQL tuy trả về data nhỏ nhưng phản hồi khá chậm. Tạo repo bằng GraphQL cũng không có tùy chọn `auto_init`, nên không thể commit mà không tạo thủ công commit đầu tiên.
* Thêm tính năng "quản lý mọi người". Những người được thêm sẽ được tô sáng cú pháp tên trong trình chỉnh sửa.
* Có thể lưu cài đặt lên GitHub, lưu vào tập tin `settings.json`.

## 1.0.0 (04-04-2024)

* GitHub API không dùng [REST](https://octokit.github.io/rest.js/v18) nữa, chuyển sang dùng [GraphQL](https://docs.github.com/en/graphql/reference). Tại REST có vấn đề khi cache, nên dùng GraphQL nó không cache, lại còn linh hoạt nữa, tiết kiệm băng thông. Với cả nó cũng get được nội dung khi get danh sách file, nên không cần dùng tên file làm nội dung nữa, giúp có thể download repo về mà không bị không mở được do tên file quá dài. Như vậy repo cũng cần được cấu trúc lại, không dùng một repo lưu văn bản và các repo khác lưu hình ảnh nữa, mà mỗi repo bây giờ sẽ lưu một tháng trong năm.
