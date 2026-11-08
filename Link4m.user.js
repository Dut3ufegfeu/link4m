// ==UserScript==
// @name         Link4m - Clean Source (Deobfuscated)
// @namespace    local.reconstruction.link4m
// @version      1.0.0
// @description  Bản giải mã sạch hoàn nguyên 100% mã nguồn Link4m (n1ulls) - Hỗ trợ decobf: @hlounhh (<@1312674288775593984>)
// @author       n1ulls (Hỗ trợ decobf: @hlounhh - <@1312674288775593984>)
// @match        *://link4m.app/*
// @match        *://*.link4m.app/*
// @match        *://link4m.com/*
// @match        *://*.link4m.com/*
// @match        *://link4m.net/*
// @match        *://*.link4m.net/*
// @match        *://link4m.org/*
// @match        *://*.link4m.org/*
// @run-at       document-idle
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_info
// @connect      *
// @updateURL    https://github.com/Dut3ufegfeu/link4m/raw/main/Link4m.user.js
// @downloadURL  https://github.com/Dut3ufegfeu/link4m/raw/main/Link4m.user.js
// ==/UserScript==

(() => {
  'use strict';

  if (window.__link4mReadableSourceLoaded) return;
  window.__link4mReadableSourceLoaded = true;

  const CONFIG = Object.freeze({
    requestTimeoutMs: 25000,
    pageWaitMs: 60000,
    imageWaitMs: 6000,
    recaptchaWaitMs: 300000,
    maxWidgetAttempts: 5,
    maxWidgetSteps: 4,
    maxImageCandidates: 3,
    ocrSpaceApiKeys: ['helloworld'],
    ocrSpaceEndpoint: 'https://api.ocr.space/parse/image',
    tesseractCdn: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    storeUrl: 'https://robuxvien.com/home',
    communityUrl: 'https://discord.gg/rcRBbzTfqB',
    // The supplied program evaluated a dynamic script from /widget/client.js.
    // Leave this false unless the code source has been reviewed and trusted.
    allowRemoteWidgetJavaScript: true
  });

  const KNOWN_SUFFIXES = new Set(
    'com.vn net.vn edu.vn org.vn gov.vn info.vn pro.vn ac.vn health.vn name.vn co.uk org.uk com.au com.sg com.my com.ph co.jp co.kr co.id co.th com.br vn com net org io info co me xyz app dev top site online store club pro tv cc gg asia biz us uk ca de jp kr sg id th my ph lat icu fun space tech website lol click link live news blog shop vip win work world zone ai to sh fm ly gl it es fr ru br in au nl se no pl cz ch at be dk fi gr hk tw nz za mx ar cl pe ve ua ro hu tr sa ae pk bd lk np mm kh la bn mobi name page life today cloud digital media network systems solutions services games game apk download'.split(' ')
  );
  const REJECTED_HOSTS = /^(?:www\.)?(?:google\.[a-z.]+|link4m\.[a-z.]+|gstatic\.com|googleapis\.com|googleusercontent\.com|cloudflare\.com|youtube\.com|youtu\.be|facebook\.com|fb\.com|chrome\.google\.com|android\.com|apple\.com|microsoft\.com|w3\.org|schema\.org|example\.com)$/i;

  const state = {
    ui: {},
    busy: false,
    autoDetecting: false,
    panelOpen: true,
    currentUrl: location.href,
    isGoogleInstruction: false,
    status: 'Đang khởi tạo…',
    statusTone: 'info',
    spinning: true,
    timers: new Map(),
    timerSequence: 0,
    finalUrl: '',
    cachedTesseractLoader: null,
    allowRemoteWidgetJavaScript: CONFIG.allowRemoteWidgetJavaScript
  };

  const STYLES = `
    :host, :host * { box-sizing:border-box; }
    .root { font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif; color:#e9f4fa; line-height:1.45; }
    .panel { width:min(372px,calc(100vw - 24px)); max-height:calc(100vh - 30px); overflow-y:auto;
      border-radius:19px; border:1px solid #477489; background:linear-gradient(160deg,#13232f,#070c12 65%);
      box-shadow:0 16px 42px #0009,0 0 25px #59caee20; }
    .head { display:flex;align-items:center;gap:9px; padding:12px 14px;border-bottom:1px solid #ffffff18; }
    .title { flex:1;min-width:0;font-size:15px;font-weight:800;letter-spacing:.2px; }
    .version {font:700 10px ui-monospace,monospace;color:#a9e7fb;border:1px solid #4897b8;
      background:#3483a330;padding:4px 7px;border-radius:20px;}
    button { font:inherit;cursor:pointer; }
    button:focus-visible,input:focus-visible { outline:2px solid #86dffc;outline-offset:2px; }
    .minimize {border:0;border-radius:9px;color:#d0e9f3;background:#ffffff16;width:30px;height:30px;font-size:20px;}
    .status {position:relative;display:flex;align-items:flex-start;gap:9px;min-height:50px;padding:13px 14px;
      border-bottom:1px solid #ffffff14;color:#bfe2f0;font-size:13px;font-weight:600;}
    .status.info {color:#bfe2f0}.status.ok{color:#8ae1b0}.status.warn{color:#f0ce8b}.status.err{color:#ff9c95}
    .spinner {flex:none;width:12px;height:12px;margin-top:3px;border-radius:50%;
      border:2px solid #ffffff2b;border-top-color:#8ae6ff;animation:spin .75s linear infinite;}
    .spinner.off {display:none} @keyframes spin{to{transform:rotate(360deg)}}
    .message {flex:1;word-break:break-word}.clock{font:700 12px ui-monospace,monospace;color:#8ae6ff;white-space:nowrap;}
    .progress {height:3px;background:#ffffff16}.fill{height:100%;width:0;background:#78dfff;transition:width .2s;}
    .notice {display:none;margin:10px 14px 0;border:1px solid #64b8d788;border-radius:11px;
      background:#46b9ec1f;color:#dcf5ff;padding:10px;font-size:12px;font-weight:700;}
    .notice.show {display:block}.form {display:grid;gap:10px;padding:12px 14px;}
    .inputWrap{border:1px solid #ffffff2c;background:#02080fd9;border-radius:12px;padding:0 11px;display:flex;align-items:center;gap:8px;}
    .urlInput{border:0;background:transparent;padding:13px 0;min-width:0;flex:1;color:#effaff;font-size:14px;font-weight:400;font-family:inherit;outline:0;}
    .urlInput::placeholder{color:#81919f}.urlInput:disabled{opacity:.6}
    .primary{border:0;border-radius:11px;padding:11px;background:linear-gradient(135deg,#88e8ff,#4fb8e8);
      color:#061622;font-size:14px;font-weight:800;min-height:42px;}
    button:disabled{opacity:.45;cursor:not-allowed}.links{display:flex;gap:8px;}
    .secondary{flex:1;padding:10px;border-radius:10px;border:1px solid #6bb7d24b;
      background:#65b7e51d;color:#e6faff;font-size:13px;font-weight:700;}
    .secondary.purple{background:#8393f524;border-color:#8393f566}
    .advanced{display:flex;align-items:flex-start;gap:7px;font-size:11px;color:#a7c3d2;line-height:1.4;cursor:pointer;}
    .advanced input{margin:1px 0 0;accent-color:#70d5f5;}
    .result {display:none;margin:0 14px 12px;padding:10px;border:1px solid #68bd8d80;border-radius:12px;background:#1a3c2a80;}
    .result.show{display:block}.resultLabel{font-size:11px;letter-spacing:1px;font-weight:800;color:#9ee4ba;}
    .resultUrl{font:12px/1.55 ui-monospace,Consolas,monospace;overflow-wrap:anywhere;max-height:90px;overflow:auto;
      margin:7px 0;padding:9px;background:#0004;border-radius:8px;}
    .actions{display:flex;gap:8px}.actions button{flex:1;padding:10px;border:0;border-radius:9px;font-size:13px;font-weight:800;}
    .copy{background:#6ac595;color:#092318}.open{background:#294737;color:#cefbdd}
    .fab{display:none;width:54px;height:54px;border-radius:17px;border:1px solid #65cbea8a;background:#11222f;
      color:#9ceaff;font-size:23px;font-weight:900;box-shadow:0 8px 26px #0009;}
    @media(max-width:480px){.panel{width:calc(100vw - 16px)}.urlInput{font-size:16px}}
    @media(prefers-reduced-motion:reduce){.spinner{animation:none}.fill{transition:none}}
  `;

  const MARKUP = `
    <div class="root">
      <section class="panel" id="panel" aria-label="Link4m">
        <header class="head"><strong class="title">Link4m (Bypass)</strong>
          <span class="version">CLEAN 1.0</span><button type="button" class="minimize" id="minimize" title="Thu nhỏ">−</button>
        </header>
        <div class="status info" id="status"><span class="spinner" id="spinner"></span>
          <span class="message" id="statusMessage">Đang khởi tạo…</span><span class="clock" id="timer"></span></div>
        <div class="progress"><div class="fill" id="progressFill"></div></div>
        <div class="notice" id="captchaNotice">🔐 Hãy hoàn thành reCAPTCHA trực tiếp trên trang.</div>
        <form id="urlForm" class="form" novalidate>
          <div class="inputWrap" id="inputWrap">🔗
            <input id="urlInput" class="urlInput" type="text" inputmode="url" autocomplete="off"
                   placeholder="Nhập URL nhiệm vụ (ví dụ example.com)" />
          </div>
          <button type="submit" class="primary" id="startButton">Bắt đầu</button>
          <div class="links">
            <button type="button" id="storeButton" class="secondary">My Store</button>
            <button type="button" id="communityButton" class="secondary purple">My Server</button>
          </div>
          <label class="advanced"><input type="checkbox" id="allowWidgetCode" />
            Cho phép chạy mã JavaScript động từ máy chủ widget (chỉ bật khi tin tưởng nguồn mã).
          </label>
        </form>
        <section class="result" id="result"><div class="resultLabel">✓ URL CỦA BẠN</div>
          <div class="resultUrl" id="resultUrl"></div><div class="actions">
            <button type="button" class="copy" id="copyButton">⧉ Sao chép</button>
            <button type="button" class="open" id="openButton">↗ Mở URL</button>
          </div>
        </section>
      </section>
      <button type="button" class="fab" id="reopenButton" title="Mở công cụ" aria-label="Mở công cụ">↗</button>
    </div>`;

  function createInterface() {
    if (state.ui.host || !document.body) return;
    const host = document.createElement('div');
    host.id = 'link4m-clean-source-host';
    host.style.cssText = 'position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2147483647;';
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLES;
    shadowRoot.append(style);
    const app = document.createElement('div');
    app.innerHTML = MARKUP;
    shadowRoot.append(app);
    document.body.append(host);

    const byId = (id) => shadowRoot.getElementById(id);
    state.ui = {
      host, shadowRoot,
      panel: byId('panel'), status: byId('status'), message: byId('statusMessage'),
      spinner: byId('spinner'), timer: byId('timer'), progress: byId('progressFill'),
      notice: byId('captchaNotice'), form: byId('urlForm'), inputWrap: byId('inputWrap'),
      input: byId('urlInput'), startButton: byId('startButton'), reopen: byId('reopenButton'),
      result: byId('result'), resultUrl: byId('resultUrl')
    };

    byId('minimize').addEventListener('click', () => setPanelOpen(false));
    byId('reopenButton').addEventListener('click', () => setPanelOpen(true));
    byId('storeButton').addEventListener('click', () => openExternal(CONFIG.storeUrl));
    byId('communityButton').addEventListener('click', () => openExternal(CONFIG.communityUrl));
    byId('copyButton').addEventListener('click', copyResult);
    byId('allowWidgetCode').checked = state.allowRemoteWidgetJavaScript;
    byId('allowWidgetCode').addEventListener('change', (event) => {
      state.allowRemoteWidgetJavaScript = event.target.checked;
    });
    byId('openButton').addEventListener('click', () => state.finalUrl && openExternal(state.finalUrl));
    state.ui.form.addEventListener('submit', (event) => {
      event.preventDefault();
      void runBypass(state.ui.input.value);
    });

    setInterval(updateStatusClock, 250);
    updateStatusClock();
    updateButtons();
  }

  function setPanelOpen(open) {
    state.panelOpen = Boolean(open);
    state.ui.panel.style.display = state.panelOpen ? '' : 'none';
    state.ui.reopen.style.display = state.panelOpen ? 'none' : 'block';
  }

  function updateStatus(message, { tone = 'info', spin = false } = {}) {
    state.status = String(message);
    state.statusTone = tone;
    state.spinning = spin;
    if (!state.ui.status) return;
    state.ui.message.textContent = state.status;
    state.ui.status.className = `status ${tone}`;
    state.ui.spinner.classList.toggle('off', !spin);
    updateStatusClock();
  }

  function updateStatusClock() {
    if (!state.ui.timer) return;
    const now = Date.now();
    const active = [...state.timers.values()].filter((timer) => timer.end > now).sort((a, b) => a.end - b.end)[0];
    if (!active) {
      state.ui.timer.textContent = '';
      state.ui.progress.style.width = '0%';
      return;
    }
    const seconds = Math.max(0, Math.ceil((active.end - now) / 1000));
    const label = seconds >= 60 ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : `${seconds}s`;
    state.ui.timer.textContent = label;
    state.ui.progress.style.width = `${Math.max(0, Math.min(100, 100 * (1 - (active.end - now) / active.duration)))}%`;
  }

  function updateButtons() {
    if (!state.ui.startButton) return;
    const disabled = state.busy || state.autoDetecting;
    state.ui.startButton.disabled = disabled;
    state.ui.input.disabled = disabled;
    state.ui.startButton.textContent = state.busy ? 'Đang xử lý…' : state.autoDetecting ? 'Đang OCR…' : 'Bắt đầu';
  }

  function showResult(url) {
    state.finalUrl = url;
    state.ui.resultUrl.textContent = url;
    state.ui.result.classList.add('show');
    updateStatus('✓ Lấy URL thành công', { tone: 'ok' });
  }

  function openExternal(url) {
    try { window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (error) { console.warn('[Link4m Clean] Không thể mở URL', error); }
  }

  async function copyResult() {
    if (!state.finalUrl) return;
    try {
      if (typeof GM_setClipboard === 'function') {
        GM_setClipboard(state.finalUrl);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(state.finalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = state.finalUrl;
        document.body.append(textarea);
        textarea.select();
        if (!document.execCommand('copy')) throw new Error('Không có Clipboard API');
        textarea.remove();
      }
      updateStatus('✓ Đã sao chép URL', { tone: 'ok' });
    } catch (error) { updateStatus('Không sao chép được URL', { tone: 'warn' }); }
  }

  function sleep(milliseconds, label = '') {
    const duration = Math.max(0, Math.round(Number(milliseconds) || 0));
    const id = ++state.timerSequence;
    if (label && duration > 0) state.timers.set(id, { label, duration, end: Date.now() + duration });
    return new Promise((resolve) => setTimeout(() => {
      state.timers.delete(id);
      resolve();
    }, duration));
  }

  async function waitForNetwork(timeoutMs = 120000) {
    if (navigator.onLine !== false) return;
    await new Promise((resolve) => {
      const cleanup = () => { window.removeEventListener('online', done); clearTimeout(timeoutId); };
      const done = () => { cleanup(); resolve(); };
      const timeoutId = setTimeout(done, timeoutMs);
      window.addEventListener('online', done, { once: true });
    });
  }

  function normalizeUrl(rawUrl) {
    const input = String(rawUrl ?? '').trim();
    if (!input) return '';
    if (!/<[a-z][\s\S]*>/i.test(input)) return input;
    const div = document.createElement('div');
    div.innerHTML = input;
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function validateTaskUrl(input) {
    let text = String(input || '').trim();
    if (!text) throw new Error('Chưa nhập URL nhiệm vụ');
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(text)) text = `https://${text}`;
    let url;
    try { url = new URL(text); }
    catch { throw new Error('URL không hợp lệ'); }
    if (url.protocol === 'http:') url.protocol = 'https:';
    if (url.protocol !== 'https:' || !url.hostname) throw new Error('Chỉ hỗ trợ URL HTTPS');
    if (/^(?:[a-z\d-]+\.)*link4m\.(?:com|net|org)$/i.test(url.hostname)) {
      throw new Error('Hãy nhập URL nhiệm vụ, không phải link Link4m');
    }
    return url.href;
  }

  async function request(url, { method = 'GET', headers = {}, body, timeoutMs = CONFIG.requestTimeoutMs, responseType = 'text' } = {}) {
    const options = {
      url: String(url), method: method.toUpperCase(), headers, timeout: timeoutMs,
      responseType: responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
      data: body, anonymous: true
    };
    const requestFunction = typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function'
      ? GM.xmlHttpRequest.bind(GM)
      : typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : null;
    if (requestFunction) {
      return new Promise((resolve, reject) => {
        let finished = false;
        const complete = (callback, value) => {
          if (finished) return;
          finished = true;
          callback(value);
        };
        try {
          const pending = requestFunction({
            ...options,
            onload: (response) => complete(resolve, {
              status: Number(response.status) || 0,
              responseText: response.responseText || '',
              response: response.response,
              finalUrl: response.finalUrl || response.responseURL || url
            }),
            onerror: (error) => complete(reject, new Error(error?.error || error?.statusText || 'Lỗi mạng')),
            ontimeout: () => complete(reject, new Error('Hết thời gian chờ HTTP')),
            onabort: () => complete(reject, new Error('Yêu cầu đã bị hủy'))
          });
          if (pending && typeof pending.catch === 'function') pending.catch((error) => complete(reject, error));
        } catch (error) { complete(reject, error); }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body,
        credentials: 'omit',
        signal: controller.signal
      });
      return {
        status: response.status,
        responseText: responseType === 'arraybuffer' ? '' : await response.text(),
        response: responseType === 'arraybuffer' ? await response.arrayBuffer() : undefined,
        finalUrl: response.url
      };
    } finally { clearTimeout(timeoutId); }
  }

  function browserHeaders(baseUrl = state.currentUrl) {
    let origin = location.origin;
    try { origin = new URL(baseUrl).origin; } catch { /* fallback */ }
    return {
      accept: '*/*', 'accept-language': 'vi,en;q=0.9,en-US;q=0.8',
      'cache-control': 'no-cache', pragma: 'no-cache', referer: `${origin}/`
    };
  }

  function formHeaders(baseUrl = state.currentUrl) {
    return { ...browserHeaders(baseUrl), 'content-type': 'application/x-www-form-urlencoded' };
  }

  function readStringVariable(source, variableName) {
    const safeName = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?:var|let|const)\\s+${safeName}\\s*=\\s*['\"]([^'\"]+)['\"]`, 'i');
    const found = String(source).match(pattern);
    return found ? found[1].replace(/\\x([\da-f]{2})/gi, (_, digits) => String.fromCharCode(parseInt(digits, 16))) : null;
  }

  function readNumberVariable(source, variableName) {
    const safeName = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const found = String(source).match(new RegExp(`(?:var|let|const)\\s+${safeName}\\s*=\\s*['\"]?(-?[\\d.]+)`, 'i'));
    return found ? Number(found[1]) : null;
  }

  function extractWidgetScripts(html) {
    const scripts = [];
    const seen = new Set();
    const regex = /<script[^>]+src=["'](?:https?:)?\/\/([^\/"']+)\/widget\/(service(?:-v\d+)?\.js)\?([^"']*)["']/gi;
    for (const match of html.matchAll(regex)) {
      const hostname = match[1];
      const key = new URLSearchParams(match[3].replace(/&amp;/g, '&')).get('key');
      if (!key || seen.has(`${hostname}/${key}`)) continue;
      seen.add(`${hostname}/${key}`);
      scripts.push({ hostname, key, url: `https://${hostname}/widget/${match[2]}?key=${encodeURIComponent(key)}` });
    }
    return scripts;
  }

  function parseWidgetHtml(html) {
    if (!/var\s+get_code\s*=\s*true\s*;/i.test(html)) return null;
    const allRefDomains = [...html.matchAll(/var\s+ref_domain_list\s*=\s*\[([^\]]*)\]/gi)]
      .flatMap((match) => [...match[1].matchAll(/["']([^"']+)["']/g)].map((part) => part[1]));
    const refs = allRefDomains.filter((ref) => /google/i.test(ref) === state.isGoogleInstruction);
    if (state.isGoogleInstruction && refs.length === 0) return null;
    if (!state.isGoogleInstruction && allRefDomains.length > 0) return null;

    const endpoints = [...new Set((html.match(/(?:get_code|get_quest_code)\.html/g) || []))];
    if (!endpoints.length) return null;
    let domain = readStringVariable(html, 'traffic_domain');
    if (!domain) {
      const variable = html.match(/["']https?:\/\/["']\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*["']\/widget\//);
      if (variable) domain = readStringVariable(html, variable[1]);
    }
    let key = readStringVariable(html, 'traffic_key');
    let code = readStringVariable(html, 'traffic_id');
    let session = readStringVariable(html, 'traffic_session');
    const codeVariable = html.match(/[?&]code=["']\s*\+\s*([A-Za-z_$][\w$]*)/);
    const keyVariable = html.match(/[?&]key=["']\s*\+\s*([A-Za-z_$][\w$]*)/);
    const sessionVariable = html.match(/traffic_session=["']\s*\+\s*([A-Za-z_$][\w$]*)/);
    if (!code && codeVariable) code = readStringVariable(html, codeVariable[1]);
    if (!key && keyVariable) key = readStringVariable(html, keyVariable[1]);
    if (!session && sessionVariable) session = readStringVariable(html, sessionVariable[1]);
    if (!session) {
      const fallback = html.match(/var\s+[A-Za-z_$][\w$]*\s*=\s*["']([a-f\d]{24})["']/i);
      session = fallback ? fallback[1] : null;
    }
    if (!key || !code || !session || !domain) return null;
    domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (!/^[a-z\d.-]+$/i.test(domain) || !domain.includes('.')) return null;
    return {
      domain, key, code, session,
      uuidName: readStringVariable(html, 'uuid_name'),
      totalSteps: endpoints[0] === 'get_quest_code.html' ? 2 : 1,
      endpoint: endpoints[0],
      waitSeconds: readNumberVariable(html, 'traffic_wait_time') ?? 0,
      nextWaitSeconds: readNumberVariable(html, 'traffic_step_2_wait_time') ?? 0
    };
  }

  function getBrowserInfo() {
    const agent = navigator.userAgent;
    const match = agent.match(/(?:OPR|Opera)\/([\d.]+)/) || agent.match(/Edg\/([\d.]+)/)
      || agent.match(/Chrome\/([\d.]+)/) || agent.match(/Firefox\/([\d.]+)/)
      || agent.match(/Version\/([\d.]+).*Safari/) || [];
    const browser = /OPR|Opera/.test(agent) ? 'Opera' : /Edg\//.test(agent) ? 'Edge'
      : /Chrome\//.test(agent) ? 'Chrome' : /Firefox\//.test(agent) ? 'Firefox'
      : /Safari\//.test(agent) ? 'Safari' : navigator.appName || 'Unknown';
    return { browser, version: match[1] || '0', major: parseInt(match[1] || '0', 10) || 0 };
  }

  function getOperatingSystem() {
    const agent = navigator.userAgent;
    if (/Windows NT 10/.test(agent)) return { os: 'Windows', version: '10+' };
    if (/Windows/.test(agent)) return { os: 'Windows', version: 'Unknown' };
    if (/Android ([\d.]+)/.test(agent)) return { os: 'Android', version: RegExp.$1 };
    if (/iPhone|iPad|iPod/.test(agent)) return { os: 'iOS', version: 'Unknown' };
    if (/Mac OS X/.test(agent)) return { os: 'Mac', version: 'Unknown' };
    if (/Linux/.test(agent)) return { os: 'Linux', version: 'Unknown' };
    return { os: 'Unknown', version: 'Unknown' };
  }

  function getStableClientId(contextName) {
    const key = `_traffic_cid_${contextName || 'default'}`;
    try {
      if (typeof GM_getValue === 'function') {
        const previous = GM_getValue(key, null);
        if (previous) return previous;
        const generated = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        if (typeof GM_setValue === 'function') GM_setValue(key, generated);
        return generated;
      }
    } catch { /* private/storage-disabled browser */ }
    return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }

  function getClientDetails(contextName) {
    const browser = getBrowserInfo();
    const platform = getOperatingSystem();
    let url;
    try { url = new URL(state.currentUrl); }
    catch { url = new URL(location.href); }
    return {
      screen: `${screen.width} x ${screen.height}`,
      browser: browser.browser,
      browserVersion: browser.version,
      browserMajorVersion: browser.major,
      mobile: /Mobile|Android|iP(ad|od|hone)/i.test(navigator.userAgent),
      os: platform.os, osVersion: platform.version,
      cookies: true, flashVersion: 'no check', lang: 'vi',
      client_id: getStableClientId(contextName),
      pathname: url.pathname, href: url.href, hostname: url.hostname
    };
  }

  function readChallengeData(challengeScript, initialDetails) {
    const code = String(challengeScript || '').trim();
    if (!code) return initialDetails;
    if (!state.allowRemoteWidgetJavaScript) {
      throw new Error('Widget yêu cầu JavaScript động — tích tùy chọn tin cậy mã widget nếu muốn tiếp tục.');
    }
    // Dynamic code is a security-sensitive feature inherited from the original script.
    // It should only be enabled after reviewing the fetched script and its source.
    const initial = JSON.parse(JSON.stringify(initialDetails));
    const result = new Function('jscd', `${code}\nreturn typeof jscd === 'object' && jscd ? jscd : null;`)(initial);
    return result && typeof result === 'object' ? result : initialDetails;
  }

  function encodeForm(values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value == null) continue;
      params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return params.toString();
  }

  async function fetchWidgetHtml(widget) {
    try {
      const response = await request(widget.url, { headers: browserHeaders() });
      if (response.status < 200 || response.status >= 400) return null;
      const parsed = parseWidgetHtml(response.responseText);
      return parsed ? { html: response.responseText, parsed, widget } : null;
    } catch (error) {
      console.warn('[Link4m Clean] Không tải được widget', error);
      return null;
    }
  }

  async function processWidget(widgetState) {
    let currentPage = widgetState;
    let previousId = null;
    let previousDetails = null;
    let totalSteps = widgetState.parsed.totalSteps;

    for (let step = 1; step <= Math.min(CONFIG.maxWidgetSteps, totalSteps); step++) {
      const details = currentPage.parsed;
      const initialDetails = previousDetails || getClientDetails(details.uuidName);
      const requestBody = encodeForm({ traffic_session: details.session, key: details.key, ...initialDetails });
      const clientEndpoint = `https://${details.domain}/widget/client.js`;

      let response;
      let retries = 0;
      while (true) {
        try {
          updateStatus(`Widget: xử lý bước ${step}/${totalSteps}`, { spin: true });
          response = await request(clientEndpoint, {
            method: 'POST', body: requestBody, headers: formHeaders(), timeoutMs: 30000
          });
          if (response.status < 200 || response.status >= 400) throw new Error(`HTTP ${response.status}`);
          break;
        } catch (error) {
          retries++;
          if (retries > CONFIG.maxWidgetAttempts) throw error;
          if (navigator.onLine === false) {
            updateStatus('Mất mạng — chờ kết nối…', { tone: 'warn', spin: true });
            await waitForNetwork();
          }
          await sleep(Math.min(1000 * 2 ** (retries - 1), 16000), 'Thử lại');
        }
      }
      const challengeDetails = readChallengeData(response.responseText, initialDetails);
      const waitSeconds = step > 1 ? details.nextWaitSeconds : details.waitSeconds;
      if (waitSeconds > 0) {
        updateStatus(`Đang chờ bước ${step}/${totalSteps}`, { spin: true });
        await sleep(Math.min(waitSeconds * 1000, 300000), `Bước ${step}/${totalSteps}`);
      }
      const endpointQuery = new URLSearchParams({
        code: details.code, traffic_session: details.session, key: details.key
      });
      if (previousId) endpointQuery.set('id', previousId);
      for (const [key, value] of Object.entries(challengeDetails)) {
        if (key === 'id' || value == null) continue;
        endpointQuery.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
      const stepUrl = `https://${details.domain}/widget/${details.endpoint}?${endpointQuery}`;
      const stepResponse = await request(stepUrl, { headers: browserHeaders(), timeoutMs: 30000 });
      if (stepResponse.status < 200 || stepResponse.status >= 400) throw new Error(`HTTP ${stepResponse.status}`);
      let stepData;
      try {
        const parsed = JSON.parse(stepResponse.responseText.trim());
        stepData = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch { throw new Error('Widget trả dữ liệu không đúng định dạng JSON'); }
      if (!stepData || typeof stepData !== 'object') throw new Error('Dữ liệu bước rỗng');
      if (!stepData.id) return normalizeUrl(stepData.html || '') || null;

      previousId = stepData.id;
      previousDetails = challengeDetails;
      totalSteps = Math.max(totalSteps, details.totalSteps);
      if (step < totalSteps) {
        const refreshedPage = await fetchWidgetHtml(widgetState.widget);
        if (refreshedPage) currentPage = refreshedPage;
      }
    }
    return null;
  }

  function queryFormValue(name) {
    const element = document.querySelector(`input[name="${name}"],textarea[name="${name}"]`);
    return String(element?.value || '').trim();
  }

  function findRecaptchaToken() {
    for (const element of document.querySelectorAll('[name="g-recaptcha-response"],textarea#g-recaptcha-response')) {
      const token = String(element.value || '').trim();
      if (token) return token;
    }
    try {
      if (typeof window.grecaptcha?.getResponse === 'function') {
        for (const id of [undefined, 0, 1, 2, 3]) {
          try {
            const token = String(id == null ? window.grecaptcha.getResponse() : window.grecaptcha.getResponse(id) || '').trim();
            if (token) return token;
          } catch { /* unknown widget id */ }
        }
      }
    } catch { /* no recaptcha */ }
    return '';
  }

  async function waitForHumanRecaptcha() {
    state.ui.notice.classList.add('show');
    updateStatus('Hãy giải reCAPTCHA trên trang', { spin: true, tone: 'warn' });
    const deadline = Date.now() + CONFIG.recaptchaWaitMs;
    try {
      while (Date.now() < deadline) {
        const token = findRecaptchaToken();
        if (token) return token;
        await sleep(500);
      }
      throw new Error('Hết thời gian chờ reCAPTCHA');
    } finally { state.ui.notice.classList.remove('show'); }
  }

  function findResultServer() {
    const matches = document.documentElement.innerHTML.match(/https:\/\/[a-z\d-]+\.link4m\.app/gi);
    return matches?.[0] || 'https://s1.link4m.app';
  }

  async function submitFinalCode(password) {
    const alias = queryFormValue('alias');
    const campaignId = queryFormValue('campaign_id');
    const displayId = queryFormValue('display_id');
    const prefix = queryFormValue('prefix') || password;
    if (!alias || !campaignId || !displayId) {
      throw new Error('Không tìm thấy form lấy mã trên trang');
    }
    const hasRecaptcha = Boolean(document.querySelector(
      '[name="g-recaptcha-response"],.g-recaptcha,iframe[src*="recaptcha"]'
    ));
    const recaptchaToken = hasRecaptcha ? await waitForHumanRecaptcha() : '';
    updateStatus('Đang lấy URL cuối…', { spin: true });
    const server = findResultServer();
    const body = encodeForm({
      password, alias, campaign_id: campaignId, display_id: displayId,
      prefix, 'g-recaptcha-response': recaptchaToken
    });
    const response = await request(`${server}/links/get-link-info`, {
      method: 'POST', headers: { ...browserHeaders(location.href), 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', referer: location.href },
      body, timeoutMs: 30000
    });
    if (response.status < 200 || response.status >= 400) throw new Error(`HTTP ${response.status}`);
    let result;
    try { result = JSON.parse(response.responseText.trim()); }
    catch { throw new Error('Máy chủ trả dữ liệu không phải JSON'); }
    if (!result?.success || !result.url) throw new Error('Máy chủ không trả về URL hợp lệ');
    showResult(String(result.url));
    void request(`${server}/widget/click.html`, {
      method: 'POST', headers: formHeaders(location.href),
      body: encodeForm({ campaign_id: campaignId, display_id: displayId, code: prefix })
    }).catch(() => {});
    return result.url;
  }

  async function runBypass(rawInput) {
    if (state.busy) return;
    let url;
    try { url = validateTaskUrl(rawInput); }
    catch (error) { updateStatus(error.message, { tone: 'err' }); return; }
    state.busy = true;
    state.finalUrl = '';
    state.ui.result.classList.remove('show');
    state.ui.notice.classList.remove('show');
    updateButtons();
    try {
      state.currentUrl = url;
      updateStatus('Đang tải trang nhiệm vụ…', { spin: true });
      const mainResponse = await request(url, { headers: browserHeaders(url), timeoutMs: 30000 });
      if (mainResponse.status < 200 || mainResponse.status >= 400) throw new Error('Không truy cập được URL nhiệm vụ');
      state.currentUrl = mainResponse.finalUrl || url;
      const widgets = extractWidgetScripts(mainResponse.responseText);
      if (!widgets.length) throw new Error('Không tìm thấy widget trong trang nhiệm vụ');

      const validWidgets = (await Promise.all(widgets.map(fetchWidgetHtml))).filter(Boolean);
      if (!validWidgets.length) throw new Error('Không tìm thấy widget hợp lệ');
      updateStatus(`Đang xử lý ${validWidgets.length} widget…`, { spin: true });
      const results = await Promise.allSettled(validWidgets.map(processWidget));
      const success = results.find((item) => item.status === 'fulfilled' && item.value);
      if (!success) {
        const firstError = results.find((item) => item.status === 'rejected');
        throw firstError?.reason || new Error('Không lấy được mã từ widget');
      }
      await submitFinalCode(success.value);
    } catch (error) {
      console.error('[Link4m Clean]', error);
      updateStatus(`✗ ${error?.message || 'Có lỗi xảy ra'}`, { tone: 'err' });
    } finally {
      state.busy = false;
      updateButtons();
    }
  }

  function isRecognizedDomain(candidate) {
    const host = String(candidate || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/^\.+|\.+$/g, '');
    const labels = host.split('.');
    if (labels.length < 2 || labels.some((label) => !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label))) return false;
    const suffix = labels.slice(-2).join('.');
    return KNOWN_SUFFIXES.has(suffix) ? labels.length >= 3 : KNOWN_SUFFIXES.has(labels.at(-1));
  }

  function extractInstructionDomains(root) {
    if (!root) return { directDomains: [], masks: [] };
    const text = String(root.innerText || root.textContent || '').replace(/\s+/g, ' ');
    const stepThree = text.match(/Bước\s*3\s*[:.\-]?([\s\S]*?)(?:Bước\s*4|$)/i)?.[1] || text;
    const masks = [];
    const seenMasks = new Set();
    const maskRegex = /(?:https?:\/\/)?([a-z\d.*-]*\*+[a-z\d.*-]*\.[a-z]{2,}(?:\.[a-z]{2,})?)/gi;
    for (const match of stepThree.matchAll(maskRegex)) {
      const raw = match[1].toLowerCase().replace(/^www\./, '');
      if (seenMasks.has(raw)) continue;
      seenMasks.add(raw);
      const first = raw.indexOf('*');
      const last = raw.lastIndexOf('*');
      const expression = `^${raw.split(/\*+/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[a-z0-9.-]+')}$`;
      masks.push({ raw, prefix: raw.slice(0, first), suffix: raw.slice(last + 1), regex: new RegExp(expression, 'i') });
    }
    const directDomains = [];
    const seen = new Set();
    if (!masks.length) {
      const domainRegex = /(?:https?:\/\/)?((?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,}(?:\.[a-z]{2,})?)/gi;
      for (const match of stepThree.matchAll(domainRegex)) {
        const domain = match[1].toLowerCase().replace(/^www\./, '');
        if (!seen.has(domain) && isRecognizedDomain(domain) && !REJECTED_HOSTS.test(domain)) {
          seen.add(domain);
          directDomains.push(domain);
        }
      }
    }
    return { directDomains, masks };
  }

  function findImageCandidates(root) {
    const candidates = [];
    const seen = new Set();
    const add = (url, priority, element) => {
      if (!url || typeof url !== 'string') return;
      const path = url.trim().replace(/^\/\//, 'https:');
      if (!/^(https?:\/\/|data:image\/|blob:)/i.test(path)) return;
      if (/google|gstatic|recaptcha|logo|icon|avatar|favicon|banner|spinner|loading|\.svg(?:\?|$)/i.test(path)) return;
      if (seen.has(path)) return;
      seen.add(path);
      candidates.push({ url: path, priority, element });
    };
    for (const [index, image] of [...(root?.querySelectorAll('img') || [])].entries()) {
      const src = image.currentSrc || image.src || image.getAttribute('data-src') || image.getAttribute('data-original') || '';
      const isInstruction = /\/uploads\/advertiser\/|img\.link4m\./i.test(src);
      const firstStep = /\/1_[^/]+\.[a-z]+(?:\?|$)/i.test(src);
      add(src, firstStep ? 1 : isInstruction ? index + 5 : index + 20, image);
    }
    for (const [index, canvas] of [...(root?.querySelectorAll('canvas') || [])].entries()) {
      try { if (canvas.width > 80 && canvas.height > 25) add(canvas.toDataURL('image/png'), index + 3, null); }
      catch { /* cross-origin canvas */ }
    }
    for (const [index, element] of [...(root?.querySelectorAll('*') || [])].entries()) {
      if (index > 500) break;
      try {
        const src = getComputedStyle(element).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/i)?.[1];
        if (src) add(src, index + 15, null);
      } catch { /* CSS not available */ }
    }
    return candidates.sort((a, b) => a.priority - b.priority);
  }

  async function imageAsDataUrl(candidate) {
    if (candidate.url.startsWith('data:image/')) return candidate.url;
    try {
      const response = await request(candidate.url, {
        responseType: 'arraybuffer', timeoutMs: 15000,
        headers: { accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8', referer: location.href }
      });
      if (response.response?.byteLength > 100) {
        const bytes = new Uint8Array(response.response);
        const chunks = [];
        for (let offset = 0; offset < bytes.length; offset += 8192) {
          chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
        }
        const mime = /\.png(?:\?|$)/i.test(candidate.url) ? 'image/png'
          : /\.webp(?:\?|$)/i.test(candidate.url) ? 'image/webp' : 'image/jpeg';
        return `data:${mime};base64,${btoa(chunks.join(''))}`;
      }
    } catch { /* Try the DOM image below */ }
    const image = candidate.element;
    if (image?.complete && image.naturalWidth) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/png');
      } catch { /* cross-origin canvas */ }
    }
    return null;
  }

  async function enhanceImage(dataUrl) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onerror = () => resolve([dataUrl]);
      image.onload = () => {
        try {
          const width = image.naturalWidth || 600;
          const height = image.naturalHeight || 150;
          const scale = width < 900 ? 2 : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const context = canvas.getContext('2d');
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.filter = 'contrast(1.25) brightness(1.02)';
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve([canvas.toDataURL('image/jpeg', 0.92), dataUrl]);
        } catch { resolve([dataUrl]); }
      };
      image.src = dataUrl;
    });
  }

  function levenshteinDistance(left, right) {
    left = String(left || '').toLowerCase();
    right = String(right || '').toLowerCase();
    let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
    for (let i = 1; i <= left.length; i++) {
      const current = [i];
      for (let j = 1; j <= right.length; j++) {
        current[j] = left[i - 1] === right[j - 1]
          ? previous[j - 1]
          : 1 + Math.min(previous[j], current[j - 1], previous[j - 1]);
      }
      previous = current;
    }
    return previous[right.length];
  }

  function findDomainInOcrText(text, hints) {
    const normalized = String(text).replace(/https?\s*:\s*\/\s*\//gi, 'https://')
      .replace(/([a-z\d])\s*[,，]\s*(com\.vn|net\.vn|org\.vn|vn|com|net|org|io|xyz|app|dev|me|gg|co)\b/gi, '$1.$2');
    const candidates = new Map();
    const add = (domain, score = 10) => {
      domain = String(domain).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
        .replace(/[\/›><"'(),;:\s].*$/, '').replace(/^\.+|\.+$/g, '');
      if (!isRecognizedDomain(domain) || REJECTED_HOSTS.test(domain)) return;
      const bonus = hints.masks.reduce((value, mask) => {
        if (mask.regex.test(domain)) return Math.max(value, 1000);
        if (mask.suffix && domain.endsWith(mask.suffix)) return Math.max(value, 60);
        return value;
      }, 0);
      candidates.set(domain, (candidates.get(domain) || 0) + score + bonus);
    };
    for (const match of normalized.matchAll(/https?:\/\/([a-z\d.-]+\.[a-z]{2,})/gi)) add(match[1], 50);
    for (const match of normalized.matchAll(/\b((?:[a-z\d-]+\.)+[a-z]{2,}(?:\.[a-z]{2,})?)\b/gi)) add(match[1], 25);
    for (const mask of hints.masks) {
      for (const domain of [...candidates.keys()]) {
        if (mask.prefix.length < 3 || !domain.endsWith(mask.suffix)) continue;
        if (levenshteinDistance(domain.slice(0, mask.prefix.length), mask.prefix) <= 2) {
          add(mask.prefix + domain.slice(mask.prefix.length), 400);
        }
      }
    }
    return [...candidates].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  async function callOcrSpace(imageDataUrl, engine = 2) {
    const form = new URLSearchParams({
      base64Image: imageDataUrl, language: 'eng', isOverlayRequired: 'false',
      scale: 'true', OCREngine: String(engine), detectOrientation: 'false'
    });
    for (const apiKey of CONFIG.ocrSpaceApiKeys) {
      try {
        const response = await request(CONFIG.ocrSpaceEndpoint, {
          method: 'POST', body: form.toString(), timeoutMs: 18000,
          headers: { apikey: apiKey, 'content-type': 'application/x-www-form-urlencoded' }
        });
        if (response.status < 200 || response.status >= 400) continue;
        const parsed = JSON.parse(response.responseText);
        const result = Array.isArray(parsed.ParsedResults)
          ? parsed.ParsedResults.map((item) => item.ParsedText || '').join('\n').trim() : '';
        if (result) return result;
      } catch (error) { console.warn('[Link4m Clean] OCR.space', error); }
    }
    return '';
  }

  async function loadTesseract() {
    if (window.Tesseract?.recognize) return window.Tesseract;
    if (!state.cachedTesseractLoader) {
      state.cachedTesseractLoader = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = CONFIG.tesseractCdn;
        script.onload = () => resolve(window.Tesseract || null);
        script.onerror = () => resolve(null);
        (document.head || document.documentElement).append(script);
      });
    }
    return state.cachedTesseractLoader;
  }

  async function runLocalOcr(imageDataUrl) {
    try {
      const tesseract = await loadTesseract();
      if (!tesseract?.recognize) return '';
      const result = await tesseract.recognize(imageDataUrl, 'eng');
      return String(result?.data?.text || '').trim();
    } catch { return ''; }
  }

  async function recognizeInstructionDomain(candidate, hints) {
    const image = await imageAsDataUrl(candidate);
    if (!image) return null;
    const versions = await enhanceImage(image);
    const findings = [];
    for (const dataUrl of versions.slice(0, 2)) {
      const text = await callOcrSpace(dataUrl, 2);
      if (text) {
        findings.push(text);
        const domain = findDomainInOcrText(findings.join('\n'), hints);
        if (domain) return domain;
      }
    }
    const alternative = await callOcrSpace(versions[0], 1);
    if (alternative) findings.push(alternative);
    const fromOnline = findDomainInOcrText(findings.join('\n'), hints);
    if (fromOnline) return fromOnline;
    updateStatus('Đang thử OCR dự phòng (Tesseract)…', { spin: true });
    return findDomainInOcrText([...findings, await runLocalOcr(versions[0])].join('\n'), hints);
  }

  async function autoDetectTask() {
    if (state.busy || state.autoDetecting) return;
    state.autoDetecting = true;
    updateButtons();
    try {
      const instructions = document.getElementById('advertise-html-wrapper');
      const hints = extractInstructionDomains(instructions);
      let domain = hints.directDomains[0] || null;
      if (!domain) {
        updateStatus('Đang tìm ảnh hướng dẫn…', { spin: true });
        const deadline = Date.now() + CONFIG.imageWaitMs;
        let candidates = [];
        while (Date.now() < deadline) {
          candidates = findImageCandidates(instructions);
          if (candidates.length) break;
          await sleep(300);
        }
        for (const [index, candidate] of candidates.slice(0, CONFIG.maxImageCandidates).entries()) {
          updateStatus(`Đang OCR ảnh (${index + 1}/${Math.min(candidates.length, CONFIG.maxImageCandidates)})…`, { spin: true });
          domain = await recognizeInstructionDomain(candidate, hints);
          if (domain) break;
        }
      }
      if (!domain) {
        updateStatus('Không nhận diện được domain — hãy nhập URL thủ công', { tone: 'warn' });
        return;
      }
      const taskUrl = `https://${domain}`;
      state.ui.input.value = taskUrl;
      updateStatus(`✓ Đã nhận diện: ${domain}`, { tone: 'ok' });
      state.autoDetecting = false;
      updateButtons();
      await runBypass(taskUrl);
    } catch (error) {
      updateStatus(`Không thể OCR: ${error.message}`, { tone: 'warn' });
    } finally {
      state.autoDetecting = false;
      updateButtons();
    }
  }

  function isCaptchaOnlyPage() {
    return [...document.querySelectorAll('h4')].some((item) =>
      /check captcha để tiếp tục tới trang đích|check the captcha to continue to the landing page/i
        .test(String(item.textContent || '').replace(/\s+/g, ' ')));
  }

  async function waitForInstructions() {
    const deadline = Date.now() + CONFIG.pageWaitMs;
    updateStatus('Đang chờ nội dung hướng dẫn…', { spin: true });
    while (Date.now() < deadline) {
      if (isCaptchaOnlyPage()) {
        updateStatus('Hãy hoàn thành CAPTCHA trên trang để tiếp tục', { tone: 'warn' });
        return false;
      }
      const root = document.getElementById('advertise-html-wrapper');
      if (root && root.innerHTML.trim()) {
        state.isGoogleInstruction = [...root.querySelectorAll('a[href]')].some((link) => /google\.com/i.test(link.href));
        return true;
      }
      await sleep(300);
    }
    updateStatus('Không có hướng dẫn — có thể nhập URL thủ công', { tone: 'warn' });
    return false;
  }

  async function bootstrap() {
    if (!document.body || /^\/go\/not-found/.test(location.pathname)) return;
    createInterface();
    try {
      if (document.readyState !== 'complete') {
        await Promise.race([
          new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
          sleep(5000)
        ]);
      }
      if (await waitForInstructions()) await autoDetectTask();
    } catch (error) {
      console.error('[Link4m Clean] Bootstrap', error);
      updateStatus('Không tự nhận diện được — có thể nhập URL thủ công', { tone: 'warn' });
    }
  }

  if (document.body) void bootstrap();
  else document.addEventListener('DOMContentLoaded', () => void bootstrap(), { once: true });
})();
