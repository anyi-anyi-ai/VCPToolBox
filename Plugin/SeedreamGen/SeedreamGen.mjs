import https from 'https';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, readFileSync, writeFileSync } from 'fs';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API配置
const API_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const MODEL_ID = 'doubao-seedream-4-0-250828';

// 从环境变量读取配置
const API_KEYS_STRING = process.env.VOLCENGINE_API_KEY || '';
const API_KEYS = API_KEYS_STRING.split(',').map(key => key.trim()).filter(key => key);

const DEFAULT_WATERMARK = process.env.DEFAULT_WATERMARK === 'true' ? true : false;
const DEFAULT_RESPONSE_FORMAT = process.env.DEFAULT_RESPONSE_FORMAT || 'url';

// VCP服务器配置
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || process.cwd();
const SERVER_PORT = process.env.SERVER_PORT || '5000';
const IMAGESERVER_IMAGE_KEY = process.env.IMAGESERVER_IMAGE_KEY || '123';
const VAR_HTTP_URL = process.env.VarHttpUrl || 'http://localhost';

// 缓存文件路径
const CACHE_FILE_PATH = path.join(__dirname, '.seedream_api_cache.json');

/**
 * ApiKeyPool - 管理API密钥池，实现顺序轮询和错误处理
 */
class ApiKeyPool {
    constructor(keys) {
        this.state = this.loadState();

        // 如果没有状态，或者环境变量中的密钥已更改，则重新初始化
        const envKeySet = new Set(keys);
        const stateKeySet = new Set(this.state.keys.map(k => k.key));

        if (this.state.keys.length !== keys.length || ![...envKeySet].every(k => stateKeySet.has(k))) {
            log('info', `初始化API密钥池，共${keys.length}个密钥`);
            this.state = {
                currentIndex: 0,
                keys: keys.map(key => ({
                    key,
                    active: true,
                    errorCount: 0,
                    maxErrors: 3  // 降低为3次，因为图像生成API比较昂贵
                }))
            };
            this.saveState();
        }
    }

    loadState() {
        try {
            if (existsSync(CACHE_FILE_PATH)) {
                const data = readFileSync(CACHE_FILE_PATH, 'utf8');
                const state = JSON.parse(data);
                log('info', `从缓存加载API密钥状态`);
                return state;
            }
        } catch (error) {
            log('warn', `无法读取缓存文件，使用新状态: ${error.message}`);
        }
        return { currentIndex: 0, keys: [] };
    }

    saveState() {
        try {
            writeFileSync(CACHE_FILE_PATH, JSON.stringify(this.state, null, 2));
        } catch (error) {
            log('error', `无法写入缓存文件: ${error.message}`);
        }
    }

    getNextKey() {
        const activeKeys = this.state.keys.filter(k => k.active);
        if (activeKeys.length === 0) {
            // 如果所有密钥都被禁用，尝试重置错误计数
            log('warn', '所有API密钥都已被禁用，尝试重置...');
            this.resetAllKeys();
            const resetKeys = this.state.keys.filter(k => k.active);
            if (resetKeys.length === 0) {
                return null;
            }
        }

        // 使用模运算确保索引在有效范围内
        const activeIndex = this.state.currentIndex % activeKeys.length;
        const keyConfig = activeKeys[activeIndex];
        
        // 更新索引以指向下一个密钥
        this.state.currentIndex = (this.state.currentIndex + 1) % this.state.keys.length;
        
        log('info', `使用API密钥 #${this.state.keys.indexOf(keyConfig) + 1}/${this.state.keys.length} (活跃: ${activeKeys.length}/${this.state.keys.length})`);
        
        this.saveState();
        return keyConfig;
    }

