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

## Phần backend local được bổ sung

Game client gọi các endpoint sau:

- `POST /api/ai`
- `GET/POST /api/lb`
- `GET/POST /api/chal`
- `GET/POST /api/prank`

`dev-server.mjs` cung cấp implementation local tương thích đủ để test UI/flow. Đây là backend mock phát triển, không phải production service.

## Chưa thể khẳng định chỉ bằng static check

- Cân bằng gameplay ở mọi nhánh event ngẫu nhiên.
- Hành vi audio MP3 thật vì archive không chứa thư mục music; game có fallback audio/synth khi tải nhạc lỗi.
- Tương thích trình duyệt ở mọi phiên bản mobile.
- Logic production server gốc của leaderboard/challenge/prank/AI, vì server source không nằm trong archive.
