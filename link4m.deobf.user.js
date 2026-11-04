// ==UserScript==
// @name         Link4m Bypasser (n1ulls Deobfuscated)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Bản giải mã sạch Link4m bypasser (n1ulls) - Tự động bóc tách nhiệm vụ, giải mã widget và lấy mã siêu tốc không cần chờ timer
// @author       n1ulls (Deobfuscated by Community)
// @match        *://link4m.com/*
// @match        *://*.link4m.com/*
// @match        *://link4m.net/*
// @match        *://*.link4m.net/*
// @match        *://link4m.org/*
// @match        *://*.link4m.org/*
// @match        *://link4m.co/*
// @match        *://*.link4m.co/*
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
    console.log('[Link4m Bypass] Script đã được nạp thành công');

    // Cấu hình UI Floating Action Button
    function createBypassUI() {
        if (document.getElementById('link4m-bypass-ui')) return;

        const container = document.createElement('div');
        container.id = 'link4m-bypass-ui';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #1e1e2f;
            color: #fff;
            padding: 14px 18px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            border: 1px solid #383854;
            min-width: 260px;
            font-size: 13px;
        `;

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:bold; color:#4ade80;">🚀 Link4m Bypasser</span>
                <span id="bypass-status" style="font-size:11px; color:#94a3b8;">Đang sẵn sàng...</span>
            </div>
            <div id="bypass-details" style="font-size:12px; color:#cbd5e1; margin-bottom:10px; word-break:break-all;">
                Đang quét thông tin nhiệm vụ...
            </div>
            <div id="bypass-actions" style="display:none; gap:6px;">
                <button id="btn-copy" style="flex:1; background:#3b82f6; border:none; color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:500;">Sao chép mã</button>
                <button id="btn-submit" style="flex:1; background:#10b981; border:none; color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:500;">Tự nộp</button>
            </div>
        `;

        document.body.appendChild(container);
        return container;
    }

    function setStatus(status, details, showActions = false) {
        createBypassUI();
        const elStatus = document.getElementById('bypass-status');
        const elDetails = document.getElementById('bypass-details');
        const elActions = document.getElementById('bypass-actions');

        if (elStatus) elStatus.innerText = status;
        if (elDetails) elDetails.innerHTML = details;
        if (elActions) elActions.style.display = showActions ? 'flex' : 'none';
    }

    // 1. Quét thông tin trang Link4m
    function extractQuestData() {
        const bodyText = document.body.innerText || '';
        const bodyHtml = document.body.innerHTML || '';

        // Bóc tách tên miền mục tiêu từ Bước 3
        let targetDomain = null;
        const b3Match = bodyText.match(/Bước\s*3\s*[:.\-]?([\s\S]*?)(?:Bước\s*4|$)/i);
        if (b3Match && b3Match[1]) {
            const domainMatch = b3Match[1].match(/(?:https?:\/\/)?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\.[a-z]{2,})?)/i);
            if (domainMatch && domainMatch[1]) {
                targetDomain = domainMatch[1].replace(/^(?:www\.)?/i, '');
            }
        }

        // Bóc tách MongoDB 24-character hex ID (Task ID của Link4m)
        let taskId = null;
        const idMatch = bodyHtml.match(/var\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([0-9a-f]{24})['"]/i);
        if (idMatch && idMatch[2]) {
            taskId = idMatch[2];
        }

        // Bóc tách widget URL hoặc key
        let widgetUrl = null;
        const scriptMatch = bodyHtml.match(/<script[^>]+src=["'](?:https?:)?\/\/([^\/"']+)\/widget\/(service(?:-v\d+)?\.js)\?([^"']*)["']/i);
        if (scriptMatch) {
            widgetUrl = `https://${scriptMatch[1]}/widget/${scriptMatch[2]}?${scriptMatch[3]}`;
        }

        return {
            targetDomain: targetDomain,
            taskId: taskId,
            widgetUrl: widgetUrl
        };
    }

    // 2. Tìm kiếm ô nhập mã và nút xác nhận trên trang
    function findCodeInput() {
        return document.querySelector('input[name="code"], input#code, input[placeholder*="mã"], input[placeholder*="code"]') ||
               document.querySelector('form input[type="text"]');
    }

    function findSubmitButton() {
        return document.querySelector('button[type="submit"], input[type="submit"], button#submit, .btn-submit, a.btn-continue');
    }

    // 3. Gửi request trực tiếp đến widget API để nhận mã không cần chờ đếm ngược
    function solveLink4mQuest(questData) {
        setStatus('Đang lấy mã...', `Mục tiêu: <b>${questData.targetDomain || 'Server Link4m'}</b>`);

        // Xây dựng các endpoint nhận code
        const candidates = [];
        if (questData.targetDomain) {
            candidates.push(`https://${questData.targetDomain}/widget/get_code.html`);
            candidates.push(`https://${questData.targetDomain}/widget/get_quest_code.html`);
        }
        if (questData.taskId) {
            candidates.push(`https://api.link4m.com/api/task/verify?id=${questData.taskId}`);
            candidates.push(`https://link4m.app/widget/get_code.html?task=${questData.taskId}`);
        }

        let resolved = false;

        function tryEndpoint(index) {
            if (index >= candidates.length) {
                if (!resolved) {
                    setStatus('Chờ nhập tay', 'Không thể bóc tách tự động mã từ widget.<br>Vui lòng lấy mã theo hướng dẫn.', false);
                }
                return;
            }

            const url = candidates[index];
            console.log('[Link4m Bypass] Đang thử:', url);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'Accept': '*/*',
                    'User-Agent': navigator.userAgent
                },
                timeout: 5000,
                onload: function(res) {
                    if (res.status === 200) {
                        const codeMatch = res.responseText.match(/["']?([A-Za-z0-9_-]{5,20})["']?/);
                        if (codeMatch && codeMatch[1]) {
                            resolved = true;
                            onCodeReceived(codeMatch[1]);
                            return;
                        }
                    }
                    tryEndpoint(index + 1);
                },
                onerror: function() {
                    tryEndpoint(index + 1);
                },
                ontimeout: function() {
                    tryEndpoint(index + 1);
                }
            });
        }

        tryEndpoint(0);
    }

    // 4. Xử lý khi nhận được mã xác thực
    function onCodeReceived(code) {
        console.log('[Link4m Bypass] Lấy mã thành công:', code);
        setStatus('Thành công! 🎉', `Mã code: <b style="color:#facc15; font-size:14px;">${code}</b>`, true);

        // Lưu vào clipboard
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(code);
        }

        const inputEl = findCodeInput();
        if (inputEl) {
            inputEl.value = code;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));

            // Tự động nhấn nút submit sau 1 giây
            setTimeout(() => {
                const submitBtn = findSubmitButton();
                if (submitBtn) {
                    submitBtn.click();
                }
            }, 1000);
        }

        // Đính sự kiện cho nút UI
        const btnCopy = document.getElementById('btn-copy');
        if (btnCopy) {
            btnCopy.onclick = () => {
                if (typeof GM_setClipboard === 'function') GM_setClipboard(code);
                alert('Đã sao chép mã: ' + code);
            };
        }

        const btnSubmit = document.getElementById('btn-submit');
        if (btnSubmit) {
            btnSubmit.onclick = () => {
                const btn = findSubmitButton();
                if (btn) btn.click();
            };
        }
    }

    // 5. Khởi động
    createBypassUI();
    const quest = extractQuestData();
    console.log('[Link4m Bypass] Dữ liệu nhiệm vụ:', quest);

    if (quest.targetDomain || quest.taskId) {
        solveLink4mQuest(quest);
    } else {
        setStatus('Sẵn sàng', 'Trang không có nhiệm vụ Link4m chủ động.');
    }
})();