    markKeyError(key, errorType = 'general') {
        const keyConfig = this.state.keys.find(k => k.key === key);
        if (keyConfig) {
            keyConfig.errorCount++;
            keyConfig.lastError = new Date().toISOString();
            keyConfig.lastErrorType = errorType;
            
            log('warn', `API密钥错误 (${errorType}): ${key.substring(0, 8)}... (错误次数: ${keyConfig.errorCount}/${keyConfig.maxErrors})`);
            
            if (keyConfig.errorCount >= keyConfig.maxErrors) {
                keyConfig.active = false;
                log('error', `禁用API密钥 (多次错误): ${key.substring(0, 8)}...`);
            }
            
            this.saveState();
        }
    }

    markKeySuccess(key) {
        const keyConfig = this.state.keys.find(k => k.key === key);
        if (keyConfig) {
            // 成功后重置错误计数
            keyConfig.errorCount = 0;
            keyConfig.lastSuccess = new Date().toISOString();
            this.saveState();
        }
    }

    resetAllKeys() {
        log('info', '重置所有API密钥状态');
        this.state.keys.forEach(keyConfig => {
            if (keyConfig.errorCount < keyConfig.maxErrors * 2) {
                // 只重置错误次数不是特别多的密钥
                keyConfig.active = true;
                keyConfig.errorCount = Math.floor(keyConfig.errorCount / 2); // 减半错误计数
            }
        });
        this.saveState();
    }

    getAllKeysStatus() {
        return this.state.keys.map((k, index) => ({
            index: index + 1,
            active: k.active,
            errorCount: k.errorCount,
            lastError: k.lastError,
            lastSuccess: k.lastSuccess
        }));
    }
}

// 初始化API密钥池
let apiKeyPool = null;

/**
 * 日志函数
 */
function log(level, message) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [SeedreamGen] [${level}] ${message}`);
}

/**
 * 发送HTTP请求到火山引擎API（支持重试）
 */
async function callVolcengineAPI(requestBody, retryCount = 0) {
    // 获取下一个可用的API密钥
    const keyConfig = apiKeyPool.getNextKey();
    
    if (!keyConfig) {
        throw new Error('没有可用的API密钥（所有密钥都已失效）');
    }
    
    const apiKey = keyConfig.key;
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(requestBody);
        
        const options = {
            hostname: 'ark.cn-beijing.volces.com',
            port: 443,
            path: '/api/v3/images/generations',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        // 设置请求超时时间为4分钟（比plugin-manifest中的5分钟短一点）
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', async () => {
                try {
                    const result = JSON.parse(data);
                    if (res.statusCode === 200) {
                        // 标记密钥成功
                        apiKeyPool.markKeySuccess(apiKey);
                        resolve(result);
                    } else {
                        // 处理错误
                        const errorMessage = result.error?.message || `API错误: ${res.statusCode}`;
                        
                        if (res.statusCode === 429) {
                            // 配额限制错误
                            log('error', `API密钥配额已用完: ${errorMessage}`);
                            apiKeyPool.markKeyError(apiKey, 'quota_exceeded');
                            
                            // 如果还有重试机会，使用下一个密钥重试
                            if (retryCount < API_KEYS.length - 1) {
                                log('info', `尝试使用其他密钥 (重试 ${retryCount + 1}/${API_KEYS.length - 1})`);
                                resolve(callVolcengineAPI(requestBody, retryCount + 1));
                            } else {
                                reject(new Error('所有API密钥的配额都已用完'));
                            }
                        } else if (res.statusCode === 401) {
                            // 认证错误
                            apiKeyPool.markKeyError(apiKey, 'auth_failed');
                            reject(new Error(`API密钥认证失败: ${errorMessage}`));
                        } else if (res.statusCode === 400) {
                            // 请求参数错误，不是密钥的问题
                            reject(new Error(`请求参数错误: ${errorMessage}`));
                        } else {
                            // 其他错误
                            apiKeyPool.markKeyError(apiKey, 'api_error');
                            reject(new Error(errorMessage));
                        }
                    }
                } catch (e) {
                    apiKeyPool.markKeyError(apiKey, 'parse_error');
                    reject(new Error(`解析响应失败: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => {
            apiKeyPool.markKeyError(apiKey, 'network_error');
            reject(new Error(`请求失败: ${e.message}`));
        });
        
        // 设置请求超时为240秒（4分钟）
        req.setTimeout(240000, () => {
            req.destroy();
            apiKeyPool.markKeyError(apiKey, 'timeout');
            reject(new Error('请求超时: 图像生成耗时过长，请稍后重试'));
        });

        req.write(postData);
        req.end();
    });
}

