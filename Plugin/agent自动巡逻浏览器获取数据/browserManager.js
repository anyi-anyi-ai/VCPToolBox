// Plugin/ChromeBridge/browserManager.js
// Puppeteer 浏览器生命周期管理器
// 负责：启动/关闭浏览器、加载 Chrome Profile、加载 VCPBridge 扩展、页面管理

const path = require('path');
const fs = require('fs');
const os = require('os');

// 插件根目录（用于解析相对路径）
const PLUGIN_ROOT = __dirname;
// 项目根目录（server.js 所在目录）
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

let puppeteer;
let StealthPlugin;

// 延迟加载 puppeteer（避免未安装时阻塞整个插件）
function loadPuppeteer() {
    if (!puppeteer) {
        try {
            puppeteer = require('puppeteer-extra');
            StealthPlugin = require('puppeteer-extra-plugin-stealth');
            puppeteer.use(StealthPlugin());
        } catch (e) {
            throw new Error(
                '[BrowserManager] puppeteer-extra 或 stealth 插件未安装。' +
                '请运行: npm install puppeteer-extra puppeteer-extra-plugin-stealth'
            );
        }
    }
    return puppeteer;
}

// ========== 浏览器实例管理 ==========

/** @type {import('puppeteer').Browser|null} */
let browserInstance = null;

/** @type {Map<string, import('puppeteer').Page>} */
const managedPages = new Map();

/** @type {string|null} 当前活动页面的 ID */
let activePageId = null;

/** @type {boolean} */
let debugMode = false;

function setDebugMode(mode) {
    debugMode = mode;
}

function log(...args) {
    if (debugMode) {
        console.log('[BrowserManager]', ...args);
    }
}

/**
 * 自动检测 Chrome 可执行文件路径
 * @returns {string|null}
 */
