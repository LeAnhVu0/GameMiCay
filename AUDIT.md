# Source Audit

## Kết luận

Gameplay source gốc đầy đủ; archive nhận được bị hỏng chủ yếu do patch semantic alias/refactor chèn không đúng cấu trúc của JavaScript minified.

## Lỗi blocking đã tìm thấy

1. `saveGameState` alias được chèn vào giữa chuỗi khai báo `const Q ... , i = {...}` làm `game.js` không parse.
2. Có dấu `}` thừa ngay sau alias `playSound`, làm parser dừng trước `function Jc`.
3. Alias `startPrepMode` được chèn giữa thân `TA()`, làm phần goals/day/prep render rơi ra ngoài function.
4. `const gameState = o` là alias không an toàn: `o` được reassign trong load/reset/challenge restore nên alias có thể trỏ vào object cũ.

## Cách sửa

Không vá tiếp file đã bị chèn alias. `game.js` được rebuild từ `original/js.original.txt`, sau đó chỉ áp các thay đổi local-development không ảnh hưởng gameplay:

- remove domain guard/copy telemetry/redirect;
- remove global devtool/context-menu blocker;
- thêm header mô tả build local.

## Kiến trúc hiện tại

Runtime là static-only: không có server, endpoint, `fetch`, telemetry hay dịch vụ ngoài. Save và gameplay nằm trong trình duyệt; save envelope `MC2|base64(JSON)|checksum` được giữ nguyên.

- Leaderboard online và prank multiplayer đã bị gỡ.
- Thử thách là lượt chơi local theo ngày, không token, ranking hay submit điểm.
- Trả lời đánh giá dùng PRNG seeded local.
- Nhạc nền dùng Web Audio synthesizer local, không tải MP3.
- `original/` là archive tham khảo, không được load bởi runtime.

## Chưa thể khẳng định chỉ bằng static check

- Cân bằng gameplay ở mọi nhánh event ngẫu nhiên.
- Chất lượng nhạc tổng hợp có thể khác các bản MP3 trước đây.
- Tương thích trình duyệt ở mọi phiên bản mobile.
- Tương thích trình duyệt ở mọi phiên bản mobile.
