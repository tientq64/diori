# Các quy ước trong dự án

> Chưa hoàn tất.

## Cấu trúc các repo lưu dữ liệu nhật ký

- Dữ liệu dạng văn bản sẽ được lưu trong repo tên `diori-main`.

- Các hình ảnh sẽ được lưu vào các repo với tên theo cú pháp `diori-photos-{year}`, trong đó `{year}` là năm của hình ảnh này.

- Các hình ảnh được lưu vào các repo riêng vì GitHub giới hạn kích thước của mỗi repo.

- Đường dẫn của hình ảnh có dạng `MM/DD/YYYYMMDD-{photoKey}.webp`. Trong đó `YYYY`, `MM`, `DD` là năm, tháng, ngày tương ứng của hình ảnh, `photoKey` là key của hình ảnh. Key của mỗi hình ảnh phải đảm bảo là duy nhất trong thư mục chứa nó. Nếu hai hình ảnh có cùng key nhưng trong hai thư mục khác nhau thì không sao.

- Phần mở rộng của ảnh phải luôn là `.webp`. Nếu người dùng tải lên ảnh định dạng khác, hãy convert nó sang `webp`.

- Mỗi thư mục ngày có thể chứa tối đa 4 ảnh. Nhưng lý tưởng nhất là nên chỉ chứa một ảnh đại diện cho một ngày.

- Dung lượng và kích cỡ của hình ảnh không nên quá lớn. Nếu hình ảnh quá lớn, hãy nén hoặc giảm kích cỡ ảnh xuống độ lớn phù hợp.

- Tập tin `settings.json` dùng để lưu các cài đặt của người dùng.
