const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class RecentMemoManager {
    constructor(basePath) {
        this.basePath = basePath;
        this.historyDir = path.resolve(basePath, 'history');
        this.logDir = path.resolve(basePath, 'logs');
        
        // 🌟 核心配置：滑动窗口与归档阈值
        this.maxRounds = parseInt(process.env.RecentMemo_MaxRounds) || 50;
        this.archiveThreshold = parseInt(process.env.RecentMemo_ArchiveThreshold) || 100;
        
        this.ensureDir();
    }

    _panoramaLog(scope, agent, message, level = 'INFO') {
        const now = new Date();
        const timestamp = now.toLocaleString('zh-CN', { hour12: false });
        const dateStr = now.toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `RecentMemo_${dateStr}.log`);
        const logEntry = `[${timestamp}] [${level}] [${scope}] [${agent || 'GLOBAL'}] ${message}\n`;
        const fsSync = require('fs');
        try {
            if (!fsSync.existsSync(this.logDir)) fsSync.mkdirSync(this.logDir, { recursive: true });
            fsSync.appendFileSync(logFile, logEntry, 'utf8');
        } catch (e) {}
    }

    async ensureDir() {
        try {
            await fs.mkdir(this.historyDir, { recursive: true });
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (e) {}
    }

    async ensureAgentFile(agentName) {
        const filePath = path.join(this.historyDir, `${agentName}.txt`);
        try {
            await fs.access(filePath);
        } catch (e) {
            await fs.writeFile(filePath, '', 'utf-8');
        }
    }

    // 🌟 自动归档逻辑：溢出数据进入 .Arc 缓存区
    async _archiveOverflow(agentName, overflowEntries) {
        if (!overflowEntries || overflowEntries.length === 0) return;
        
        // 归档目录对齐到 dailynote/{Agent}.Arc
        const arcDir = path.join(this.basePath, '..', '..', 'dailynote', `${agentName}.Arc`);
        try {
            const fsSync = require('fs');
            if (!fsSync.existsSync(arcDir)) await fs.mkdir(arcDir, { recursive: true });
            
            const bufferPath = path.join(arcDir, 'Buffer_Pending.txt');
            const overflowText = overflowEntries.join('\n--------------------------------------------------\n') + '\n--------------------------------------------------\n';
            
            // 写入 Buffer
            await fs.appendFile(bufferPath, overflowText, 'utf-8');
            
            // 检查 Buffer 规模是否触发独立文件化
            const bufferContent = await fs.readFile(bufferPath, 'utf-8');
            const bufferEntries = bufferContent.split('--------------------------------------------------\n').filter(Boolean);
            
            if (bufferEntries.length >= this.archiveThreshold) {
                const now = new Date();
                const timestamp = now.toISOString().replace(/[:T]/g, '-').split('.')[0];
                const archivePath = path.join(arcDir, `${timestamp}.txt`);
                await fs.writeFile(archivePath, bufferContent, 'utf-8');
                await fs.writeFile(bufferPath, '', 'utf-8'); // 清空 Buffer
                this._panoramaLog('ARCHIVE', agentName, `Archive triggered: Created ${timestamp}.txt with ${bufferEntries.length} entries.`);
            }
        } catch (e) {
            this._panoramaLog('ARCHIVE', agentName, `Archive Error: ${e.message}`, 'ERROR');
        }
    }

    _simplifyContent(content) {
        if (!content) return '';
        let text = typeof content === 'string' ? content : (Array.isArray(content) ? content.map(c => c.text || '').join(' ') : String(content));
        return text
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<div[\s\S]*?>/gi, ' ')
            .replace(/<\/div>/gi, ' ')
            .replace(/<!-- [\s\S]*? -->/g, '')
            .replace(/<<<\[TOOL_REQUEST\]>>>[\s\S]*?<<<\[END_TOOL_REQUEST\]>>>/g, '[TOOL调用]')
            .replace(/\[\[(.*?)\]\]/g, '“$1”')
            .replace(/%%(.*?)%%/g, '“$1”')
            .replace(/<[^>]*>/g, '')
            .replace(/[^\u4e00-\u9fa5\x20-\x7E\u3000-\u303f\uff00-\uffef\n\r\t]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    _formatMessage(role, content, agentName) {
        const timestamp = new Date().toLocaleString();
        const displayRole = (role === 'user') ? '述' : '荧';
        return `# [${timestamp}]\n[${displayRole}]: ${content}`;
    }

    async syncHistory(agentName, messages, isReadOnly = false) {
        if (!agentName || !messages || isReadOnly) return;
        await this.ensureAgentFile(agentName);

        const filePath = path.join(this.historyDir, `${agentName}.txt`);
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const incoming = messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: this._simplifyContent(m.content) }))
                .filter(m => m.content.length > 0);

            if (incoming.length === 0) return;

            let entries = fileContent.split('--------------------------------------------------\n').map(e => e.trim()).filter(Boolean);
            const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;

            let startIndex = 0;
            if (lastEntry) {
                for (let i = incoming.length - 1; i >= 0; i--) {
                    if (incoming[i].content.length > 10 && lastEntry.includes(incoming[i].content)) {
                        startIndex = i + 1;
                        break;
                    }
                }
            }

            const pending = incoming.slice(startIndex);
            if (pending.length > 0) {
                // 注入新条目
                const newFormattedEntries = pending.map(m => this._formatMessage(m.role, m.content, agentName));
                entries.push(...newFormattedEntries);

                // 🌟 滑动窗口处理
                if (entries.length > this.maxRounds) {
                    const overflowCount = entries.length - this.maxRounds;
                    const overflow = entries.splice(0, overflowCount);
                    await this._archiveOverflow(agentName, overflow);
                    this._panoramaLog('SYNC', agentName, `Sliding window active: Moved ${overflowCount} entries to Archive.`);
                }

                const finalText = entries.join('\n--------------------------------------------------\n') + '\n--------------------------------------------------\n';
                await fs.writeFile(filePath, finalText, 'utf-8');
                this._panoramaLog('SYNC', agentName, `Synchronized ${pending.length} new messages. Main history size: ${entries.length}`);
            }
        } catch (e) {
            this._panoramaLog('SYNC', agentName, `Sync Error: ${e.message}`, 'ERROR');
        }
    }

    async processRecentMemo(agentName, rawRounds, rawMode) {
        const mode = String(rawMode || 'normal').trim().toLowerCase();
        const rounds = parseInt(rawRounds) || 5;

        this._panoramaLog('PROCESS', agentName, `Requesting History (PURE) -> Rounds: ${rounds}, Mode: ${mode}`);
        
        if (mode === 'aisum') {
            return await this._processAISummary(agentName, rounds);
        }

        return await this.getRecentContext(agentName, rounds, true);
    }

    async _processAISummary(agentName, rawRounds) {
        const fullHistory = await this.getRecentContext(agentName, 200, false); 
        if (!fullHistory || fullHistory.length < 50) {
            return await this.getRecentContext(agentName, rawRounds, true);
        }
        
        const summary = await this._callIndependentAI(`请对以下对话历史进行全量总结：\n\n${fullHistory}`);
        const summaryPath = path.join(this.historyDir, `${agentName}_Summary.txt`);
        
        try {
            await fs.writeFile(summaryPath, summary, 'utf8');
        } catch (e) {}

        const recent = await this.getRecentContext(agentName, rawRounds, false);
        return `### 🧠 记忆概溯\n${summary}\n\n### 📝 最近${rawRounds}轮记录\n${recent}`;
    }

    async _callIndependentAI(prompt) {
        const apiKey = process.env.API_Key;
        const apiUrl = process.env.API_URL;
        const model = process.env.RecentMemo_Model || 'gemini-3-flash';

        if (!apiKey || !apiUrl) return '[总结不可用: 缺少API配置]';

        try {
            const response = await axios.post(`${apiUrl}/v1/chat/completions`, {
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                timeout: 90000
            });
            return response.data?.choices[0]?.message?.content || '[内容为空]';
        } catch (e) {
            return `[总结失败: ${e.message}]`;
        }
    }

    async getRecentContext(agentName, rounds, includeSummary = true) {
        const filePath = path.join(this.historyDir, `${agentName}.txt`);
        const summaryPath = path.join(this.historyDir, `${agentName}_Summary.txt`);
        
        try {
            let result = '';
            if (includeSummary) {
                try {
                    const summary = await fs.readFile(summaryPath, 'utf-8');
                    if (summary.trim()) result += `### 🧠 记忆摘要\n${summary}\n\n`;
                } catch (e) {}
            }

            let content = '';
            try {
                content = await fs.readFile(filePath, 'utf-8');
            } catch (e) {
                return result || '[无历史记录]';
            }

            const entries = content.split('--------------------------------------------------\n').map(e => e.trim()).filter(Boolean);
            
            let recent = [];
            let displayTitle = '';

            // 🌟 严格支持 NN-NN 范围语法 (例如 01-20)
            const rangeMatch = String(rounds).match(/^(\d+)-(\d+)$/);
            if (rangeMatch) {
                const startIdx = Math.max(0, parseInt(rangeMatch[1]) - 1);
                const endIdx = parseInt(rangeMatch[2]);
                recent = entries.slice(startIdx, endIdx);
                displayTitle = `### 📝 历史记录 [第${startIdx + 1}轮 至 第${endIdx}轮] (共${recent.length}条)\n`;
            } else {
                const count = parseInt(rounds) || 5;
                recent = entries.slice(Math.max(0, entries.length - count));
                displayTitle = `### 📝 最近${recent.length}轮对话\n`;
            }
            
            if (recent.length > 0) {
                result += displayTitle + recent.join('\n--------------------------------------------------\n') + '\n';
            } else {
                result += '[暂无对话详情]\n';
            }
            return result;
        } catch (e) { 
            return '[加载异常]'; 
        }
    }
}

module.exports = RecentMemoManager;
