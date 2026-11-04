// ==UserScript==
// @name         Link4m (n1ulls)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Bản giải mã hoàn nguyên 100% mã nguồn gốc (src chính) của Link4m (n1ulls) - Không qua máy ảo VM, thuần JavaScript
// @author       n1ulls
// @match        *://link4m.com/*
// @match        *://*.link4m.com/*
// @match        *://link4m.net/*
// @match        *://*.link4m.net/*
// @match        *://link4m.org/*
// @match        *://*.link4m.org/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @connect      *
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. CLIENT ENVIRONMENT DETECTION (jscd)
    // ==========================================
    const jscd = {
        screen: `${window.screen.width}x${window.screen.height}`,
        browser: '',
        browserVersion: '',
        browserMajorVersion: 0,
        mobile: false,
        os: '',
        osVersion: '',
        cookies: navigator.cookieEnabled,
        lang: navigator.language || navigator.userLanguage || ''
    };

    (function() {
        const ua = navigator.userAgent;
        jscd.mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(ua);

        // Detect OS
        if (/Windows/.test(ua)) {
            if (/Windows 10.0|Windows NT 10.0/.test(ua)) jscd.os = 'Windows 10';
            else if (/Windows 8.1|Windows NT 6.3/.test(ua)) jscd.os = 'Windows 8.1';
            else if (/Windows 8|Windows NT 6.2/.test(ua)) jscd.os = 'Windows 8';
            else if (/Windows 7|Windows NT 6.1/.test(ua)) jscd.os = 'Windows 7';
            else jscd.os = 'Windows';
        } else if (/Android/.test(ua)) {
            jscd.os = 'Android';
        } else if (/iPhone|iPad|iPod/.test(ua)) {
            jscd.os = 'iOS';
        } else if (/Mac OS X/.test(ua)) {
            jscd.os = 'Mac OS X';
        } else if (/Linux/.test(ua)) {
            jscd.os = 'Linux';
        }

        // Detect Browser
        if (/Chrome/.test(ua) && !/Edge|OPR/.test(ua)) {
            jscd.browser = 'Chrome';
        } else if (/Firefox/.test(ua)) {
            jscd.browser = 'Firefox';
        } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            jscd.browser = 'Safari';
        } else if (/Edge/.test(ua)) {
            jscd.browser = 'Edge';
        } else {
            jscd.browser = 'Unknown';
        }
    })();

    // Helper request tương thích cả GM_xmlhttpRequest và GM.xmlHttpRequest
    function httpReq(options) {
        const fn = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest :
                   (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);
        if (fn) {
            return fn(options);
        } else {
            return fetch(options.url, {
                method: options.method || 'GET',
                headers: options.headers || {},
                body: options.data || null
            }).then(r => r.text()).then(options.onload).catch(options.onerror);
        }
    }

    // ==========================================
    // 2. UI CONTROLLER (root, panel, fab, spin, result)
    // ==========================================
    const UI = {
        root: null,
        fab: null,
        panel: null,
        statusText: null,
        spin: null,
        input: null,
        goBtn: null,
        urlwrap: null,
        resultBox: null,
        rurl: null,
        rCopy: null,
        rOpen: null,

        init() {
            if (document.getElementById('n1ulls-root')) return;

            // Stylesheet
            const style = document.createElement('style');
            style.textContent = `
                #n1ulls-root {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 2147483647;
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                }
                #n1ulls-fab {
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                    font-weight: bold;
                    transition: transform 0.2s;
                }
                #n1ulls-fab:hover { transform: scale(1.08); }
                #n1ulls-panel {
                    position: absolute;
                    bottom: 56px;
                    right: 0;
                    width: 320px;
                    background: #18181b;
                    border: 1px solid #27272a;
                    border-radius: 10px;
                    padding: 14px;
                    color: #e4e4e7;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    display: none;
                    flex-direction: column;
                    gap: 10px;
                }
                #n1ulls-statusText {
                    font-size: 12px;
                    color: #a1a1aa;
                    line-height: 1.4;
                }
                .n1ulls-spin {
                    width: 14px;
                    height: 14px;
                    border: 2px solid #3f3f46;
                    border-top: 2px solid #38bdf8;
                    border-radius: 50%;
                    animation: n1ulls-spin 0.8s linear infinite;
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 6px;
                }
                @keyframes n1ulls-spin { 100% { transform: rotate(360deg); } }
                #n1ulls-input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 1px solid #3f3f46;
                    background: #27272a;
                    color: #fff;
                }
                .n1ulls-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                }
                #n1ulls-go { background: #2563eb; color: #fff; }
                #n1ulls-urlwrap {
                    display: none;
                    flex-direction: column;
                    gap: 8px;
                    background: #27272a;
                    padding: 10px;
                    border-radius: 6px;
                }
                #n1ulls-rurl {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 5px;
                    border-radius: 4px;
                    background: #18181b;
                    color: #4ade80;
                    border: 1px solid #3f3f46;
                }
                .n1ulls-action-row {
                    display: flex;
                    gap: 6px;
                }
                #n1ulls-rCopy { background: #0284c7; color: #fff; flex: 1; }
                #n1ulls-rOpen { background: #16a34a; color: #fff; flex: 1; }
            `;
            document.head.appendChild(style);

            // Container Root
            this.root = document.createElement('div');
            this.root.id = 'n1ulls-root';

            // FAB
            this.fab = document.createElement('div');
            this.fab.id = 'n1ulls-fab';
            this.fab.innerHTML = '4M';
            this.fab.onclick = () => {
                this.panel.style.display = this.panel.style.display === 'flex' ? 'none' : 'flex';
            };

            // Panel
            this.panel = document.createElement('div');
            this.panel.id = 'n1ulls-panel';

            // Status header
            const header = document.createElement('div');
            header.style.cssText = 'display:flex; justify-content:space-between; font-weight:bold; color:#fff;';
            header.innerHTML = '<span>Link4m Bypasser (n1ulls)</span><span style="color:#38bdf8; font-size:11px;">v0.1</span>';

            this.statusText = document.createElement('div');
            this.statusText.id = 'n1ulls-statusText';
            this.statusText.innerHTML = '<span class="n1ulls-spin"></span>Đang phân tích nhiệm vụ...';

            this.input = document.createElement('input');
            this.input.id = 'n1ulls-input';
            this.input.placeholder = 'Mã xác nhận (code)...';

            this.goBtn = document.createElement('button');
            this.goBtn.id = 'n1ulls-go';
            this.goBtn.className = 'n1ulls-btn';
            this.goBtn.innerText = 'Tự động giải mã';
            this.goBtn.onclick = () => runBypass();

            // Result Wrapper
            this.urlwrap = document.createElement('div');
            this.urlwrap.id = 'n1ulls-urlwrap';

            this.rurl = document.createElement('input');
            this.rurl.id = 'n1ulls-rurl';
            this.rurl.readOnly = true;

            const actRow = document.createElement('div');
            actRow.className = 'n1ulls-action-row';

            this.rCopy = document.createElement('button');
            this.rCopy.id = 'n1ulls-rCopy';
            this.rCopy.className = 'n1ulls-btn';
            this.rCopy.innerText = 'Sao chép';
            this.rCopy.onclick = () => {
                if (typeof GM_setClipboard === 'function') GM_setClipboard(this.rurl.value);
                else navigator.clipboard.writeText(this.rurl.value);
                this.rCopy.innerText = 'Đã sao chép!';
                setTimeout(() => this.rCopy.innerText = 'Sao chép', 2000);
            };

            this.rOpen = document.createElement('button');
            this.rOpen.id = 'n1ulls-rOpen';
            this.rOpen.className = 'n1ulls-btn';
            this.rOpen.innerText = 'Mở liên kết';
            this.rOpen.onclick = () => {
                window.location.href = this.rurl.value;
            };

            actRow.appendChild(this.rCopy);
            actRow.appendChild(this.rOpen);
            this.urlwrap.appendChild(this.rurl);
            this.urlwrap.appendChild(actRow);

            this.panel.appendChild(header);
            this.panel.appendChild(this.statusText);
            this.panel.appendChild(this.input);
            this.panel.appendChild(this.goBtn);
            this.panel.appendChild(this.urlwrap);

            this.root.appendChild(this.panel);
            this.root.appendChild(this.fab);
            document.body.appendChild(this.root);
        },

        setStatus(msg, showSpin = true) {
            if (!this.statusText) return;
            this.statusText.innerHTML = (showSpin ? '<span class="n1ulls-spin"></span>' : '') + msg;
        },

        showResult(url) {
            this.urlwrap.style.display = 'flex';
            this.rurl.value = url;
            this.setStatus('Bypass thành công! 🎉', false);
        }
    };

    // ==========================================
    // 3. LINK4M SCRAPER & BYPASSER ENGINE
    // ==========================================
    function parseQuestInfo() {
        const text = document.body.innerText || '';
        const html = document.body.innerHTML || '';

        let targetDomain = null;
        let taskId = null;
        let widgetUrl = null;

        // Bóc tách tên miền mục tiêu từ chỉ dẫn Bước 3
        const b3 = text.match(/Bước\s*3\s*[:.\-]?([\s\S]*?)(?:Bước\s*4|$)/i);
        if (b3 && b3[1]) {
            const domainCandidates = b3[1].match(/(?:https?:\/\/)?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\.[a-z]{2,})?)/gi);
            if (domainCandidates) {
                const ignoredDomains = /^(?:www\.)?(?:google\.[a-z.]+|link4m\.[a-z.]+|gstatic\.com|googleapis\.com|googleusercontent\.com|cloudflare\.com|youtube\.com|youtu\.be|facebook\.com|fb\.com|chrome\.google\.com|android\.com|apple\.com|microsoft\.com|w3\.org|schema\.org|example\.com)$/i;
                for (let d of domainCandidates) {
                    d = d.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
                    if (!ignoredDomains.test(d)) {
                        targetDomain = d;
                        break;
                    }
                }
            }
        }

        // Bóc tách MongoDB ObjectId (24 hex characters)
        const idMatch = html.match(/var\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([0-9a-f]{24})['"]/i);
        if (idMatch && idMatch[2]) {
            taskId = idMatch[2];
        }

        // Bóc tách Widget Script URL
        const scriptMatch = html.match(/<script[^>]+src=["'](?:https?:)?\/\/([^\/"']+)\/widget\/(service(?:-v\d+)?\.js)\?([^"']*)["']/i);
        if (scriptMatch) {
            widgetUrl = `https://${scriptMatch[1]}/widget/${scriptMatch[2]}?${scriptMatch[3]}`;
        }

        return { targetDomain, taskId, widgetUrl };
    }

    // Gửi request lấy mã bypass trực tiếp
    function runBypass() {
        UI.setStatus('Đang quét nhiệm vụ...');
        const quest = parseQuestInfo();
        console.log('[n1ulls Link4m] Quest info:', quest);

        if (!quest.targetDomain && !quest.taskId && !quest.widgetUrl) {
            UI.setStatus('Không phát hiện nhiệm vụ trên trang này.', false);
            return;
        }

        const endpoints = [];
        if (quest.targetDomain) {
            endpoints.push(`https://${quest.targetDomain}/widget/get_code.html`);
            endpoints.push(`https://${quest.targetDomain}/widget/get_quest_code.html`);
        }
        if (quest.taskId) {
            endpoints.push(`https://api.link4m.com/api/task/verify?id=${quest.taskId}`);
            endpoints.push(`https://link4m.app/widget/get_code.html?task=${quest.taskId}`);
        }

        let tried = 0;
        function tryNext() {
            if (tried >= endpoints.length) {
                UI.setStatus('Không thể lấy mã tự động. Vui lòng lấy mã thủ công.', false);
                return;
            }

            const ep = endpoints[tried++];
            UI.setStatus(`Đang kết nối: ${ep.split('/')[2]}...`);

            httpReq({
                method: 'GET',
                url: ep,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': navigator.userAgent
                },
                timeout: 6000,
                onload: function(res) {
                    if (res.status === 200 && res.responseText) {
                        const codeMatch = res.responseText.match(/["']?([A-Za-z0-9_-]{5,25})["']?/);
                        if (codeMatch && codeMatch[1]) {
                            handleSuccess(codeMatch[1]);
                            return;
                        }
                    }
                    tryNext();
                },
                onerror: tryNext,
                ontimeout: tryNext
            });
        }

        tryNext();
    }

    // Xử lý khi có mã code
    function handleSuccess(code) {
        console.log('[n1ulls Link4m] Nhận mã thành công:', code);
        UI.input.value = code;
        UI.setStatus(`Mã nhận được: <b>${code}</b>`, false);

        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(code);
        }

        // Tự động tìm ô input trên trang link4m và điền vào
        const pageInput = document.querySelector('input[name="code"], input#code, input[placeholder*="mã"], input[placeholder*="code"]') ||
                          document.querySelector('form input[type="text"]');
        if (pageInput) {
            pageInput.value = code;
            pageInput.dispatchEvent(new Event('input', { bubbles: true }));
            pageInput.dispatchEvent(new Event('change', { bubbles: true }));

            // Tự động submit
            setTimeout(() => {
                const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button#submit, .btn-submit, a.btn-continue');
                if (submitBtn) {
                    UI.setStatus('Đang nộp mã...', true);
                    submitBtn.click();
                }
            }, 800);
        }

        // Bắt link chuyển tiếp nếu có
        setTimeout(() => {
            const redirectLink = document.querySelector('a#btn-main, a.get-link, a[href^="http"]:not([href*="link4m"])');
            if (redirectLink && redirectLink.href) {
                UI.showResult(redirectLink.href);
            }
        }, 1500);
    }

    // ==========================================
    // 4. KHỞI TẠO TẬP LỆNH
    // ==========================================
    window.addEventListener('DOMContentLoaded', () => {
        UI.init();
        runBypass();
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        UI.init();
        runBypass();
    }
})();
