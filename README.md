# Tiệm Mì Cay

Game chạy hoàn toàn bằng HTML, CSS và JavaScript trong trình duyệt. Không cần backend, Node server, API ngoài hay tài khoản. Tiến trình được lưu local trong trình duyệt; định dạng sao lưu vẫn là `MC2|base64(JSON)|checksum`.

Font Mali (400/500/600/700) và Paytone One được đóng gói local trong `fonts/`, kèm license OFL; không cần tải font từ Google khi chơi.

Leaderboard online và prank multiplayer đã được gỡ. Thử thách nấu mì chạy local theo ngày, phản hồi khách được tạo deterministic trên máy, nhạc nền dùng Web Audio tổng hợp trong trình duyệt. Inventory, nấu ăn, khách, tiền, nâng cấp, nhân viên, ngày, cài đặt, âm thanh và giao diện tiếp tục chạy local.

## Chạy local

Cần Python 3 để mở static server:

```bash
python3 -m http.server 8080
```

Trên Windows, có thể chạy `run-local.bat` (Python Launcher `py -3` hoặc `python`). Linux/macOS dùng `./run-local.sh`. Mở `http://127.0.0.1:8080`.

## GitHub Pages

Đưa nội dung thư mục project lên repository và bật Pages cho thư mục/branch đó. Asset, script, stylesheet, manifest và icon dùng relative paths nên project cũng hoạt động dưới repository path, không chỉ ở domain root. Không cần build step hay server-side functions.

## Kiểm tra

Node.js chỉ cần để chạy các kiểm tra phát triển, không phải runtime của game:

```bash
node --check game.js
node --check bootstrap.js
node tools/verify-project.mjs
```

Các bản source tham khảo và tài liệu phân tích nằm trong `original/` và `docs/`; chúng không được nạp khi game chạy.
