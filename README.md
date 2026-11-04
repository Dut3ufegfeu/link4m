# Link4m Bypass Userscript (n1ulls Deobfuscated)

Bản giải mã và tối ưu hóa từ Userscript gốc `Link4m (n1ulls)` tải từ kho `conphuskibidi-cloud/icebui/main/cakj.js`.

---

## 🔍 Phân tích kiến trúc mã gốc (cakj.js - 445 KB)
- **Tác giả / Nguồn**: `conphuskibidi-cloud/icebui`
- **Kỹ thuật che giấu**:
  - Đóng gói mã trong một máy ảo **Bytecode Virtual Machine (JSVMP)**.
  - Sử dụng 533 chuỗi ký tự được mã hóa kép (Base64 + xor key động).
  - Tích hợp mô-đun Fingerprinting `jscd` (giả lập thông số thiết bị, OS, trình duyệt).
  - Chèn module `norcap` (hỗ trợ vượt captcha Turnstile / ReCaptcha).
  - Tải mã ngầm từ xa (`@require`) để có thể tự động đổi mã mà người dùng không biết.

---

## ⚡ Cải tiến trong bản Deobfuscated:
1. **Loại bỏ Remote Loader 445 KB**: Toàn bộ mã chạy độc lập (offline-first), không nạp file từ github ngoài.
2. **Không có mã độc ngầm**: Gỡ bỏ anti-debugging, vòng lặp crash DevTools và các hàm theo dõi hành vi người dùng.
3. **Floating UI trực quan**: Bổ sung popup điều khiển góc màn hình hiển thị trực tiếp trạng thái quét nhiệm vụ, mã code nhận được, và các nút Sao chép / Tự nộp.
4. **Tự động nhận diện nhiệm vụ**: Bóc tách tên miền quảng cáo mục tiêu từ `Bước 3` và `taskId` (MongoDB ObjectId 24 ký tự) để gọi trực tiếp tới widget API lấy mã ngay lập tức.
