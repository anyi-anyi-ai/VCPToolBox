#!/usr/bin/env node

import pkg from 'NeteaseCloudMusicApi';
const { login_cellphone, captcha_sent, login_qr_key, login_qr_create, login_qr_check, cloudsearch, song_url_v1, song_detail, lyric } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COOKIE_FILE = path.join(__dirname, 'cookie.txt');

// ── stdin ──────────────────────────────────────────────

async function readInput() {
    let data = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) {
        data += chunk;
    }
    return data;
}

// ── Cookie Persistence ─────────────────────────────────

async function loadCookie() {
    try {
        const cookie = await fs.readFile(COOKIE_FILE, 'utf-8');
        return cookie.trim() || null;
    } catch {
        return null;
    }
}

async function saveCookie(cookie) {
    await fs.writeFile(COOKIE_FILE, cookie, 'utf-8');
}

// ── Login ──────────────────────────────────────────────

async function ensureLogin() {
    // 1. 优先用缓存的 cookie 文件
    const cached = await loadCookie();
    if (cached) return cached;

    // 2. 其次检查 config.env 里直接配置的 MUSIC_U cookie
    const musicU = process.env.NETEASE_MUSIC_U;
    if (musicU) {
        const cookie = `MUSIC_U=${musicU}`;
        await saveCookie(cookie);
        return cookie;
    }

    // 3. 最后尝试手机号密码登录
    const phone = process.env.NETEASE_PHONE;
    const password = process.env.NETEASE_PASSWORD;

    if (!phone || !password) {
        throw new Error('请在 config.env 中配置 NETEASE_MUSIC_U（推荐）或 NETEASE_PHONE + NETEASE_PASSWORD');
    }

    const res = await login_cellphone({
        phone,
        password,
        countrycode: '86'
    });

    if (res.status !== 200 || !res.body?.cookie) {
        const msg = res.body?.msg || res.body?.message || '未知错误';
        throw new Error(`网易云登录失败: ${msg} (status: ${res.status})`);
    }

    await saveCookie(res.body.cookie);
    return res.body.cookie;
}

// ── Helpers ────────────────────────────────────────────