/**
 * 处理图片URL或Base64
 */
async function processImageInput(image) {
    if (!image) return null;
    
    // 如果是数组，递归处理每个元素
    if (Array.isArray(image)) {
        return Promise.all(image.map(img => processImageInput(img)));
    }
    
    // 如果已经是Base64格式
    if (typeof image === 'string' && image.startsWith('data:image')) {
        return image;
    }
    
    // 如果是URL
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
        return image;
    }
    
    // 如果是本地文件路径（file:// 协议）
    if (typeof image === 'string' && image.startsWith('file://')) {
        try {
            // 尝试解析文件路径
            let filePath;
            
            // 处理 Windows 文件路径
            // file://C:\Users\... 或 file:///C:/Users/...
            if (image.startsWith('file:///')) {
                // file:///C:/Users/... 格式
                filePath = decodeURIComponent(image.substring(8));
                // 将正斜杠转换为反斜杠（Windows路径）
                if (process.platform === 'win32') {
                    filePath = filePath.replace(/\//g, '\\');
                }
            } else if (image.startsWith('file://')) {
                // file://C:\Users\... 格式
                filePath = decodeURIComponent(image.substring(7));
            }
            
            log('info', `尝试读取本地文件: ${filePath}`);
            
            const buffer = await fs.readFile(filePath);
            const base64 = buffer.toString('base64');
            
            // 根据文件扩展名判断MIME类型
            const ext = path.extname(filePath).toLowerCase();
            let mimeType = 'image/jpeg';
            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.bmp') mimeType = 'image/bmp';
            
            return `data:${mimeType};base64,${base64}`;
        } catch (e) {
            if (e.code === 'ENOENT') {
                // 文件不存在，触发超栈追踪机制
                log('warn', `本地文件不存在，触发超栈追踪: ${image}`);
                const error = new Error('本地文件未找到，需要远程获取。');
                error.code = 'FILE_NOT_FOUND_LOCALLY';
                error.fileUrl = image;
                throw error;
            }
            throw new Error(`读取文件失败: ${e.message}`);
        }
    }
    
    return image;
}

/**
 * 处理文生图
 */
async function handleGenerate(args) {
    const prompt = args.prompt || args.Prompt;
    const resolution = args.resolution || args.size || args.Resolution || '2048x2048';
    const watermark = args.watermark !== undefined ? args.watermark : DEFAULT_WATERMARK;
    const seed = args.seed || -1;
    
    if (!prompt) {
        throw new Error('必须提供 prompt 参数');
    }
    
    const requestBody = {
        model: MODEL_ID,
        prompt: prompt,
        size: resolution,
        watermark: watermark,
        response_format: DEFAULT_RESPONSE_FORMAT
    };
    
    if (seed !== -1) {
        requestBody.seed = seed;
    }
    
    return await callVolcengineAPI(requestBody);
}

/**
 * 处理图生图
 */