function detectChromePath() {
    const isWin = os.platform() === 'win32';
    const isMac = os.platform() === 'darwin';

    if (isWin) {
        const possiblePaths = [
            path.join(process.env['LOCALAPPDATA'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(process.env['PROGRAMFILES'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            // Edge 也可以
            path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(process.env['PROGRAMFILES'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        ];
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                log(`检测到浏览器: ${p}`);
                return p;
            }
        }
    } else if (isMac) {
        const macPaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
        ];
        for (const p of macPaths) {
            if (fs.existsSync(p)) return p;
        }
    } else {
        // Linux
        const linuxPaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ];
        for (const p of linuxPaths) {
            if (fs.existsSync(p)) return p;
        }
    }

    return null;
}

/**
 * 获取默认的 Chrome Profile 路径
 * @returns {string|null}
 */
function getDefaultProfilePath() {
    const isWin = os.platform() === 'win32';
    const isMac = os.platform() === 'darwin';

    if (isWin) {
        return path.join(process.env['LOCALAPPDATA'] || '', 'Google', 'Chrome', 'User Data');
    } else if (isMac) {
        return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
    } else {
        return path.join(os.homedir(), '.config', 'google-chrome');
    }
}

/**
 * 解析 profilePath —— 支持相对路径（相对于项目根目录）和绝对路径
 * @param {string} rawPath 原始路径
 * @returns {string} 绝对路径
 */
function resolveProfilePath(rawPath) {
    if (!rawPath) return rawPath;
    if (path.isAbsolute(rawPath)) return rawPath;
    // 相对路径：相对于项目根目录（server.js 所在目录）
    return path.resolve(PROJECT_ROOT, rawPath);
}

/**
 * 反自动化检测注入脚本（共享，避免重复定义）
 * stealth 插件已覆盖大部分项目，此处仅做 webdriver 和 chrome 对象的兜底
 */
function getAntiDetectionScript() {
    return () => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
        // 注意：不再覆盖 navigator.plugins / navigator.languages
        // 因为 puppeteer-extra-plugin-stealth 已经提供了更精准的伪装
        // 额外覆盖反而可能破坏 stealth 的伪装效果

        // 兜底 Chrome 对象（某些环境下 stealth 可能未覆盖）
        if (!window.chrome) {
            window.chrome = {
                runtime: {},
                loadTimes: function () { },
                csi: function () { },
                app: {}
            };
        }
    };
}

/**
 * 为页面注册 close 事件，自动清理 managedPages
 * @param {string} pageId
 * @param {import('puppeteer').Page} page
 */
function registerPageCloseHandler(pageId, page) {
    page.on('close', () => {
        managedPages.delete(pageId);
        if (activePageId === pageId) {
            const remaining = Array.from(managedPages.keys());
            activePageId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
        }
    });
}

/**
 * 启动浏览器实例
 * @param {object} config 配置
 * @param {string} [config.chromePath] Chrome 可执行文件路径
 * @param {string} [config.profilePath] Chrome Profile 路径（User Data 目录）
 * @param {string} [config.profileName] Profile 名称（如 "Default", "Profile 1"）
 * @param {boolean} [config.headless] 是否无头模式
 * @param {boolean} [config.loadExtension] 是否加载 VCPBridge 扩展
 * @param {string} [config.extensionPath] 扩展路径
 * @param {string} [config.proxyServer] 代理服务器
 * @param {{width:number,height:number}} [config.viewport] 视口大小
 * @returns {Promise<{success: boolean, message: string, browser_id: string}>}
 */
async function launchBrowser(config = {}) {
    // 如果已有浏览器实例，先检查是否还活着
    if (browserInstance) {
        try {
            // 检查浏览器是否还在运行
            const pages = await browserInstance.pages();
            if (pages.length >= 0) {
                return {
                    success: true,
                    message: `浏览器已在运行中，当前有 ${pages.length} 个标签页。使用 close_browser 关闭后再重新启动。`,
                    browser_id: 'puppeteer-main',
                    pages: pages.length
                };
            }
        } catch (e) {
            // 浏览器已死，清理引用
            browserInstance = null;
            managedPages.clear();
            activePageId = null;
        }
    }

    const pptr = loadPuppeteer();

    // 构建启动参数
    const args = [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process'
        // 注释掉容易引起黄条警告的参数
        // '--disable-web-security',
        // '--allow-running-insecure-content'
    ];

    // Chrome Profile 支持（resolveProfilePath 处理相对路径 -> 绝对路径）
    const rawProfilePath = config.profilePath || getDefaultProfilePath();
    const profilePath = resolveProfilePath(rawProfilePath);
    const profileName = config.profileName || 'Default';

    if (profilePath) {
        // 如果路径不存在，主动创建（首次启动专用 profile 目录场景）
        if (!fs.existsSync(profilePath)) {
            try {
                fs.mkdirSync(profilePath, { recursive: true });
                console.log(`[BrowserManager] 📁 已创建 Chrome Profile 目录: ${profilePath}`);
            } catch (mkdirErr) {
                console.warn(`[BrowserManager] ⚠️ 无法创建 Profile 目录: ${mkdirErr.message}，将使用临时 Profile`);
            }
        }
        if (fs.existsSync(profilePath)) {
            args.push(`--user-data-dir=${profilePath}`);
            args.push(`--profile-directory=${profileName}`);
            console.log(`[BrowserManager] 📂 使用 Chrome Profile: ${profilePath} (${profileName})`);
        }
    }

    // 加载 VCPBridge 扩展
    if (config.loadExtension !== false) {
        const extPath = config.extensionPath || path.join(__dirname, 'VCPBridge-Extension');
        if (fs.existsSync(extPath)) {
            args.push(`--load-extension=${extPath}`);
            args.push(`--disable-extensions-except=${extPath}`);
            console.log(`[BrowserManager] 🧩 加载 VCPBridge 扩展: ${extPath}`);
        } else {
            console.log(`[BrowserManager] ⚠️ VCPBridge 扩展路径不存在: ${extPath}`);
        }
    }

    // 代理
    if (config.proxyServer) {
        args.push(`--proxy-server=${config.proxyServer}`);
    }

    // 视口大小
    const viewport = config.viewport || { width: 1440, height: 900 };

    // 启动选项
    const launchOptions = {
        headless: config.headless === true ? 'new' : false,
        args,
        defaultViewport: viewport,
        ignoreDefaultArgs: ['--enable-automation', '--disable-extensions'],
        // 如果用户指定了 Chrome 路径就用，否则自动检测
        ...(config.chromePath ? { executablePath: config.chromePath } : {}),
    };

    // 如果没有指定 Chrome 路径，尝试自动检测
    if (!config.chromePath) {
        const detected = detectChromePath();
        if (detected) {
            launchOptions.executablePath = detected;
            console.log(`[BrowserManager] 🌐 使用检测到的浏览器: ${detected}`);
        }
        // 如果检测不到，让 Puppeteer 用自带的 Chromium
    }

    try {
        console.log('[BrowserManager] 🚀 正在启动浏览器...');
        browserInstance = await pptr.launch(launchOptions);

        // 监听浏览器关闭事件
        browserInstance.on('disconnected', () => {
            console.log('[BrowserManager] 🔌 浏览器已断开连接');
            browserInstance = null;
            managedPages.clear();
            activePageId = null;
        });

        // 获取默认页面
        const pages = await browserInstance.pages();
        if (pages.length > 0) {
            const defaultPage = pages[0];
            const pageId = `page-${Date.now()}`;
            managedPages.set(pageId, defaultPage);
            activePageId = pageId;

            // 反检测注入（使用共享函数，stealth 兜底）
            await defaultPage.evaluateOnNewDocument(getAntiDetectionScript());
            // 注册页面关闭事件（防止手动关闭标签页后 managedPages 残留死引用）
            registerPageCloseHandler(pageId, defaultPage);
        }

        const result = {
            success: true,
            message: `浏览器启动成功！当前有 ${pages.length} 个标签页。` +
                (profilePath ? ` 已加载 Profile: ${profileName}` : ' 使用临时 Profile'),
            browser_id: 'puppeteer-main',
            pages: pages.length
        };

        console.log(`[BrowserManager] ✅ ${result.message}`);
        return result;

    } catch (e) {
        console.error('[BrowserManager] ❌ 浏览器启动失败:', e.message);

        // 如果是因为 Profile 被占用，给出明确提示
        if (e.message.includes('user data directory is already in use') ||
            e.message.includes('already running')) {
            throw new Error(
                '浏览器启动失败：Chrome Profile 已被另一个 Chrome 实例占用。' +
                '请先关闭所有 Chrome 浏览器窗口，或使用不同的 Profile。' +
                '提示：可以在 config.env 中设置 CHROME_PROFILE_NAME=VCPAutomate 使用独立 Profile。'
            );
        }

        throw new Error(`浏览器启动失败: ${e.message}`);
    }
}

/**
 * 关闭浏览器实例
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function closeBrowser() {
    if (!browserInstance) {
        return {
            success: true,
            message: '没有正在运行的浏览器实例。'
        };
    }

    try {
        await browserInstance.close();
        browserInstance = null;
        managedPages.clear();
        activePageId = null;

        return {
            success: true,
            message: '浏览器已关闭。'
        };
    } catch (e) {
        browserInstance = null;
        managedPages.clear();
        activePageId = null;
        return {
            success: true,
            message: `浏览器关闭（可能已经断开）: ${e.message}`
        };
    }
}

/**
 * 获取当前活动页面
 * @returns {import('puppeteer').Page|null}
 */
function getActivePage() {
    if (!activePageId || !managedPages.has(activePageId)) {
        return null;
    }
    return managedPages.get(activePageId);
}

/**
 * 在浏览器中打开新标签页
 * @param {string} url 要打开的 URL
 * @returns {Promise<{success: boolean, pageId: string, url: string}>}
 */
async function openNewPage(url) {
    if (!browserInstance) {
        throw new Error('浏览器未启动。请先调用 launch_browser。');
    }

    const page = await browserInstance.newPage();
    const pageId = `page-${Date.now()}`;

    // 反检测注入（使用共享函数）
    await page.evaluateOnNewDocument(getAntiDetectionScript());

    if (url) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    managedPages.set(pageId, page);
    activePageId = pageId;

    // 监听页面关闭（使用共享函数）
    registerPageCloseHandler(pageId, page);

    return {
        success: true,
        pageId,
        url: page.url()
    };
}

/**
 * 在当前活动页面导航到新 URL
 * @param {string} url
 * @returns {Promise<{success: boolean, url: string}>}
 */
async function navigateTo(url) {
    const page = getActivePage();
    if (!page) {
        throw new Error('没有活动页面。请先启动浏览器或打开新标签页。');
    }

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    return {
        success: true,
        url: page.url()
    };
}

/**
 * 获取当前页面信息（标题、URL、内容摘要）
 * @returns {Promise<object>}
 */
async function getPageInfo() {
    const page = getActivePage();
    if (!page) {
        throw new Error('没有活动页面。');
    }

    const title = await page.title();
    const url = page.url();

    // 提取页面主要文本内容
    const textContent = await page.evaluate(() => {
        // 移除脚本和样式
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
        const text = clone.innerText || clone.textContent || '';
        // 清理多余空白
        return text.replace(/\s+/g, ' ').trim().substring(0, 5000);
    });

    return {
        success: true,
        title,
        url,
        content_preview: textContent.substring(0, 2000),
        content_length: textContent.length
    };
}

/**
 * 截取当前页面截图
 * @param {object} options
 * @returns {Promise<{success: boolean, screenshot_base64: string}>}
 */
async function takeScreenshot(options = {}) {
    const page = getActivePage();
    if (!page) {
        throw new Error('没有活动页面。');
    }

    const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 70,
        fullPage: options.fullPage || false
    });

    return {
        success: true,
        screenshot_base64: screenshotBuffer.toString('base64'),
        format: 'jpeg'
    };
}

