import os
import json
import sys
import time
import glob
import uuid
import re

# 导入本地 LoRA 扫描模块
try:
    from lora_scanner import (
        scan_local_lora_directory,
        read_safetensors_metadata,
        classify_lora,
        save_lora_metadata_separate,
        load_lora_metadata_separate,
        update_lora_database,
        query_civitai_by_hash,
        extract_training_words,
        extract_trigger_words
    )
    LORA_SCANNER_AVAILABLE = True
except ImportError:
    LORA_SCANNER_AVAILABLE = False

PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__))

def load_env_file(filepath):
    """Loads a .env file into the environment variables."""
    if not os.path.isfile(filepath):
        return
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                if key not in os.environ:
                    os.environ[key] = value

env_path = os.path.join(PLUGIN_DIR, 'config.env')
load_env_file(env_path)

COMFYUI_BASE_URL = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8199").rstrip('/')
COMFYUI_WORKFLOWS_PATH_REL = os.getenv("COMFYUI_WORKFLOWS_PATH", "workflows")
COMFYUI_OUTPUT_IMAGE_TYPE = os.getenv("COMFYUI_OUTPUT_IMAGE_TYPE", "url").lower()
COMFYUI_REQUEST_TIMEOUT_SECONDS = int(os.getenv("COMFYUI_REQUEST_TIMEOUT_SECONDS", "120"))

COMFYUI_WORKFLOWS_PATH_ABS = os.path.join(PLUGIN_DIR, COMFYUI_WORKFLOWS_PATH_REL)

# LoRA 配置
# 支持两种配置项名称：COMFYUI_LORA_PATH 和 COMFYUI_LORA_DIR
COMFYUI_LORA_PATH = os.getenv("COMFYUI_LORA_PATH", "") or os.getenv("COMFYUI_LORA_DIR", "")
LORA_METADATA_DIR = os.getenv("COMFYUI_LORA_METADATA_DIR", "") or os.path.join(PLUGIN_DIR, "lora_metadata")
LORA_REGISTRY_PATH = os.path.join(PLUGIN_DIR, "lora_registry.json")  # LoRA 档案存储路径

def log_stderr(message):
    print(f"[VCPComfyUIPlugin] {message}", file=sys.stderr)
    sys.stderr.flush()

def handle_list_workflows(params):
    try:
        if not os.path.isdir(COMFYUI_WORKFLOWS_PATH_ABS):
            return {"status": "error", "error": f"Workflows directory not found: {COMFYUI_WORKFLOWS_PATH_ABS}"}
        
        workflow_files = []
        for filepath in glob.glob(os.path.join(COMFYUI_WORKFLOWS_PATH_ABS, '*.json')):
            workflow_files.append(os.path.basename(filepath))
            
        return {"status": "success", "result": json.dumps(workflow_files)}
    except Exception as e:
        log_stderr(f"Error in handle_list_workflows: {str(e)}")
        return {"status": "error", "error": f"Failed to list workflows: {str(e)}"}

def handle_discover_environment(params):
    try:
        import requests
        import traceback
        
        environment_data = {}
        object_info_url = f"{COMFYUI_BASE_URL}/object_info"
        
        try:
            response = requests.get(object_info_url, timeout=45)
            response.raise_for_status()
            full_object_info = response.json()
            
            # 获取模型列表
            checkpoints = []
            if "CheckpointLoaderSimple" in full_object_info:
                ckpt_info = full_object_info["CheckpointLoaderSimple"]
                if ckpt_info.get("input", {}).get("required", {}).get("ckpt_name"):
                    ckpt_param = ckpt_info["input"]["required"]["ckpt_name"]
                    if isinstance(ckpt_param, list) and len(ckpt_param) > 0:
                        checkpoints = ckpt_param[0] if isinstance(ckpt_param[0], list) else []
            
            # 获取LoRA列表
            loras = []
            lora_loader_nodes = ["LoraLoader", "LoraLoaderOnly", "LoraLoaderModelOnly"]
            for node_name in lora_loader_nodes:
                if node_name in full_object_info:
                    lora_info = full_object_info[node_name]
                    if lora_info.get("input", {}).get("required", {}).get("lora_name"):
                        lora_param = lora_info["input"]["required"]["lora_name"]
                        if isinstance(lora_param, list) and len(lora_param) > 0:
                            loras = lora_param[0] if isinstance(lora_param[0], list) else []
                            break
            
            # 获取采样器
            samplers = []
            if "KSampler" in full_object_info:
                ksampler_info = full_object_info["KSampler"]
                if ksampler_info.get("input", {}).get("required", {}).get("sampler_name"):
                    sampler_param = ksampler_info["input"]["required"]["sampler_name"]
                    if isinstance(sampler_param, list) and len(sampler_param) > 0:
                        samplers = sampler_param[0] if isinstance(sampler_param[0], list) else []
            
            # 获取调度器
            schedulers = []
            if "KSampler" in full_object_info:
                ksampler_info = full_object_info["KSampler"]
                if ksampler_info.get("input", {}).get("required", {}).get("scheduler"):
                    scheduler_param = ksampler_info["input"]["required"]["scheduler"]
                    if isinstance(scheduler_param, list) and len(scheduler_param) > 0:
                        schedulers = scheduler_param[0] if isinstance(scheduler_param[0], list) else []
            
            # 获取VAE列表
            vae_list = []
            if "VAELoader" in full_object_info:
                vae_info = full_object_info["VAELoader"]
                if vae_info.get("input", {}).get("required", {}).get("vae_name"):
                    vae_param = vae_info["input"]["required"]["vae_name"]
                    if isinstance(vae_param, list) and len(vae_param) > 0:
                        vae_list = vae_param[0] if isinstance(vae_param[0], list) else []
            
            # 获取Embeddings列表
            embeddings = []
            # 从CLIPTextEncode节点获取embeddings
            for node_type in ["CLIPTextEncode", "CLIPTextEncodeSDXL"]:
                if node_type in full_object_info:
                    clip_info = full_object_info[node_type]
                    # embeddings通常在CLIP的输入中
                    break
            
            environment_data = {
                "checkpoints": checkpoints,
                "loras": loras,
                "samplers": samplers,
                "schedulers": schedulers,
                "vae_list": vae_list,
                "available_nodes": list(full_object_info.keys())
            }
            
            return {"status": "success", "result": json.dumps(environment_data)}
            
        except Exception as e:
            return {"status": "error", "error": f"Failed to discover environment: {str(e)}"}
            
    except ImportError:
        return {"status": "error", "error": "requests library is not installed"}

# LoRA 数据库文件路径
LORA_DB_FILE = os.path.join(PLUGIN_DIR, "lora_database.json")