function formatDuration(ms) {
    if (!ms) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatFee(fee) {
    const map = { 0: '免费', 1: 'VIP', 4: '专辑付费', 8: '免费(含广告)' };
    return map[fee] ?? `type_${fee}`;
}

function parseLrcToPlain(lrc) {
    if (!lrc) return '';
    return lrc
        .split('\n')
        .map(line => line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim())
        .filter(Boolean)
        .join('\n');
}

// ── Player HTML Builder ──────────────────────────────

function buildPlayerHtml(data) {
    const safeData = JSON.stringify(data).replace(/<\//g, '<\\/');
    return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{overflow:hidden;background:#0b0b12;color:#eee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;-webkit-text-size-adjust:100%}
.bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(50px) brightness(0.25) saturate(1.2);z-index:0;pointer-events:none}
#app{position:relative;overflow:hidden;padding:clamp(12px,3vw,20px);padding-bottom:max(clamp(12px,3vw,20px),env(safe-area-inset-bottom))}
.head{position:relative;z-index:1;display:flex;align-items:center;gap:clamp(10px,3vw,16px)}
.cv{width:clamp(56px,15vw,76px);height:clamp(56px,15vw,76px);border-radius:10px;object-fit:cover;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,.5);background:#1a1a2e;animation:spin 20s linear infinite;animation-play-state:paused;transition:border-radius .6s}
.cv.on{animation-play-state:running;border-radius:50%}
@keyframes spin{to{transform:rotate(360deg)}}
.inf{flex:1;min-width:0}
.nm{font-size:clamp(15px,4.2vw,18px);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ar{font-size:clamp(12px,3.2vw,14px);color:#aaa;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qt{display:inline-block;font-size:10px;color:#1db954;border:1px solid rgba(29,185,84,.4);border-radius:4px;padding:1px 6px;margin-top:5px}
.ctrl{position:relative;z-index:1;display:flex;align-items:center;gap:clamp(8px,2.5vw,14px);margin-top:clamp(8px,2vw,14px)}
.pbtn{width:44px;height:44px;min-width:44px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s}
.pbtn:active{transform:scale(.93);background:rgba(255,255,255,.25)}
.pw{flex:1;display:flex;flex-direction:column;gap:4px}
.bar{width:100%;height:6px;background:rgba(255,255,255,.08);border-radius:3px;cursor:pointer;position:relative;touch-action:none}
.fill{height:100%;background:linear-gradient(90deg,#1db954,#1ed760);border-radius:3px;width:0;pointer-events:none}
.bar::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:50%;transform:translate(-50%,-50%);left:var(--pos,0%);opacity:0;transition:opacity .15s;pointer-events:none;box-shadow:0 0 6px rgba(0,0,0,.4)}
.bar.drag::after{opacity:1}
.tr{display:flex;justify-content:space-between;font-size:11px;color:#555}
.lb{position:relative;z-index:1;height:clamp(150px,28vw,200px);overflow-y:auto;-webkit-overflow-scrolling:touch;margin-top:clamp(6px,1.5vw,12px);padding:80px 0;-webkit-mask-image:linear-gradient(transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(transparent,#000 8%,#000 92%,transparent)}
.lb::-webkit-scrollbar{display:none}
.ll{padding:5px 8px;font-size:clamp(14px,3.8vw,16px);color:rgba(255,255,255,.25);transition:color .4s,transform .4s;text-align:center;line-height:1.7;transform:scale(1)}
.ll.on{color:#fff;transform:scale(1.06)}
.ll.tl{font-size:clamp(12px,3.2vw,14px);color:rgba(255,255,255,.15);padding-top:1px}
.ll.tl.on{color:rgba(255,255,255,.55)}
.nol{text-align:center;color:#444;padding-top:60px;font-size:14px}
</style>
</head>
<body>
<div id="app">
<div class="bg" id="bg"></div>
<div class="head"><img class="cv" id="cv" src="" alt=""><div class="inf"><div class="nm" id="nm"></div><div class="ar" id="ar"></div><span class="qt" id="qt"></span></div></div>
<div class="ctrl"><button class="pbtn" id="pbtn">&#9654;</button><div class="pw"><div class="bar" id="bar"><div class="fill" id="fill"></div></div><div class="tr"><span id="ct">0:00</span><span id="dt">0:00</span></div></div></div>
<div class="lb" id="lb"></div>
</div>
<audio id="au" preload="auto"></audio>
<script>
var D=\${safeData};
var au=document.getElementById('au'),pbtn=document.getElementById('pbtn'),bar=document.getElementById('bar'),fill=document.getElementById('fill'),ct=document.getElementById('ct'),dt=document.getElementById('dt'),lb=document.getElementById('lb'),cv=document.getElementById('cv');
if(D.cover){cv.src=D.cover+'?param=200y200';document.getElementById('bg').style.backgroundImage='url('+D.cover+'?param=500y500)';}
document.getElementById('nm').textContent=D.name;
document.getElementById('ar').textContent=D.artists+'  \\u00b7  '+D.album;
document.getElementById('qt').textContent=[D.qualityLabel,D.format,D.bitrateStr].filter(Boolean).join(' \\u00b7 ');
au.src=D.url;

function pLrc(s){if(!s)return[];var r=[];s.split('\\n').forEach(function(l){var ms=l.match(/\\[(\\d{2}):(\\d{2})\\.(\\d{2,3})\\]/g)||[];var txt=l.replace(/\\[\\d{2}:\\d{2}\\.\\d{2,3}\\]/g,'').trim();if(!txt)return;ms.forEach(function(m){var p=m.match(/(\\d{2}):(\\d{2})\\.(\\d{2,3})/);if(p){var t=parseInt(p[1])*60+parseInt(p[2])+parseInt(p[3].length===2?p[3]+'0':p[3])/1000;r.push({time:t,text:txt});}});});return r.sort(function(a,b){return a.time-b.time;});}

var oL=pLrc(D.lrc),tL=pLrc(D.tlrc),tM={};
tL.forEach(function(l){tM[l.time.toFixed(2)]=l.text;});

if(!oL.length){lb.innerHTML='<div class="nol">\\u266b \\u7eaf\\u97f3\\u4e50\\uff0c\\u8bf7\\u6b23\\u8d4f</div>';}else{oL.forEach(function(l,i){var e=document.createElement('div');e.className='ll';e.textContent=l.text;e.dataset.i=i;lb.appendChild(e);var tk=l.time.toFixed(2);if(tM[tk]){var te=document.createElement('div');te.className='ll tl';te.textContent=tM[tk];te.dataset.i=i;lb.appendChild(te);}});}

pbtn.onclick=function(){if(au.paused)au.play();else au.pause();};
au.onplay=function(){pbtn.innerHTML='\\u23f8';cv.classList.add('on');};
au.onpause=function(){pbtn.innerHTML='&#9654;';cv.classList.remove('on');};
au.onended=function(){pbtn.innerHTML='&#9654;';cv.classList.remove('on');};
au.onerror=function(){pbtn.innerHTML='\\u2715';pbtn.style.borderColor='#f44';};

function fmt(s){if(!s||isNaN(s))return'0:00';return Math.floor(s/60)+':'+('0'+Math.floor(s%60)).slice(-2);}
au.onloadedmetadata=function(){dt.textContent=fmt(au.duration);};

var lastI=-1;
au.ontimeupdate=function(){if(!au.duration)return;var pct=au.currentTime/au.duration*100;fill.style.width=pct+'%';bar.style.setProperty('--pos',pct+'%');ct.textContent=fmt(au.currentTime);if(!oL.length)return;var idx=-1;for(var i=oL.length-1;i>=0;i--){if(au.currentTime>=oL[i].time-0.15){idx=i;break;}}if(idx===lastI)return;lastI=idx;var all=lb.querySelectorAll('.ll');for(var j=0;j<all.length;j++)all[j].classList.remove('on');if(idx>=0){for(var j=0;j<all.length;j++){if(parseInt(all[j].dataset.i)===idx)all[j].classList.add('on');}var ae=lb.querySelector('.ll[data-i="'+idx+'"]:not(.tl)');if(ae){lb.scrollTo({top:ae.offsetTop-lb.clientHeight/2+ae.offsetHeight/2,behavior:'smooth'});}}};

bar.addEventListener('click',function(e){if(!au.duration)return;var r=bar.getBoundingClientRect();var p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));au.currentTime=p*au.duration;});
var drag=false;
bar.addEventListener('pointerdown',function(e){drag=true;bar.classList.add('drag');bar.setPointerCapture(e.pointerId);});
bar.addEventListener('pointermove',function(e){if(!drag||!au.duration)return;var r=bar.getBoundingClientRect();var p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));fill.style.width=p*100+'%';bar.style.setProperty('--pos',p*100+'%');ct.textContent=fmt(p*au.duration);});
bar.addEventListener('pointerup',function(e){if(!drag)return;drag=false;bar.classList.remove('drag');if(!au.duration)return;var r=bar.getBoundingClientRect();var p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));au.currentTime=p*au.duration;});

au.play().catch(function(){});
<\/script>
</body>
</html>`;
}

// ── Handlers ───────────────────────────────────────────

async function handleSearch(args, cookie) {
    const keywords = args.keywords || args.keyword || args.query;
    if (!keywords || typeof keywords !== 'string' || !keywords.trim()) {
        throw new Error('参数 "keywords" 是必需的，请提供搜索关键词。');
    }

    const limit = Math.min(Number(args.limit) || 10, 30);

    const res = await cloudsearch({
        keywords: keywords.trim(),
        type: 1,
        limit,
        offset: 0,
        cookie
    });

    if (res.status === 301) throw new Error('AUTH_EXPIRED');

    if (res.status !== 200 || !res.body?.result?.songs) {
        throw new Error(`搜索失败: ${res.body?.msg || '无结果'} (status: ${res.status})`);
    }

    const songs = res.body.result.songs;

    const formatted = songs.map(s => ({
        id: s.id,
        name: s.name,
        artists: s.ar ? s.ar.map(a => a.name).join(' / ') : '未知',
        album: s.al?.name || '未知',
        duration: formatDuration(s.dt),
        fee: formatFee(s.fee)
    }));

    return {
        keywords,
        totalFound: res.body.result.songCount || songs.length,
        returnedCount: formatted.length,
        songs: formatted,
        tip: '使用 get_song_url 命令配合歌曲 id 获取播放链接。'
    };
}

async function handleGetUrl(args, cookie) {
    const id = Number(args.id || args.songId || args.song_id);
    if (!id || isNaN(id)) {
        throw new Error('参数 "id" 是必需的，请提供有效的歌曲ID。');
    }

    // 并行请求播放链接、歌曲详情和歌词
    const [urlRes, detailRes, lyricRes] = await Promise.all([
        song_url_v1({ id, level: 'jymaster', cookie }),
        song_detail({ ids: String(id), cookie }).catch(() => null),
        lyric({ id, cookie }).catch(() => null)
    ]);

    if (urlRes.status === 301) throw new Error('AUTH_EXPIRED');

    if (urlRes.status !== 200 || !urlRes.body?.data?.[0]) {
        throw new Error(`获取播放链接失败: ${urlRes.body?.msg || '未知错误'} (status: ${urlRes.status})`);
    }

    const d = urlRes.body.data[0];

    if (!d.url) {
        throw new Error(`歌曲 ${id} 无可用播放链接，可能是VIP专属或地区限制。fee: ${d.fee}`);
    }

    // 提取歌曲详情
    const songInfo = detailRes?.body?.songs?.[0];
    const name = songInfo?.name || '未知歌曲';
    const artists = songInfo?.ar?.map(a => a.name).join(' / ') || '未知歌手';
    const album = songInfo?.al?.name || '未知专辑';
    const cover = songInfo?.al?.picUrl || '';
    const duration = formatDuration(songInfo?.dt);

    // 音质描述
    const levelMap = {
        standard: '标准',
        higher: '较高',
        exhigh: '极高',
        lossless: '无损',
        hires: 'Hi-Res',
        jyeffect: '高清环绕声',
        sky: '沉浸环绕声',
        jymaster: '超清母带'
    };
    const qualityLabel = levelMap[d.level] || d.level;
    const bitrateStr = d.br > 1000000 ? `${(d.br / 1000000).toFixed(1)}Mbps` : `${Math.round(d.br / 1000)}kbps`;
    const sizeStr = d.size > 1048576 ? `${(d.size / 1048576).toFixed(1)}MB` : `${Math.round(d.size / 1024)}KB`;

    const audioUrl = d.url;

    // 提取歌词
    const lrcOriginal = lyricRes?.body?.lrc?.lyric || '';
    const lrcTranslation = lyricRes?.body?.tlyric?.lyric || '';
    const plainLyrics = parseLrcToPlain(lrcOriginal);
    const plainTranslation = parseLrcToPlain(lrcTranslation);

    // 构建带歌词滚动的播放器页面
    const html = buildPlayerHtml({
        name, artists, album, cover, url: audioUrl,
        qualityLabel, format: (d.type || '').toUpperCase(), bitrateStr,
        lrc: lrcOriginal, tlrc: lrcTranslation
    });

    return {
        id: d.id,
        name,
        artists,
        album,
        cover,
        duration,
        url: audioUrl,
        quality: {
            level: d.level,
            label: qualityLabel,
            bitrate: d.br,
            size: d.size,
            format: d.type
        },
        songInfo: `${name} - ${artists}（专辑：${album}）| 时长 ${duration} | ${qualityLabel} ${(d.type || '').toUpperCase()} ${bitrateStr}`,
        lyrics: plainLyrics || '纯音乐，无歌词',
        lyricsTranslation: plainTranslation || null,
        html,
        tip: '请将 html 字段的完整内容用代码块（三个反引号）包裹后原样输出给用户，这是一个带实时歌词滚动的音乐播放器页面，不要修改HTML内容。你可以阅读 songInfo 和 lyrics 字段了解歌曲信息和歌词，与用户一起欣赏讨论。'
    };
}

async function handleGetLyrics(args, cookie) {
    const id = Number(args.id || args.songId || args.song_id);
    if (!id || isNaN(id)) {
        throw new Error('参数 "id" 是必需的，请提供有效的歌曲ID。');
    }

    const res = await lyric({ id, cookie });

    if (res.status === 301) throw new Error('AUTH_EXPIRED');

    if (res.status !== 200) {
        throw new Error(`获取歌词失败: ${res.body?.msg || '未知错误'} (status: ${res.status})`);
    }

    const lrcOriginal = res.body?.lrc?.lyric || null;
    const lrcTranslation = res.body?.tlyric?.lyric || null;
    const lrcRomaji = res.body?.romalrc?.lyric || null;

    if (!lrcOriginal) {
        return {
            id,
            hasLyrics: false,
            message: '该歌曲暂无歌词（可能是纯音乐）。'
        };
    }

    const result = {
        id,
        hasLyrics: true,
        plainLyrics: parseLrcToPlain(lrcOriginal),
        lrc: lrcOriginal
    };

    if (lrcTranslation) {
        result.plainTranslation = parseLrcToPlain(lrcTranslation);
        result.translatedLrc = lrcTranslation;
    }

    if (lrcRomaji) {
        result.romajiLrc = lrcRomaji;
    }

    return result;
}

// ── Login Handlers ────────────────────────────────────

async function handleSendCaptcha(args) {
    const phone = args.phone || process.env.NETEASE_PHONE;
    if (!phone) {
        throw new Error('参数 "phone" 是必需的，请提供手机号。');
    }

    const res = await captcha_sent({ phone, ctcode: '86' });

    if (res.status !== 200 && res.body?.code !== 200) {
        const msg = res.body?.msg || res.body?.message || '未知错误';
        throw new Error(`发送验证码失败: ${msg} (status: ${res.status})`);
    }

    return {
        phone,
        message: `验证码已发送到 ${phone}，请让用户查收短信并提供验证码，然后调用 captcha_login 命令完成登录。`
    };
}

async function handleCaptchaLogin(args) {
    const phone = args.phone || process.env.NETEASE_PHONE;
    const captcha = args.captcha || args.code;

    if (!phone) throw new Error('参数 "phone" 是必需的。');
    if (!captcha) throw new Error('参数 "captcha" 是必需的，请提供短信验证码。');

    const res = await login_cellphone({
        phone,
        captcha: String(captcha),
        countrycode: '86'
    });

    if (res.status !== 200 || !res.body?.cookie) {
        const msg = res.body?.msg || res.body?.message || '未知错误';
        throw new Error(`验证码登录失败: ${msg} (status: ${res.status})`);
    }

    await saveCookie(res.body.cookie);

    const profile = res.body.profile;
    return {
        message: '登录成功！cookie 已缓存，后续调用无需重复登录。',
        nickname: profile?.nickname || '未知',
        vipType: profile?.vipType || 0
    };
}

async function handleQrLogin(args) {
    const action = args.action || 'generate';

    if (action === 'generate') {
        // Step 1: 获取 unikey
        const keyRes = await login_qr_key({});
        const unikey = keyRes.body?.data?.unikey;
        if (!unikey) {
            throw new Error('获取二维码 key 失败: ' + JSON.stringify(keyRes.body));
        }

        // Step 2: 生成二维码 URL 和 base64 图片
        const qrRes = await login_qr_create({ key: unikey, qrimg: true });
        const qrurl = qrRes.body?.data?.qrurl;
        const qrimg = qrRes.body?.data?.qrimg; // data:image/png;base64,...

        return {
            action: 'generate',
            key: unikey,
            qrurl: qrurl || '',
            qrimg: qrimg || '',
            message: '二维码已生成。请让用户用网易云音乐 App 扫描二维码，然后调用 qr_login 命令并传入 action:"poll" 和 key 来检查扫码状态。',
            tip: '如果前端支持，可以用 qrimg (base64) 直接渲染二维码图片给用户扫描。'
        };
    }

    if (action === 'poll' || action === 'check') {
        const key = args.key;
        if (!key) throw new Error('参数 "key" 是必需的，请传入 generate 步骤返回的 key。');

        const checkRes = await login_qr_check({ key });
        const code = checkRes.body?.code;

        // 800=过期 801=等待扫码 802=已扫码待确认 803=登录成功
        if (code === 803) {
            const cookie = checkRes.body?.cookie;
            if (cookie) {
                await saveCookie(cookie);
                return {
                    action: 'poll',
                    code: 803,
                    message: '登录成功！cookie 已缓存，后续调用无需重复登录。',
                    nickname: checkRes.body?.nickname || '未知'
                };
            }
            throw new Error('登录成功但未获取到 cookie，请重新生成二维码。');
        }

        const statusMap = {
            800: '二维码已过期，请重新调用 qr_login (action:"generate") 生成新的二维码。',
            801: '等待用户扫码中…请用户打开网易云音乐 App 扫描二维码，然后再次调用 qr_login (action:"poll", key:"...") 检查。',
            802: '用户已扫码，等待确认中…请再次调用 qr_login (action:"poll", key:"...") 检查。'
        };

        return {
            action: 'poll',
            code,
            message: statusMap[code] || `未知状态码: ${code}`
        };
    }

    throw new Error('参数 "action" 应为 "generate"（生成二维码）或 "poll"（检查扫码状态）。');
}

// ── Dispatch ───────────────────────────────────────────

async function dispatch(command, args, cookie) {
    switch (command) {
        case 'send_captcha':
            return await handleSendCaptcha(args);
        case 'captcha_login':
            return await handleCaptchaLogin(args);
        case 'qr_login':
            return await handleQrLogin(args);
        case 'search_song':
            return await handleSearch(args, cookie);
        case 'get_song_url':
            return await handleGetUrl(args, cookie);
        case 'get_lyrics':
            return await handleGetLyrics(args, cookie);
        default:
            throw new Error(`未知命令: '${command}'，支持: qr_login, send_captcha, captcha_login, search_song, get_song_url, get_lyrics`);
    }
}

// ── Main ───────────────────────────────────────────────

async function main() {
    try {
        const raw = await readInput();
        if (!raw) throw new Error('未收到任何输入。');

        const args = JSON.parse(raw);
        const command = args.command;

        if (!command) {
            throw new Error("缺少 'command' 参数。支持: 'qr_login', 'send_captcha', 'captcha_login', 'search_song', 'get_song_url', 'get_lyrics'");
        }

        // 登录类命令不需要先 ensureLogin
        const LOGIN_COMMANDS = ['send_captcha', 'captcha_login', 'qr_login'];
        let result;

        if (LOGIN_COMMANDS.includes(command)) {
            result = await dispatch(command, args, null);
        } else {
            let cookie = await ensureLogin();
            try {
                result = await dispatch(command, args, cookie);
            } catch (err) {
                if (err.message === 'AUTH_EXPIRED') {
                    // cookie 过期，重新登录后重试
                    try { await fs.unlink(COOKIE_FILE); } catch { /* ignore */ }
                    cookie = await ensureLogin();
                    result = await dispatch(command, args, cookie);
                } else {
                    throw err;
                }
            }
        }

        console.log(JSON.stringify({ status: 'success', result }));
        process.exit(0);

    } catch (error) {
        console.log(JSON.stringify({
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        }));
        process.exit(1);
    }
}

main();
