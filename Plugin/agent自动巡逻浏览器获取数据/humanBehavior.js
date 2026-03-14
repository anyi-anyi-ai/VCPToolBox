// Plugin/ChromeBridge/humanBehavior.js
// 人类行为模拟模块 - 用于规避反爬虫检测
// 包含：随机延迟、鼠标轨迹、滚动节奏、输入节奏等

/**
 * 随机延迟 - 模拟人类操作间隔
 * @param {number} min 最小延迟（毫秒）
 * @param {number} max 最大延迟（毫秒）
 * @returns {Promise<void>}
 */
function randomDelay(min = 500, max = 2000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 短延迟 - 模拟快速人类反应
 */
function shortDelay() {
    return randomDelay(200, 800);
}

/**
 * 中等延迟 - 模拟阅读/思考
 */
function mediumDelay() {
    return randomDelay(1000, 3000);
}

/**
 * 长延迟 - 模拟页面浏览
 */
function longDelay() {
    return randomDelay(3000, 6000);
}

/**
 * 生成贝塞尔曲线控制点，用于模拟自然鼠标移动
 * @param {number} startX 起始X
 * @param {number} startY 起始Y
 * @param {number} endX 终点X
 * @param {number} endY 终点Y
 * @param {number} steps 步数
 * @returns {Array<{x: number, y: number}>}
 */
function generateBezierPoints(startX, startY, endX, endY, steps = 20) {
    // 随机生成2个控制点，使鼠标轨迹看起来自然
    const cp1x = startX + (endX - startX) * (0.2 + Math.random() * 0.3);
    const cp1y = startY + (Math.random() - 0.5) * Math.abs(endY - startY) * 0.8;
    const cp2x = startX + (endX - startX) * (0.5 + Math.random() * 0.3);
    const cp2y = endY + (Math.random() - 0.5) * Math.abs(endY - startY) * 0.4;

    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        const x = mt3 * startX + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * endX;
        const y = mt3 * startY + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * endY;

        points.push({
            x: Math.round(x),
            y: Math.round(y)
        });
    }
    return points;
}

/**
 * 模拟人类鼠标移动到目标位置
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {number} targetX 目标X坐标
 * @param {number} targetY 目标Y坐标
 */
async function humanMouseMove(page, targetX, targetY) {
    // 获取当前鼠标位置（如果可能的话），否则从随机位置开始
    const viewport = page.viewport();
    const startX = Math.floor(Math.random() * (viewport?.width || 1280));
    const startY = Math.floor(Math.random() * (viewport?.height || 800));

    const steps = 15 + Math.floor(Math.random() * 20);
    const points = generateBezierPoints(startX, startY, targetX, targetY, steps);

    for (const point of points) {
        await page.mouse.move(point.x, point.y);
        // 每步之间的微延迟（5-25ms，模拟真实鼠标速度）
        await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 20));
    }
}

/**
 * 模拟人类点击 - 移动到元素附近并点击
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {string} selector CSS 选择器
 * @param {object} options 选项
 */
async function humanClick(page, selector, options = {}) {
    const element = await page.$(selector);
    if (!element) {
        throw new Error(`元素未找到: ${selector}`);
    }

    const box = await element.boundingBox();
    if (!box) {
        throw new Error(`元素不可见: ${selector}`);
    }

    // 在元素区域内随机一个点击位置（不总是正中心）
    const clickX = box.x + box.width * (0.3 + Math.random() * 0.4);
    const clickY = box.y + box.height * (0.3 + Math.random() * 0.4);

    // 模拟鼠标移动到目标
    await humanMouseMove(page, clickX, clickY);
    
    // 短暂停顿后点击
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
    
    await page.mouse.click(clickX, clickY, {
        delay: 50 + Math.floor(Math.random() * 100) // 按下和释放之间的延迟
    });

    // 点击后的自然停顿
    await shortDelay();
}

/**
 * 模拟人类输入 - 逐字输入，有自然的打字节奏
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {string} selector CSS 选择器
 * @param {string} text 要输入的文本
 */
async function humanType(page, selector, text) {
    await humanClick(page, selector);
    
    for (const char of text) {
        await page.keyboard.type(char, {
            delay: 80 + Math.floor(Math.random() * 180) // 模拟打字速度
        });

        // 偶尔有更长的停顿（模拟思考）
        if (Math.random() < 0.1) {
            await randomDelay(300, 800);
        }
    }
}

