#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Solar } = require('lunar-javascript');

// ============================================
// 梅花易数起卦插件 v2.2 (修复二进制定义)
// Author: Nova & 小夜
// ============================================

// --- 基础数据定义 ---

// 先天八卦：二进制从下到上（索引0=初爻，1=二爻，2=三爻），1=阳，0=阴
const TRIGRAM_MAP = {
    1: { name: '乾', symbol: '☰', element: '金', binary: [1, 1, 1] }, // 三阳
    2: { name: '兑', symbol: '☱', element: '金', binary: [1, 1, 0] }, // 上缺（初阳、二阳、三阴）
    3: { name: '离', symbol: '☲', element: '火', binary: [1, 0, 1] }, // 中虚（初阳、二阴、三阳）
    4: { name: '震', symbol: '☳', element: '木', binary: [1, 0, 0] }, // 一阳在下（初阳、二阴、三阴）
    5: { name: '巽', symbol: '☴', element: '木', binary: [0, 1, 1] }, // 一阴在下（初阴、二阳、三阳）
    6: { name: '坎', symbol: '☵', element: '水', binary: [0, 1, 0] }, // 中满（初阴、二阳、三阴）
    7: { name: '艮', symbol: '☶', element: '土', binary: [0, 0, 1] }, // 一阳在上（初阴、二阴、三阳）
    8: { name: '坤', symbol: '☷', element: '土', binary: [0, 0, 0] }  // 三阴
};