async function handleEdit(args) {
    const prompt = args.prompt || args.Prompt;
    const image = await processImageInput(args.image || args.Image || args.image_url);
    let resolution = args.resolution || args.size || args.Resolution;
    const watermark = args.watermark !== undefined ? args.watermark : DEFAULT_WATERMARK;
    
    if (!prompt) {
        throw new Error('必须提供 prompt 参数');
    }
    if (!image) {
        throw new Error('图生图模式必须提供 image 参数');
    }
    
    // 处理adaptive或未指定尺寸的情况
    // 火山引擎API不支持"adaptive"，需要使用具体尺寸
    if (!resolution || resolution === 'adaptive' || resolution === 'auto') {
        // 默认使用2048x2048，这是一个比较通用的尺寸
        resolution = '2048x2048';
        log('info', '图生图模式：未指定尺寸或使用adaptive，默认使用2048x2048');
    }
    
    // 验证尺寸格式是否合法
    const validSizes = [
        '1024x1024', '1280x1280', '1536x1536', '2048x2048',  // 正方形
        '2048x1536', '1536x2048',  // 4:3 和 3:4
        '2304x1728', '1728x2304',  // 4:3 和 3:4 (更高分辨率)
        '2560x1440', '1440x2560',  // 16:9 和 9:16
        '1920x1080', '1080x1920',  // 16:9 和 9:16 (标准)
        '1k', '2k', '4k'  // 预设尺寸
    ];
    
    // 如果不是预设尺寸，检查格式是否为 WIDTHxHEIGHT
    if (!validSizes.includes(resolution) && !resolution.match(/^\d+x\d+$/)) {
        log('warn', `无效的尺寸格式: ${resolution}，使用默认尺寸2048x2048`);
        resolution = '2048x2048';
    }
    
    const requestBody = {
        model: MODEL_ID,
        prompt: prompt,
        image: image,
        size: resolution,
        watermark: watermark,
        response_format: DEFAULT_RESPONSE_FORMAT
        // 注意：Seedream 4.0 不支持 guidance_scale 参数
    };
    
    // 如果用户明确提供了 seed 参数，则添加
    if (args.seed && args.seed !== -1) {
        requestBody.seed = args.seed;
    }
    
    return await callVolcengineAPI(requestBody);
}

/**
 * 处理多图融合
 */
async function handleCompose(args) {
    const prompt = args.prompt || args.Prompt;
    let images = args.image || args.images || args.Image || args.Images;
    let resolution = args.resolution || args.size || args.Resolution;
    const watermark = args.watermark !== undefined ? args.watermark : DEFAULT_WATERMARK;
    
    if (!prompt) {
        throw new Error('必须提供 prompt 参数');
    }
    if (!images) {
        throw new Error('多图融合模式必须提供 image 参数');
    }
    
    // 确保images是数组
    if (!Array.isArray(images)) {
        // 尝试解析JSON字符串
        if (typeof images === 'string' && images.startsWith('[')) {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = [images];
            }
        } else {
            images = [images];
        }
    }
    
    if (images.length < 2) {
        throw new Error('多图融合至少需要2张图片');
    }
    if (images.length > 10) {
        throw new Error('多图融合最多支持10张图片');
    }
    
    // 处理adaptive或未指定尺寸的情况
    if (!resolution || resolution === 'adaptive' || resolution === 'auto') {
        // 多图融合默认使用2048x2048
        resolution = '2048x2048';
        log('info', '多图融合模式：未指定尺寸或使用adaptive，默认使用2048x2048');
    }
    
    // 验证尺寸格式
    const validPresets = ['1K', '2K', '4K'];  // 注意是大写K
    const validSizes = [
        '1024x1024', '1280x1280', '1536x1536', '2048x2048',
        '2048x1536', '1536x2048', '2304x1728', '1728x2304',
        '2560x1440', '1440x2560', '1920x1080', '1080x1920',
        '2496x1664', '1664x2496', '3024x1296'
    ];
    
    // 转换小写的k为大写K
    if (resolution.toLowerCase() === '1k') resolution = '1K';
    else if (resolution.toLowerCase() === '2k') resolution = '2K';
    else if (resolution.toLowerCase() === '4k') resolution = '4K';
    
    // 验证格式
    if (!validPresets.includes(resolution) && 
        !validSizes.includes(resolution) && 
        !resolution.match(/^\d+x\d+$/)) {
        log('warn', `无效的尺寸格式: ${resolution}，使用默认尺寸2048x2048`);
        resolution = '2048x2048';
    }
    
    const processedImages = await processImageInput(images);
    
    const requestBody = {
        model: MODEL_ID,
        prompt: prompt,
        image: processedImages,
        size: resolution,
        watermark: watermark,
        response_format: DEFAULT_RESPONSE_FORMAT,
        sequential_image_generation: 'disabled'
    };
    
    return await callVolcengineAPI(requestBody);
}