/**
 * 模拟人类滚动 - 自然的滚动节奏，不是机械匀速
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {object} options 滚动选项
 * @param {string} options.direction 方向 'down' 或 'up'
 * @param {number} options.distance 滚动距离（像素），0为自适应
 * @param {number} options.times 滚动次数
 * @param {boolean} options.smooth 是否平滑滚动
 */
async function humanScroll(page, options = {}) {
    const {
        direction = 'down',
        distance = 0,
        times = 3,
        smooth = true
    } = options;

    for (let i = 0; i < times; i++) {
        // 每次滚动的距离有随机变化
        const scrollAmount = distance || (300 + Math.floor(Math.random() * 500));
        const scrollDirection = direction === 'down' ? scrollAmount : -scrollAmount;

        if (smooth) {
            // 平滑滚动 - 分多步完成
            const steps = 5 + Math.floor(Math.random() * 5);
            const stepAmount = scrollDirection / steps;
            
            for (let j = 0; j < steps; j++) {
                await page.evaluate((amount) => {
                    window.scrollBy(0, amount);
                }, stepAmount);
                await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
            }
        } else {
            await page.evaluate((amount) => {
                window.scrollBy(0, amount);
            }, scrollDirection);
        }

        // 滚动间隙模拟阅读停顿
        if (i < times - 1) {
            await randomDelay(800, 2500);
        }
    }
}

/**
 * 模拟人类浏览行为 - 在页面上随机移动鼠标、偶尔滚动
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {number} duration 浏览持续时间（毫秒）
 */
async function humanBrowse(page, duration = 5000) {
    const startTime = Date.now();
    const viewport = page.viewport() || { width: 1280, height: 800 };

    while (Date.now() - startTime < duration) {
        const action = Math.random();

        if (action < 0.4) {
            // 40% 概率：随机移动鼠标
            const x = Math.floor(Math.random() * viewport.width);
            const y = Math.floor(Math.random() * viewport.height);
            await humanMouseMove(page, x, y);
        } else if (action < 0.7) {
            // 30% 概率：轻微滚动
            await humanScroll(page, { times: 1, distance: 100 + Math.floor(Math.random() * 200) });
        } else {
            // 30% 概率：停顿（模拟阅读）
            await randomDelay(1000, 3000);
        }

        await shortDelay();
    }
}

/**
 * 等待页面加载完成 + 额外自然延迟
 * @param {import('puppeteer').Page} page Puppeteer 页面实例
 * @param {number} extraDelay 额外延迟
 */
async function waitForPageReady(page, extraDelay = 2000) {
    try {
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
    } catch (e) {
        // 超时也继续，页面可能加载了部分资源但足够使用
    }
    // 额外等待动态内容加载
    await randomDelay(extraDelay, extraDelay + 2000);
}

/**
 * 安全等待选择器 - 带超时的人类化等待
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<import('puppeteer').ElementHandle|null>}
 */
async function safeWaitForSelector(page, selector, timeout = 10000) {
    try {
        const element = await page.waitForSelector(selector, { timeout, visible: true });
        await shortDelay(); // 等到后稍微停顿
        return element;
    } catch (e) {
        return null;
    }
}

/**
 * 在多个可能的选择器中找到第一个匹配的
 * @param {import('puppeteer').Page} page
 * @param {string[]} selectors
 * @param {number} timeout
 * @returns {Promise<{element: import('puppeteer').ElementHandle|null, selector: string|null}>}
 */
async function findFirstSelector(page, selectors, timeout = 5000) {
    for (const selector of selectors) {
        const element = await safeWaitForSelector(page, selector, timeout);
        if (element) {
            return { element, selector };
        }
    }
    return { element: null, selector: null };
}

/**
 * 随机化 viewport 尺寸 - 避免所有实例用同一分辨率
 * @returns {{width: number, height: number}}
 */
function randomViewport() {
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1280, height: 720 },
        { width: 1600, height: 900 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
}

module.exports = {
    randomDelay,
    shortDelay,
    mediumDelay,
    longDelay,
    generateBezierPoints,
    humanMouseMove,
    humanClick,
    humanType,
    humanScroll,
    humanBrowse,
    waitForPageReady,
    safeWaitForSelector,
    findFirstSelector,
    randomViewport
};