/**
 * 在当前页面执行 JavaScript 代码
 * Agent 传入的 code 是字符串形式的 JS 代码片段
 * 使用 new Function 包裹以确保返回值可被正确序列化
 * @param {string} code
 * @returns {Promise<any>}
 */
async function executeScript(code) {
    const page = getActivePage();
    if (!page) {
        throw new Error('没有活动页面。');
    }

    // 使用 page.evaluate 的字符串模式（包裹为 IIFE 以支持返回值）
    // Agent 传入的代码可能是表达式或语句块，用 async IIFE 兼容两者
    const wrappedCode = `(async () => { ${code} })()`;
    try {
        const result = await page.evaluate(wrappedCode);
        return {
            success: true,
            result
        };
    } catch (evalErr) {
        // 如果包裹后执行失败，尝试直接作为表达式求值（兼容简单表达式如 "document.title"）
        try {
            const result = await page.evaluate(code);
            return {
                success: true,
                result
            };
        } catch (directErr) {
            throw new Error(`脚本执行失败: ${evalErr.message}`);
        }
    }
}

/**
 * 列出所有打开的标签页
 * @returns {Promise<object>}
 */
async function listPages() {
    if (!browserInstance) {
        return { success: true, pages: [], message: '浏览器未启动。' };
    }

    const pages = await browserInstance.pages();
    const pageList = [];

    for (const [id, page] of managedPages.entries()) {
        try {
            pageList.push({
                id,
                url: page.url(),
                title: await page.title(),
                active: id === activePageId
            });
        } catch (e) {
            // 页面可能已关闭
        }
    }

    return {
        success: true,
        pages: pageList,
        total: pages.length,
        active_page: activePageId
    };
}

/**
 * 检查浏览器是否在运行
 * @returns {boolean}
 */
function isBrowserRunning() {
    return browserInstance !== null;
}

/**
 * 获取浏览器实例（供高级操作使用）
 * @returns {import('puppeteer').Browser|null}
 */
function getBrowserInstance() {
    return browserInstance;
}

module.exports = {
    setDebugMode,
    detectChromePath,
    getDefaultProfilePath,
    launchBrowser,
    closeBrowser,
    getActivePage,
    openNewPage,
    navigateTo,
    getPageInfo,
    takeScreenshot,
    executeScript,
    listPages,
    isBrowserRunning,
    getBrowserInstance
};