/**
 * 处理组图生成
 */
async function handleGroup(args) {
    const prompt = args.prompt || args.Prompt;
    const maxImages = parseInt(args.max_images || args.maxImages || args.count || 4);
    const resolution = args.resolution || args.size || args.Resolution || '2048x2048';
    const watermark = args.watermark !== undefined ? args.watermark : DEFAULT_WATERMARK;
    const image = args.image ? await processImageInput(args.image) : null;
    
    if (!prompt) {
        throw new Error('必须提供 prompt 参数');
    }
    
    if (maxImages < 1 || maxImages > 15) {
        throw new Error('max_images 必须在 1-15 范围内');
    }
    
    const requestBody = {
        model: MODEL_ID,
        prompt: prompt,
        size: resolution,
        watermark: watermark,
        response_format: DEFAULT_RESPONSE_FORMAT,
        sequential_image_generation: 'auto',
        sequential_image_generation_options: {
            max_images: maxImages
        }
    };
    
    // 如果提供了参考图片
    if (image) {
        requestBody.image = image;
    }
    
    return await callVolcengineAPI(requestBody);
}

/**
 * 保存图片到本地并返回URL
 */
async function saveImageToLocal(imageUrl, imageBase64) {
    try {
        let imageBuffer;
        let extension = 'png';
        
        if (imageBase64) {
            // 如果是Base64格式
            imageBuffer = Buffer.from(imageBase64, 'base64');
        } else if (imageUrl) {
            // 如果是URL，需要下载
            // 火山引擎可能返回不完整的URL，需要补全
            const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;
            
            const response = await new Promise((resolve, reject) => {
                https.get(fullUrl, (res) => {
                    // 处理重定向
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        https.get(res.headers.location, (redirectRes) => {
                            const chunks = [];
                            redirectRes.on('data', chunk => chunks.push(chunk));
                            redirectRes.on('end', () => resolve({ 
                                data: Buffer.concat(chunks),
                                contentType: redirectRes.headers['content-type'] 
                            }));
                            redirectRes.on('error', reject);
                        });
                        return;
                    }
                    
                    const chunks = [];
                    res.on('data', chunk => chunks.push(chunk));
                    res.on('end', () => resolve({ 
                        data: Buffer.concat(chunks),
                        contentType: res.headers['content-type'] 
                    }));
                    res.on('error', reject);
                });
            });
            
            imageBuffer = response.data;
            // 从content-type提取扩展名
            if (response.contentType && response.contentType.includes('jpeg')) {
                extension = 'jpg';
            }
        } else {
            return null;
        }
        
        // 生成唯一文件名
        const fileName = `${uuidv4()}.${extension}`;
        const imageDir = path.join(PROJECT_BASE_PATH, 'image', 'seedream');
        const localImagePath = path.join(imageDir, fileName);
        
        // 创建目录
        await fs.mkdir(imageDir, { recursive: true });
        
        // 保存文件
        await fs.writeFile(localImagePath, imageBuffer);
        
        // 生成可访问的URL
        const relativePathForUrl = path.join('seedream', fileName).replace(/\\/g, '/');
        const accessibleUrl = `${VAR_HTTP_URL}:${SERVER_PORT}/pw=${IMAGESERVER_IMAGE_KEY}/images/${relativePathForUrl}`;
        
        log('info', `图片已保存: ${localImagePath}`);
        
        return {
            localPath: localImagePath,
            fileName: fileName,
            accessibleUrl: accessibleUrl,
            serverPath: `image/seedream/${fileName}`
        };
    } catch (error) {
        log('error', `保存图片失败: ${error.message}`);
        return null;
    }
}

