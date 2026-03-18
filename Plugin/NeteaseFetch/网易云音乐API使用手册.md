# 网易云音乐 API 使用手册（守岸人备忘）

> 最后更新：2026-02-26 | 状态：已验证可用

## 服务信息
- 本地地址：http://localhost:4567
- 启动命令（PowerShell）：$env:PORT=4567; pnpm start
- 项目路径：D:\oneapi\api-enhanced
- 账号：饭饭斋（uid: 60908770）
- VIP：黑胶VIP (vipType: 11)
- 插件状态：已提交开发者适配中，当前通过 WebReadFile 直接调用

## Cookie
登录uid: 60908770，API通过浏览器登录后自动管理session。WebReadFile请求时为匿名状态，公开数据均可正常获取。

---

## 守岸人操作方式（WebReadFile直接调API）

### 核心三连：歌曲详情+歌词+热评

同学丢网易云链接时，从链接取id=后面的数字，然后三连：

WebReadFile -> http://localhost:4567/song/detail?ids=3342918129
WebReadFile -> http://localhost:4567/lyric?id=3342918129
WebReadFile -> http://localhost:4567/comment/music?id=3342918129&limit=5

### 返回数据关键字段

song/detail:
- songs[0].name -> 歌名
- songs[0].ar[0].name -> 歌手
- songs[0].al.name -> 专辑名
- songs[0].al.picUrl -> 封面图URL
- songs[0].dt -> 时长（毫秒）

lyric:
- lrc.lyric -> 完整歌词（LRC格式带时间轴）

comment/music:
- hotComments[].content -> 热评内容
- hotComments[].user.nickname -> 评论者
- hotComments[].likedCount -> 点赞数

---

## 全部可用接口

### 无需登录（已验证）

/song/detail?ids=ID -> 歌曲详情（支持逗号分隔多个）
/lyric?id=ID -> 完整歌词
/comment/music?id=ID&limit=5 -> 歌曲评论
/comment/hot?id=ID&type=0 -> 只看热评
/cloudsearch?keywords=关键词&limit=10 -> 综合搜索
/playlist/detail?id=ID -> 歌单详情
/playlist/track/all?id=ID&limit=50&offset=0 -> 歌单全部曲目
/artist/songs?id=歌手ID&limit=20 -> 歌手热门歌曲
/artist/detail?id=歌手ID -> 歌手详情
/album?id=专辑ID -> 专辑详情
/simi/song?id=ID -> 相似歌曲
/simi/artist?id=歌手ID -> 相似歌手
/toplist -> 排行榜列表
/top/song?type=0 -> 新歌速递（0全部 7华语 96欧美）
/song/wiki/summary?id=ID -> 歌曲百科

搜索type参数：1歌曲 10专辑 100歌手 1000歌单 1002用户

### 需要登录态

/song/url/v1?id=ID&level=exhigh -> 播放链接（level: standard/higher/exhigh/lossless）
/recommend/songs -> 每日推荐
/personal_fm -> 私人FM
/user/record?uid=60908770&type=1 -> 听歌排行（0总排行 1近一周）
/user/playlist?uid=60908770 -> 用户歌单
/likelist?uid=60908770 -> 喜欢的音乐ID列表

---

## 场景速查

同学说"帮我看看这首歌" -> song/detail + lyric + comment/music 三连
同学说"搜一下xxx" -> cloudsearch?keywords=xxx
同学说"这个歌手还有什么好听的" -> artist/songs?id=歌手ID
同学说"推荐类似的歌" -> simi/song?id=歌曲ID
同学说"看看我最近听了什么" -> user/record?uid=60908770&type=1
同学说"今天听什么" -> recommend/songs
同学说"这首歌什么来头" -> song/wiki/summary?id=歌曲ID
同学说"看看热歌榜" -> toplist
同学说"帮我拉一下这个歌单" -> playlist/detail + playlist/track/all

## 注意事项
1. API服务需保持运行（关掉PowerShell窗口服务就停了）
2. 播放链接有时效性不要缓存
3. 评论数据量大limit建议5-10
4. WebReadFile批量调用用command1/url1格式