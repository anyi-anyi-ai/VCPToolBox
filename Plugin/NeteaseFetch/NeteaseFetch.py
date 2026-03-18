#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NeteaseFetch - 网易云音乐内容获取插件 (VCP)
基于本地部署的 NeteaseCloudMusicApiEnhanced 服务。
"""

import sys
import json
import os
import re
import logging
import requests

# --- Logging Setup ---
class UTF8StreamHandler(logging.StreamHandler):
    def emit(self, record):
        try:
            msg = self.format(record)
            stream = self.stream
            if hasattr(stream, 'buffer'):
                stream.buffer.write((msg + self.terminator).encode('utf-8'))
                stream.buffer.flush()
            else:
                stream.write(msg + self.terminator)
                self.flush()
        except Exception:
            self.handleError(record)

handler = UTF8StreamHandler(sys.stderr)
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(logging.INFO)

# --- Config ---
API_PORT = os.environ.get('NETEASE_API_PORT', '4567')
API_BASE = f"http://localhost:{API_PORT}"
COOKIE = os.environ.get('NETEASE_COOKIE', '')

# --- Helper ---
def api_get(endpoint, params=None):
    """统一的 API 请求封装"""
    url = f"{API_BASE}{endpoint}"
    if params is None:
        params = {}
    if COOKIE:
        params['cookie'] = COOKIE
    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        raise ConnectionError(f"无法连接到网易云API服务 ({API_BASE})，请确认服务已启动。")
    except Exception as e:
        raise RuntimeError(f"API请求失败 [{endpoint}]: {e}")

def extract_song_id(text):
    """从链接或纯数字中提取歌曲ID"""
    match = re.search(r'id=(\d+)', text)
    if match:
        return match.group(1)
    match = re.match(r'^(\d+)$', text.strip())
    if match:
        return match.group(1)
    return None

def format_lyric(raw_lrc):
    """将 lrc 格式歌词转为纯文本，保留时间轴"""
    if not raw_lrc:
        return "（暂无歌词）"
    lines = []
    for line in raw_lrc.strip().split('\n'):
        # 跳过元信息行
        if line.startswith('[by:') or line.startswith('[ti:') or line.startswith('[ar:') or line.startswith('[al:'):
            continue
        lines.append(line)
    return '\n'.join(lines).strip() if lines else "（暂无歌词）"

# --- Core Functions ---

def fetch_song(song_id):
    """获取歌曲详情 + 歌词 + 热评，一站式打包"""
    logging.info(f"Fetching song package for ID: {song_id}")

    # 1. 歌曲详情
    detail_data = api_get('/song/detail', {'ids': song_id})
    songs = detail_data.get('songs', [])
    if not songs:
        return "未找到该歌曲，请检查ID是否正确。"
    song = songs[0]
    name = song.get('name', '未知')
    artists = ' / '.join([ar.get('name', '') for ar in song.get('ar', [])])
    album = song.get('al', {}).get('name', '未知专辑')
    duration_ms = song.get('dt', 0)
    duration_str = f"{duration_ms // 60000}:{(duration_ms % 60000) // 1000:02d}"

    # 2. 歌词
    lyric_data = api_get('/lyric', {'id': song_id})
    raw_lrc = lyric_data.get('lrc', {}).get('lyric', '')
    lyric_text = format_lyric(raw_lrc)

    # 3. 热评（取前5条）
    comment_data = api_get('/comment/music', {'id': song_id, 'limit': 5})
    hot_comments = comment_data.get('hotComments', [])
    comments_text = ""
    if hot_comments:
        comment_lines = []
        for c in hot_comments:
            user = c.get('user', {}).get('nickname', '匿名')
            content = c.get('content', '')
            likes = c.get('likedCount', 0)
            comment_lines.append(f"  {user} (👍{likes}): {content}")
        comments_text = '\n'.join(comment_lines)
    else:
        comments_text = "  暂无热评"

    # 组装输出
    result = (
        f"【歌曲信息】\n"
        f"歌名：{name}\n"
        f"歌手：{artists}\n"
        f"专辑：{album}\n"
        f"时长：{duration_str}\n\n"
        f"【歌词】\n{lyric_text}\n\n"
        f"【热门评论】\n{comments_text}"
    )
    return result

def search_song(keyword, limit=10):
    """搜索歌曲"""
    logging.info(f"Searching for: {keyword}")
    data = api_get('/cloudsearch', {'keywords': keyword, 'limit': limit})
    songs = data.get('result', {}).get('songs', [])
    if not songs:
        return f"未找到与 '{keyword}' 相关的歌曲。"

    lines = [f"--- 关键词 '{keyword}' 的搜索结果 ---"]
    for s in songs:
        sid = s.get('id', '')
        sname = s.get('name', '未知')
        artists = ' / '.join([ar.get('name', '') for ar in s.get('ar', [])])
        album = s.get('al', {}).get('name', '')
        lines.append(f"【{sname}】- {artists}\n  专辑: {album} | ID: {sid}")
    return '\n\n'.join(lines)

def fetch_playlist(playlist_id, limit=20):
    """获取歌单详情及曲目列表"""
    logging.info(f"Fetching playlist: {playlist_id}")
    data = api_get('/playlist/detail', {'id': playlist_id})
    playlist = data.get('playlist', {})
    if not playlist:
        return "未找到该歌单。"

    name = playlist.get('name', '未知歌单')
    creator = playlist.get('creator', {}).get('nickname', '未知')
    desc = playlist.get('description', '无简介')
    track_ids = playlist.get('trackIds', [])[:limit]

    # 获取曲目详情
    ids_str = ','.join([str(t.get('id', '')) for t in track_ids])
    if ids_str:
        tracks_data = api_get('/song/detail', {'ids': ids_str})
        songs = tracks_data.get('songs', [])
    else:
        songs = []

    lines = [
        f"【歌单信息】",
        f"歌单名：{name}",
        f"创建者：{creator}",
        f"简介：{(desc or '无')[:200]}",
        f"曲目数：{len(playlist.get('trackIds', []))}",
        f"\n【曲目列表（前{limit}首）】"
    ]
    for i, s in enumerate(songs, 1):
        sname = s.get('name', '未知')
        artists = ' / '.join([ar.get('name', '') for ar in s.get('ar', [])])
        lines.append(f"  {i}. {sname} - {artists}")

    return '\n'.join(lines)

def fetch_song_url(song_id):
    """获取歌曲播放链接（需要登录cookie）"""
    logging.info(f"Fetching song URL for ID: {song_id}")
    data = api_get('/song/url/v1', {'id': song_id, 'level': 'exhigh'})
    url_data = data.get('data', [])
    if url_data and url_data[0].get('url'):
        info = url_data[0]
        return (
            f"【音源信息】\n"
            f"播放链接：{info['url']}\n"
            f"码率：{info.get('br', 0) // 1000}kbps\n"
            f"格式：{info.get('type', '未知')}"
        )
    return "无法获取播放链接（可能需要VIP或登录Cookie）。"

# --- Request Handler ---

def handle_single_request(data):
    """处理单个请求"""
    action = data.get('action', 'fetch_song')

    if action == 'search':
        keyword = data.get('keyword')
        if not keyword:
            raise ValueError("搜索需要提供 keyword 参数。")
        limit = int(data.get('limit', 10))
        return search_song(keyword, limit)

    elif action == 'fetch_playlist':
        playlist_id = data.get('playlist_id')
        if not playlist_id:
            # 尝试从url提取
            url = data.get('url', '')
            match = re.search(r'id=(\d+)', url)
            playlist_id = match.group(1) if match else None
        if not playlist_id:
            raise ValueError("需要提供 playlist_id 或包含id的歌单链接。")
        limit = int(data.get('limit', 20))
        return fetch_playlist(playlist_id, limit)

    elif action == 'fetch_url':
        song_id = data.get('song_id') or extract_song_id(data.get('url', ''))
        if not song_id:
            raise ValueError("需要提供 song_id 或网易云歌曲链接。")
        return fetch_song_url(song_id)

    else:  # 默认: fetch_song
        song_id = data.get('song_id') or extract_song_id(data.get('url', ''))
        if not song_id:
            raise ValueError("需要提供 song_id 或网易云歌曲链接。")
        return fetch_song(song_id)

# --- Main ---

if __name__ == "__main__":
    input_data_raw = sys.stdin.read()
    output = {}

    try:
        if not input_data_raw.strip():
            raise ValueError("No input data received from stdin.")

        input_data = json.loads(input_data_raw)
        result_data = handle_single_request(input_data)
        output = {"status": "success", "result": result_data}

    except (json.JSONDecodeError, ValueError) as e:
        output = {"status": "error", "error": f"Input Error: {e}"}
    except ConnectionError as e:
        output = {"status": "error", "error": str(e)}
    except Exception as e:
        logging.exception("An unexpected error occurred during plugin execution.")
        output = {"status": "error", "error": f"An unexpected error occurred: {e}"}

    sys.stdout.buffer.write(json.dumps(output, indent=2, ensure_ascii=False).encode('utf-8'))
    sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()