/**
 * 构建返回结果
 */
async function buildResponse(apiResult, command, prompt) {
    const images = apiResult.data || [];
    const usage = apiResult.usage || {};
    
    // 记录返回格式
    const isBase64Format = DEFAULT_RESPONSE_FORMAT === 'b64_json';
    log('info', `响应格式: ${DEFAULT_RESPONSE_FORMAT}, 实际返回: ${images.length > 0 ? (images[0].b64_json ? 'Base64' : 'URL') : '无图片'}`);
    
    // 保存成功的图片到本地
    const savedImages = [];
    const base64Images = [];  // 用于存储Base64图片数据
    
    for (const img of images) {
        if (!img.error) {
            let savedInfo = null;
            let base64Data = null;
            
            if (isBase64Format && img.b64_json) {
                // Base64格式：直接保存Base64数据
                savedInfo = await saveImageToLocal(null, img.b64_json);
                base64Data = img.b64_json;
            } else if (!isBase64Format && img.url) {
                // URL格式：下载图片并保存
                savedInfo = await saveImageToLocal(img.url, null);
            } else {
                // 兼容处理：如果格式不匹配，尝试使用可用的数据
                log('warn', `格式不匹配 - 期望: ${DEFAULT_RESPONSE_FORMAT}, 实际: ${img.url ? 'URL' : img.b64_json ? 'Base64' : '未知'}`);
                savedInfo = await saveImageToLocal(img.url, img.b64_json);
                base64Data = img.b64_json;
            }
            
            if (savedInfo) {
                savedImages.push(savedInfo);
                if (base64Data) {
                    base64Images.push({
                        base64: `data:image/png;base64,${base64Data}`,
                        localUrl: savedInfo.accessibleUrl
                    });
                }
            }
        }
    }
    
    // 构建文本描述
    let textContent = `🎨 **Seedream 4.0 图像生成成功！**\n\n`;
    textContent += `📝 **提示词**: ${prompt}\n`;
    textContent += `🖼️ **生成方式**: ${getCommandDescription(command)}\n`;
    textContent += `📊 **生成数量**: ${images.length} 张\n`;
    textContent += `📡 **返回格式**: ${isBase64Format ? 'Base64' : 'URL'}\n`;
    
    // 添加本地保存信息
    if (savedImages.length > 0) {
        textContent += `💾 **已保存到本地**: ${savedImages.length} 张\n`;
        textContent += `📁 **保存路径**: image/seedream/\n\n`;
        
        // 列出所有可访问的URL
        textContent += `**可访问URL：**\n`;
        savedImages.forEach((saved, idx) => {
            textContent += `- 图片${idx + 1}: ${saved.accessibleUrl}\n`;
        });
        
        // 如果是Base64格式，提醒用户可以直接看到图片
        if (isBase64Format && base64Images.length > 0) {
            textContent += `\n✅ **Base64格式**: 图片数据已嵌入，AI可以直接看到图片内容！`;
        }
    }
    
    if (usage.output_tokens) {
        textContent += `\n💰 **Token消耗**: ${usage.output_tokens}\n`;
    }
    
    // 处理错误情况（部分失败）
    const successImages = images.filter(img => !img.error);
    const failedImages = images.filter(img => img.error);
    
    if (failedImages.length > 0) {
        textContent += `\n⚠️ **部分图片生成失败**: ${failedImages.length} 张\n`;
        failedImages.forEach((img, idx) => {
            textContent += `  - 图片${idx + 1}: ${img.error.message}\n`;
        });
    }
    
    if (!isBase64Format && successImages.length > 0) {
        textContent += `\n⏰ **注意**: 图片链接将在24小时后失效，请及时保存！`;
    }
    
    // 构建返回结果 - 采用与 NanoBananaGenOR 相同的格式
    const contentArray = [];
    
    // 添加文本内容
    contentArray.push({
        type: 'text',
        text: textContent
    });
    
    // 如果是Base64格式，添加图片到content数组中
    if (isBase64Format && base64Images.length > 0) {
        // 添加所有图片（AI可以直接看到）
        base64Images.forEach((imgData, idx) => {
            contentArray.push({
                type: 'image_url',
                image_url: {
                    url: imgData.base64
                }
            });
        });
    }
    
    // 构建最终结果
    const result = {
        content: contentArray,  // 使用数组格式，与NanoBananaGenOR保持一致
        details: {
            serverPath: savedImages.length > 0 ? savedImages[0].serverPath : null,
            fileName: savedImages.length > 0 ? savedImages[0].fileName : null,
            imageUrls: savedImages.map(s => s.accessibleUrl),
            prompt: prompt,
            command: command,
            model: apiResult.model,
            created: apiResult.created,
            usage: usage,
            image_count: successImages.length,
            response_format: DEFAULT_RESPONSE_FORMAT
        }
    };
    
    return result;
}

