# Tiệm Mì Cay — source local hoàn chỉnh

Bản này được rebuild từ source người dùng cung cấp, ưu tiên **giữ nguyên gameplay và save compatibility**.

## Đã sửa

- Khôi phục `game.js` từ source gốc để loại các patch alias bị chèn sai scope.
- Sửa lỗi parse `Unexpected token ','` quanh state runtime.
- Loại lỗi parse do dấu `}` thừa quanh audio helper.
- Loại patch làm đứt thân hàm `TA()`/prep flow.
- Bỏ hostname/copy-report/redirect guard để chạy local.
- Bỏ global context-menu/devtools blocker.
- `bootstrap.js` chỉ log lỗi local, không gửi telemetry.
- Bổ sung PWA manifest và icon local.
- Bổ sung local Node server và mock API cho leaderboard, Giải mì, chọc quán và phản hồi AI.
- Giữ nguyên save envelope `MC2|base64(JSON)|checksum`.

## Chạy đầy đủ

Cần Node.js 18+:

```bash
node dev-server.mjs
```

Sau đó mở:

```text
http://127.0.0.1:8080
```

Windows có thể chạy `run-local.bat`; Linux/macOS dùng `./run-local.sh`.

> `python -m http.server 8080` chỉ chạy phần static. Các feature dùng `/api/lb`, `/api/chal`, `/api/prank`, `/api/ai` sẽ không có backend mock.

## Kiểm tra source

```bash
node --check game.js
node --check bootstrap.js
node --check dev-server.mjs
node tools/verify-project.mjs
```

## Local mock data

`dev-server.mjs` lưu dữ liệu mock vào `.local-data/mock-api.json`. Thư mục này được tạo khi chạy server và có thể xóa để reset leaderboard/challenge/prank local.

## Reverse engineering

Các tài liệu mapping vẫn nằm trong `docs/`. Lưu ý: tên minified chưa được đổi hàng loạt trực tiếp trong runtime source vì alias sai scope từng làm hỏng parser. Rename tiếp theo nên dùng IDE Rename Symbol/AST và regression test theo hướng dẫn.
