"""
LoRA Scanner Module for VCPComfyUIPlugin

Provides functionality to:
1. Scan local LoRA directory for .safetensors files
2. Read embedded metadata from safetensors file headers (robust implementation)
3. Extract training words from ss_tag_frequency (Kohya training metadata)
4. Query Civitai API for additional model information
5. Classify LoRAs by type (style, character, enhancement, etc.)
6. Store metadata in lora_database.json

Inspired by lora_info.py from ComfyUI extensions
"""

import os
import sys
import json
import re
import hashlib
import time
import requests
from typing import Dict, List, Optional, Any, Tuple, Callable
from datetime import datetime

def log_stderr(message):
    """输出日志到 stderr，避免污染 stdout（VCP 插件协议要求只有最终 JSON 响应才能输出到 stdout）"""
    print(f"[LoRA Scanner] {message}", file=sys.stderr)
    sys.stderr.flush()

PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Civitai API 配置
CIVITAI_API_URL = "https://civitai.com/api/v1/model-versions/by-hash/"
CIVITAI_TIMEOUT = 10  # 秒
CIVITAI_CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "civitai_cache")

# LoRA 分类关键词映射
LORA_CATEGORY_KEYWORDS = {
    # 风格类
    "style": {
        "keywords": ["anime", "manga", "realistic", "realism", "cartoon", "painting", 
                     "sketch", "watercolor", "oil", "pixel", "chibi", "ghibli", 
                     "cyberpunk", "steampunk", "fantasy", "scifi", "horror", "art",
                     "style", "画风", "风格"],
        "description": "风格类 LoRA，用于改变图像的整体艺术风格"
    },
    # 角色类
    "character": {
        "keywords": ["character", "girl", "boy", "woman", "man", "male", "female",
                     "person", "portrait", "face", "角色", "人物", "char"],
        "description": "角色类 LoRA，用于生成特定角色或人物特征"
    },
    # 增强类
    "enhancement": {
        "keywords": ["detail", "tweaker", "sharp", "quality", "hd", "4x", "upscale",
                     "enhance", "improve", "better", "detailer", "增强", "细节"],
        "description": "增强类 LoRA，用于提升图像质量或细节"
    },
    # 效果类
    "effect": {
        "keywords": ["lighting", "shadow", "glow", "blur", "bokeh", "atmosphere",
                     "weather", "season", "效果", "光影"],
        "description": "效果类 LoRA，用于添加特殊视觉效果"
    },
    # 服装类
    "clothing": {
        "keywords": ["dress", "uniform", "swimsuit", "bikini", "lingerie", "outfit",
                     "clothes", "costume", "armor", "suit", "服装", "衣服"],
        "description": "服装类 LoRA，用于改变角色服装"
    },
    # 姿势类
    "pose": {
        "keywords": ["pose", "standing", "sitting", "lying", "kneeling", "dancing",
                     "action", "dynamic", "姿势", "动作"],
        "description": "姿势类 LoRA，用于控制角色姿势"
    },
    # 背景类
    "background": {
        "keywords": ["background", "landscape", "scenery", "environment", "indoor",
                     "outdoor", "city", "nature", "room", "背景", "场景"],
        "description": "背景类 LoRA，用于改变或增强背景"
    },
    # 主题类
    "theme": {
        "keywords": ["fantasy", "scifi", "horror", "romance", "comedy", "drama",
                     "historical", "medieval", "futuristic", "主题"],
        "description": "主题类 LoRA，用于设定特定主题"
    },
    # 概念类
    "concept": {
        "keywords": ["concept", "概念", "lora", "mix"],
        "description": "概念类 LoRA，用于特定概念或混合效果"
    }
}


def ensure_cache_dir():
    """确保缓存目录存在"""
    if not os.path.exists(CIVITAI_CACHE_DIR):
        os.makedirs(CIVITAI_CACHE_DIR, exist_ok=True)


def calculate_sha256_hash(file_path: str) -> Optional[str]:
    """
    计算文件的 SHA256 哈希值
    
    Args:
        file_path: 文件路径
        
    Returns:
        64位十六进制哈希字符串，失败返回 None
    """
    if not file_path or not os.path.isfile(file_path):
        return None
    
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        log_stderr(f"Failed to calculate SHA256 for {file_path}: {e}")
        return None


