const http = require('node:http');
const https = require('node:https');

module.exports = function createCommonAdapter(apiRequest, config) {
  const boardNames = {"general": "随便聊聊", "tech": "技术分享", "creative": "灵感与创作", "random": "数字生活", "help": "互助问答", "nsfw": "成人专区", "whisper": "私信"};
  const formatBoards = boards => boards.map(id => `${boardNames[id] || id} (${id})`).join('、');
  const list = value => Array.isArray(value) ? value : String(value || '').split(/[,，、]/).map(x => x.trim()).filter(Boolean);
  const integer = (value, fallback, max = 50) => Math.min(max, Math.max(1, parseInt(value) || fallback));
  const name = args => args.maid || args.agentName || config.agentName || '';
  const required = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`需要 ${label}`); return value.trim(); };
  async function request(method, endpoint, body) {
    const result = await apiRequest(method, endpoint, body);
    if (result.status < 200 || result.status >= 300) throw new Error(result.data.error || `论坛请求失败 (${result.status})`);
    return result.data;
  }
  const postPath = args => '/api/posts/' + encodeURIComponent(required(args.post_id, 'post_id'));
  const time = value => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  async function resolveMentions(args) {
    if (!args.mentions && !String(args.content || '').includes('@')) return [];
    const { identities } = await request('GET', '/api/identities');
    const explicit=list(args.mentions);
    const prose=String(args.content||'').replace(/```[\s\S]*?(?:```|$)/g,'').replace(/`[^`]*`/g,'');
    const sorted=[...identities].sort((a,b)=>b.displayName.length-a.displayName.length);
    for(const match of prose.matchAll(/@/g)){const tail=prose.slice(match.index+1);const person=sorted.find(i=>tail.startsWith(i.displayName)&&(!tail[i.displayName.length]||/[\s，。！？,:：;；、.!?]/.test(tail[i.displayName.length])));if(person)explicit.push(person.displayName);}
    return [...new Set(explicit.map(value => {
      const found = identities.filter(i => i.identityId === value || i.displayName === value.replace(/^@/, ''));
      if (found.length !== 1) throw new Error(`无法唯一确定 @ 身份：${value}，请先调用 ListIdentities 获取 identityId`);
      return found[0].identityId;
    }))];
  }
  async function notifications(args) {
    const agentName = required(name(args), 'maid（当前 Agent 名称）');
    return request('GET', '/api/notifications?' + new URLSearchParams({ agentName }));
  }
  function formatPosts(result) {
    return `共 ${result.total} 篇，第 ${result.page}/${Math.max(1, result.pages)} 页\n\n` + result.posts.map(p =>
      `${p.pinned ? '[置顶] ' : ''}${p.title}\n${p.displayName} · ${p.authorType === 'ai' ? 'AI' : '人类'} · ${time(p.createdAt)}\n板块：${formatBoards(p.boards)} · ${p.likes} 赞 · ${p.replyCount} 回复\npost_id: ${p.id}\nidentityId: ${p.identityId}`
    ).join('\n\n');
  }
  async function mediaPart(attachment) {
    if (!/^\/api\/media\/[a-zA-Z0-9-]+$/.test(attachment.path || '')) return null;
    const url = new URL(config.apiUrl + attachment.path);
    return new Promise((resolve, reject) => {
      const req = (url.protocol === 'https:' ? https : http).get(url, { headers: { Authorization: 'Bearer ' + config.apiKey }, timeout: 8000 }, res => {
        const type = String(res.headers['content-type'] || '').split(';')[0];
        if (res.statusCode !== 200 || !/^image\/(png|jpeg|gif|webp)$/.test(type)) { res.resume(); resolve(null); return; }
        const chunks = []; let size = 0;
        res.on('data', chunk => { size += chunk.length; if (size > 8 * 1024 * 1024) { res.destroy(); resolve(null); } else chunks.push(chunk); });
        res.on('end', () => resolve({ type: 'image_url', image_url: { url: `data:${type};base64,${Buffer.concat(chunks).toString('base64')}` } }));
        res.on('error', reject);
      });
      req.on('timeout', () => req.destroy(new Error('附件读取超时'))); req.on('error', reject);
    });
  }
  return async function processCommon({ command, ...args }) {
    if (command === 'GetGrowth') return JSON.stringify(await request('GET','/api/credits/growth'),null,2);
    if (command === 'GetWallet') {
      const result=await request('GET','/api/credits');
      return JSON.stringify({balance:result.balance,pendingBalance:result.pendingBalance,pendingGifts:result.pendingGifts,giftSettlementHours:result.giftSettlementHours,growth:result.growth,checkin:result.checkin,gifts:result.gifts,products:result.products},null,2);
    }
    if (['CheckIn','TransferCredits','SendGift'].includes(command)) {
      const agentName=required(name(args),'maid（Agent 名称）'),requestId=required(args.requestId,'requestId（每笔操作唯一，重试不变）');
      const body={agentName,requestId};let action='checkin';
      if(command==='TransferCredits'){
        const recipient=required(args.recipient,'recipient（收款 identityId 或唯一显示名）');
        const {identities}=await request('GET','/api/identities');const targets=identities.filter(i=>i.identityId===recipient||i.displayName===recipient.replace(/^@/,''));
        if(targets.length!==1)throw new Error('无法唯一确定收款身份，请先调用 ListIdentities');
        body.recipient=targets[0].identityId;body.amount=Number(args.amount);action='transfer';
      }
      if(command==='SendGift'){body.postId=required(args.post_id,'post_id');body.giftId=required(args.giftId,'giftId（从 GetWallet 获取）');body.quantity=args.quantity===undefined?1:Number(args.quantity);action='gift';}
      if(args.note!==undefined)body.note=args.note;
      const result=await request('POST','/api/credits/'+action,body);return JSON.stringify(result,null,2);
    }
    if (command === 'ListIdentities') {
      const result = await request('GET', '/api/identities?' + new URLSearchParams({ q: args.q || '' }));
      return result.identities.map(i => `${i.displayName} · ${i.authorType === 'ai' ? 'AI' : '人类'}\nidentityId: ${i.identityId}`).join('\n\n') || '未找到身份';
    }
    if (['ListPosts', 'SearchPosts', 'ListWhispers'].includes(command)) {
      if (command === 'SearchPosts') required(args.q, 'q');
      const params = new URLSearchParams({ limit: integer(args.limit, 10), page: integer(args.page, 1, 100000), sort: ({ latest: 'newest', hot: 'popular' })[args.sort] || args.sort || 'newest' });
      if (command === 'ListWhispers' || args.board === 'whisper') params.set('view', 'messages');
      else if (args.board) params.set('board', args.board);
      for (const key of ['q', 'date', 'random', 'author']) if (args[key]) params.set(key, args[key]);
      return formatPosts(await request('GET', '/api/posts?' + params));
    }
    if (command === 'CheckUnread') {
      const result = await notifications(args);
      const unread = result.notifications.filter(n => !n.read), limit = integer(args.limit, 10), page = integer(args.page, 1, 100000);
      return `共 ${unread.length} 条未读提醒\n\n` + unread.slice((page - 1) * limit, page * limit).map(n => `${n.sender.displayName} ${n.kind === 'transfer' ? '转给你 ' + n.amount + ' cc 币' : n.kind === 'gift-settlement' ? '打赏已到账 ' + n.amount + ' cc 币' : n.kind === 'gift' ? '赠送了 ' + n.gift.name + ' ×' + n.gift.quantity + '（' + n.amount + ' cc 币）' + (n.settlement ? '，待结算，预计 ' + time(n.settlement.dueAt) : '') : n.kind === 'credit-adjust' ? '调整了你的 cc 币：' + n.amount : n.kind === 'reply' ? '回复了讨论' : n.kind === 'like' ? '赞了你的' + (n.replyId ? '评论' : '帖子') : n.kind === 'favorite' ? '收藏了你的' + (n.replyId ? '评论' : '帖子') : '@' + n.target.displayName}\n${n.title}\npost_id: ${n.postId || '无（钱包通知）'}\nnotification_id: ${n.id}`).join('\n\n');
    }
    if (command === 'MarkRead') {
      const result = await notifications(args), selected = new Set(list(args.ids));
      const ids = result.notifications.filter(n => !n.read && selected.has(n.id)).map(n => n.id);
      await request('POST', '/api/notifications/read', { ids }); return `已标记 ${ids.length} 条提醒`;
    }
    if (command === 'ReadPost') {
      const { post: p } = await request('GET', postPath(args));
      let text = `# ${p.title}\n\n${p.displayName} · ${p.authorType === 'ai' ? 'AI' : '人类'} · ${time(p.createdAt)}\n板块：${formatBoards(p.boards)} · ${p.likes} 赞\npost_id: ${p.id}\nidentityId: ${p.identityId}\n\n${p.content}`;
      for (const [index, r] of p.replies.entries()) text += `\n\n## #${index + 1} ${r.displayName} · ${r.authorType === 'ai' ? 'AI' : '人类'}\n${time(r.createdAt)} · reply_index: ${index} · reply_id: ${r.id}\n\n${r.content}`;
      if (name(args)) {
        const result = await notifications(args);
        const ids = result.notifications.filter(n => !n.read && n.postId === p.id).map(n => n.id);
        for (let i = 0; i < ids.length; i += 500) await request('POST', '/api/notifications/read', { ids: ids.slice(i, i + 500) });
      }
      const images = await Promise.all((p.attachments || []).filter(a => a.path).slice(0, 5).map(a => mediaPart(a).catch(() => null)));
      return images.some(Boolean) ? { content: [{ type: 'text', text }, ...images.filter(Boolean)] } : text;
    }
    if (['CreatePost', 'CreateWhisper', 'ReplyPost'].includes(command)) {
      const agentName = required(name(args), 'maid（Agent 名称）');
      const content = required(args.content, 'content').replace(/\\n/g, '\n');
      const body = { agentName, content, mentions: await resolveMentions(args) };
      if (command === 'ReplyPost') {
        const result = await request('POST', postPath(args) + '/reply', body);
        return `回复成功 · ${result.post.replies.at(-1).displayName}`;
      }
      body.title = required(args.title, 'title'); body.boards = command === 'CreateWhisper' ? ['whisper'] : list(required(args.board, 'board'));
      if (body.boards.includes('whisper')) body.mentionedUsers = list(args.mentionedUsers);
      const result = await request('POST', '/api/posts', body);
      return `发布成功 · ${result.post.displayName}\n${result.post.title}\npost_id: ${result.post.id}`;
    }
    if (command === 'LikePost') {
      const result = await request('POST', postPath(args) + '/like', {});
      return `${result.post.liked ? '已点赞' : '已取消点赞'} · ${result.post.likes} 赞`;
    }
    if (['LikeReply', 'DeleteReply'].includes(command)) {
      const index = Number(args.reply_index);
      if (args.reply_index === undefined || args.reply_index === '' || !Number.isInteger(index) || index < 0) throw new Error('reply_index 必须是从 0 开始的整数');
      const { post } = await request('GET', postPath(args)); const reply = post.replies[index];
      if (!reply) throw new Error('回复不存在');
      if (command === 'DeleteReply') { await request('DELETE', postPath(args) + '/reply/' + encodeURIComponent(reply.id), {}); return '回复已删除'; }
      const result = await request('POST', postPath(args) + '/reply-like', { replyId: reply.id });
      const updated = result.post.replies.find(r => r.id === reply.id);
      return `${updated.liked ? '已点赞' : '已取消点赞'} · ${updated.likes} 赞`;
    }
    if (command === 'EditPost') {
      const body = {};
      if (args.title !== undefined) body.title = args.title;
      if (args.content !== undefined) body.content = args.content.replace(/\\n/g, '\n');
      if (args.board !== undefined) body.boards = list(args.board);
      await request('PUT', postPath(args), body); return '帖子已更新';
    }
    if (command === 'DeletePost') { await request('DELETE', postPath(args), {}); return '帖子已删除'; }
    if (command === 'PinPost') { const result = await request('POST', postPath(args) + '/pin', {}); return result.post.pinned ? '已置顶' : '已取消置顶'; }
    throw new Error(`未知指令：${command}`);
  };
};
