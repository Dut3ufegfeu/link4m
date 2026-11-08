# Link4m Bypass Userscript - Clean Reconstructed Source

Dự án phân tích, bẻ khóa và hoàn nguyên mã nguồn gốc của Userscript:
**`Link4m - Clean Source (Deobfuscated)`** (nguyên bản từ `conphuskibidi-cloud/icebui/cakj.js`).

---

## 🚀 Cài đặt trực tiếp (Userscript)

Cài đặt bằng extension Tampermonkey / Violentmonkey trên trình duyệt:

- 🔗 **Bản chính thức (Clean Single-File Reconstructed)**:
  [Cài đặt Link4m.user.js](https://github.com/Dut3ufegfeu/link4m/raw/main/Link4m.user.js)
- 🔗 **Bản deobf**:
  [Cài đặt link4m.deobf.user.js](https://github.com/Dut3ufegfeu/link4m/raw/main/link4m.deobf.user.js)

---

## 🛠️ Phân tích kiến trúc mã nguồn gốc và bản Clean Deobfuscated

File gốc `cakj.js` (445 KB) ban đầu bị đóng gói qua tầng máy ảo ảo hóa **JSVMP (JavaScript Virtual Machine)** kết hợp mã hóa chuỗi hai lớp.

Bản tái thiết sạch (**Clean Reconstructed**) này giải mã toàn bộ logic sang chuẩn JavaScript ES6+ thuần túy, có thể đọc và chỉnh sửa trực tiếp:

### 1. Giao diện Shadow DOM (`link4m-clean-source-host`)
- Tách biệt hoàn toàn CSS và HTML với trang web đích, tránh xung đột CSS.
- Hiển thị trực quan: Spinner trạng thái, đồng hồ đếm ngược, thanh tiến trình (progress bar), form nhập URL nhiệm vụ thủ công, các nút sao chép kết quả và mở liên kết đích.

### 2. Bộ nhận diện nhiệm vụ & OCR tự động (Tesseract.js / OCR.space)
- **Bóc tách tên miền Bước 3**: Tự động trích xuất các tên miền bị che dấu (dạng `d***.com`).
- **Xử lý ảnh nhiệm vụ trên Canvas**: Tự động tìm ảnh hướng dẫn nhiệm vụ, chuyển đổi sang Data URL và tăng cường độ tương phản.
- **Nhận diện ký tự quang học (OCR)**: Tích hợp thư viện Tesseract.js (tải động) hoặc API OCR.space để đọc ảnh, sau đó dùng thuật toán **Levenshtein Distance** so khớp mờ tìm ra chính xác website mục tiêu.

### 3. Giao thức Widget & Multi-Step Countdown
- Tự động bóc tách các thẻ `<script>` nhúng widget và tải `/widget/client.js`.
- Bóc tách các thông số phiên: `traffic_session`, `traffic_token`, `traffic_code`, `traffic_key`.
- Vượt qua chuỗi đếm ngược nhiều bước (`maxWidgetSteps`) mà không cần người dùng thao tác thủ công.

### 4. Tự động giải quyết ReCAPTCHA & Nộp mã
- Tự động bắt token ReCAPTCHA khi hoàn thành hoặc thông báo người dùng giải reCAPTCHA nếu xuất hiện thử thách tương tác.
- Tự động gửi kết quả tới máy chủ backend `/links/get-link-info` và kích hoạt luồng trả link đích.

---

## 📂 Danh mục tệp tin trong repository

| Tệp tin | Mô tả |
| :--- | :--- |
| `Link4m.user.js` | Userscript chính thức cài trực tiếp qua Tampermonkey. |
| `link4m.deobf.user.js` | Bản deobfuscated clean source hoàn chỉnh. |
| `link4m.full.deobf.user.js` | Bản tái thiết đầy đủ single-file có chú thích kiến trúc. |
| `cakj.deobf.js` | Mã nguồn giải mã từ loader gốc cakj.js. |
| `cakj_deobf.js` | File lưu vết các opcode và string pool thô đã bóc tách từ JSVMP. |
