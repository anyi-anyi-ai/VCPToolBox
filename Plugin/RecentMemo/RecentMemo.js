// Plugin/RecentMemo/RecentMemo.js
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const RecentMemoManager = require('./RecentMemoManager.js');

class RecentMemoPlugin {
    constructor() {
        this.name = 'RecentMemo';
        this.recentMemoManager = null;
        this.isInitialized = false;
    }

    async initialize(config, dependencies) {
        try {
            console.log('\x1b[42m[RecentMemo] 🚀 Initializing PURE Mode (No AIMemo)...\x1b[0m');
            this.recentMemoManager = new RecentMemoManager(__dirname);
            this.isInitialized = true;
            
            if (!fsSync.existsSync(path.join(__dirname, 'logs'))) {
                fsSync.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
            }
            fsSync.writeFileSync(path.join(__dirname, 'logs', 'LIVE_PROBE.log'), `LAST_START: ${new Date().toLocaleString()} [PURE_MODE]\n`);
        } catch (e) {
            console.error('[RecentMemo] Init Error:', e);
        }
    }

    _purifyMessageContent(text) {
        if (!text || typeof text !== 'string') return text;
        return text
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
            .replace(/[^\u4e00-\u9fa5\x20-\x7E\u3000-\u303f\uff00-\uffef\n\r\t%\[\]:：。，？！]/g, ' ')
            .replace(/ {2,}/g, ' ')
            .trim();
    }

    async processMessages(messages, pluginConfig) {
        if (!this.isInitialized || !this.recentMemoManager) return messages;

        // 🌟 物理隔离拦截：如果没有检测到 License，立即秒退，不进行任何读写/同步
        const hasLicense = messages.some(m => /\[\[RecentMemo=True\]\]/i.test(String(m.content || '')));
        if (!hasLicense) return messages;

        try {
            // 还原被注释的标签
            for (let i = 0; i < messages.length; i++) {
                if (typeof messages[i].content === 'string') {
                    messages[i].content = messages[i].content
                        .replace(/<!-- RECENT_MEMO_PERSISTENT_START (.*?) -->[\s\S]*?<!-- RECENT_MEMO_PERSISTENT_END -->/g, '$1')
                        .replace(/<!-- AIMEMO_PERSISTENT_START (.*?) -->[\s\S]*?<!-- AIMEMO_PERSISTENT_END -->/g, '$1');
                }
            }

            let isLicensed = false;
            const activeAgents = new Set();
            const tagsInvolved = [];

            for (const m of messages) {
                const text = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                const cleanText = this._purifyMessageContent(text);

                if (/\[\[RecentMemo=True\]\]/i.test(cleanText)) isLicensed = true;

                const matches = cleanText.match(/%%RecentMemo::[^%]+%%/gi) || [];
                for (const tag of matches) {
                    try {
                        const cleanTag = tag.replace(/%%/gi, '');
                        const parts = cleanTag.split('::');
                        const name = (parts[1] || '').trim();
                        const rounds = (parts[2] || '5').trim();
                        let mode = (parts[3] || 'normal').trim().toLowerCase();
                        if (mode.includes('aimemo') || mode === '004') mode = 'normal';

                        if (name && name.toLowerCase() !== 'unknown') {
                            tagsInvolved.push({ tag, name, rounds, mode });
                            if (mode !== 'read') activeAgents.add(name);
                        }
                    } catch (e) {}
                }
            }

            // 🌟 核心修正：如果没有许可标记，立即退出，不再执行同步逻辑
            if (!isLicensed) return messages;

            if (activeAgents.size > 0) {
                for (const name of activeAgents) {
                    await this.recentMemoManager.syncHistory(name, messages, false);
                }
                this._engageHighFidelityTracker(activeAgents, messages);
            }

            const targetIndices = messages.reduce((acc, m, idx) => {
                if (m.role === 'system' && typeof m.content === 'string' && m.content.includes('%%RecentMemo::')) acc.push(idx);
                return acc;
            }, []);

            if (targetIndices.length === 0) return messages;

            const newMessages = JSON.parse(JSON.stringify(messages));
            for (const idx of targetIndices) {
                newMessages[idx].content = await this._processSingleSystemMessage(newMessages[idx].content);
            }

            return newMessages;

        } catch (e) {
            console.error('[RecentMemo] Runtime Error:', e);
            return messages;
        }
    }

    async _processSingleSystemMessage(content) {
        let processed = content;
        const tags = processed.match(/%%RecentMemo::[^%]+%%/gi) || [];
        for (const tag of tags) {
            try {
                const cleanTag = tag.replace(/%%/gi, '');
                const parts = cleanTag.split('::');
                const agentName = (parts[1] || '').trim();
                const rounds = (parts[2] || '5').trim();
                // 🌟 使用专门的解析逻辑获取指定范围的内容
                const result = await this.recentMemoManager.getRecentContext(agentName, rounds, true);
                const persistent = `<!-- RECENT_MEMO_PERSISTENT_START ${tag} -->\n${result}\n<!-- RECENT_MEMO_PERSISTENT_END -->`;
                processed = processed.split(tag).join(persistent);
            } catch (e) {
                console.error(`[RecentMemo] Error processing tag ${tag}:`, e);
            }
        }
        return processed;
    }

    _engageHighFidelityTracker(agentNames, messagesRef) {
        const startTime = Date.now();
        const initialLen = messagesRef.length;
        const track = async () => {
            if (Date.now() - startTime > 600000) return;
            const curLen = messagesRef.length;
            if (curLen > initialLen && messagesRef[curLen - 1].role === 'assistant') {
                for (const name of agentNames) {
                    await this.recentMemoManager.syncHistory(name, messagesRef, false);
                }
                return;
            }
            setTimeout(track, 3000);
        };
        setTimeout(track, 3000);
    }

    shutdown() {}
}

module.exports = new RecentMemoPlugin();