# 常见 LoRA 类型关键词映射
LORA_KEYWORD_MAPPINGS = {
    # 风格类
    "anime": {"tags": ["anime", "style", "illustration"], "compatible_styles": ["anime", "manga"], "category": "style"},
    "manga": {"tags": ["manga", "style", "black_white"], "compatible_styles": ["manga", "comic"], "category": "style"},
    "realistic": {"tags": ["realistic", "photorealistic", "photo"], "compatible_styles": ["realistic", "photo"], "category": "style"},
    "realism": {"tags": ["realistic", "photorealistic"], "compatible_styles": ["realistic"], "category": "style"},
    "cartoon": {"tags": ["cartoon", "style"], "compatible_styles": ["cartoon"], "category": "style"},
    "painting": {"tags": ["painting", "artistic", "style"], "compatible_styles": ["painting", "artistic"], "category": "style"},
    "sketch": {"tags": ["sketch", "drawing", "style"], "compatible_styles": ["sketch"], "category": "style"},
    "watercolor": {"tags": ["watercolor", "painting", "artistic"], "compatible_styles": ["watercolor"], "category": "style"},
    "oil": {"tags": ["oil_painting", "painting", "artistic"], "compatible_styles": ["oil_painting"], "category": "style"},
    "pixel": {"tags": ["pixel_art", "retro", "style"], "compatible_styles": ["pixel_art"], "category": "style"},
    "chibi": {"tags": ["chibi", "cute", "style"], "compatible_styles": ["chibi", "anime"], "category": "style"},
    "ghibli": {"tags": ["ghibli", "anime", "studio_ghibli"], "compatible_styles": ["ghibli", "anime"], "category": "style"},
    
    # 角色类
    "character": {"tags": ["character"], "category": "character"},
    "girl": {"tags": ["girl", "female", "character"], "category": "character"},
    "boy": {"tags": ["boy", "male", "character"], "category": "character"},
    "woman": {"tags": ["woman", "female", "character"], "category": "character"},
    "man": {"tags": ["man", "male", "character"], "category": "character"},
    
    # 概念/效果类
    "detail": {"tags": ["detail", "enhancement", "quality"], "category": "enhancement", "default_strength": 0.6},
    "tweaker": {"tags": ["detail", "enhancement", "tweaker"], "category": "enhancement", "default_strength": 0.6},
    "sharp": {"tags": ["sharp", "detail", "enhancement"], "category": "enhancement", "default_strength": 0.5},
    "lighting": {"tags": ["lighting", "effect"], "category": "effect"},
    "shadow": {"tags": ["shadow", "lighting", "effect"], "category": "effect"},
    "glow": {"tags": ["glow", "effect", "lighting"], "category": "effect"},
    
    # 服装类
    "dress": {"tags": ["dress", "clothing", "outfit"], "category": "clothing"},
    "uniform": {"tags": ["uniform", "clothing", "outfit"], "category": "clothing"},
    "swimsuit": {"tags": ["swimsuit", "clothing", "bikini"], "category": "clothing"},
    "lingerie": {"tags": ["lingerie", "clothing"], "category": "clothing"},
    
    # 姿势类
    "pose": {"tags": ["pose"], "category": "pose"},
    
    # 背景类
    "background": {"tags": ["background", "environment"], "category": "background"},
    "landscape": {"tags": ["landscape", "background", "scenery"], "category": "background"},
    
    # 特定主题
    "fantasy": {"tags": ["fantasy", "magical"], "compatible_styles": ["fantasy"], "category": "theme"},
    "scifi": {"tags": ["sci-fi", "science_fiction", "futuristic"], "compatible_styles": ["scifi"], "category": "theme"},
    "horror": {"tags": ["horror", "dark", "scary"], "compatible_styles": ["horror"], "category": "theme"},
    "cyberpunk": {"tags": ["cyberpunk", "scifi", "neon"], "compatible_styles": ["cyberpunk"], "category": "theme"},
    "steampunk": {"tags": ["steampunk", "victorian", "mechanical"], "compatible_styles": ["steampunk"], "category": "theme"},
    
    # 质量增强
    "quality": {"tags": ["quality", "enhancement"], "category": "enhancement", "default_strength": 0.7},
    "hd": {"tags": ["hd", "high_quality", "enhancement"], "category": "enhancement", "default_strength": 0.6},
    "4x": {"tags": ["upscale", "enhancement"], "category": "enhancement"},
    "upscale": {"tags": ["upscale", "enhancement"], "category": "enhancement"},
}