/**
 * 获取命令描述
 */
function getCommandDescription(command) {
    const descriptions = {
        'generate': '文生图',
        'edit': '图生图',
        'compose': '多图融合',
        'group': '组图生成'
    };
    return descriptions[command] || command;
}

/**
 * 主函数
 */
async function main() {
    try {
        // 检查API密钥
        if (API_KEYS.length === 0) {
            throw new Error('未配置 VOLCENGINE_API_KEY，请在 config.env 中设置');
        }
        
        // 初始化API密钥池
        if (!apiKeyPool) {
            apiKeyPool = new ApiKeyPool(API_KEYS);
            log('info', `API密钥池已初始化，共${API_KEYS.length}个密钥`);
        }
        
        // 读取输入
        const input = await new Promise((resolve) => {
            let data = '';
            process.stdin.on('data', chunk => data += chunk);
            process.stdin.on('end', () => resolve(data));
        });
        
        const args = JSON.parse(input);
        log('info', `收到请求: ${JSON.stringify(args).substring(0, 200)}...`);
        
        // 识别命令（支持多种参数名）
        const command = args.command || args.Command || args.cmd || 'generate';
        
        let apiResult;
        
        // 根据命令分发处理
        switch (command.toLowerCase()) {
            case 'generate':
            case 'text2image':
            case 't2i':
                apiResult = await handleGenerate(args);
                break;
                
            case 'edit':
            case 'image2image':
            case 'i2i':
                apiResult = await handleEdit(args);
                break;
                
            case 'compose':
            case 'merge':
            case 'fusion':
                apiResult = await handleCompose(args);
                break;
                
            case 'group':
            case 'sequential':
            case 'series':
                apiResult = await handleGroup(args);
                break;
                
            default:
                throw new Error(`未知的命令: ${command}`);
        }
        
        // 构建响应（注意这是异步函数，需要await）
        const response = await buildResponse(
            apiResult, 
            command, 
            args.prompt || args.Prompt || ''
        );
        
        // 输出成功结果
        console.log(JSON.stringify({
            status: 'success',
            result: response
        }));
        
        log('info', '图像生成成功完成');
        
    } catch (error) {
        log('error', `错误: ${error.message}`);
        
        // 处理超栈追踪
        if (error.code === 'FILE_NOT_FOUND_LOCALLY') {
            console.log(JSON.stringify({
                status: 'error',
                code: error.code,
                error: error.message,
                fileUrl: error.fileUrl
            }));
        } else {
            // 普通错误
            console.log(JSON.stringify({
                status: 'error',
                error: error.message
            }));
        }
        
        process.exit(1);
    }
}

// 执行主函数
main();
