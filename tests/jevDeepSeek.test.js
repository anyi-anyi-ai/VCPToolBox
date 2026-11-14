'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const planner = require('../modules/jevToolCallExp');

test('JEV 成功将联网搜索中的 DeepSeek 别名映射为 DeepSeekSearch 插件调用', async () => {
    const calls = await planner.plan('JEV:「始」请使用 {联网搜索} 中的 DeepSeek，围绕【2026年最新AI进展】。「末」');
    
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'DeepSeekSearch');
    assert.equal(calls[0].args.command, 'DeepSeekSearch');
    assert.equal(calls[0].args.query, '2026年最新AI进展');
    assert.equal(calls[0].args.format, 'markdown');
});

test('JEV 支持 DeepSeek 别名与约束参数（抓取正文与数量）', async () => {
    const calls = await planner.plan('JEV:「始」请使用 {联网搜索} 中的 深度求索，围绕【Transformer架构优化】，并参考[抓取正文, 5条]。「末」');
    
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'DeepSeekSearch');
    assert.equal(calls[0].args.command, 'DeepSeekSearch');
    assert.equal(calls[0].args.query, 'Transformer架构优化');
    assert.equal(calls[0].args.need_content, 'true');
    assert.equal(calls[0].args.count, '5');
});
