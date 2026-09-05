/* ZCODE RTL RENDERER PAYLOAD */
(() => {
    if (window.__ZCODE_RTL_LOADED__) return;
    window.__ZCODE_RTL_LOADED__ = true;

    const FONT_BASE64 = '__FONT_BASE64_PLACEHOLDER__';

    // Load config from localStorage for renderer persistence
    let rtlConfig = {
        faFont: '',
        enFont: '',
        codeFont: '',
        lh: '1.75',
        fs: '14',
        isRTL: true,
        forceRTL: false,
        fixAtSign: true
    };

    try {
        const saved = localStorage.getItem('zcode-rtl-config');
        if (saved) {
            rtlConfig = { ...rtlConfig, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('[ZCode RTL] Failed to read localStorage config:', e);
    }

    function initRTL() {
        if (document.getElementById('zcode-rtl-root')) return;

        let isRTL = rtlConfig.isRTL;
        let forceRTL = rtlConfig.forceRTL || false;
        let fixAtSign = rtlConfig.fixAtSign !== false;

        // 1. Inject UI widget style
        const widgetStyle = document.createElement('style');
        widgetStyle.id = 'zcode-rtl-widget-style';
        widgetStyle.textContent = `
            .zcode-rtl-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 38px;
                height: 38px;
                z-index: 2147483640;
                overflow: visible !important;
                direction: ltr !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            .zcode-rtl-widget-trigger {
                position: relative;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background-color: #0284c7;
                color: #ffffff;
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                cursor: pointer;
                opacity: 0.88;
                transition: all 0.25s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .zcode-rtl-widget-trigger:hover {
                opacity: 1;
                transform: scale(1.08);
            }
            .zcode-rtl-widget-panel {
                transform: scale(0);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
                transform-origin: bottom right;
                position: absolute;
                bottom: 0;
                right: 0;
                width: 275px;
                border-radius: 14px;
                padding: 14px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                background-color: #ffffff;
                color: #0f172a;
                border: 1px solid #e2e8f0;
                font-size: 12px;
                box-sizing: border-box;
            }
            .dark .zcode-rtl-widget-panel,
            body.dark .zcode-rtl-widget-panel {
                background-color: #18181b;
                color: #f4f4f5;
                border-color: #27272a;
                box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            }
            .zcode-rtl-widget-container:hover .zcode-rtl-widget-trigger {
                opacity: 0 !important;
                transform: scale(0.6) !important;
                pointer-events: none !important;
            }
            .zcode-rtl-widget-container:hover .zcode-rtl-widget-panel {
                transform: scale(1) !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            .zcode-rtl-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
                gap: 8px;
            }
            .zcode-rtl-label {
                font-weight: 500;
                font-size: 11px;
                opacity: 0.85;
                white-space: nowrap;
            }
            .zcode-rtl-input {
                width: 125px;
                padding: 4px 8px;
                border-radius: 6px;
                border: 1px solid #cbd5e1;
                background-color: #f8fafc;
                color: inherit;
                font-size: 11px;
                outline: none;
                box-sizing: border-box;
                transition: border-color 0.15s;
            }
            .dark .zcode-rtl-input,
            body.dark .zcode-rtl-input {
                background-color: #27272a;
                border-color: #3f3f46;
            }
            .zcode-rtl-input:focus {
                border-color: #0284c7;
            }
            .zcode-rtl-toggle-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                width: 38px;
                height: 20px;
                border-radius: 9999px;
                border: none;
                cursor: pointer;
                padding: 0;
                transition: background-color 0.2s ease;
                flex-shrink: 0;
            }
            .zcode-rtl-toggle-knob {
                display: inline-block;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background-color: #ffffff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
            }
            .zcode-rtl-separator {
                height: 1px;
                background-color: #e2e8f0;
                margin: 8px 0;
                width: 100%;
            }
            .dark .zcode-rtl-separator,
            body.dark .zcode-rtl-separator {
                background-color: #27272a;
            }
            .zcode-rtl-github {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 11px;
                color: inherit;
                opacity: 0.7;
                padding-top: 4px;
                transition: opacity 0.15s;
            }
            .zcode-rtl-github:hover {
                opacity: 1;
                color: #0284c7;
            }
        `;
        document.head.appendChild(widgetStyle);

        // 2. Dynamic Font, Size and Line-Height Styles
        const rtlStyle = document.createElement('style');
        rtlStyle.id = 'zcode-rtl-dynamic-style';

        const updateDynamicCSS = (faFont, enFont, codeFont, lh, fs) => {
            let faFontRule = '';
            let faFontName = "'VazirmatnVariable'";

            if (faFont) {
                faFontName = `'UserPersianFont', 'VazirmatnVariable'`;
                let baseFaFont = faFont.replace(/[-\s]?Regular$/i, '');
                faFontRule = `
                    @font-face {
                        font-family: 'UserPersianFont';
                        src: local('${faFont}'), local('${baseFaFont}');
                        font-weight: 400;
                        unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                    }
                    @font-face {
                        font-family: 'UserPersianFont';
                        src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'), local('${baseFaFont}Bold');
                        font-weight: 700;
                        unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                    }
                `;
            }

            let enFontStr = enFont ? `'${enFont}', ui-sans-serif, system-ui, sans-serif` : 'ui-sans-serif, system-ui, sans-serif';
            let codeFontStr = codeFont ? `'${codeFont}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

            const fontSizeVal = fs || '14';
            const lineHeightVal = lh || '1.75';

            let forceRtlRule = forceRTL ? `
                .prose > *:not(pre):not(code),
                .markdown-body > *:not(pre):not(code),
                [class*="prose"] p,
                [class*="prose"] li,
                [class*="prose"] h1,
                [class*="prose"] h2,
                [class*="prose"] h3,
                [class*="prose"] h4,
                [class*="message"] p,
                [class*="message"] li {
                    direction: rtl !important;
                    text-align: right !important;
                    unicode-bidi: isolate !important;
                }
            ` : '';

            rtlStyle.textContent = `
                ${faFontRule}
                @font-face {
                    font-family: 'VazirmatnVariable';
                    src: url('data:font/woff2;base64,${FONT_BASE64}') format('woff2');
                    font-weight: 100 900;
                    unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
                }
                
                /* Global Root CSS Variable Overrides */
                :root, :host, html, body {
                    --ui-font-size: ${fontSizeVal}px !important;
                    --text-ui-base: ${fontSizeVal}px !important;
                    --text-ui-sm: calc(${fontSizeVal}px - 2px) !important;
                    --text-ui-lg: calc(${fontSizeVal}px + 2px) !important;
                    --text-ui-caption: calc(${fontSizeVal}px - 1px) !important;
                    --tw-leading: ${lineHeightVal} !important;
                    font-family: ${faFontName}, ${enFontStr}, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
                }
                
                /* Target all message text, markdown, prose, and paragraphs directly */
                .prose,
                .prose p,
                .prose li,
                .prose span,
                .prose div,
                .markdown-body,
                .markdown-body p,
                .markdown-body li,
                [class*="prose"] p,
                [class*="prose"] li,
                [contenteditable="true"],
                [contenteditable="true"] p,
                [contenteditable="true"] span {
                    font-size: ${fontSizeVal}px !important;
                    line-height: ${lineHeightVal} !important;
                }
                
                p, h1, h2, h3, h4, h5, h6, ul, ol {
                    unicode-bidi: plaintext;
                    text-align: start;
                }
                
                .prose > *, .markdown-body > * {
                    unicode-bidi: plaintext;
                    text-align: start;
                }
                
                ${forceRtlRule}
                
                /* RTL List indentations */
                ul[dir="rtl"], ol[dir="rtl"], [dir="rtl"] ul, [dir="rtl"] ol {
                    padding-left: 0 !important;
                    padding-right: 1.5rem !important;
                }
                
                /* Keep code blocks LTR with user selected code font */
                pre, code, pre *, code * {
                    unicode-bidi: isolate !important;
                    direction: ltr !important;
                    text-align: left !important;
                    font-family: ${codeFontStr} !important;
                    line-height: 1.5 !important;
                }
                
                [contenteditable="true"], [contenteditable="true"] * {
                    unicode-bidi: isolate !important;
                    text-align: start !important;
                }
                
                .truncate, [role="treeitem"] {
                    unicode-bidi: plaintext !important;
                    text-align: start !important;
                }
            `;
        };

        if (isRTL) {
            document.head.appendChild(rtlStyle);
            updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.codeFont, rtlConfig.lh, rtlConfig.fs);
        }

        // 3. Smart Direction Auto-detection
        // Detects RTL even if the sentence starts with English words (e.g., "Docker یک ابزار عالی است")
        function getSmartDirection(text) {
            const clean = text.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
            if (!clean) return 'auto';

            if (forceRTL) return 'rtl';

            // Count Persian/Arabic characters vs English Latin characters
            const rtlMatches = clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/g) || [];
            const ltrMatches = clean.match(/[A-Za-z]/g) || [];

            if (rtlMatches.length > 0) {
                // If there are at least 3 RTL letters, or RTL is at least 25% of all letters, treat as RTL
                const totalLetters = rtlMatches.length + ltrMatches.length;
                if (rtlMatches.length >= 3 || (totalLetters > 0 && rtlMatches.length / totalLetters >= 0.25)) {
                    return 'rtl';
                }
            }

            return 'ltr';
        }

        function updateDir() {
            if (!isRTL) return;

            // Inputs / Textareas
            document.querySelectorAll('[contenteditable="true"], [contenteditable="true"] p, textarea, input[type="text"]').forEach(el => {
                const text = (el.value || el.textContent || '').trim();
                if (text.length > 0) {
                    const newDir = getSmartDirection(text);
                    if (el.getAttribute('dir') !== newDir) el.setAttribute('dir', newDir);
                } else {
                    if (el.hasAttribute('dir')) el.removeAttribute('dir');
                }
            });

            // Chat outputs, markdown, list items, headers
            document.querySelectorAll(`
                .prose > *,
                .markdown-body > *,
                [class*="prose"] p,
                [class*="prose"] li,
                [class*="prose"] h1,
                [class*="prose"] h2,
                [class*="prose"] h3,
                [class*="prose"] h4,
                [class*="message"] p,
                [class*="message"] li
            `).forEach(el => {
                if (el.tagName === 'PRE' || el.tagName === 'CODE' || el.closest('pre') || el.closest('code')) return;

                const text = (el.textContent || '').trim();
                if (text.length > 0) {
                    const dir = getSmartDirection(text);
                    if (el.getAttribute('dir') !== dir) {
                        el.setAttribute('dir', dir);
                    }
                }
            });
        }

        document.body.addEventListener('input', updateDir, { capture: true });
        document.body.addEventListener('focusin', updateDir, { capture: true });
        const observer = new MutationObserver(updateDir);
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(updateDir, 600);

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyR') {
                e.preventDefault();
                setRTLActive(!isRTL);
            }
            if (fixAtSign && e.code === 'Digit2' && e.shiftKey) {
                if (e.key === '٬' || e.key === '،') {
                    e.preventDefault();
                    document.execCommand('insertText', false, '@');
                }
            }
        }, { capture: true });

        // 4. Floating Settings Widget DOM
        const widgetWrapper = document.createElement('div');
        widgetWrapper.id = 'zcode-rtl-root';
        widgetWrapper.innerHTML = `
            <div class="zcode-rtl-widget-container">
                <div class="zcode-rtl-widget-trigger" title="ZCode RTL Settings (Alt+R)">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </div>
                <div class="zcode-rtl-widget-panel">
                    <div style="text-align: center; font-weight: 700; font-size: 13px; margin-bottom: 10px; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 6px;">
                        ZCode Smart RTL
                    </div>
                    <div class="zcode-rtl-row">
                        <span class="zcode-rtl-label" id="zcode-toggle-label">${isRTL ? 'Enabled' : 'Disabled'} (Alt+R)</span>
                        <button id="zcode-toggle-btn" class="zcode-rtl-toggle-btn" style="background-color: ${isRTL ? '#0284c7' : '#94a3b8'};">
                            <span id="zcode-toggle-knob" class="zcode-rtl-toggle-knob" style="transform: translateX(${isRTL ? '20px' : '3px'});"></span>
                        </button>
                    </div>
                    <div id="zcode-settings-body" style="transition: opacity 0.2s; ${isRTL ? '' : 'opacity: 0.4; pointer-events: none;'}">
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">Force RTL Everything</span>
                            <button id="zcode-force-btn" class="zcode-rtl-toggle-btn" style="background-color: ${forceRTL ? '#0284c7' : '#94a3b8'};">
                                <span id="zcode-force-knob" class="zcode-rtl-toggle-knob" style="transform: translateX(${forceRTL ? '20px' : '3px'});"></span>
                            </button>
                        </div>
                        <div class="zcode-rtl-separator"></div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">FA / AR Font</span>
                            <input id="zcode-fa-input" class="zcode-rtl-input" placeholder="Default: Vazirmatn" value="${rtlConfig.faFont}">
                        </div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">EN Font</span>
                            <input id="zcode-en-input" class="zcode-rtl-input" placeholder="Default: System" value="${rtlConfig.enFont}">
                        </div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">Code Font</span>
                            <input id="zcode-code-input" class="zcode-rtl-input" placeholder="Default: Monospace" value="${rtlConfig.codeFont}">
                        </div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">Line Height (<span id="zcode-lh-val">${rtlConfig.lh}</span>)</span>
                            <input id="zcode-lh-input" type="range" min="1.3" max="2.4" step="0.05" value="${rtlConfig.lh}" style="width: 90px; accent-color: #0284c7; cursor: pointer;">
                        </div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">Font Size (<span id="zcode-fs-val">${rtlConfig.fs}px</span>)</span>
                            <input id="zcode-fs-input" type="range" min="12" max="22" step="1" value="${rtlConfig.fs}" style="width: 90px; accent-color: #0284c7; cursor: pointer;">
                        </div>
                        <div class="zcode-rtl-separator"></div>
                        <div class="zcode-rtl-row">
                            <span class="zcode-rtl-label">Fix @ on Shift+2</span>
                            <button id="zcode-at-btn" class="zcode-rtl-toggle-btn" style="background-color: ${fixAtSign ? '#0284c7' : '#94a3b8'};">
                                <span id="zcode-at-knob" class="zcode-rtl-toggle-knob" style="transform: translateX(${fixAtSign ? '20px' : '3px'});"></span>
                            </button>
                        </div>
                    </div>
                    <div class="zcode-rtl-separator"></div>
                    <a href="https://github.com/AriaRazavi2005/zcode-rtl" target="_blank" class="zcode-rtl-github">
                        <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        <span>ZCode RTL Patcher</span>
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(widgetWrapper);

        const toggleBtn = document.getElementById('zcode-toggle-btn');
        const toggleKnob = document.getElementById('zcode-toggle-knob');
        const toggleLabel = document.getElementById('zcode-toggle-label');
        const settingsBody = document.getElementById('zcode-settings-body');
        const forceBtn = document.getElementById('zcode-force-btn');
        const forceKnob = document.getElementById('zcode-force-knob');
        const atBtn = document.getElementById('zcode-at-btn');
        const atKnob = document.getElementById('zcode-at-knob');
        const faInput = document.getElementById('zcode-fa-input');
        const enInput = document.getElementById('zcode-en-input');
        const codeInput = document.getElementById('zcode-code-input');
        const lhInput = document.getElementById('zcode-lh-input');
        const fsInput = document.getElementById('zcode-fs-input');
        const lhVal = document.getElementById('zcode-lh-val');
        const fsVal = document.getElementById('zcode-fs-val');

        const persistConfig = () => {
            const data = {
                faFont: faInput.value.trim(),
                enFont: enInput.value.trim(),
                codeFont: codeInput.value.trim(),
                lh: lhInput.value,
                fs: fsInput.value,
                isRTL,
                forceRTL,
                fixAtSign
            };
            try {
                localStorage.setItem('zcode-rtl-config', JSON.stringify(data));
            } catch (e) {
                console.warn('[ZCode RTL] Save failed:', e);
            }
        };

        function setRTLActive(active) {
            isRTL = active;
            persistConfig();
            if (isRTL) {
                toggleLabel.textContent = 'Enabled (Alt+R)';
                toggleBtn.style.backgroundColor = '#0284c7';
                toggleKnob.style.transform = 'translateX(20px)';
                settingsBody.style.opacity = '1';
                settingsBody.style.pointerEvents = 'auto';
                if (!rtlStyle.parentNode) document.head.appendChild(rtlStyle);
                updateDynamicCSS(faInput.value.trim(), enInput.value.trim(), codeInput.value.trim(), lhInput.value, fsInput.value);
                updateDir();
            } else {
                toggleLabel.textContent = 'Disabled (Alt+R)';
                toggleBtn.style.backgroundColor = '#94a3b8';
                toggleKnob.style.transform = 'translateX(3px)';
                settingsBody.style.opacity = '0.4';
                settingsBody.style.pointerEvents = 'none';
                if (rtlStyle.parentNode) rtlStyle.parentNode.removeChild(rtlStyle);
                document.querySelectorAll('[dir]').forEach(el => el.removeAttribute('dir'));
            }
        }

        toggleBtn.addEventListener('click', () => setRTLActive(!isRTL));

        forceBtn.addEventListener('click', () => {
            forceRTL = !forceRTL;
            persistConfig();
            forceBtn.style.backgroundColor = forceRTL ? '#0284c7' : '#94a3b8';
            forceKnob.style.transform = `translateX(${forceRTL ? '20px' : '3px'})`;
            updateDynamicCSS(faInput.value.trim(), enInput.value.trim(), codeInput.value.trim(), lhInput.value, fsInput.value);
            updateDir();
        });

        atBtn.addEventListener('click', () => {
            fixAtSign = !fixAtSign;
            persistConfig();
            atBtn.style.backgroundColor = fixAtSign ? '#0284c7' : '#94a3b8';
            atKnob.style.transform = `translateX(${fixAtSign ? '20px' : '3px'})`;
        });

        const onFontChange = () => {
            persistConfig();
            lhVal.textContent = lhInput.value;
            fsVal.textContent = fsInput.value + 'px';
            updateDynamicCSS(faInput.value.trim(), enInput.value.trim(), codeInput.value.trim(), lhInput.value, fsInput.value);
            updateDir();
        };

        faInput.addEventListener('input', onFontChange);
        enInput.addEventListener('input', onFontChange);
        codeInput.addEventListener('input', onFontChange);
        lhInput.addEventListener('input', onFontChange);
        fsInput.addEventListener('input', onFontChange);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRTL, { once: true });
    } else {
        initRTL();
    }
})();