def read_safetensors_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """
    读取 safetensors 文件的内嵌元数据（健壮实现）
    
    参考：https://github.com/huggingface/safetensors#format
    文件格式：
    - 前8字节：无符号小端64位整数，表示头部大小
    - 接下来N字节：JSON格式的头部数据
    - 头部JSON中的 "__metadata__" 字段包含元数据
    
    Args:
        file_path: safetensors 文件路径
        
    Returns:
        元数据字典，失败返回 None
    """
    if not file_path or not os.path.isfile(file_path):
        return None
    
    if not file_path.endswith('.safetensors'):
        return None
    
    try:
        with open(file_path, "rb") as f:
            # 读取前8字节获取头部大小
            header_size_bytes = f.read(8)
            if len(header_size_bytes) < 8:
                raise BufferError("File too small to contain valid header")
            
            header_size = int.from_bytes(header_size_bytes, "little", signed=False)
            
            if header_size <= 0:
                raise BufferError(f"Invalid header size: {header_size}")
            
            # 限制头部大小防止内存溢出（通常不会超过几MB）
            if header_size > 100 * 1024 * 1024:  # 100MB 限制
                raise BufferError(f"Header size too large: {header_size}")
            
            # 读取头部JSON
            header_bytes = f.read(header_size)
            if len(header_bytes) < header_size:
                raise BufferError("Incomplete header data")
            
            header_json = json.loads(header_bytes.decode('utf-8'))
            
            # 提取 __metadata__ 字段
            if "__metadata__" not in header_json:
                return {}
            
            metadata = header_json["__metadata__"]
            
            # 处理嵌套的JSON字符串（某些字段可能是JSON字符串）
            if isinstance(metadata, dict):
                for key, value in list(metadata.items()):
                    if isinstance(value, str) and value.startswith('{') and value.endswith('}'):
                        try:
                            metadata[key] = json.loads(value)
                        except (json.JSONDecodeError, ValueError):
                            pass  # 保持原值
            
            return metadata
            
    except json.JSONDecodeError as e:
        log_stderr(f"JSON decode error in {file_path}: {e}")
        return None
    except BufferError as e:
        log_stderr(f"Buffer error in {file_path}: {e}")
        return None
    except Exception as e:
        log_stderr(f"Error reading metadata from {file_path}: {e}")
        return None


def extract_training_words(metadata: Optional[Dict[str, Any]]) -> Tuple[List[str], Dict[str, int]]:
    """
    从元数据中提取训练词（Kohya ss_tag_frequency 格式）
    
    Kohya 训练时会在元数据中保存 ss_tag_frequency 字段，
    格式为 {"bucket_name": {"tag": count, ...}, ...}
    
    Args:
        metadata: safetensors 元数据
        
    Returns:
        (训练词列表, 词频字典)
    """
    trained_words = []
    word_counts = {}
    
    if not metadata:
        return trained_words, word_counts
    
    # 从 ss_tag_frequency 提取训练标签
    if 'ss_tag_frequency' in metadata and isinstance(metadata['ss_tag_frequency'], dict):
        for bucket_name, bucket_value in metadata['ss_tag_frequency'].items():
            if isinstance(bucket_value, dict):
                for tag, count in bucket_value.items():
                    tag = str(tag).strip() if tag else ""
                    try:
                        count = int(count) if count else 0
                    except (ValueError, TypeError):
                        count = 0
                    if tag and tag not in word_counts:
                        word_counts[tag] = 0
                    if tag:
                        word_counts[tag] += count
    
    # 从 ss_output_character_tags 提取角色标签
    if 'ss_output_character_tags' in metadata:
        char_tags = metadata['ss_output_character_tags']
        if isinstance(char_tags, str):
            for tag in char_tags.split(','):
                tag = tag.strip()
                if tag and tag not in word_counts:
                    word_counts[tag] = 0
    
    # 从 ss_output_style_tags 提取风格标签
    if 'ss_output_style_tags' in metadata:
        style_tags = metadata['ss_output_style_tags']
        if isinstance(style_tags, str):
            for tag in style_tags.split(','):
                tag = tag.strip()
                if tag and tag not in word_counts:
                    word_counts[tag] = 0
    
    # 按词频排序
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    trained_words = [word for word, count in sorted_words]
    
    return trained_words, word_counts


