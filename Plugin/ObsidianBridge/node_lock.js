'use strict';
// ============================================================
// node_lock.js  --  按笔记路径的跨进程排他锁
//
// 为什么必须是文件锁: VCPToolBox 以 pluginType=synchronous + stdio 调用本插件,
// 每次工具调用都 fork 一个新的 node 进程。进程一死内存状态即消失,
// 任何 let locked = true 之类的内存锁完全无效。
//
// 原语: fs.openSync(path, 'wx') —— 排他创建, 文件已存在则抛 EEXIST。
// 这是 POSIX 与 Windows 上都成立的原子操作, 比 exists 后 create 可靠。
// ============================================================

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const LOCK_DIR = path.join(os.tmpdir(), 'vcp-obsidian-node-locks');
const STALE_MS = 30000;   // 略高于 execCLI 的 25s 超时, 防进程崩溃后死锁
const WAIT_MS = 15000;    // 最长等待
const POLL_MS = 60;

function lockPathFor(notePath) {
    const h = crypto.createHash('sha1').update(String(notePath)).digest('hex').slice(0, 16);
    return path.join(LOCK_DIR, h + '.lock');
}

function ensureDir() {
    try { fs.mkdirSync(LOCK_DIR, { recursive: true }); } catch (_) { /* 已存在 */ }
}

function readHolder(lp) {
    try { return JSON.parse(fs.readFileSync(lp, 'utf-8')); } catch (_) { return null; }
}

// 持有者进程是否还活着。ESRCH = 不存在; EPERM = 存在但无权限(仍算活)
function alive(pid) {
    if (!pid) return false;
    try { process.kill(pid, 0); return true; }
    catch (e) { return e.code === 'EPERM'; }
}

function tryTake(lp, notePath) {
    try {
        const fd = fs.openSync(lp, 'wx');
        fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: Date.now(), note: notePath }));
        fs.closeSync(fd);
        return true;
    } catch (e) {
        if (e.code !== 'EEXIST') throw e;
        // 已被占用: 判断是否为陈旧锁
        const h = readHolder(lp);
        const expired = !h || (Date.now() - (h.at || 0) > STALE_MS);
        const dead = h && !alive(h.pid);
        if (expired || dead) {
            try { fs.unlinkSync(lp); } catch (_) { /* 被别人抢先清了 */ }
            try {
                const fd2 = fs.openSync(lp, 'wx');
                fs.writeSync(fd2, JSON.stringify({ pid: process.pid, at: Date.now(), note: notePath, reclaimed: true }));
                fs.closeSync(fd2);
                return true;
            } catch (_) { return false; }
        }
        return false;
    }
}

// 同步阻塞等待。同步是刻意的: 整个插件是同步 stdio 模型,
// 引入 async 会让锁的持有边界与 handler 的执行边界错位。
function acquire(notePath) {
    ensureDir();
    const lp = lockPathFor(notePath);
    const deadline = Date.now() + WAIT_MS;
    for (;;) {
        if (tryTake(lp, notePath)) return { path: lp, note: notePath };
        if (Date.now() >= deadline) {
            const h = readHolder(lp);
            const e = new Error(
                '获取写锁超时(' + (WAIT_MS / 1000) + 's): "' + notePath + '" 正被另一次节点操作占用' +
                (h && h.pid ? '(PID ' + h.pid + ')' : '') +
                '。请稍后重试; 若确信无并发操作, 可删除锁文件 ' + lp
            );
            e.isLockTimeout = true;
            throw e;
        }
        // 同步忙等: Atomics.wait 不占 CPU, 且不依赖任何外部命令
        try {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
        } catch (_) {
            const t = Date.now() + POLL_MS;
            while (Date.now() < t) { /* 退化忙等 */ }
        }
    }
}

function release(handle) {
    if (!handle || !handle.path) return;
    const h = readHolder(handle.path);
    // 只释放自己持有的锁: 若已被回收并被他人取得, 不可误删
    if (h && h.pid && h.pid !== process.pid) return;
    try { fs.unlinkSync(handle.path); } catch (_) { /* 已释放 */ }
}

// 包裹执行, 保证异常路径也解锁
function withLock(notePath, fn) {
    const handle = acquire(notePath);
    try { return fn(); }
    finally { release(handle); }
}

module.exports = { acquire, release, withLock, LOCK_DIR, STALE_MS, WAIT_MS };
