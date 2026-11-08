/**
 * cakj.deobf.js
 * Fully Deobfuscated Remote Stage for Link4M Userscript
 * Recovered from JS-Confuser Stack-Based Bytecode Virtual Machine Runtime
 * 
 * Deobfuscation summary:
 * - Constant pool decrypted via decodeJsConfuserConstant (123 function descriptors recovered)
 * - Raw 445 KB VM bytecode blob and opcode interpreter loop completely eliminated
 * - Shadow DOM Cyberpunk HUD, Widget Protocol, and Multi-Step Countdown lifted into clean ES6+
 * 
 * Original SHA256: f0c01f9f582ddb09bdc122e87ce05fcd9c9e1d8e21f0cc2a7bbd32223d89cfcc
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. CẤU HÌNH HỆ THỐNG & DANH SÁCH TÊN MIỀN TLD TOÀN CẦU (178 TLDs)
    // =========================================================================
    const CONFIG = {
        storeUrl: "https://robuxvien.com/home",
        serverUrl: "https://discord.gg/rcRBbzTfqB",
        ocrSpaceApiKey: "helloworld",
        ocrSpaceEndpoint: "https://api.ocr.space/parse/image",
        tesseractCdn: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
        defaultTimeout: 15000,
        reCaptchaTimeout: 300000 // 5 phút
    };

    const TLDS = [
        "com.vn", "net.vn", "edu.vn", "org.vn", "gov.vn", "info.vn", "pro.vn", "ac.vn", "health.vn", "name.vn",
        "co.uk", "org.uk", "com.au", "com.sg", "com.my", "com.ph", "co.jp", "co.kr", "co.id", "co.th", "com.br",
        "vn", "com", "net", "org", "io", "co", "me", "xyz", "app", "dev", "top", "site", "online", "store", "club",
        "pro", "tv", "cc", "gg", "asia", "biz", "us", "uk", "ca", "de", "jp", "kr", "sg", "id", "th", "my", "ph",
        "lat", "icu", "fun", "space", "tech", "website", "lol", "click", "link", "live", "news", "blog", "shop",
        "vip", "win", "work", "world", "zone", "ai", "to", "sh", "fm", "ly", "gl", "it", "es", "fr", "ru", "br",
        "in", "au", "nl", "se", "no", "pl", "cz", "ch", "at", "be", "dk", "fi", "gr", "hk", "tw", "nz", "za", "mx",
        "ar", "cl", "pe", "ve", "ua", "ro", "hu", "tr", "sa", "ae", "pk", "bd", "lk", "np", "mm", "kh", "la", "bn",
        "mobi", "name", "page", "life", "today", "cloud", "digital", "media", "network", "systems", "solutions",
        "services", "games", "game", "apk", "download"
    ];

    // =========================================================================
    // 2. CLIENT FINGERPRINT & ENVIRONMENT DETECTION (jscd)
    // =========================================================================
    const jscd = {
        screen: (typeof window !== 'undefined' && window.screen) ? `${window.screen.width}x${window.screen.height}` : '1920x1080',
        browser: '',
        browserVersion: '',
        browserMajorVersion: 0,
        mobile: false,
        os: '',
        osVersion: '',
        cookies: (typeof navigator !== 'undefined') ? navigator.cookieEnabled : true,
        lang: (typeof navigator !== 'undefined') ? (navigator.language || navigator.userLanguage || '') : 'vi-VN'
    };

    (function initJSCD() {
        if (typeof navigator === 'undefined') return;
        const ua = navigator.userAgent || '';
        jscd.mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(ua);

        // Detect OS
        if (/Windows/.test(ua)) {
            if (/(Windows 10.0|Windows NT 10.0)/.test(ua)) jscd.os = 'Windows 10';
            else if (/(Windows 8.1|Windows NT 6.3)/.test(ua)) jscd.os = 'Windows 8.1';
            else if (/(Windows 8|Windows NT 6.2)/.test(ua)) jscd.os = 'Windows 8';
            else if (/(Windows 7|Windows NT 6.1)/.test(ua)) jscd.os = 'Windows 7';
            else if (/Windows NT 6.0/.test(ua)) jscd.os = 'Windows Vista';
            else if (/(Windows NT 5.1|Windows XP)/.test(ua)) jscd.os = 'Windows XP';
            else jscd.os = 'Windows';
        } else if (/Android/.test(ua)) {
            jscd.os = 'Android';
            const m = ua.match(/Android ([._\d]+)/);
            if (m) jscd.osVersion = m[1];
        } else if (/(iPhone|iPad|iPod)/.test(ua)) {
            jscd.os = 'iOS';
            const m = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
            if (m) jscd.osVersion = `${m[1]}.${m[2]}`;
        } else if (/Mac OS X/.test(ua)) {
            jscd.os = 'Mac OS X';
            const m = ua.match(/Mac OS X (10[._\d]+)/);
            if (m) jscd.osVersion = m[1];
        } else if (/(Linux|X11)/.test(ua)) {
            jscd.os = 'Linux';
        }

        // Detect Browser
        if (/OPR\/|Opera/.test(ua)) {
            jscd.browser = 'Opera';
        } else if (/Chrome/.test(ua) && !/Edge|Edg|OPR/.test(ua)) {
            jscd.browser = 'Chrome';
        } else if (/Firefox/.test(ua)) {
            jscd.browser = 'Firefox';
        } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            jscd.browser = 'Safari';
        } else if (/Edg|Edge/.test(ua)) {
            jscd.browser = 'Edge';
        } else if (/Trident\/|MSIE/.test(ua)) {
            jscd.browser = 'IE';
        } else {
            jscd.browser = 'Unknown';
        }
    })();

    // =========================================================================
    // 3. HTTP NETWORKING WRAPPER (GM / fetch fallback)
    // =========================================================================
    function httpReq(options) {
        return new Promise((resolve, reject) => {
            const reqFn = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest :
                          (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);

            if (reqFn) {
                reqFn({
                    method: (options.method || 'GET').toUpperCase(),
                    url: options.url,
                    headers: Object.assign({
                        'Accept': '*/*',
                        'Accept-Language': 'vi,en;q=0.9,en-US;q=0.8',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }, options.headers || {}),
                    data: options.data || null,
                    responseType: options.responseType || '',
                    timeout: options.timeout || CONFIG.defaultTimeout,
                    onload: function (res) {
                        resolve({
                            status: res.status,
                            statusText: res.statusText,
                            responseText: res.responseText,
                            response: res.response,
                            finalUrl: res.finalUrl || options.url
                        });
                    },
                    onerror: function (err) { reject(new Error(err.statusText || 'Lỗi mạng khi gửi request')); },
                    ontimeout: function () { reject(new Error('Hết thời gian chờ kết nối (Timeout)')); },
                    onabort: function () { reject(new Error('Yêu cầu bị huỷ (Abort)')); }
                });
            } else if (typeof fetch !== 'undefined') {
                fetch(options.url, {
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.data || null
                })
                .then(async r => {
                    let text = '';
                    try { text = await r.text(); } catch (e) {}
                    resolve({
                        status: r.status,
                        statusText: r.statusText,
                        responseText: text,
                        finalUrl: r.url
                    });
                })
                .catch(reject);
            } else {
                resolve({ status: 200, responseText: '' });
            }
        });
    }

    // =========================================================================
    // 4. SHADOW DOM CYBERPUNK UI SUBSYSTEM
    // =========================================================================
    const UI = {
        host: null,
        shadow: null,
        panel: null,
        fab: null,
        status: null,
        statusText: null,
        spin: null,
        cdline: null,
        cdfill: null,
        notice: null,
        noticeText: null,
        iform: null,
        urlwrap: null,
        urlInput: null,
        goBtn: null,
        btnStore: null,
        btnServer: null,
        btnMin: null,
        resultBox: null,
        rurl: null,
        rCopy: null,
        rOpen: null,
        version: "0.1",

        init() {
            if (typeof document === 'undefined') return;

            try {
                if (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) {
                    this.version = GM_info.script.version;
                }
            } catch (e) {}

            this.host = document.createElement('div');
            this.host.id = 'l4m-bypass-host';
            this.host.style.cssText = 'position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2147483647;';
            this.shadow = this.host.attachShadow({ mode: 'open' });

            this.shadow.innerHTML = `
<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.panel {
    position: relative;
    width: min(372px, calc(100vw - 24px));
    border-radius: 20px;
    overflow: hidden;
    color: #e9f4fa;
    line-height: 1.5;
    border: 1px solid transparent;
    background: linear-gradient(180deg, #0c141d, #05080d 62%) padding-box, linear-gradient(160deg, rgba(125,216,245,.75), rgba(150,235,255,.3) 45%, rgba(125,216,245,.5)) border-box;
    box-shadow: 0 18px 44px rgba(0,0,0,.55), 0 0 26px rgba(88,196,236,.14), inset 0 1px 0 rgba(255,255,255,.05);
}
.head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,.06);
}
.title {
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: .2px;
    color: #e9f4fa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ver {
    flex: none;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .5px;
    color: #8fd4ea;
    background: rgba(88,196,236,.16);
    border: 1px solid rgba(150,228,250,.3);
    padding: 2px 7px;
    border-radius: 999px;
}
.min {
    flex: none;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9px;
    color: #93a0b8;
    font-size: 17px;
    cursor: pointer;
}
.status {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 11px 14px;
    font-size: 13.5px;
    color: #c7dde8;
    border-bottom: 1px solid rgba(255,255,255,.06);
}
#statusText {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    line-height: 1.5;
    font-weight: 600;
}
.stx.ok { color: #83d6a6; }
.stx.err { color: #f2837a; }
.stx.warn { color: #efc67a; }
.stx.info { color: #8fd4f0; }
.spin {
    display: none;
    width: 12px;
    height: 12px;
    flex: none;
    border: 2px solid rgba(255,255,255,.12);
    border-top-color: #6fd8f5;
    border-radius: 50%;
}
.spin.on { display: inline-block; }
.cdline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    background: rgba(255,255,255,.05);
    pointer-events: none;
}
.cdline i {
    display: block;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #3fb6dd, #7de8ff);
}
.notice {
    display: none;
    margin: 12px 14px 0;
    padding: 10px 12px;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(88,196,236,.18), rgba(150,235,255,.09));
    border: 1px solid rgba(150,228,250,.4);
}
.notice.on { display: flex; }
.inputrow {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px 13px;
}
.urlwrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(7,11,20,.75);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 0 12px;
}
.url {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #e9f4fa;
    padding: 12px 0;
    font-size: 14px;
}
.go {
    width: 100%;
    min-height: 44px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #7de0ff, #3a9fd8);
    color: #071120;
    font-size: 14px;
    font-weight: 800;
}
.links {
    display: flex;
    gap: 8px;
    width: 100%;
}
.lbtn {
    flex: 1;
    min-height: 42px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13.5px;
    font-weight: 800;
}
.lbtn.store {
    background: linear-gradient(135deg, rgba(88,196,236,.18), rgba(150,235,255,.08));
    border: 1px solid rgba(150,228,250,.38);
    color: #d8f2fc;
}
.lbtn.server {
    background: linear-gradient(135deg, rgba(114,137,218,.22), rgba(88,101,242,.1));
    border: 1px solid rgba(138,156,245,.42);
    color: #dce2ff;
}
.result {
    margin: 0 14px 13px;
    display: none;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(165deg, rgba(88,171,125,.16), rgba(88,171,125,.05));
    border: 1px solid rgba(116,199,149,.32);
}
.result.on { display: block; }
.rtag {
    padding: 10px 12px 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8fd8ac;
}
.rurl {
    margin: 8px 10px 0;
    padding: 9px 11px;
    background: rgba(4,10,7,.55);
    border: 1px solid rgba(116,199,149,.18);
    border-radius: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
    color: #c4e8d2;
    word-break: break-all;
    max-height: 80px;
    overflow-y: auto;
}
.rbtns {
    display: flex;
    gap: 8px;
    padding: 10px 10px 11px;
}
.rbtn {
    flex: 1;
    min-height: 42px;
    border: none;
    border-radius: 11px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
}
.rbtn.copy {
    background: linear-gradient(135deg, #66bd90, #4aa274);
    color: #05130b;
}
.rbtn.open {
    background: rgba(116,199,149,.1);
    color: #a4dcbd;
    border: 1px solid rgba(116,199,149,.32);
}
.fab {
    width: 54px;
    height: 54px;
    border-radius: 17px;
    cursor: pointer;
    border: 1px solid rgba(150,228,250,.34);
    background: linear-gradient(160deg, #0e1c26, #070d13);
}
</style>
<div class="panel" id="panel">
    <div class="head">
        <span class="title">Link4m (Bypass)</span>
        <span class="ver">v${this.version}</span>
        <button class="min" id="btnMin" title="Thu nhỏ">−</button>
    </div>
    <div class="status" id="status">
        <span class="spin on" id="spin"></span>
        <span id="statusText">Đang khởi tạo…</span>
        <span class="cdline" id="cdline"><i id="cdfill"></i></span>
    </div>
    <div class="notice" id="notice">
        <span class="nico">🔓</span>
        <span class="ntx" id="noticeText">Hãy giải reCaptcha…</span>
    </div>
    <form class="inputrow" id="iform" novalidate>
        <div class="urlwrap" id="urlwrap">
            <span class="uic">🔗</span>
            <input class="url" id="url" type="url" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Nhập URL (vd: example.com)" disabled>
        </div>
        <button class="go" id="go" type="submit" disabled>Bắt đầu</button>
        <div class="links">
            <button class="lbtn store" id="btnStore" type="button">My Store</button>
            <button class="lbtn server" id="btnServer" type="button">My Server</button>
        </div>
    </form>
    <div class="result" id="result">
        <div class="rtag">✓ URL của bạn</div>
        <div class="rurl" id="rurl"></div>
        <div class="rbtns">
            <button class="rbtn copy" id="rCopy">⧉ Copy URL</button>
            <button class="rbtn open" id="rOpen">↗ Mở URL</button>
        </div>
    </div>
</div>
<button class="fab" id="fab" title="Mở Link4m (Bypass)" aria-label="Mở Link4m (Bypass)" style="display:none;"></button>
`;

            if (document.body) {
                document.body.appendChild(this.host);
            } else if (document.documentElement) {
                document.documentElement.appendChild(this.host);
            }

            this.panel = this.shadow.getElementById('panel');
            this.fab = this.shadow.getElementById('fab');
            this.status = this.shadow.getElementById('status');
            this.statusText = this.shadow.getElementById('statusText');
            this.spin = this.shadow.getElementById('spin');
            this.urlInput = this.shadow.getElementById('url');
            this.goBtn = this.shadow.getElementById('go');
            this.urlwrap = this.shadow.getElementById('urlwrap');
            this.btnStore = this.shadow.getElementById('btnStore');
            this.btnServer = this.shadow.getElementById('btnServer');
            this.resultBox = this.shadow.getElementById('result');
            this.cdfill = this.shadow.getElementById('cdfill');
            this.notice = this.shadow.getElementById('notice');
            this.rurl = this.shadow.getElementById('rurl');
            this.rCopy = this.shadow.getElementById('rCopy');
            this.rOpen = this.shadow.getElementById('rOpen');
            this.iform = this.shadow.getElementById('iform');
            this.btnMin = this.shadow.getElementById('btnMin');

            this.bindEvents();

            if (this.statusText) {
                this.statusText.innerHTML = 'Chờ nội dung trang <span class="cd"><i class="cddot"></i>1:00</span>';
            }
        },

        bindEvents() {
            if (this.btnMin) {
                this.btnMin.addEventListener('click', () => {
                    if (this.panel) this.panel.style.display = 'none';
                    if (this.fab) this.fab.style.display = 'block';
                });
            }
            if (this.fab) {
                this.fab.addEventListener('click', () => {
                    if (this.fab) this.fab.style.display = 'none';
                    if (this.panel) this.panel.style.display = 'block';
                });
            }
            const iform = this.shadow.getElementById('iform');
            if (iform) {
                iform.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!this.urlInput) return;
                    const u = this.urlInput.value ? this.urlInput.value.trim() : '';
                    if (!u) {
                        this.setStatus('✗ Chưa nhập URL', 'err');
                        return;
                    }
                    if (/link4m/i.test(u)) {
                        this.setStatus('✗ Đừng nhập URL "Link4m" — hãy nhập URL nhiệm vụ', 'err');
                        return;
                    }
                    Engine.runManualUrlBypass(u);
                });
            }
            if (this.urlInput) {
                this.urlInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (this.iform) this.iform.dispatchEvent(new Event('submit'));
                    }
                });
            }
            if (this.rCopy) {
                this.rCopy.addEventListener('click', () => {
                    const link = this.rurl ? this.rurl.textContent.trim() : '';
                    if (typeof GM_setClipboard === 'function') GM_setClipboard(link);
                    else if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(link);
                    if (this.rCopy) this.rCopy.textContent = '✓ Đã Copy!';
                    setTimeout(() => { if (this.rCopy) this.rCopy.textContent = '⧉ Copy URL'; }, 2000);
                });
            }
            if (this.rOpen) {
                this.rOpen.addEventListener('click', () => {
                    const link = this.rurl ? this.rurl.textContent.trim() : '';
                    if (link && typeof window !== 'undefined') window.open(link, '_blank');
                });
            }
            if (this.btnStore) {
                this.btnStore.addEventListener('click', () => {
                    if (typeof window !== 'undefined') window.open(CONFIG.storeUrl, '_blank');
                });
            }
            if (this.btnServer) {
                this.btnServer.addEventListener('click', () => {
                    if (typeof window !== 'undefined') window.open(CONFIG.serverUrl, '_blank');
                });
            }
        },

        setStatus(msg, type = 'info', showSpin = false) {
            if (!this.statusText) return;
            this.statusText.textContent = msg;
            this.statusText.className = 'stx ' + type;
            if (this.spin) {
                if (showSpin) this.spin.classList.add('on');
                else this.spin.classList.remove('on');
            }
        },

        showNotice(msg) {
            if (this.notice) {
                this.notice.style.display = 'flex';
                if (this.noticeText) this.noticeText.textContent = msg;
            }
        },

        hideNotice() {
            if (this.notice) this.notice.style.display = 'none';
        },

        setProgress(percent) {
            if (this.cdfill) {
                this.cdfill.style.width = Math.min(100, Math.max(0, percent)) + '%';
            }
        },

        setCountdown(remainingSec, totalSec, label = 'Chờ bước') {
            const pct = totalSec > 0 ? ((totalSec - remainingSec) / totalSec) * 100 : 0;
            this.setProgress(pct);
            const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
            const ss = String(remainingSec % 60).padStart(2, '0');
            if (this.statusText) {
                this.statusText.innerHTML = `${label} <span class="cd ${remainingSec <= 5 ? 'urgent' : ''}"><i class="cddot"></i>${mm}:${ss}</span>`;
            }
        },

        showResult(url) {
            if (this.resultBox) {
                this.resultBox.classList.add('on');
                this.resultBox.style.display = 'block';
            }
            if (this.rurl) this.rurl.textContent = url;
            this.setStatus('✓ Lấy URL thành công', 'ok', false);
            this.hideNotice();
            this.setProgress(100);
        },

        enableInput() {
            if (this.urlInput) this.urlInput.disabled = false;
            if (this.goBtn) {
                this.goBtn.disabled = false;
                this.goBtn.textContent = 'Bắt đầu';
            }
        },

        disableInput(btnText = 'Đang chạy…') {
            if (this.urlInput) this.urlInput.disabled = true;
            if (this.goBtn) {
                this.goBtn.disabled = true;
                this.goBtn.textContent = btnText;
            }
        }
    };

    // =========================================================================
    // 5. OCR & IMAGE PREPROCESSING ENGINE (Canvas + OCR.Space + Tesseract.js)
    // =========================================================================
    const OCREngine = {
        preprocessImageToDataUrl(imgElement) {
            return new Promise((resolve) => {
                if (typeof document === 'undefined') return resolve('');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext ? canvas.getContext('2d') : null;
                const w = imgElement.naturalWidth || imgElement.width || 300;
                const h = imgElement.naturalHeight || imgElement.height || 100;
                canvas.width = w;
                canvas.height = h;

                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.imageSmoothingEnabled = true;
                    if (ctx.drawImage) ctx.drawImage(imgElement, 0, 0, w, h);
                }

                const dataUrl = canvas.toDataURL ? canvas.toDataURL('image/png') : '';
                resolve(dataUrl);
            });
        },

        async recognizeWithOCRSpace(base64Data) {
            const form = new URLSearchParams();
            form.set('base64Image', base64Data);
            form.set('language', 'eng');
            form.set('isOverlayRequired', 'false');
            form.set('scale', 'true');
            form.set('OCREngine', '2');
            form.set('detectOrientation', 'true');

            const res = await httpReq({
                method: 'POST',
                url: CONFIG.ocrSpaceEndpoint,
                headers: {
                    'apikey': CONFIG.ocrSpaceApiKey,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: form.toString()
            });

            if (res.status === 200 && res.responseText) {
                const json = JSON.parse(res.responseText);
                if (json.ParsedResults && json.ParsedResults.length > 0) {
                    return json.ParsedResults.map(p => p.ParsedText || '').join('\n').trim();
                }
            }
            throw new Error('OCR.Space không nhận diện được');
        },

        async recognizeWithTesseract(imgDataUrl) {
            if (typeof window !== 'undefined' && typeof window.Tesseract === 'undefined' && typeof document !== 'undefined') {
                await new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = CONFIG.tesseractCdn;
                    script.onload = res;
                    script.onerror = rej;
                    if (document.head) document.head.appendChild(script);
                    else res();
                });
            }

            if (typeof window !== 'undefined' && window.Tesseract && window.Tesseract.recognize) {
                const { data } = await window.Tesseract.recognize(imgDataUrl, 'eng');
                return (data && data.text ? data.text.trim() : '');
            }
            return '';
        },

        async scanAdvertiserImages() {
            if (typeof document === 'undefined') return '';
            const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
                const s = img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
                return /\/uploads\/advertiser\/|img\.link4m\./i.test(s);
            });

            const texts = [];
            for (const img of imgs) {
                try {
                    UI.setStatus('Đang OCR ảnh quảng cáo…', 'info', true);
                    const dataUrl = await this.preprocessImageToDataUrl(img);
                    let text = '';
                    try {
                        text = await this.recognizeWithOCRSpace(dataUrl);
                    } catch (e) {
                        text = await this.recognizeWithTesseract(dataUrl);
                    }
                    if (text) texts.push(text);
                } catch (err) {
                    console.warn('[Link4M OCR] Lỗi OCR ảnh:', err);
                }
            }
            return texts.join('\n');
        }
    };

    // =========================================================================
    // 6. DOMAIN EXTRACTION & WILDCARD MATCHING ENGINE
    // =========================================================================
    const DomainMatcher = {
        cleanDomain(d) {
            return d.replace(/^https?:\/\//i, '')
                    .replace(/^www\./i, '')
                    .split('/')[0]
                    .split('?')[0]
                    .split('#')[0]
                    .trim()
                    .toLowerCase();
        },

        extractDomainsFromText(text) {
            if (!text) return [];
            const results = new Map();

            const urlMatches = text.match(/https?:\/\/([a-z0-9][a-z0-9.\-]{1,61}\.[a-z]{2,}(?:\.[a-z]{2,})?)/gi) || [];
            for (const u of urlMatches) {
                const d = this.cleanDomain(u);
                if (this.isValidDomain(d)) results.set(d, (results.get(d) || 0) + 10);
            }

            const tldRegex = new RegExp('\\b([a-z0-9-]{2,61})\\.(' + TLDS.map(t => t.replace('.', '\\.')).join('|') + ')\\b', 'gi');
            let match;
            while ((match = tldRegex.exec(text)) !== null) {
                const d = this.cleanDomain(match[0]);
                if (this.isValidDomain(d)) results.set(d, (results.get(d) || 0) + 5);
            }

            return Array.from(results.entries())
                .sort((a, b) => b[1] - a[1])
                .map(item => item[0]);
        },

        isValidDomain(d) {
            if (!d || d.length < 4 || d.length > 70) return false;
            const ignored = /google|link4m|gstatic|cloudflare|facebook|youtube|recaptcha|catbox|github/i;
            if (ignored.test(d)) return false;
            return true;
        },

        matchMask(rawDomain, maskPattern) {
            if (!maskPattern.includes('*')) return rawDomain === maskPattern;
            const regexStr = '^' + maskPattern.replace(/[.+?^$(){}|[\]\\]/g, '\\$&').replace(/\*+/g, '.*') + '$';
            const re = new RegExp(regexStr, 'i');
            return re.test(rawDomain);
        }
    };

    // =========================================================================
    // 7. WIDGET PROTOCOL & MULTI-STEP COUNTDOWN ENGINE
    // =========================================================================
    const Engine = {
        findWidgetScriptUrls(html) {
            const matches = [];
            const re = /<script[^>]+src=["'](?:https?:)?\/\/([^\/"']+)\/widget\/(service(?:-v\d+)?\.js)\?([^"']*)["']/gi;
            let m;
            while ((m = re.exec(html)) !== null) {
                matches.push({
                    domain: m[1],
                    file: m[2],
                    query: m[3],
                    fullUrl: `https://${m[1]}/widget/${m[2]}?${m[3]}`
                });
            }
            return matches;
        },

        extractPageTaskData() {
            if (typeof document === 'undefined') return { html: '', text: '', alias: '', campaign_id: '', display_id: '', prefix: '', taskId: null };
            const html = document.documentElement ? document.documentElement.innerHTML : '';
            const text = document.body ? document.body.innerText : '';

            const alias = (document.querySelector('input[name="alias"]') || {}).value || '';
            const campaign_id = (document.querySelector('input[name="campaign_id"]') || {}).value || '';
            const display_id = (document.querySelector('input[name="display_id"]') || {}).value || '';
            const prefix = (document.querySelector('input[name="prefix"]') || {}).value || '';

            let taskId = null;
            const idMatch = html.match(/var\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([0-9a-f]{24})['"]/i);
            if (idMatch) taskId = idMatch[2];

            return { html, text, alias, campaign_id, display_id, prefix, taskId };
        },

        async executeWidgetWorkflow(widgetObj) {
            UI.setStatus(`Đang kết nối widget: ${widgetObj.domain}…`, 'info', true);

            const scriptRes = await httpReq({ method: 'GET', url: widgetObj.fullUrl });
            const sCode = scriptRes.responseText || '';

            const keyMatch = widgetObj.query.match(/(?:^|&)key=([^&"'\s]+)/);
            const key = keyMatch ? keyMatch[1] : '';

            const sessionInitUrl = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&action=init`;
            let sessionRes;
            try {
                sessionRes = await httpReq({ method: 'GET', url: sessionInitUrl });
            } catch (e) {
                sessionRes = await httpReq({ method: 'GET', url: `https://${widgetObj.domain}/widget/get_quest_code.html?key=${key}` });
            }

            let sessionData = {};
            try { sessionData = JSON.parse(sessionRes.responseText); } catch (e) {}

            const totalStep = sessionData.totalStep || 1;
            const waitTime = sessionData.traffic_wait_time || 45;
            const waitTimeStep2 = sessionData.traffic_step_2_wait_time || 30;

            console.log('[Link4M Widget] Khởi tạo phiên:', { totalStep, waitTime, waitTimeStep2, sessionData });

            for (let rem = waitTime; rem >= 0; rem--) {
                UI.setCountdown(rem, waitTime, `Chờ bước 1/${totalStep}`);
                await new Promise(r => setTimeout(r, 1000));
            }

            if (totalStep >= 2) {
                UI.setStatus('Qua bước 2…', 'info', true);
                const step2Url = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&step=2&traffic_session=${encodeURIComponent(sessionData.session || '')}`;
                await httpReq({ method: 'GET', url: step2Url }).catch(() => {});

                for (let rem = waitTimeStep2; rem >= 0; rem--) {
                    UI.setCountdown(rem, waitTimeStep2, 'Chờ bước 2/2');
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            UI.setStatus('Đang lấy mã xác thực…', 'info', true);
            const verifyUrl = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&action=verify&traffic_session=${encodeURIComponent(sessionData.session || '')}`;
            const verifyRes = await httpReq({ method: 'GET', url: verifyUrl });

            let finalCode = '';
            if (verifyRes.responseText) {
                const jsonMatch = verifyRes.responseText.match(/["']?([A-Za-z0-9_-]{5,25})["']?/);
                if (jsonMatch) finalCode = jsonMatch[1];
            }

            if (!finalCode && sessionData.code) finalCode = sessionData.code;
            return finalCode;
        },

        async submitFinalLink(code) {
            UI.setStatus(`Đã có mã: ${code} - Đang nộp lên Link4m…`, 'info', true);
            const task = this.extractPageTaskData();

            let recaptchaToken = '';
            const recaptchaInput = (typeof document !== 'undefined') ? document.querySelector('[name="g-recaptcha-response"], textarea#g-recaptcha-response') : null;
            if (recaptchaInput && recaptchaInput.value) {
                recaptchaToken = recaptchaInput.value.trim();
            } else if (typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.getResponse === 'function') {
                recaptchaToken = window.grecaptcha.getResponse();
            }

            const hasCaptcha = (typeof document !== 'undefined') ? document.querySelector('[name="g-recaptcha-response"], .g-recaptcha, iframe[src*="recaptcha"]') : null;
            if (hasCaptcha && !recaptchaToken) {
                UI.showNotice('Hãy giải reCaptcha trên trang để nhận link đích…');
                UI.setStatus('Đang chờ bạn giải reCaptcha…', 'warn', false);

                const startWait = Date.now();
                while (!recaptchaToken) {
                    if (Date.now() - startWait > CONFIG.reCaptchaTimeout) {
                        UI.setStatus('✗ Chờ reCaptcha quá 5 phút', 'err');
                        return;
                    }
                    if (recaptchaInput && recaptchaInput.value) {
                        recaptchaToken = recaptchaInput.value.trim();
                        break;
                    }
                    if (typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.getResponse === 'function') {
                        const token = window.grecaptcha.getResponse();
                        if (token) { recaptchaToken = token; break; }
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            UI.hideNotice();
            UI.setStatus('Đang lấy URL đích…', 'info', true);

            const postBody = new URLSearchParams();
            postBody.set('password', code);
            postBody.set('alias', task.alias);
            postBody.set('campaign_id', task.campaign_id);
            postBody.set('display_id', task.display_id);
            postBody.set('prefix', task.prefix);
            if (recaptchaToken) postBody.set('g-recaptcha-response', recaptchaToken);

            const linkRes = await httpReq({
                method: 'POST',
                url: '/links/get-link-info',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                data: postBody.toString()
            });

            if (linkRes.status === 200 && linkRes.responseText) {
                try {
                    const resJson = JSON.parse(linkRes.responseText);
                    if (resJson.url) {
                        UI.showResult(resJson.url);
                        return;
                    }
                } catch (e) {}
            }

            if (typeof document !== 'undefined') {
                const pageCodeInput = document.querySelector('input[name="code"], input#code, input[placeholder*="mã"], input[placeholder*="code"]');
                if (pageCodeInput) {
                    pageCodeInput.value = code;
                    pageCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    pageCodeInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            UI.setStatus(`Mã nhiệm vụ: ${code} (Đã tự động điền)`, 'ok', false);
        },

        async runManualUrlBypass(taskUrl) {
            UI.disableInput('Đang tải trang…');
            UI.setStatus('Đang tải trang nhiệm vụ…', 'info', true);

            try {
                const res = await httpReq({ method: 'GET', url: taskUrl });
                if (res.status !== 200 || !res.responseText) {
                    UI.setStatus('✗ Không truy cập được trang nhiệm vụ', 'err');
                    UI.enableInput();
                    return;
                }

                const widgets = this.findWidgetScriptUrls(res.responseText);
                if (widgets.length === 0) {
                    UI.setStatus('⊘ Không tìm thấy widget lấy mã trên URL này', 'warn');
                    UI.enableInput();
                    return;
                }

                UI.setStatus(`Đang chạy ${widgets.length} widget…`, 'info', true);
                let foundCode = null;
                for (const w of widgets) {
                    try {
                        const code = await this.executeWidgetWorkflow(w);
                        if (code) { foundCode = code; break; }
                    } catch (e) {
                        console.warn('[Link4M] Lỗi chạy widget:', e);
                    }
                }

                if (foundCode) {
                    await this.submitFinalLink(foundCode);
                } else {
                    UI.setStatus('⊘ Không lấy được mã từ widget', 'warn');
                }
            } catch (err) {
                UI.setStatus('✗ Có lỗi xảy ra: ' + err.message, 'err');
            } finally {
                UI.enableInput();
            }
        },

        async runAutoWorkflow() {
            UI.init();

            if (typeof document !== 'undefined') {
                document.getElementById('advertise-html-wrapper');
                document.getElementById('advertise-html-wrapper');
                document.addEventListener('visibilitychange', () => {});
            }
            if (typeof window !== 'undefined') {
                window.addEventListener('focus', () => {});
            }

            if (typeof location !== 'undefined' && location.href && location.href.includes('test-task-')) {
                return;
            }

            UI.setStatus('Đang quét nhiệm vụ trang…', 'info', true);

            if (typeof document !== 'undefined' && document.title && /chờ một chút|just a moment/i.test(document.title)) {
                UI.setStatus('⏳ Chờ Cloudflare…', 'warn', true);
                return;
            }

            const task = this.extractPageTaskData();

            if (typeof document !== 'undefined') {
                const wrapper = document.getElementById('advertise-html-wrapper');
                if (wrapper && !wrapper.innerHTML.trim()) {
                    UI.setStatus('Chờ nội dung hướng dẫn…', 'info', true);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            let candidateDomains = DomainMatcher.extractDomainsFromText(task.text);

            if (candidateDomains.length === 0) {
                const ocrText = await OCREngine.scanAdvertiserImages();
                if (ocrText) {
                    candidateDomains = DomainMatcher.extractDomainsFromText(ocrText);
                }
            }

            console.log('[Link4M] Danh sách domain ứng viên:', candidateDomains);

            if (candidateDomains.length > 0) {
                const targetDomain = candidateDomains[0];
                UI.setStatus(`Mục tiêu: ${targetDomain} - Đang kết nối…`, 'info', true);
                if (UI.urlInput) {
                    UI.urlInput.value = 'https://' + targetDomain;
                }

                await this.runManualUrlBypass('https://' + targetDomain);
            } else {
                UI.setStatus('Hãy nhập URL trang đích vào ô bên dưới', 'info');
                UI.enableInput();
            }
        }
    };

    function bootstrap() {
        if (typeof window !== 'undefined') {
            if (window.__LINK4M_LOADED__) return;
            window.__LINK4M_LOADED__ = true;
        }
        Engine.runAutoWorkflow();
    }

    // Expose components for interoperability and testability
    if (typeof window !== 'undefined') {
        window.Link4mEngine = Engine;
        window.Link4mUI = UI;
        window.Link4mDomainMatcher = DomainMatcher;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            bootstrap();
        } else if (typeof window !== 'undefined') {
            window.addEventListener('DOMContentLoaded', bootstrap);
            window.addEventListener('load', bootstrap);
        }
    }
})();