const WUXING = {
    generates: { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' },
    overcomes: { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
};

const HEXAGRAM_LOOKUP = {};
let hexagramData = [];

try {
    const dataPath = path.join(__dirname, 'dataset', '64hexagrams.json');
    hexagramData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    hexagramData.forEach(hex => {
        const key = hex.upper_trigram.name + '-' + hex.lower_trigram.name;
        HEXAGRAM_LOOKUP[key] = hex;
    });
} catch (e) {
    console.error('[梅花易数] 数据集加载失败:', e.message);
}

// --- 核心计算函数 ---

function numberToTrigram(num) {
    let r = ((num % 8) + 8) % 8;
    if (r === 0) r = 8;
    return { ...TRIGRAM_MAP[r], number: r };
}

function getChangingLine(n1, n2) {
    let r = ((n1 + n2) % 6 + 6) % 6;
    if (r === 0) r = 6;
    return r; // 1-6，1=初爻，6=上爻
}

// 二进制转先天数（修正版）
// binary: [初爻, 二爻, 三爻]，1=阳，0=阴
function binaryToNumber(binary) {
    // val = 初爻*1 + 二爻*2 + 三爻*4
    const val = binary[0] * 1 + binary[1] * 2 + binary[2] * 4;
    // 映射到先天数
    const map = {
        0: 8, // 坤 ☷ [0,0,0] 坤六断
        1: 4, // 艮 ☶ [1,0,0] 艮覆碗
        2: 6, // 坎 ☵ [0,1,0] 坎中满
        3: 2, // 巽 ☴ [1,1,0] 巽下断
        4: 7, // 震 ☳ [0,0,1] 震仰盂
        5: 3, // 离 ☲ [1,0,1] 离中虚
        6: 5, // 兑 ☱ [0,1,1] 兑上缺
        7: 1  // 乾 ☰ [1,1,1] 乾三连
    };
    return map[val] || 1;
}

// 获取变卦：动爻阴阳翻转
function getChangedHexagram(originalHex, changingLine) {
    const upperBinary = [...TRIGRAM_MAP[originalHex.upper_trigram.number].binary];
    const lowerBinary = [...TRIGRAM_MAP[originalHex.lower_trigram.number].binary];
    
    if (changingLine >= 4) {
        // 上卦：4爻=idx0, 5爻=idx1, 6爻=idx2
        const idx = changingLine - 4; // 4->0, 5->1, 6->2
        upperBinary[idx] = upperBinary[idx] === 1 ? 0 : 1;
    } else {
        // 下卦：3爻(六三)=idx2, 2爻(六二)=idx1, 1爻(初六)=idx0
        const idx = changingLine - 1; // 1->0, 2->1, 3->2
        lowerBinary[idx] = lowerBinary[idx] === 1 ? 0 : 1;
    }
    
    const upperNum = binaryToNumber(upperBinary);
    const lowerNum = binaryToNumber(lowerBinary);
    
    // 安全检查
    if (!TRIGRAM_MAP[upperNum] || !TRIGRAM_MAP[lowerNum]) {
        console.error('[梅花易数] 变卦计算错误:', upperNum, lowerNum, upperBinary, lowerBinary);
        return null;
    }
    
    const upper = TRIGRAM_MAP[upperNum];
    const lower = TRIGRAM_MAP[lowerNum];
    const key = upper.name + '-' + lower.name;
    
    return HEXAGRAM_LOOKUP[key] || null;
}

function getMutualHexagram(originalHex) {
    const upperBinary = TRIGRAM_MAP[originalHex.upper_trigram.number].binary;
    const lowerBinary = TRIGRAM_MAP[originalHex.lower_trigram.number].binary;
    const line2 = lowerBinary[1];
    const line3 = lowerBinary[2];
    const line4 = upperBinary[0];
    const line5 = upperBinary[1];
    const mutualLowerBinary = [line2, line3, line4];
    const mutualUpperBinary = [line3, line4, line5];
    const upperNum = binaryToNumber(mutualUpperBinary);
    const lowerNum = binaryToNumber(mutualLowerBinary);
    const upper = TRIGRAM_MAP[upperNum];
    const lower = TRIGRAM_MAP[lowerNum];
    if (!upper || !lower) {
        return null;
    }
    const key = upper.name + '-' + lower.name;
    return HEXAGRAM_LOOKUP[key] || null;
}

function analyzeBodyUse(originalHex, changingLine) {
    let bodyTrigram, useTrigram;
    if (changingLine >= 4) {
        useTrigram = originalHex.upper_trigram;
        bodyTrigram = originalHex.lower_trigram;
    } else {
        useTrigram = originalHex.lower_trigram;
        bodyTrigram = originalHex.upper_trigram;
    }

    const bodyEl = bodyTrigram.element;
    const useEl = useTrigram.element;
    let relationship, fortune;

    if (bodyEl === useEl) {
        relationship = '体用比和';
        fortune = '平稳顺遂，事可成';
    } else if (WUXING.generates[useEl] === bodyEl) {
        relationship = '用生体';
        fortune = '大吉，得外力相助，事易成';
    } else if (WUXING.generates[bodyEl] === useEl) {
        relationship = '体生用';
        fortune = '有所付出消耗，需谨慎行事';
    } else if (WUXING.overcomes[bodyEl] === useEl) {
        relationship = '体克用';
        fortune = '吉，可掌控局面，小有收获';
    } else if (WUXING.overcomes[useEl] === bodyEl) {
        relationship = '用克体';
        fortune = '凶，受外力制约，阻碍较大';
    } else {
        relationship = '关系待定';
        fortune = '需结合具体情况分析';
    }

    return { body: bodyTrigram, use: useTrigram, bodyEl, useEl, relationship, fortune };
}

function divineByTime() {
    const now = new Date();
    const year = now.getFullYear();
    const lunar = Solar.fromDate(now).getLunar();
    const lunarMonthRaw = lunar.getMonth();
    const month = Math.abs(lunarMonthRaw);
    const day = lunar.getDay();
    const hour = now.getHours();
    const earthlyBranch = (year % 12) || 12;
    const shichen = Math.floor((hour + 1) / 2) % 12 + 1;
    const upperNum = earthlyBranch + month + day;
    const lowerNum = upperNum + shichen;
    const leapPrefix = lunarMonthRaw < 0 ? '闰' : '';
    return { number1: upperNum, number2: lowerNum, timeInfo: year + '年 农历' + leapPrefix + month + '月' + day + '日 ' + hour + '时（第' + shichen + '时辰）' };
}

function getYaoName(changingLine, isYang) {
    const positions = ['初', '二', '三', '四', '五', '上'];
    const type = isYang ? '九' : '六';
    if (changingLine === 1) return '初' + type;
    if (changingLine === 6) return type === '九' ? '上九' : '上六';
    return type + positions[changingLine - 1];
}

function renderYao(isYang, element, isChanging) {
    const colorClass = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' }[element] || 'metal';
    const glowClass = isChanging ? ' glow' : '';
    
    if (isYang) {
        return '<div class=\"yao-row\"><div class=\"yao-yang ' + colorClass + glowClass + '\"></div></div>';
    } else {
        return '<div class=\"yao-row\"><div class=\"yao-yin\"><div class=\"yao-yin-part ' + colorClass + glowClass + '\"></div><div class=\"yao-yin-part ' + colorClass + glowClass + '\"></div></div></div>';
    }
}

// 渲染六爻卦象（HTML从上到下 = 爻位从6到1）
function renderHexagram(upperTrigram, lowerTrigram, changingLine) {
    const upperBinary = TRIGRAM_MAP[upperTrigram.number].binary;
    const lowerBinary = TRIGRAM_MAP[lowerTrigram.number].binary;
    
    let html = '';
    
    // 上卦三爻（在HTML中显示在上部）：6爻(上九), 5爻(九五), 4爻(九四)
    for (let i = 2; i >= 0; i--) {
        const yaoNum = 4 + i; // i=2->6, i=1->5, i=0->4
        html += renderYao(upperBinary[i] === 1, upperTrigram.element, yaoNum === changingLine);
    }
    
    // 下卦三爻（在HTML中显示在下部）：3爻(六三), 2爻(六二), 1爻(初六)
    for (let i = 2; i >= 0; i--) {
        const yaoNum = 1 + i; // i=2->3, i=1->2, i=0->1
        html += renderYao(lowerBinary[i] === 1, lowerTrigram.element, yaoNum === changingLine);
    }
    
    return html;
}

function renderTrigram(trigram) {
    const binary = TRIGRAM_MAP[trigram.number].binary;
    let html = '';
    for (let i = 2; i >= 0; i--) {
        html += renderYao(binary[i] === 1, trigram.element, false);
    }
    return html;
}

async function handleRequest(args) {
    if (hexagramData.length === 0) {
        return { status: 'error', error: '64卦数据集加载失败' };
    }

    const command = args.command || ((args.number1 !== undefined && args.number2 !== undefined) ? 'divine_by_numbers' : undefined);
    let num1, num2, extraInfo = '';

    switch (command) {
        case 'divine_by_numbers':
            num1 = parseInt(args.number1);
            num2 = parseInt(args.number2);
            if (isNaN(num1) || isNaN(num2)) {
                return { status: 'error', error: '请提供两个有效数字' };
            }
            extraInfo = '报数起卦：' + num1 + ', ' + num2;
            break;
        case 'divine_by_time': {
            const t = divineByTime();
            num1 = t.number1;
            num2 = t.number2;
            extraInfo = '时间起卦：' + t.timeInfo;
            break;
        }
        case 'divine_random':
            num1 = Math.floor(Math.random() * 999) + 1;
            num2 = Math.floor(Math.random() * 999) + 1;
            extraInfo = '随机天机数：' + num1 + ', ' + num2;
            break;
        default:
            return { status: 'error', error: '未知命令: ' + command };
    }

    // 计算
    const upper = numberToTrigram(num1);
    const lower = numberToTrigram(num2);
    const hexKey = upper.name + '-' + lower.name;
    const originalHex = HEXAGRAM_LOOKUP[hexKey];
    if (!originalHex) {
        return { status: 'error', error: '未找到卦象: ' + hexKey };
    }

    const changingLine = getChangingLine(num1, num2);
    const mutualHex = getMutualHexagram(originalHex);
    const changedHex = getChangedHexagram(originalHex, changingLine);
    const bodyUse = analyzeBodyUse(originalHex, changingLine);
    
    const lineText = originalHex.line_texts[changingLine - 1] || '无对应爻辞';
    
    // 判断动爻阴阳
    let isYang;
    if (changingLine >= 4) {
        isYang = TRIGRAM_MAP[originalHex.upper_trigram.number].binary[changingLine - 4] === 1;
    } else {
        isYang = TRIGRAM_MAP[originalHex.lower_trigram.number].binary[changingLine - 1] === 1;
    }
    const yaoName = getYaoName(changingLine, isYang);

    // 构建HTML输出
    const styleDef = '<style>' +
        '.yao-row { display: flex; justify-content: center; margin: 6px 0; height: 12px; }' +
        '.yao-yang { width: 70px; border-radius: 2px; }' +
        '.yao-yin { width: 70px; display: flex; justify-content: space-between; }' +
        '.yao-yin-part { width: 30px; border-radius: 2px; }' +
        '.glow { animation: yao-breathe 2s ease-in-out infinite; }' +
        '@keyframes yao-breathe { 0%, 100% { filter: drop-shadow(0 0 8px currentColor) brightness(1.2); } 50% { filter: drop-shadow(0 0 2px currentColor) brightness(0.9); } }' +
        '.metal { background-color: #d4af37; }' +
        '.wood { background-color: #4caf50; }' +
        '.fire { background-color: #f44336; }' +
        '.water { background-color: #2196f3; }' +
        '.earth { background-color: #8d6e63; }' +
        '</style>';

    const htmlOutput = '<div style=\"font-family: \'Noto Serif SC\', \'SimSun\', serif; background: linear-gradient(135deg, #faf6ed 0%, #f5ecd8 100%); padding: 24px; border-radius: 16px; border: 2px solid #d4af37; box-shadow: 0 8px 32px rgba(139, 69, 19, 0.15); max-width: 980px; margin: 0 auto; color: #5d4037;\">' +
        styleDef +
        '<div style=\"text-align: center; font-size: 24px; font-weight: bold; color: #8b4513; margin-bottom: 20px; letter-spacing: 2px;\">梅花易数占验</div>' +
        
        '<div style=\"display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px;\">' +
            '<div style=\"flex: 1; background: rgba(255,255,255,0.6); padding: 16px; border-radius: 12px; text-align: center;\">' +
                '<div style=\"font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #3e2723;\">本卦：' + originalHex.full_name + '</div>' +
                '<div style=\"margin-bottom: 16px;\">' + renderHexagram(upper, lower, changingLine) + '</div>' +
                '<div style=\"font-size: 12px; text-align: left; background: rgba(212, 175, 55, 0.1); padding: 8px; border-radius: 6px; line-height: 1.5;\">' +
                    '<b>卦辞：</b>' + originalHex.hexagram_text +
                '</div>' +
            '</div>' +
            
            '<div style=\"display: flex; align-items: center; color: #d4af37; font-size: 24px; font-weight: bold;\">→</div>' +

            '<div style=\"flex: 1; background: rgba(255,255,255,0.6); padding: 16px; border-radius: 12px; text-align: center;\">' +
                '<div style=\"font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #3e2723;\">互卦：' + (mutualHex ? mutualHex.full_name : '未知') + '</div>' +
                '<div style=\"margin-bottom: 16px;\">' +
                    (mutualHex ? renderHexagram(
                        mutualHex.upper_trigram,
                        mutualHex.lower_trigram,
                        0
                    ) : '<div style=\"color:#999;\">无法计算互卦</div>') +
                '</div>' +
                '<div style=\"font-size: 12px; text-align: left; background: rgba(212, 175, 55, 0.1); padding: 8px; border-radius: 6px; line-height: 1.5;\">' +
                    '<b>卦辞：</b>' + (mutualHex ? mutualHex.hexagram_text : '无') +
                '</div>' +
            '</div>' +

            '<div style=\"display: flex; align-items: center; color: #d4af37; font-size: 24px; font-weight: bold;\">→</div>' +
            
            '<div style=\"flex: 1; background: rgba(255,255,255,0.6); padding: 16px; border-radius: 12px; text-align: center;\">' +
                '<div style=\"font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #3e2723;\">变卦：' + (changedHex ? changedHex.full_name : '未知') + '</div>' +
                '<div style=\"margin-bottom: 16px;\">' +
                    (changedHex ? renderHexagram(
                        changedHex.upper_trigram,
                        changedHex.lower_trigram,
                        0
                    ) : '<div style=\"color:#999;\">无法计算变卦</div>') +
                '</div>' +
                '<div style=\"font-size: 12px; text-align: left; background: rgba(212, 175, 55, 0.1); padding: 8px; border-radius: 6px; line-height: 1.5;\">' +
                    '<b>卦辞：</b>' + (changedHex ? changedHex.hexagram_text : '无') +
                '</div>' +
            '</div>' +
        '</div>' +
        
        '<div style=\"background: #fff3e0; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800;\">' +
            '<div style=\"font-weight: bold; color: #e65100; margin-bottom: 6px; font-size: 15px;\">动爻：' + yaoName + '</div>' +
            '<div style=\"font-style: italic; font-size: 14px; color: #5d4037;\">\"' + lineText + '\"</div>' +
        '</div>' +
        
        '<div style=\"background: rgba(255,255,255,0.6); padding: 16px; border-radius: 12px;\">' +
            '<div style=\"text-align: center; font-weight: bold; margin-bottom: 16px; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 8px; color: #8b4513;\">体用分析</div>' +
            '<div style=\"display: flex; justify-content: space-around; align-items: center; margin-bottom: 16px;\">' +
                '<div style=\"text-align: center;\">' +
                    '<div style=\"font-size: 13px; font-weight: bold; margin-bottom: 8px; color: ' + (bodyUse.bodyEl === '火' ? '#c62828' : bodyUse.bodyEl === '木' ? '#2e7d32' : bodyUse.bodyEl === '水' ? '#1565c0' : bodyUse.bodyEl === '金' ? '#f57f17' : '#5d4037') + ';\">体卦·' + bodyUse.body.name + bodyUse.bodyEl + '</div>' +
                    renderTrigram(bodyUse.body) +
                '</div>' +
                
                '<div style=\"font-weight: bold; color: ' + (bodyUse.relationship.includes('克') ? '#d32f2f' : bodyUse.relationship.includes('生') ? '#2e7d32' : '#8b4513') + '; background: ' + (bodyUse.relationship.includes('克') ? '#ffebee' : bodyUse.relationship.includes('生') ? '#e8f5e9' : '#fff8e1') + '; padding: 4px 12px; border-radius: 12px; border: 1px solid ' + (bodyUse.relationship.includes('克') ? '#ffcdd2' : bodyUse.relationship.includes('生') ? '#c8e6c9' : '#ffe082') + '; font-size: 14px;\">' +
                    bodyUse.relationship +
                '</div>' +

                '<div style=\"text-align: center;\">' +
                    '<div style=\"font-size: 13px; font-weight: bold; margin-bottom: 8px; color: ' + (bodyUse.useEl === '火' ? '#c62828' : bodyUse.useEl === '木' ? '#2e7d32' : bodyUse.useEl === '水' ? '#1565c0' : bodyUse.useEl === '金' ? '#f57f17' : '#5d4037') + ';\">用卦·' + bodyUse.use.name + bodyUse.useEl + '</div>' +
                    renderTrigram(bodyUse.use) +
                '</div>' +
            '</div>' +
            '<div style=\"text-align: center; font-size: 13px; background: rgba(255,255,255,0.8); padding: 8px; border-radius: 6px; color: #5d4037;\">' +
                '<b>断语：</b>' + bodyUse.fortune +
            '</div>' +
        '</div>' +
    '</div>';

    return {
        status: 'success',
        result: {
            content: [{ type: 'text', text: "请用HTML渲染" + htmlOutput }],
            details: {
                method: command,
                numbers: { num1, num2 },
                originalHexagram: originalHex,
                changingLine: changingLine,
                changingLineName: yaoName,
                changingLineText: lineText,
                mutualHexagram: mutualHex,
                changedHexagram: changedHex,
                bodyUseAnalysis: bodyUse
            }
        }
    };
}

module.exports = { handleRequest };

async function main() {
    let inputChunks = [];
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) {
        inputChunks.push(chunk);
    }
    const inputData = inputChunks.join('');
    try {
        if (!inputData.trim()) {
            throw new Error('No input data received from stdin.');
        }
        let parsedArgs;
        try {
            parsedArgs = JSON.parse(inputData);
        } catch (_) {
            const parts = inputData.trim().split(/[\s,]+/).filter(Boolean);
            if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
                parsedArgs = { command: 'divine_by_numbers', number1: Number(parts[0]), number2: Number(parts[1]) };
            } else {
                throw new Error('输入必须是JSON，或两个数字（空格/逗号分隔）');
            }
        }

        if (Array.isArray(parsedArgs) && parsedArgs.length === 2) {
            parsedArgs = { command: 'divine_by_numbers', number1: Number(parsedArgs[0]), number2: Number(parsedArgs[1]) };
        }

        const resultObject = await handleRequest(parsedArgs || {});
        console.log(JSON.stringify(resultObject));
    } catch (e) {
        console.log(JSON.stringify({ status: 'error', error: 'PlumBlossomDivination Error: ' + e.message }));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