def extract_trigger_words(metadata: Optional[Dict[str, Any]]) -> List[str]:
    """
    从元数据中提取触发词
    
    Args:
        metadata: safetensors 元数据
        
    Returns:
        触发词列表
    """
    trigger_words = []
    
    if not metadata:
        return trigger_words
    
    # 优先级顺序提取触发词
    trigger_sources = [
        'ss_output_trigger_words',
        'trigger_words',
        'activation text',
        'ss_activation_text'
    ]
    
    for source in trigger_sources:
        if source in metadata:
            value = metadata[source]
            if isinstance(value, str):
                # 分割并清理
                for word in re.split(r'[,，\n]+', value):
                    word = word.strip()
                    if word and word not in trigger_words:
                        trigger_words.append(word)
            elif isinstance(value, list):
                for word in value:
                    word = str(word).strip()
                    if word and word not in trigger_words:
                        trigger_words.append(word)
    
    return trigger_words


def query_civitai_by_hash(file_hash: str, use_cache: bool = True) -> Optional[Dict[str, Any]]:
    """
    通过 SHA256 哈希查询 Civitai API 获取模型信息
    
    Args:
        file_hash: 文件的 SHA256 哈希值
        use_cache: 是否使用缓存
        
    Returns:
        Civitai 模型信息，失败返回 None
    """
    if not file_hash:
        return None
    
    ensure_cache_dir()
    
    # 检查缓存
    cache_file = os.path.join(CIVITAI_CACHE_DIR, f"{file_hash}.json")
    if use_cache and os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                cached = json.load(f)
                # 缓存有效期7天
                if 'timestamp' in cached:
                    cache_time = cached.get('timestamp', 0)
                    if time.time() - cache_time < 7 * 24 * 3600:
                        return cached.get('data')
        except Exception as e:
            log_stderr(f"Cache read error: {e}")
    
    # 查询 Civitai API
    api_url = f"{CIVITAI_API_URL}{file_hash}"
    
    try:
        response = requests.get(api_url, timeout=CIVITAI_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            
            # 保存缓存
            try:
                cache_data = {
                    'timestamp': time.time(),
                    'hash': file_hash,
                    'data': data
                }
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(cache_data, f, ensure_ascii=False, indent=2)
            except Exception as e:
                log_stderr(f"Cache write error: {e}")
            
            return data
        elif response.status_code == 404:
            log_stderr(f"Model not found on Civitai: {file_hash[:16]}...")
            return None
        else:
            log_stderr(f"Civitai API error: {response.status_code}")
            return None
            
    except requests.exceptions.Timeout:
        log_stderr(f"Civitai API timeout")
        return None
    except requests.exceptions.RequestException as e:
        log_stderr(f"Civitai API request error: {e}")
        return None
    except json.JSONDecodeError as e:
        log_stderr(f"Civitai API response parse error: {e}")
        return None


def parse_civitai_data(civitai_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    解析 Civitai API 返回的数据
    
    Args:
        civitai_data: Civitai API 返回的原始数据
        
    Returns:
        解析后的结构化数据
    """
    result = {
        'name': None,
        'model_id': None,
        'version_id': None,
        'type': None,
        'base_model': None,
        'trigger_words': [],
        'trained_words': [],
        'description': None,
        'tags': [],
        'nsfw': False,
        'images': [],
        'links': []
    }
    
    if not civitai_data:
        return result
    
    # 提取基本信息
    if 'model' in civitai_data:
        model = civitai_data['model']
        result['name'] = model.get('name')
        result['model_id'] = model.get('id')
        result['type'] = model.get('type')
    
    result['version_id'] = civitai_data.get('id')
    result['base_model'] = civitai_data.get('baseModel')
    result['description'] = civitai_data.get('description')
    result['nsfw'] = civitai_data.get('nsfw', False)
    
    # 提取触发词
    if 'triggerWords' in civitai_data:
        result['trigger_words'] = civitai_data['triggerWords']
    
    # 提取训练词
    if 'trainedWords' in civitai_data:
        result['trained_words'] = civitai_data['trainedWords']
    
    # 提取标签
    if 'model' in civitai_data and 'tags' in civitai_data['model']:
        result['tags'] = civitai_data['model']['tags']
    
    # 提取图片
    if 'images' in civitai_data:
        for img in civitai_data['images'][:5]:  # 最多5张
            img_info = {
                'url': img.get('url'),
                'nsfw': img.get('nsfwLevel', 0) > 0
            }
            result['images'].append(img_info)
    
    # 生成链接
    if result['model_id']:
        result['links'].append(f"https://civitai.com/models/{result['model_id']}")
        if result['version_id']:
            result['links'].append(f"https://civitai.com/models/{result['model_id']}?modelVersionId={result['version_id']}")
    
    return result


def classify_lora(lora_name: str, metadata: Optional[Dict[str, Any]], 
                  civitai_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    根据文件名、元数据和 Civitai 数据对 LoRA 进行分类
    
    Args:
        lora_name: LoRA 文件名
        metadata: safetensors 元数据
        civitai_data: Civitai API 数据
        
    Returns:
        分类信息字典
    """
    name_lower = lora_name.lower()
    base_name = os.path.splitext(lora_name)[0]
    
    # 收集匹配的类别
    matched_categories = []
    matched_keywords = []
    
    # 从文件名匹配类别
    for category, info in LORA_CATEGORY_KEYWORDS.items():
        for keyword in info["keywords"]:
            if keyword in name_lower:
                if category not in matched_categories:
                    matched_categories.append(category)
                if keyword not in matched_keywords:
                    matched_keywords.append(keyword)
    
    # 从 Civitai 数据提取信息
    civitai_info = parse_civitai_data(civitai_data)
    
    # Civitai 类型映射
    civitai_type_map = {
        'LORA': 'style',
        'LoCon': 'style',
        'DoRA': 'style',
        'Character': 'character',
        'Style': 'style',
        'Concept': 'concept',
        'Clothing': 'clothing',
        'Poses': 'pose',
        'Background': 'background'
    }
    
    if civitai_info['type'] and civitai_info['type'] in civitai_type_map:
        mapped_type = civitai_type_map[civitai_info['type']]
        if mapped_type not in matched_categories:
            matched_categories.insert(0, mapped_type)
    
    # 从 Civitai 标签推断类别
    for tag in civitai_info['tags']:
        tag_lower = tag.lower()
        for category, info in LORA_CATEGORY_KEYWORDS.items():
            if tag_lower in info['keywords'] and category not in matched_categories:
                matched_categories.append(category)
    
    # 从元数据推断类别
    if metadata:
        description = metadata.get('ss_output_description', '') or metadata.get('description', '')
        if description:
            for category, info in LORA_CATEGORY_KEYWORDS.items():
                for keyword in info["keywords"]:
                    if keyword in description.lower() and category not in matched_categories:
                        matched_categories.append(category)
    
    # 如果没有匹配到任何类别
    if not matched_categories:
        matched_categories.append("unknown")
    
    primary_category = matched_categories[0]
    
    # 合并触发词来源
    trigger_words = []
    
    # 1. Civitai 触发词（优先级最高）
    if civitai_info['trigger_words']:
        trigger_words.extend(civitai_info['trigger_words'])
    
    # 2. 元数据中的触发词
    metadata_triggers = extract_trigger_words(metadata)
    for word in metadata_triggers:
        if word not in trigger_words:
            trigger_words.append(word)
    
    # 3. Civitai 训练词
    for word in civitai_info['trained_words']:
        if word not in trigger_words:
            trigger_words.append(word)
    
    # 提取训练词
    trained_words, word_counts = extract_training_words(metadata)
    
    # 合并标签
    tags = list(matched_keywords)
    
    # 添加 Civitai 标签
    for tag in civitai_info['tags']:
        if tag not in tags:
            tags.append(tag)
    
    # 添加训练词作为标签
    for word in trained_words[:20]:  # 最多20个
        if word not in tags:
            tags.append(word)
    
    # 如果没有触发词，从文件名生成
    if not trigger_words and base_name:
        clean_name = base_name.replace('_', ' ').replace('-', ' ')
        words = clean_name.split()
        potential_triggers = [w for w in words if len(w) >= 3 and not w.isdigit()]
        if potential_triggers:
            trigger_words = potential_triggers[:3]
    
    # 生成描述
    description = ""
    if civitai_info['description']:
        description = civitai_info['description']
    elif metadata:
        description = metadata.get('ss_output_description', '') or metadata.get('description', '')
    
    if not description:
        category_desc = LORA_CATEGORY_KEYWORDS.get(primary_category, {}).get("description", "")
        if category_desc:
            description = f"[{primary_category}] {category_desc}"
        if civitai_info['name']:
            description = f"{civitai_info['name']} - {description}"
    
    # 提取基础模型信息
    base_model = None
    if metadata:
        base_model = metadata.get('ss_sd_model_name') or metadata.get('ss_base_model')
    if civitai_info['base_model']:
        base_model = civitai_info['base_model']
    
    # 提取网络模块信息
    network_modules = []
    if metadata:
        modules_str = metadata.get('ss_network_module', '') or metadata.get('network_module', '')
        if modules_str:
            network_modules = [m.strip() for m in modules_str.split(',') if m.strip()]
    
    return {
        "primary_category": primary_category,
        "categories": matched_categories,
        "tags": tags[:30],  # 最多30个标签
        "trigger_words": trigger_words[:10],  # 最多10个触发词
        "trained_words": trained_words[:50],  # 最多50个训练词
        "word_counts": dict(list(word_counts.items())[:50]),  # 词频统计
        "description": description[:500] if description else "",  # 限制描述长度
        "base_model": base_model,
        "ss_network_modules": network_modules,
        "civitai": {
            "name": civitai_info['name'],
            "model_id": civitai_info['model_id'],
            "version_id": civitai_info['version_id'],
            "type": civitai_info['type'],
            "links": civitai_info['links'],
            "images": civitai_info['images'][:3]
        } if civitai_info['model_id'] else None,
        "category_description": LORA_CATEGORY_KEYWORDS.get(primary_category, {}).get("description", "")
    }


def scan_local_lora_directory(
    lora_dir: str,
    skip_hash: bool = True,
    max_files: int = 0,
    query_civitai: bool = False,  # 默认禁用 Civitai 查询，避免超时
    progress_callback = None
) -> List[Dict[str, Any]]:
    """
    扫描本地 LoRA 目录
    
    Args:
        lora_dir: LoRA 目录路径
        skip_hash: 是否跳过文件哈希计算（加速扫描）
        max_files: 最大扫描文件数（0表示不限制）
        query_civitai: 是否查询 Civitai API
        progress_callback: 进度回调函数 (current, total, filename)
        
    Returns:
        LoRA 信息列表
    """
    loras = []
    
    if not os.path.isdir(lora_dir):
        log_stderr(f"Directory not found: {lora_dir}")
        return loras
    
    # 确保 max_files 是整数
    try:
        max_files = int(max_files) if max_files else 0
    except (ValueError, TypeError):
        max_files = 0
    
    # 确保 skip_hash 是布尔值
    if isinstance(skip_hash, str):
        skip_hash = skip_hash.lower() in ('true', '1', 'yes')
    
    # 获取所有 safetensors 文件
    all_files = [f for f in os.listdir(lora_dir) if f.endswith(".safetensors")]
    total_files = len(all_files)
    
    log_stderr(f"Found {total_files} .safetensors files in {lora_dir}")
    
    if max_files > 0:
        all_files = all_files[:max_files]
        log_stderr(f"Limiting scan to first {max_files} files")
    
    # 扫描所有 safetensors 文件
    for idx, filename in enumerate(all_files):
        file_path = os.path.join(lora_dir, filename)
        
        # 进度输出
        if (idx + 1) % 10 == 0 or idx == 0:
            log_stderr(f"Processing {idx + 1}/{len(all_files)}: {filename}")
        
        if progress_callback:
            progress_callback(idx + 1, len(all_files), filename)
        
        try:
            # 读取文件信息
            file_stat = os.stat(file_path)
            
            # 读取元数据
            metadata = read_safetensors_metadata(file_path)
            
            # 计算文件哈希（用于 Civitai 查询）
            file_hash = None
            if not skip_hash or query_civitai:
                file_hash = calculate_sha256_hash(file_path)
            
            # 查询 Civitai
            civitai_data = None
            if query_civitai and file_hash:
                civitai_data = query_civitai_by_hash(file_hash)
            
            # 分类
            classification = classify_lora(filename, metadata, civitai_data)
            
            lora_info = {
                "filename": filename,
                "filepath": file_path,
                "file_size": file_stat.st_size,
                "file_modified": file_stat.st_mtime,
                "file_hash": file_hash or "",
                "metadata": metadata or {},
                "classification": classification,
                "scanned": True,
                "scan_time": datetime.now().isoformat()
            }
            
            loras.append(lora_info)
            
        except Exception as e:
            log_stderr(f"Error processing {filename}: {e}")
            import traceback
            traceback.print_exc(file=sys.stderr)
    
    log_stderr(f"Completed scanning {len(loras)}/{len(all_files)} files")
    return loras


def save_lora_metadata_separate(lora_info: Dict[str, Any], metadata_dir: str) -> str:
    """
    将单个 LoRA 的元数据保存到独立 JSON 文件
    
    Args:
        lora_info: LoRA 信息字典
        metadata_dir: 元数据目录路径
        
    Returns:
        保存的元数据文件路径
    """
    # 确保目录存在
    os.makedirs(metadata_dir, exist_ok=True)
    
    # 生成文件名
    base_name = os.path.splitext(lora_info['filename'])[0]
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', base_name)
    metadata_file = os.path.join(metadata_dir, f"{safe_name}.json")
    
    # 保存
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(lora_info, f, ensure_ascii=False, indent=2)
    
    return metadata_file


def load_lora_metadata_separate(lora_filename: str, metadata_dir: str) -> Optional[Dict[str, Any]]:
    """
    从独立 JSON 文件加载 LoRA 元数据
    
    Args:
        lora_filename: LoRA 文件名（如 "model.safetensors"）
        metadata_dir: 元数据目录路径
        
    Returns:
        LoRA 信息字典，失败返回 None
    """
    # 生成文件名
    base_name = os.path.splitext(lora_filename)[0]
    safe_name = re.sub(r'[<>:"/\\|?*]', '_', base_name)
    metadata_file = os.path.join(metadata_dir, f"{safe_name}.json")
    
    if not os.path.exists(metadata_file):
        return None
    
    try:
        with open(metadata_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 提取 classification 字段中的信息（新格式）
        classification = data.get('classification', {})
        
        return {
            "description": classification.get('description', ''),
            "tags": classification.get('tags', []),
            "trigger_words": classification.get('trigger_words', []),
            "trained_words": classification.get('trained_words', []),
            "primary_category": classification.get('primary_category', 'unknown'),
            "categories": classification.get('categories', []),
            "base_model": classification.get('base_model'),
            "civitai": classification.get('civitai'),
            "file_hash": data.get('file_hash', ''),
            "file_size": data.get('file_size', 0),
            "metadata": data.get('metadata', {}),
            "default_strength": 0.8,
            "strength_range": [0.5, 1.0]
        }
    except Exception as e:
        log_stderr(f"Error loading metadata for {lora_filename}: {e}")
        return None


def update_lora_database(loras: List[Dict[str, Any]], database_path: str) -> Dict[str, Any]:
    """
    更新 LoRA 数据库
    
    Args:
        loras: LoRA 信息列表
        database_path: 数据库文件路径
        
    Returns:
        更新统计信息
    """
    # 加载现有数据库
    existing_db = {}
    if os.path.exists(database_path):
        try:
            with open(database_path, 'r', encoding='utf-8') as f:
                existing_db = json.load(f)
        except Exception as e:
            log_stderr(f"Error loading existing database: {e}")
            existing_db = {}
    
    # 统计
    stats = {
        'total': len(loras),
        'new': 0,
        'updated': 0,
        'unchanged': 0
    }
    
    # 更新数据库
    for lora in loras:
        filename = lora['filename']
        if filename not in existing_db:
            existing_db[filename] = lora
            stats['new'] += 1
        else:
            # 检查是否需要更新（文件修改时间变化）
            existing_modified = existing_db[filename].get('file_modified', 0)
            new_modified = lora.get('file_modified', 0)
            if new_modified > existing_modified:
                existing_db[filename] = lora
                stats['updated'] += 1
            else:
                stats['unchanged'] += 1
    
    # 保存数据库
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    with open(database_path, 'w', encoding='utf-8') as f:
        json.dump(existing_db, f, ensure_ascii=False, indent=2)
    
    log_stderr(f"Database updated: {stats['new']} new, {stats['updated']} updated, {stats['unchanged']} unchanged")
    
    return stats


# 测试代码（独立运行时使用 stdout，作为模块被导入时所有日志走 stderr）
if __name__ == "__main__":
    # 独立运行时，允许使用 stdout 输出
    def log_stdout(message):
        """独立运行时的日志输出"""
        print(f"[LoRA Scanner] {message}")
    
    if len(sys.argv) < 2:
        print("Usage: python lora_scanner.py <lora_directory> [max_files]")
        sys.exit(1)
    
    lora_dir = sys.argv[1]
    max_files = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    
    log_stdout(f"Scanning: {lora_dir}")
    log_stdout(f"Max files: {max_files}")
    
    loras = scan_local_lora_directory(lora_dir, skip_hash=False, max_files=max_files, query_civitai=True)
    
    log_stdout(f"\nFound {len(loras)} LoRAs:")
    for lora in loras[:5]:
        log_stdout(f"\n--- {lora['filename']} ---")
        cls = lora['classification']
        log_stdout(f"Category: {cls['primary_category']}")
        log_stdout(f"Tags: {cls['tags'][:5]}")
        log_stdout(f"Trigger words: {cls['trigger_words']}")
        if cls['civitai']:
            log_stdout(f"Civitai: {cls['civitai']['name']}")