def load_lora_database():
    """加载 LoRA 数据库"""
    if os.path.isfile(LORA_DB_FILE):
        try:
            with open(LORA_DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            log_stderr(f"Failed to load lora_database.json: {str(e)}")
            return {}
    return {}

def save_lora_database(db):
    """保存 LoRA 数据库"""
    try:
        with open(LORA_DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        log_stderr(f"Failed to save lora_database.json: {str(e)}")
        return False

def infer_lora_metadata_from_filename(lora_filename):
    """从文件名推断 LoRA 元数据"""
    # 移除扩展名
    base_name = os.path.splitext(lora_filename)[0]
    
    # 清理文件名：替换下划线、连字符为空格
    clean_name = base_name.replace('_', ' ').replace('-', ' ')
    
    # 提取版本号
    version_match = re.search(r'v?\d+\.?\d*', clean_name, re.IGNORECASE)
    version = version_match.group() if version_match else None
    
    # 提取强度建议（如 lora_name_0.8）
    strength_match = re.search(r'(\d+\.?\d*)$', clean_name)
    suggested_strength = None
    if strength_match:
        try:
            suggested_strength = float(strength_match.group())
            if 0 < suggested_strength <= 2:
                clean_name = clean_name[:strength_match.start()].strip()
        except:
            pass
    
    # 分析关键词
    detected_tags = []
    detected_styles = []
    category = "unknown"
    default_strength = 0.8
    
    clean_lower = clean_name.lower()
    
    for keyword, mapping in LORA_KEYWORD_MAPPINGS.items():
        if keyword in clean_lower.split():
            detected_tags.extend(mapping.get("tags", []))
            if mapping.get("compatible_styles"):
                detected_styles.extend(mapping["compatible_styles"])
            if mapping.get("category"):
                category = mapping["category"]
            if mapping.get("default_strength"):
                default_strength = mapping["default_strength"]
    
    # 去重
    detected_tags = list(set(detected_tags))
    detected_styles = list(set(detected_styles))
    
    # 生成描述
    description_parts = []
    if category != "unknown":
        category_names = {
            "style": "风格类",
            "character": "角色类",
            "enhancement": "增强类",
            "effect": "效果类",
            "clothing": "服装类",
            "pose": "姿势类",
            "background": "背景类",
            "theme": "主题类"
        }
        description_parts.append(f"[{category_names.get(category, category)}]")
    
    if detected_tags:
        description_parts.append(f"关键词: {', '.join(detected_tags[:5])}")
    
    description = " ".join(description_parts) if description_parts else f"LoRA: {clean_name}"
    
    return {
        "description": description,
        "tags": detected_tags,
        "compatible_styles": detected_styles,
        "category": category,
        "default_strength": suggested_strength or default_strength,
        "inferred_from_filename": True
    }

def fetch_civitai_metadata(lora_filename):
    """尝试从 Civitai API 获取 LoRA 元数据"""
    try:
        import requests
        
        # 提取可能的模型 ID 或名称
        base_name = os.path.splitext(lora_filename)[0]
        
        # Civitai API 搜索
        search_url = f"https://civitai.com/api/v1/models"
        params = {
            "query": base_name,
            "types": ["LORA"],
            "limit": 1
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("items") and len(data["items"]) > 0:
                model = data["items"][0]
                
                # 提取元数据
                tags = model.get("tags", [])
                if isinstance(tags, list):
                    tags = [t.get("name", str(t)) if isinstance(t, dict) else str(t) for t in tags]
                
                return {
                    "description": model.get("description", "")[:500] if model.get("description") else "",
                    "tags": tags[:10],
                    "civitai_id": model.get("id"),
                    "civitai_name": model.get("name"),
                    "nsfw": model.get("nsfw", False),
                    "source": "civitai"
                }
    except Exception as e:
        log_stderr(f"Civitai API error for {lora_filename}: {str(e)}")
    
    return None

def auto_register_lora(lora_name, use_civitai=True):
    """自动注册单个 LoRA"""
    db = load_lora_database()
    
    if lora_name in db and db[lora_name].get("description"):
        return db[lora_name]  # 已有描述，跳过
    
    # 从文件名推断
    metadata = infer_lora_metadata_from_filename(lora_name)
    
    # 尝试从 Civitai 获取
    if use_civitai:
        civitai_data = fetch_civitai_metadata(lora_name)
        if civitai_data:
            # 合并 Civitai 数据
            if civitai_data.get("description"):
                metadata["description"] = civitai_data["description"]
            if civitai_data.get("tags"):
                metadata["tags"] = list(set(metadata["tags"] + civitai_data["tags"]))
            metadata["civitai_id"] = civitai_data.get("civitai_id")
            metadata["source"] = "civitai"
    
    # 创建或更新条目
    if lora_name not in db:
        db[lora_name] = {
            "filename": lora_name,
            "registered_at": time.strftime('%Y-%m-%d %H:%M:%S'),
            "usage_count": 0
        }
    
    # 更新元数据
    db[lora_name].update({
        "description": metadata.get("description", ""),
        "tags": metadata.get("tags", []),
        "compatible_styles": metadata.get("compatible_styles", []),
        "default_strength": metadata.get("default_strength", 0.8),
        "strength_range": [0.5, 1.0],
        "category": metadata.get("category", "unknown"),
        "auto_registered": True,
        "updated_at": time.strftime('%Y-%m-%d %H:%M:%S')
    })
    
    if "civitai_id" in metadata:
        db[lora_name]["civitai_id"] = metadata["civitai_id"]
    
    save_lora_database(db)
    return db[lora_name]

def handle_list_loras(params):
    """列出所有已建档的 LoRA"""
    try:
        db = load_lora_database()
        
        # 如果数据库为空或请求刷新，从 ComfyUI 获取最新列表
        refresh = params.get("refresh", False)
        auto_register = params.get("auto_register", False)  # 自动注册新发现的 LoRA
        
        if refresh or not db:
            import requests
            object_info_url = f"{COMFYUI_BASE_URL}/object_info"
            response = requests.get(object_info_url, timeout=45)
            response.raise_for_status()
            full_object_info = response.json()
            
            loras = []
            lora_loader_nodes = ["LoraLoader", "LoraLoaderOnly", "LoraLoaderModelOnly"]
            for node_name in lora_loader_nodes:
                if node_name in full_object_info:
                    lora_info = full_object_info[node_name]
                    if lora_info.get("input", {}).get("required", {}).get("lora_name"):
                        lora_param = lora_info["input"]["required"]["lora_name"]
                        if isinstance(lora_param, list) and len(lora_param) > 0:
                            loras = lora_param[0] if isinstance(lora_param[0], list) else []
                            break
            
            # 合并现有数据库和新发现的 LoRA
            new_loras = []
            for lora_name in loras:
                if lora_name not in db:
                    if auto_register:
                        # 自动注册并推断元数据
                        auto_register_lora(lora_name, use_civitai=params.get("use_civitai", True))
                        new_loras.append(lora_name)
                    else:
                        db[lora_name] = {
                            "filename": lora_name,
                            "description": "",
                            "tags": [],
                            "strength_range": [0.5, 1.0],
                            "default_strength": 0.8,
                            "compatible_styles": [],
                            "usage_count": 0,
                            "registered_at": time.strftime('%Y-%m-%d %H:%M:%S')
                        }
            
            if not auto_register:
                save_lora_database(db)
            
            # 重新加载数据库
            db = load_lora_database()
        
        # 返回 LoRA 列表
        lora_list = []
        for lora_name, lora_info in db.items():
            lora_list.append({
                "name": lora_name,
                "description": lora_info.get("description", ""),
                "tags": lora_info.get("tags", []),
                "default_strength": lora_info.get("default_strength", 0.8),
                "usage_count": lora_info.get("usage_count", 0),
                "category": lora_info.get("category", "unknown"),
                "auto_registered": lora_info.get("auto_registered", False)
            })
        
        result = {
            "total": len(lora_list),
            "loras": lora_list
        }
        if auto_register and new_loras:
            result["newly_registered"] = new_loras
        
        return {"status": "success", "result": json.dumps(result)}
        
    except Exception as e:
        return {"status": "error", "error": f"Failed to list LoRAs: {str(e)}"}

def handle_scan_local_loras(params):
    """扫描本地 LoRA 目录并读取元数据建档"""
    try:
        log_stderr(f"LORA_SCANNER_AVAILABLE: {LORA_SCANNER_AVAILABLE}")
        log_stderr(f"COMFYUI_LORA_PATH from config: {COMFYUI_LORA_PATH}")
        
        if not LORA_SCANNER_AVAILABLE:
            return {"status": "error", "error": "lora_scanner 模块不可用，请确保 lora_scanner.py 存在"}
        
        # 获取 LoRA 目录路径
        lora_dir = params.get("lora_dir") or COMFYUI_LORA_PATH
        log_stderr(f"lora_dir to scan: {lora_dir}")
        
        if not lora_dir:
            return {"status": "error", "error": "未配置 LoRA 目录路径，请在 config.env 中设置 COMFYUI_LORA_DIR 或通过 lora_dir 参数指定"}
        
        if not os.path.isdir(lora_dir):
            return {"status": "error", "error": f"LoRA 目录不存在: {lora_dir}"}
        
        # 扫描参数（注意：JSON 传入的是字符串，需要类型转换）
        skip_hash_raw = params.get("skip_hash", True)
        skip_hash = skip_hash_raw if isinstance(skip_hash_raw, bool) else str(skip_hash_raw).lower() in ("true", "1", "yes")
        
        max_files_raw = params.get("max_files", 0)
        max_files = int(max_files_raw) if isinstance(max_files_raw, str) else int(max_files_raw) if max_files_raw else 0
        
        # Civitai 查询（默认禁用，因为会很慢）
        query_civitai_raw = params.get("query_civitai", False)
        query_civitai = query_civitai_raw if isinstance(query_civitai_raw, bool) else str(query_civitai_raw).lower() in ("true", "1", "yes")
        
        # 扫描本地目录
        log_stderr(f"开始扫描本地 LoRA 目录: {lora_dir}")
        log_stderr(f"参数: skip_hash={skip_hash}, max_files={max_files}, query_civitai={query_civitai}")
        
        scanned_loras = scan_local_lora_directory(lora_dir, skip_hash=skip_hash, max_files=max_files, query_civitai=query_civitai)
        
        if not scanned_loras:
            return {"status": "success", "result": json.dumps({
                "total": 0,
                "loras": [],
                "lora_dir": lora_dir,
                "message": f"在 {lora_dir} 中未找到 .safetensors 文件"
            })}
        
        # 保存元数据到独立文件
        os.makedirs(LORA_METADATA_DIR, exist_ok=True)
        
        saved_loras = []
        errors = []
        for lora_info in scanned_loras:
            try:
                metadata_path = save_lora_metadata_separate(lora_info, LORA_METADATA_DIR)
                saved_loras.append({
                    "filename": lora_info["filename"],
                    "category": lora_info["classification"]["primary_category"],
                    "tags": lora_info["classification"]["tags"],
                    "trigger_words": lora_info["classification"]["trigger_words"],
                    "has_metadata": bool(lora_info.get("metadata")),
                    "metadata_path": metadata_path
                })
            except Exception as e:
                error_msg = f"保存 LoRA 元数据失败 {lora_info['filename']}: {str(e)}"
                log_stderr(error_msg)
                errors.append(error_msg)
        
        # 同时更新 lora_database.json
        db = load_lora_database()
        for lora_info in scanned_loras:
            filename = lora_info["filename"]
            classification = lora_info["classification"]
            
            db[filename] = {
                "filename": filename,
                "description": classification.get("description", ""),
                "tags": classification.get("tags", []),
                "trigger_words": classification.get("trigger_words", []),
                "primary_category": classification.get("primary_category", "unknown"),
                "categories": classification.get("categories", []),
                "default_strength": 0.8,
                "strength_range": [0.5, 1.0],
                "usage_count": 0,
                "file_size": lora_info.get("file_size", 0),
                "file_hash": lora_info.get("file_hash", ""),
                "metadata_source": "safetensors" if lora_info.get("metadata") else "filename",
                "scanned_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "registered_at": time.strftime('%Y-%m-%d %H:%M:%S')
            }
        
        save_lora_database(db)
        
        result = {
            "total": len(scanned_loras),
            "saved": len(saved_loras),
            "errors": len(errors),
            "lora_dir": lora_dir,
            "metadata_dir": LORA_METADATA_DIR,
            "loras": saved_loras[:50],  # 只返回前50个，避免响应过大
            "message": f"成功扫描 {len(scanned_loras)} 个 LoRA，保存 {len(saved_loras)} 个元数据文件"
        }
        
        if errors:
            result["error_details"] = errors[:10]  # 只返回前10个错误
        
        log_stderr(f"扫描完成: {result['message']}")
        
        return {"status": "success", "result": json.dumps(result)}
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        log_stderr(f"扫描本地 LoRA 失败: {str(e)}\n{error_trace}")
        return {"status": "error", "error": f"Failed to scan local LoRAs: {str(e)}"}


def handle_auto_register_all_loras(params):
    """自动注册所有 LoRA 并推断元数据，支持本地扫描"""
    try:
        import requests
        
        use_civitai = params.get("use_civitai", True)
        force_update = params.get("force_update", False)  # 强制更新已有条目
        use_local_scan = params.get("use_local_scan", True)  # 优先使用本地扫描
        
        loras_from_comfyui = []
        loras_from_local = []
        
        # 方式1: 从 ComfyUI API 获取 LoRA 列表
        try:
            object_info_url = f"{COMFYUI_BASE_URL}/object_info"
            response = requests.get(object_info_url, timeout=45)
            response.raise_for_status()
            full_object_info = response.json()
            
            lora_loader_nodes = ["LoraLoader", "LoraLoaderOnly", "LoraLoaderModelOnly"]
            for node_name in lora_loader_nodes:
                if node_name in full_object_info:
                    lora_info = full_object_info[node_name]
                    if lora_info.get("input", {}).get("required", {}).get("lora_name"):
                        lora_param = lora_info["input"]["required"]["lora_name"]
                        if isinstance(lora_param, list) and len(lora_param) > 0:
                            loras_from_comfyui = lora_param[0] if isinstance(lora_param[0], list) else []
                        break
        except Exception as e:
            log_stderr(f"从 ComfyUI 获取 LoRA 列表失败: {str(e)}")
        
        # 方式2: 本地扫描（如果启用且有配置路径）
        if use_local_scan and LORA_SCANNER_AVAILABLE and COMFYUI_LORA_PATH and os.path.isdir(COMFYUI_LORA_PATH):
            log_stderr(f"启用本地扫描: {COMFYUI_LORA_PATH}")
            scanned = scan_local_lora_directory(COMFYUI_LORA_PATH)
            loras_from_local = [l["filename"] for l in scanned]
            
            # 保存本地扫描的元数据
            os.makedirs(LORA_METADATA_DIR, exist_ok=True)
            for lora_info in scanned:
                save_lora_metadata_separate(lora_info, LORA_METADATA_DIR)
        
        # 合并两种来源的 LoRA 列表
        all_loras = list(set(loras_from_comfyui + loras_from_local))
        
        if not all_loras:
            return {"status": "error", "error": "未找到任何 LoRA，请检查 ComfyUI 连接或配置 COMFYUI_LORA_PATH"}
        
        # 自动注册每个 LoRA
        registered = []
        updated = []
        skipped = []
        
        for lora_name in all_loras:
            db = load_lora_database()
            
            if lora_name in db and not force_update:
                if db[lora_name].get("description") or db[lora_name].get("metadata_source") == "safetensors":
                    skipped.append(lora_name)
                    continue
            
            old_info = db.get(lora_name, {})
            
            # 优先使用本地扫描的元数据
            local_metadata = None
            if LORA_SCANNER_AVAILABLE:
                local_meta = load_lora_metadata_separate(lora_name, LORA_METADATA_DIR)
                if local_meta:
                    local_metadata = local_meta
            
            if local_metadata:
                # 使用本地扫描的元数据
                db = load_lora_database()
                if lora_name not in db:
                    db[lora_name] = {
                        "filename": lora_name,
                        "registered_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                        "usage_count": 0
                    }
                
                db[lora_name].update({
                    "description": local_metadata.get("description", ""),
                    "tags": local_metadata.get("tags", []),
                    "trigger_words": local_metadata.get("trigger_words", []),
                    "primary_category": local_metadata.get("primary_category", "unknown"),
                    "categories": local_metadata.get("categories", []),
                    "default_strength": local_metadata.get("default_strength", 0.8),
                    "strength_range": local_metadata.get("strength_range", [0.5, 1.0]),
                    "metadata_source": "safetensors",
                    "scanned_at": time.strftime('%Y-%m-%d %H:%M:%S')
                })
                save_lora_database(db)
            else:
                # 回退到文件名推断 + Civitai
                auto_register_lora(lora_name, use_civitai=use_civitai)
            
            if lora_name in old_info:
                updated.append(lora_name)
            else:
                registered.append(lora_name)
        
        return {"status": "success", "result": json.dumps({
            "total_loras": len(all_loras),
            "from_comfyui": len(loras_from_comfyui),
            "from_local_scan": len(loras_from_local),
            "newly_registered": registered,
            "updated": updated,
            "skipped": skipped,
            "message": f"已注册 {len(registered)} 个新 LoRA，更新 {len(updated)} 个，跳过 {len(skipped)} 个"
        })}
        
    except Exception as e:
        return {"status": "error", "error": f"Failed to auto-register LoRAs: {str(e)}"}

def handle_get_lora_info(params):
    """获取单个 LoRA 的详细信息"""
    try:
        lora_name = params.get("lora_name")
        if not lora_name:
            return {"status": "error", "error": "Missing 'lora_name' parameter"}
        
        db = load_lora_database()
        
        if lora_name not in db:
            return {"status": "error", "error": f"LoRA '{lora_name}' not found in database"}
        
        return {"status": "success", "result": json.dumps(db[lora_name])}
        
    except Exception as e:
        return {"status": "error", "error": f"Failed to get LoRA info: {str(e)}"}

def handle_register_lora(params):
    """注册/更新 LoRA 信息"""
    try:
        lora_name = params.get("lora_name")
        if not lora_name:
            return {"status": "error", "error": "Missing 'lora_name' parameter"}
        
        db = load_lora_database()
        
        # 创建或更新 LoRA 条目
        if lora_name not in db:
            db[lora_name] = {
                "filename": lora_name,
                "registered_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "usage_count": 0
            }
        
        # 更新提供的字段
        if "description" in params:
            db[lora_name]["description"] = params["description"]
        if "tags" in params:
            db[lora_name]["tags"] = params["tags"] if isinstance(params["tags"], list) else [params["tags"]]
        if "strength_range" in params:
            db[lora_name]["strength_range"] = params["strength_range"]
        if "default_strength" in params:
            db[lora_name]["default_strength"] = float(params["default_strength"])
        if "compatible_styles" in params:
            db[lora_name]["compatible_styles"] = params["compatible_styles"] if isinstance(params["compatible_styles"], list) else [params["compatible_styles"]]
        if "trigger_words" in params:
            db[lora_name]["trigger_words"] = params["trigger_words"] if isinstance(params["trigger_words"], list) else [params["trigger_words"]]
        
        db[lora_name]["updated_at"] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        if save_lora_database(db):
            return {"status": "success", "result": json.dumps({
                "message": f"LoRA '{lora_name}' registered successfully",
                "lora_info": db[lora_name]
            })}
        else:
            return {"status": "error", "error": "Failed to save LoRA database"}
            
    except Exception as e:
        return {"status": "error", "error": f"Failed to register LoRA: {str(e)}"}

def handle_match_loras(params):
    """根据上下文智能匹配 LoRA"""
    try:
        context = params.get("context", "")
        prompt = params.get("prompt", "")
        style_hints = params.get("style_hints", [])
        max_results = params.get("max_results", 3)
        
        db = load_lora_database()
        
        if not db:
            # 如果数据库为空，先刷新
            refresh_result = handle_list_loras({"refresh": True})
            if refresh_result.get("status") != "success":
                return refresh_result
            db = load_lora_database()
        
        # 合并搜索文本
        search_text = f"{context} {prompt}".lower()
        if isinstance(style_hints, list):
            search_text += " " + " ".join(style_hints).lower()
        elif isinstance(style_hints, str):
            search_text += " " + style_hints.lower()
        
        # 计算匹配分数
        scored_loras = []
        for lora_name, lora_info in db.items():
            score = 0
            match_reasons = []
            
            # 检查标签匹配
            lora_tags = lora_info.get("tags", [])
            for tag in lora_tags:
                tag_lower = tag.lower()
                if tag_lower in search_text:
                    score += 10
                    match_reasons.append(f"标签匹配: {tag}")
            
            # 检查兼容风格匹配
            compatible_styles = lora_info.get("compatible_styles", [])
            for style in compatible_styles:
                style_lower = style.lower()
                if style_lower in search_text:
                    score += 8
                    match_reasons.append(f"风格匹配: {style}")
            
            # 检查触发词匹配
            trigger_words = lora_info.get("trigger_words", [])
            for trigger in trigger_words:
                trigger_lower = trigger.lower()
                if trigger_lower in search_text:
                    score += 15
                    match_reasons.append(f"触发词匹配: {trigger}")
            
            # 检查描述关键词匹配
            description = lora_info.get("description", "").lower()
            desc_words = description.split()
            for word in desc_words:
                if len(word) > 3 and word in search_text:
                    score += 2
            
            # 使用频率加权
            usage_count = lora_info.get("usage_count", 0)
            score += min(usage_count, 5)  # 最多加5分
            
            if score > 0:
                scored_loras.append({
                    "lora_name": lora_name,
                    "score": score,
                    "match_reasons": match_reasons,
                    "default_strength": lora_info.get("default_strength", 0.8),
                    "strength_range": lora_info.get("strength_range", [0.5, 1.0]),
                    "description": lora_info.get("description", ""),
                    "trigger_words": lora_info.get("trigger_words", [])
                })
        
        # 按分数排序
        scored_loras.sort(key=lambda x: x["score"], reverse=True)
        
        # 返回前 N 个结果
        top_loras = scored_loras[:max_results]
        
        return {"status": "success", "result": json.dumps({
            "matched_loras": top_loras,
            "total_matched": len(scored_loras),
            "search_context": search_text[:200]  # 截断返回
        })}
        
    except Exception as e:
        return {"status": "error", "error": f"Failed to match LoRAs: {str(e)}"}

def inject_lora_to_workflow(workflow_data, lora_configs):
    """将 LoRA 注入到工作流中
    
    Args:
        workflow_data: 工作流数据字典
        lora_configs: LoRA 配置列表，格式: [{"lora_name": "xxx.safetensors", "strength": 0.8}, ...]
    
    Returns:
        修改后的工作流数据
    """
    if not isinstance(workflow_data, dict) or not lora_configs:
        return workflow_data
    
    # 查找模型加载节点
    model_loader_node = None
    model_loader_id = None
    for node_id, node_info in workflow_data.items():
        if isinstance(node_info, dict):
            class_type = node_info.get("class_type")
            if class_type in ["CheckpointLoaderSimple", "CheckpointLoader", "UNETLoader"]:
                model_loader_node = node_info
                model_loader_id = node_id
                break
    
    if not model_loader_node:
        log_stderr("No model loader node found, cannot inject LoRA")
        return workflow_data
    
    # 获取模型输出槽位
    model_output = [model_loader_id, 0]  # 通常模型在槽位0
    clip_output = [model_loader_id, 1]   # CLIP在槽位1
    
    # 找到最大节点ID
    max_node_id = max([int(k) for k in workflow_data.keys() if str(k).isdigit()], default=0)
    
    # 逐个注入 LoRA
    previous_model = model_output
    previous_clip = clip_output
    
    for i, lora_config in enumerate(lora_configs):
        lora_name = lora_config.get("lora_name")
        strength = lora_config.get("strength", 0.8)
        
        if not lora_name:
            continue
        
        # 创建 LoraLoader 节点
        lora_node_id = str(max_node_id + 1 + i)
        lora_node = {
            "inputs": {
                "lora_name": lora_name,
                "strength_model": strength,
                "strength_clip": strength,
                "model": previous_model,
                "clip": previous_clip
            },
            "class_type": "LoraLoader",
            "_meta": {
                "title": f"LoRA: {lora_name}"
            }
        }
        
        workflow_data[lora_node_id] = lora_node
        
        # 更新下一个节点的输入
        previous_model = [lora_node_id, 0]
        previous_clip = [lora_node_id, 1]
    
    # 更新所有使用原始模型输出的节点，改为使用最后一个 LoRA 节点的输出
    if previous_model != model_output:
        for node_id, node_info in workflow_data.items():
            if isinstance(node_info, dict) and node_id != model_loader_id:
                inputs = node_info.get("inputs", {})
                
                # 检查模型输入
                if inputs.get("model") == model_output:
                    inputs["model"] = previous_model
                
                # 检查 CLIP 输入
                if inputs.get("clip") == clip_output:
                    inputs["clip"] = previous_clip
                
                # 检查 positive/negative 输入（可能引用 CLIP）
                for key in ["positive", "negative"]:
                    if inputs.get(key) == clip_output:
                        inputs[key] = previous_clip
    
    return workflow_data

def create_basic_workflow(prompt, negative_prompt="", width=512, height=512, steps=20, cfg=7.5, seed=-1, model_name=None):
    """创建基础文生图工作流"""
    workflow = {
        "1": {
            "inputs": {"ckpt_name": model_name or "v1-5-pruned-emaonly.ckpt"},
            "class_type": "CheckpointLoaderSimple"
        },
        "2": {
            "inputs": {"text": prompt, "clip": ["1", 1]},
            "class_type": "CLIPTextEncode"
        },
        "3": {
            "inputs": {"text": negative_prompt, "clip": ["1", 1]},
            "class_type": "CLIPTextEncode"
        },
        "4": {
            "inputs": {"width": width, "height": height, "batch_size": 1},
            "class_type": "EmptyLatentImage"
        },
        "5": {
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["4", 0]
            },
            "class_type": "KSampler"
        },
        "6": {
            "inputs": {"samples": ["5", 0], "vae": ["1", 2]},
            "class_type": "VAEDecode"
        },
        "7": {
            "inputs": {"filename_prefix": "VCP", "images": ["6", 0]},
            "class_type": "SaveImage"
        }
    }
    return workflow

def handle_generate_workflow(params):
    """修复后的动态工作流生成"""
    log_stderr("handle_generate_workflow called")
    
    ai_workflow_description_str = params.get("ai_workflow_description")
    if not ai_workflow_description_str:
        return {"status": "error", "error": "Missing 'ai_workflow_description' parameter"}
    
    try:
        # 支持多种输入格式
        workflow_data = None
        if isinstance(ai_workflow_description_str, str):
            try:
                workflow_data = json.loads(ai_workflow_description_str)
            except json.JSONDecodeError:
                # 如果是简单文本，创建基础工作流
                workflow_data = create_basic_workflow(ai_workflow_description_str)
        else:
            workflow_data = ai_workflow_description_str
        
        # 如果是基础参数模式
        if isinstance(workflow_data, dict) and "prompt" in workflow_data:
            def safe_get_str(data, key, default=""):
                """安全获取字符串参数"""
                value = data.get(key, default)
                if isinstance(value, (dict, list)):
                    return str(default)
                return str(value) if value is not None else str(default)

            def safe_get_int(data, key, default=0):
                """安全获取整数参数"""
                value = data.get(key, default)
                if isinstance(value, (dict, list)):
                    return int(default)
                try:
                    return int(float(str(value))) if value is not None else int(default)
                except (ValueError, TypeError):
                    return int(default)

            def safe_get_float(data, key, default=0.0):
                """安全获取浮点数参数"""
                value = data.get(key, default)
                if isinstance(value, (dict, list)):
                    return float(default)
                try:
                    return float(str(value)) if value is not None else float(default)
                except (ValueError, TypeError):
                    return float(default)

            prompt = safe_get_str(workflow_data, "prompt", "")
            negative_prompt = safe_get_str(workflow_data, "negative_prompt", "")
            width = safe_get_int(workflow_data, "width", 512)
            height = safe_get_int(workflow_data, "height", 512)
            steps = safe_get_int(workflow_data, "steps", 20)
            cfg = safe_get_float(workflow_data, "cfg", 7.5)
            seed = safe_get_int(workflow_data, "seed", -1)
            model_name = safe_get_str(workflow_data, "model_name")
            if not model_name or model_name.strip() == "":
                model_name = None
            
            workflow = create_basic_workflow(prompt, negative_prompt, width, height, steps, cfg, seed, model_name)
            return {"status": "success", "result": json.dumps(workflow)}
        
        # 处理列表格式输入
        elif isinstance(workflow_data, list):
            # 如果输入是列表，可能是工作流节点数组
            comfy_workflow = {}
            node_counter = 1
            
            for node in workflow_data:
                if isinstance(node, dict):
                    comfy_id = str(node.get("id", node_counter))
                    class_type = node.get("class_type") or node.get("type")
                    
                    if class_type:
                        comfy_node = {
                            "inputs": node.get("inputs", {}),
                            "class_type": class_type
                        }
                        
                        if "meta" in node:
                            comfy_node["_meta"] = node["meta"]
                            
                        comfy_workflow[comfy_id] = comfy_node
                        node_counter += 1
            
            # 确保有SaveImage节点
            save_nodes = [k for k, v in comfy_workflow.items() if v.get("class_type") == "SaveImage"]
            if not save_nodes:
                save_id = str(max([int(k) for k in comfy_workflow.keys() if str(k).isdigit()], default=0) + 1)
                comfy_workflow[save_id] = {
                    "inputs": {"images": ["6", 0], "filename_prefix": "VCP"},
                    "class_type": "SaveImage"
                }
            
            return {"status": "success", "result": json.dumps(comfy_workflow)}
        
        # 如果是标准工作流描述
        if isinstance(workflow_data, dict) and "nodes" in workflow_data:
            comfy_workflow = {}
            node_counter = 1
            
            for node in workflow_data["nodes"]:
                if not isinstance(node, dict):
                    continue
                    
                comfy_id = str(node.get("id", node_counter))
                class_type = node.get("class_type") or node.get("type")
                
                if not class_type:
                    continue
                    
                comfy_node = {
                    "inputs": node.get("inputs", {}),
                    "class_type": class_type
                }
                
                if "meta" in node:
                    comfy_node["_meta"] = node["meta"]
                    
                comfy_workflow[comfy_id] = comfy_node
                node_counter += 1
            
            # 确保有SaveImage节点
            save_nodes = [k for k, v in comfy_workflow.items() if v.get("class_type") == "SaveImage"]
            if not save_nodes:
                save_id = str(max([int(k) for k in comfy_workflow.keys() if k.isdigit()], default=0) + 1)
                comfy_workflow[save_id] = {
                    "inputs": {"images": ["6", 0], "filename_prefix": "VCP"},
                    "class_type": "SaveImage"
                }
            
            return {"status": "success", "result": json.dumps(comfy_workflow)}
            
    except Exception as e:
        log_stderr(f"Error in handle_generate_workflow: {str(e)}")
        return {"status": "error", "error": f"Failed to generate workflow: {str(e)}"}

def handle_generate_image(params):
    """修复后的图像生成处理"""
    try:
        import requests
        
        workflow_api_data = None
        
        # 处理workflow_json参数
        workflow_json_str = params.get("workflow_json")
        if workflow_json_str:
            try:
                if isinstance(workflow_json_str, str):
                    # 清理可能的格式问题
                    cleaned = workflow_json_str.strip()
                    if cleaned.startswith('{'):
                        workflow_api_data = json.loads(cleaned)
                    else:
                        # 可能是基础参数
                        base_params = json.loads(cleaned)
                        if isinstance(base_params, dict):
                            workflow_api_data = create_basic_workflow(**base_params)
                        else:
                            workflow_api_data = create_basic_workflow(prompt=str(base_params))
                else:
                    workflow_api_data = workflow_json_str
            except Exception as e:
                # 如果JSON解析失败，直接使用params创建基础工作流
                workflow_api_data = create_basic_workflow(
                    prompt=str(params.get("prompt", "")),
                    negative_prompt=str(params.get("negative_prompt", "")),
                    width=int(params.get("width", 512)),
                    height=int(params.get("height", 512)),
                    steps=int(params.get("steps", 20)),
                    cfg=float(params.get("cfg", 7.5)),
                    seed=int(params.get("seed", -1)),
                    model_name=str(params.get("model_name")) if params.get("model_name") else None
                )
        
        # 处理workflow_id参数
        elif params.get("workflow_id"):
            workflow_id_filename = str(params["workflow_id"])
            workflow_filepath = os.path.join(COMFYUI_WORKFLOWS_PATH_ABS, workflow_id_filename)
            if not os.path.isfile(workflow_filepath):
                return {"status": "error", "error": f"Workflow file not found: {workflow_filepath}"}
            
            try:
                with open(workflow_filepath, 'r', encoding='utf-8') as f:
                    loaded_data = json.load(f)
                    if isinstance(loaded_data, dict):
                        workflow_api_data = loaded_data
                    elif isinstance(loaded_data, list):
                        # 处理工作流节点列表
                        workflow_api_data = {}
                        for i, node in enumerate(loaded_data):
                            if isinstance(node, dict):
                                node_id = str(node.get("id", i+1))
                                workflow_api_data[node_id] = node
                    else:
                        workflow_api_data = create_basic_workflow(prompt=str(loaded_data))
            except Exception as e:
                return {"status": "error", "error": f"Failed to load workflow '{workflow_id_filename}': {str(e)}"}
        
        else:
            # 创建基础工作流 - 确保params是字典
            safe_params = params if isinstance(params, dict) else {}
            
            def safe_extract_str(p, key, default=""):
                val = p.get(key, default)
                return str(val) if not isinstance(val, (dict, list)) else str(default)
            
            def safe_extract_int(p, key, default=0):
                val = p.get(key, default)
                if isinstance(val, (dict, list)):
                    return int(default)
                try:
                    return int(float(str(val)))
                except (ValueError, TypeError):
                    return int(default)
            
            def safe_extract_float(p, key, default=0.0):
                val = p.get(key, default)
                if isinstance(val, (dict, list)):
                    return float(default)
                try:
                    return float(str(val))
                except (ValueError, TypeError):
                    return float(default)

            prompt = safe_extract_str(safe_params, "prompt", "")
            negative_prompt = safe_extract_str(safe_params, "negative_prompt", "")
            width = safe_extract_int(safe_params, "width", 512)
            height = safe_extract_int(safe_params, "height", 512)
            steps = safe_extract_int(safe_params, "steps", 20)
            cfg = safe_extract_float(safe_params, "cfg", 7.5)
            seed = safe_extract_int(safe_params, "seed", -1)
            model_name = safe_extract_str(safe_params, "model_name")
            if not model_name or model_name.strip() == "":
                model_name = None
            
            workflow_api_data = create_basic_workflow(prompt, negative_prompt, width, height, steps, cfg, seed, model_name)
        
        # 修复工作流格式
        if isinstance(workflow_api_data, dict):
            # 确保所有节点都有class_type
            fixed_workflow = {}
            for node_id, node_data in workflow_api_data.items():
                if isinstance(node_data, dict):
                    str_id = str(node_id)
                    fixed_node = dict(node_data)
                    if "class_type" not in fixed_node:
                        fixed_node["class_type"] = fixed_node.get("type", "UnknownNode")
                    fixed_workflow[str_id] = fixed_node
            
            workflow_api_data = fixed_workflow
        
        elif isinstance(workflow_api_data, list):
            # 处理节点数组格式
            fixed_workflow = {}
            for i, node_data in enumerate(workflow_api_data):
                if isinstance(node_data, dict):
                    str_id = str(node_data.get("id", i + 1))
                    fixed_node = dict(node_data)
                    if "class_type" not in fixed_node:
                        fixed_node["class_type"] = fixed_node.get("type", "UnknownNode")
                    fixed_workflow[str_id] = fixed_node
            
            workflow_api_data = fixed_workflow
        
        else:
            # 其他格式，创建基础工作流
            workflow_api_data = create_basic_workflow("Default prompt")
        
        # 确保workflow_api_data是字典
        if not isinstance(workflow_api_data, dict):
            workflow_api_data = create_basic_workflow("Default prompt")
        
        # 应用AI参数
        modified_workflow = apply_ai_params(workflow_api_data, params)
        
        # 确保有SaveImage节点
        has_save_image = any(
            isinstance(node, dict) and node.get("class_type") == "SaveImage"
            for node in modified_workflow.values()
        )
        if not has_save_image:
            try:
                save_id = str(max([int(k) for k in modified_workflow.keys() if str(k).isdigit()], default=0) + 1)
                modified_workflow[save_id] = {
                    "inputs": {"images": ["6", 0], "filename_prefix": "VCP"},
                    "class_type": "SaveImage"
                }
            except (ValueError, TypeError):
                modified_workflow["99"] = {
                    "inputs": {"images": ["6", 0], "filename_prefix": "VCP"},
                    "class_type": "SaveImage"
                }
        
        # 发送到ComfyUI
        client_id = str(uuid.uuid4())
        prompt_payload = {"prompt": modified_workflow, "client_id": client_id}
        
        response = requests.post(
            f"{COMFYUI_BASE_URL}/prompt",
            json=prompt_payload,
            timeout=COMFYUI_REQUEST_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        
        prompt_response_data = response.json()
        prompt_id = prompt_response_data.get('prompt_id')
        
        if not prompt_id:
            return {"status": "error", "error": "ComfyUI did not return a prompt_id"}
        
        # 轮询结果
        max_poll = COMFYUI_REQUEST_TIMEOUT_SECONDS // 2
        for attempt in range(max_poll):
            time.sleep(2)
            
            history_response = requests.get(f"{COMFYUI_BASE_URL}/history/{prompt_id}", timeout=10)
            history_response.raise_for_status()
            history_data = history_response.json()
            
            if prompt_id in history_data:
                outputs = history_data[prompt_id].get("outputs", {})
                
                image_outputs = []
                for node_output in outputs.values():
                    if "images" in node_output:
                        for image_info in node_output["images"]:
                            if image_info.get("filename"):
                                filename = image_info["filename"]
                                subfolder = image_info.get("subfolder", "")
                                img_type = image_info.get("type", "output")
                                image_url = f"{COMFYUI_BASE_URL}/view?filename={filename}&subfolder={subfolder}&type={img_type}"
                                image_outputs.append({
                                    "type": "url",
                                    "filename": filename,
                                    "data": image_url
                                })
                
                if image_outputs:
                    return {"status": "success", "result": json.dumps({
                        "image_outputs": image_outputs,
                        "prompt_id": prompt_id
                    })}
                else:
                    return {"status": "error", "error": "No image outputs found"}
        
        return {"status": "error", "error": f"Task timed out after {COMFYUI_REQUEST_TIMEOUT_SECONDS} seconds"}
        
    except Exception as e:
        return {"status": "error", "error": f"Failed to generate image: {str(e)}"}

def apply_ai_params(workflow_data, ai_params):
    """应用AI参数到工作流，支持动态占位符替换"""
    if not isinstance(workflow_data, dict):
        return workflow_data
    
    # 查找关键节点
    prompt_node = None
    negative_node = None
    ksampler_node = None
    checkpoint_node = None
    
    # 第一遍：收集所有文本编码节点信息
    text_encode_nodes = {}
    for node_id, node_info in workflow_data.items():
        if not isinstance(node_info, dict):
            continue
            
        class_type = node_info.get("class_type")
        inputs = node_info.get("inputs", {})
        meta = node_info.get("_meta", {})
        title = meta.get("title", "").lower()
        
        # 识别文本编码节点（更广泛的条件，保持向后兼容）
        is_text_encode = (
            class_type == "CLIPTextEncode" or  # 保持原有逻辑
            (class_type and "textencode" in class_type.lower()) or
            (class_type and "clip" in class_type.lower() and "text" in class_type.lower())
        )
        
        if is_text_encode:
            text = str(inputs.get("text", ""))
            text_encode_nodes[node_id] = {
                "class_type": class_type,
                "text": text,
                "title": title,
                "meta": meta
            }
    
    # 第二遍：分析KSampler节点，确定实际使用的文本编码节点
    ksampler_connections = {}
    primary_ksampler = None
    
    # 首先找到主要的KSampler节点（通常是第一个或denoise=1的节点）
    for node_id, node_info in workflow_data.items():
        if isinstance(node_info, dict) and node_info.get("class_type") == "KSampler":
            inputs = node_info.get("inputs", {})
            denoise = inputs.get("denoise", 1)
            
            # 优先选择denoise=1的KSampler作为主要采样器
            if denoise == 1 or primary_ksampler is None:
                primary_ksampler = node_id
    
    # 然后分析主要KSampler的连接关系
    if primary_ksampler:
        ksampler_info = workflow_data.get(primary_ksampler, {})
        inputs = ksampler_info.get("inputs", {})
        positive_ref = inputs.get("positive")
        negative_ref = inputs.get("negative")
        
        if positive_ref and len(positive_ref) >= 2:
            ksampler_connections["positive"] = str(positive_ref[0])
        if negative_ref and len(negative_ref) >= 2:
            ksampler_connections["negative"] = str(negative_ref[0])
    
    # 第三遍：根据KSampler连接和内容分析确定节点类型
    face_prompt_node = None
    enlarge_prompt_node = None
    
    for node_id, node_info in text_encode_nodes.items():
        text = node_info["text"]
        title = node_info["title"]
        meta = node_info["meta"]
        
        # 优先使用KSampler连接信息
        if ksampler_connections.get("positive") == node_id:
            prompt_node = node_id
        elif ksampler_connections.get("negative") == node_id:
            negative_node = node_id
        else:
            # 如果没有KSampler连接信息，使用内容分析
            # 识别负面提示词节点（多种判断条件）
            is_negative = (
                "negative" in title or  # 节点标题包含negative
                "negative" in text.lower() or  # 文本内容包含negative
                "worst quality" in text or  # 常见负面提示词开头
                node_id == "4" or  # 常见的负面提示词节点ID
                (meta.get("title") and "negative" in meta.get("title", "").lower())  # 元数据标题
            )
            
            if is_negative and not negative_node:
                negative_node = node_id
            # 识别不同类型的提示词节点
            else:
                # 识别面部提示词节点
                is_face_prompt = (
                    "face" in title and "prompt" in title or  # 标题包含face和prompt
                    node_id == "31" or  # 常见的面部提示词节点ID
                    (meta.get("title") and "face" in meta.get("title", "").lower() and "prompt" in meta.get("title", "").lower())
                )
                
                # 识别放大提示词节点
                is_enlarge_prompt = (
                    "enlarge" in title and "prompt" in title or  # 标题包含enlarge和prompt
                    node_id == "38" or  # 常见的放大提示词节点ID
                    (meta.get("title") and "enlarge" in meta.get("title", "").lower() and "prompt" in meta.get("title", "").lower())
                )
                
                # 识别主要正面提示词节点
                is_main_prompt = (
                    "{prompt}" in text or  # 包含占位符
                    ("prompt" in title and "negative" not in title and "face" not in title and "enlarge" not in title) or  # 标题包含prompt但不包含其他类型
                    node_id in ["3", "40"] or  # 常见的正面提示词节点ID
                    (meta.get("title") and "prompt" in meta.get("title", "").lower() and
                     "negative" not in meta.get("title", "").lower() and
                     "face" not in meta.get("title", "").lower() and
                     "enlarge" not in meta.get("title", "").lower())
                )
                
                if is_face_prompt and not face_prompt_node:
                    face_prompt_node = node_id
                elif is_enlarge_prompt and not enlarge_prompt_node:
                    enlarge_prompt_node = node_id
                elif is_main_prompt and not prompt_node:
                    prompt_node = node_id
    
    # 第四遍：查找其他关键节点
    for node_id, node_info in workflow_data.items():
        if isinstance(node_info, dict):
            class_type = node_info.get("class_type")
            if class_type == "KSampler":
                ksampler_node = node_id
            elif class_type in ["CheckpointLoaderSimple", "CheckpointLoader"]:
                checkpoint_node = node_id
    
    # 处理动态参数替换
    def replace_placeholders(text, params):
        """替换文本中的占位符 {key} 为实际参数值"""
        if not isinstance(text, str) or not isinstance(params, dict):
            return text
        
        # 查找所有占位符 {key}
        placeholders = re.findall(r'\{(\w+)\}', text)
        for placeholder in placeholders:
            if placeholder in params:
                replacement = str(params[placeholder])
                text = text.replace(f'{{{placeholder}}}', replacement)
        return text
    
    # 应用参数到主要提示词节点
    if prompt_node:
        prompt_text = workflow_data[prompt_node]["inputs"].get("text", "")
        # 如果提供了prompt参数，检查是否包含占位符
        if ai_params.get("prompt"):
            if "{prompt}" in prompt_text:
                # 如果包含占位符，则替换占位符
                workflow_data[prompt_node]["inputs"]["text"] = replace_placeholders(prompt_text, ai_params)
            # 如果不包含占位符，则不修改文本内容，保持原有的提示词
        else:
            # 否则应用占位符替换
            workflow_data[prompt_node]["inputs"]["text"] = replace_placeholders(prompt_text, ai_params)
    
    # 应用参数到面部提示词节点
    if face_prompt_node:
        face_prompt_text = workflow_data[face_prompt_node]["inputs"].get("text", "")
        # 如果提供了face_prompt参数，检查是否包含占位符
        if ai_params.get("face_prompt"):
            if "{face_prompt}" in face_prompt_text:
                # 如果包含占位符，则替换占位符
                workflow_data[face_prompt_node]["inputs"]["text"] = replace_placeholders(face_prompt_text, ai_params)
            # 如果不包含占位符，则不修改文本内容
        else:
            # 否则应用占位符替换
            workflow_data[face_prompt_node]["inputs"]["text"] = replace_placeholders(face_prompt_text, ai_params)
    
    # 应用参数到放大提示词节点
    if enlarge_prompt_node:
        enlarge_prompt_text = workflow_data[enlarge_prompt_node]["inputs"].get("text", "")
        # 如果提供了enlarge_prompt参数，检查是否包含占位符
        if ai_params.get("enlarge_prompt"):
            if "{enlarge_prompt}" in enlarge_prompt_text:
                # 如果包含占位符，则替换占位符
                workflow_data[enlarge_prompt_node]["inputs"]["text"] = replace_placeholders(enlarge_prompt_text, ai_params)
            # 如果不包含占位符，则不修改文本内容
        else:
            # 否则应用占位符替换
            workflow_data[enlarge_prompt_node]["inputs"]["text"] = replace_placeholders(enlarge_prompt_text, ai_params)
    
    # 应用参数到负面提示词节点
    if negative_node:
        negative_text = workflow_data[negative_node]["inputs"].get("text", "")
        # 如果提供了negative_prompt参数，直接替换
        if ai_params.get("negative_prompt"):
            workflow_data[negative_node]["inputs"]["text"] = ai_params["negative_prompt"]
        else:
            # 否则应用占位符替换
            workflow_data[negative_node]["inputs"]["text"] = replace_placeholders(negative_text, ai_params)
    
    # 应用模型参数
    if checkpoint_node and ai_params.get("model_name"):
        workflow_data[checkpoint_node]["inputs"]["ckpt_name"] = ai_params["model_name"]
    
    # 应用采样器参数
    if ksampler_node:
        ksampler_inputs = workflow_data[ksampler_node]["inputs"]
        for param in ["seed", "steps", "cfg", "sampler_name", "scheduler"]:
            if param in ai_params:
                ksampler_inputs[param] = ai_params[param]
    
    # 应用 LoRA 参数
    lora_configs = ai_params.get("loras") or ai_params.get("lora_configs")
    if lora_configs:
        # 支持多种格式
        if isinstance(lora_configs, str):
            try:
                lora_configs = json.loads(lora_configs)
            except:
                # 可能是单个 LoRA 名称
                lora_configs = [{"lora_name": lora_configs, "strength": 0.8}]
        elif isinstance(lora_configs, dict):
            # 单个 LoRA 配置
            lora_configs = [lora_configs]
        
        if isinstance(lora_configs, list) and len(lora_configs) > 0:
            workflow_data = inject_lora_to_workflow(workflow_data, lora_configs)
    
    # 自动匹配 LoRA（如果启用了 auto_match_lora）
    if ai_params.get("auto_match_lora") and ai_params.get("prompt"):
        try:
            match_result = handle_match_loras({
                "prompt": ai_params.get("prompt", ""),
                "context": ai_params.get("context", ""),
                "max_results": ai_params.get("max_loras", 2)
            })
            if match_result.get("status") == "success":
                match_data = json.loads(match_result["result"])
                matched_loras = match_data.get("matched_loras", [])
                if matched_loras:
                    auto_lora_configs = []
                    for ml in matched_loras:
                        auto_lora_configs.append({
                            "lora_name": ml["lora_name"],
                            "strength": ml["default_strength"]
                        })
                    workflow_data = inject_lora_to_workflow(workflow_data, auto_lora_configs)
        except Exception as e:
            log_stderr(f"Auto match LoRA failed: {str(e)}")
    
    return workflow_data

def main():
    """主程序入口"""
    plugin_dir = os.path.dirname(os.path.abspath(__file__))
    log_file_path = os.path.join(plugin_dir, "debug_log.txt")
    
    try:
        raw_input = sys.stdin.read()
        
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(f"--- Execution @ {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
            f.write(f"Raw stdin received: {raw_input}\n")
        
        if not raw_input:
            output = {"status": "error", "error": "No input received from VCP server."}
        else:
            input_data = json.loads(raw_input)
            command = input_data.get("command")
            params = input_data
            
            if command == "generate_image":
                output = handle_generate_image(params)
            elif command == "list_workflows":
                output = handle_list_workflows(params)
            elif command == "discover_environment":
                output = handle_discover_environment(params)
            elif command == "generate_workflow":
                output = handle_generate_workflow(params)
            # LoRA 管理命令
            elif command == "list_loras":
                output = handle_list_loras(params)
            elif command == "get_lora_info":
                output = handle_get_lora_info(params)
            elif command == "register_lora":
                output = handle_register_lora(params)
            elif command == "match_loras":
                output = handle_match_loras(params)
            elif command == "auto_register_all_loras":
                output = handle_auto_register_all_loras(params)
            elif command == "scan_local_loras":
                output = handle_scan_local_loras(params)
            elif command == "scan_local_loras":
                output = handle_scan_local_loras(params)
            elif command is None and (params.get("workflow_id") or params.get("workflow_json")):
                output = handle_generate_image(params)
            elif command is None and params.get("prompt"):
                # 基础txt2img调用
                output = handle_generate_image(params)
            else:
                output = {"status": "error", "error": f"Unknown or unspecified command: '{command}'"}
        
        sys.stdout.write(json.dumps(output))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {"status": "error", "error": f"Plugin internal error: {str(e)}"}
        sys.stdout.write(json.dumps(error_result))
        sys.stdout.flush()

if __name__ == "__main__":
    main()
