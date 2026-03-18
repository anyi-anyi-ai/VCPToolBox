const fs = require('fs').promises;
const path = require('path');

// 配置
const DEBUG_MODE = (process.env.debugMode || "false").toLowerCase() === "true";
const MAX_ENTRIES = parseInt(process.env.maxEntries) || 20;
const DATE_FORMAT = process.env.dateFormat || "YYYY-MM-DD";
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH;
const TIMELINE_DIR = PROJECT_BASE_PATH ? path.join(PROJECT_BASE_PATH, 'timeline') : path.join(__dirname, '..', '..', 'timeline');

// 调试日志
function debugLog(message, ...args) {
    if (DEBUG_MODE) {
        console.error(`[TimelineInjector][Debug] ${message}`, ...args);
    }
}

// 从文件名提取角色名，并清理特殊字符
function extractCharacterName(filename) {
    // 匹配模式：角色名_timeline.json
    const match = filename.match(/^(.+)_timeline\.json$/);
    if (!match) {
        return null;
    }
    
    let characterName = match[1];
    
    // 清理特殊字符：移除方括号、空格等
    characterName = characterName.replace(/[\[\]\s]/g, '');
    
    return characterName;
}

// 格式化日期
function formatDate(dateStr) {
    // 简单格式化，可以扩展使用dayjs等库
    return dateStr;
}

// 生成时间线摘要
function generateTimelineSummary(characterName, timelineData) {
    const entries = timelineData.entries;
    if (!entries || Object.keys(entries).length === 0) {
        return `[${characterName}的时间线暂无记录]`;
    }

    let summary = `【${characterName}的时间线摘要】\n`;
    summary += `最后更新: ${new Date(timelineData.lastUpdated).toLocaleString('zh-CN')}\n\n`;

    // 按日期排序（最新的在前）
    const sortedDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));
    
    let entryCount = 0;
    for (const date of sortedDates) {
        if (entryCount >= MAX_ENTRIES) break;
        
        const dateEntries = entries[date];
        // 对当天内的条目按 addedOn 降序排序（最新的在前）
        const sortedDateEntries = dateEntries.slice().sort((a, b) => {
            const timeA = a.addedOn ? new Date(a.addedOn).getTime() : 0;
            const timeB = b.addedOn ? new Date(b.addedOn).getTime() : 0;
            return timeB - timeA; // 降序
        });
        
        summary += `📅 ${formatDate(date)}:\n`;
        
        for (const entry of sortedDateEntries) {
            if (entryCount >= MAX_ENTRIES) break;
            // 提取时间（如果存在 addedOn）
            let timePrefix = '';
            if (entry.addedOn) {
                try {
                    const dateObj = new Date(entry.addedOn);
                    // 格式化为 HH:MM（24小时制）
                    const hours = dateObj.getHours().toString().padStart(2, '0');
                    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                    timePrefix = `[${hours}:${minutes}] `;
                } catch (e) {
                    // 忽略错误
                }
            }
            summary += `  • ${timePrefix}${entry.summary}\n`;
            entryCount++;
        }
        summary += '\n';
    }
    
    if (entryCount < Object.keys(entries).length) {
        summary += `...（共${Object.keys(entries).length}条记录，显示最近${entryCount}条）`;
    }
    
    return summary.trim();
}

// 主函数
async function main() {
    debugLog(`开始处理时间线目录: ${TIMELINE_DIR}`);
    
    try {
        // 检查目录是否存在
        await fs.access(TIMELINE_DIR);
    } catch (error) {
        console.error(`[TimelineInjector] 错误: 时间线目录不存在: ${TIMELINE_DIR}`);
        process.stdout.write(JSON.stringify({
            status: "error",
            message: `时间线目录不存在: ${TIMELINE_DIR}`
        }));
        return;
    }

    // 确定日记本目录
    const DAILYNOTE_DIR = PROJECT_BASE_PATH ? path.join(PROJECT_BASE_PATH, 'dailynote') : path.join(__dirname, '..', '..', 'dailynote');
    debugLog(`日记本目录: ${DAILYNOTE_DIR}`);

    try {
        const files = await fs.readdir(TIMELINE_DIR);
        const timelineFiles = files.filter(file => file.endsWith('_timeline.json') && file !== 'processed_files_db.json');
        
        debugLog(`找到 ${timelineFiles.length} 个时间线文件`);
        
        const placeholderValues = {};
        const generatedFiles = [];
        
        // 处理每个时间线文件
        for (const filename of timelineFiles) {
            const characterName = extractCharacterName(filename);
            if (!characterName) {
                debugLog(`无法从文件名提取角色名: ${filename}`);
                continue;
            }
            
            try {
                const filePath = path.join(TIMELINE_DIR, filename);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const timelineData = JSON.parse(fileContent);
                
                // 生成摘要
                const summary = generateTimelineSummary(characterName, timelineData);
                
                // 创建占位符键（保留原有输出）
                const placeholderKey = `{{${characterName}时间线}}`;
                placeholderValues[placeholderKey] = summary;
                
                // 生成日记本文件夹和文件
                const timelineFolderName = `${characterName}时间线`;
                const timelineFolderPath = path.join(DAILYNOTE_DIR, timelineFolderName);
                const timelineFilePath = path.join(timelineFolderPath, `${timelineFolderName}.txt`);
                
                // 确保文件夹存在
                await fs.mkdir(timelineFolderPath, { recursive: true });
                
                // 写入摘要到文件（覆盖）
                await fs.writeFile(timelineFilePath, summary, 'utf-8');
                generatedFiles.push(timelineFolderName);
                
                debugLog(`已处理: ${characterName} (${filename}) -> ${timelineFilePath}`);
            } catch (error) {
                console.error(`[TimelineInjector] 处理文件 ${filename} 时出错:`, error.message);
                const placeholderKey = `{{${characterName}时间线}}`;
                placeholderValues[placeholderKey] = `[加载${characterName}时间线时出错: ${error.message}]`;
            }
        }
        
        // 输出结果（保持原有JSON格式，以便插件管理器可能使用）
        const result = {
            status: "success",
            message: `成功加载 ${Object.keys(placeholderValues).length} 个角色的时间线，并在 ${DAILYNOTE_DIR} 下生成了 ${generatedFiles.length} 个时间线日记本`,
            placeholderValues: placeholderValues,
            metadata: {
                processedFiles: timelineFiles.length,
                generatedFiles: generatedFiles,
                timestamp: new Date().toISOString()
            }
        };
        
        process.stdout.write(JSON.stringify(result));
        debugLog(`处理完成，输出 ${Object.keys(placeholderValues).length} 个占位符，生成 ${generatedFiles.length} 个日记本`);
        
    } catch (error) {
        console.error(`[TimelineInjector] 主循环错误:`, error.message);
        process.stdout.write(JSON.stringify({
            status: "error",
            message: `处理时间线时出错: ${error.message}`
        }));
    }
}

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error(`[TimelineInjector] 未捕获的错误:`, error);
        process.stdout.write(JSON.stringify({
            status: "fatal",
            message: `未捕获的错误: ${error.message}`
        }));
        process.exitCode = 1;
    });
}

module.exports = { main };