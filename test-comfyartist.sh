#!/bin/bash
# ComfyArtist Agent 测试脚本

echo "=========================================="
echo "ComfyArtist Agent 测试"
echo "=========================================="

# 测试文生图
echo ""
echo "测试 1: Z-Image 文生图"
echo "------------------------------------------"
cd "H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen"
echo '{"prompt":"一位年轻女性，晨光中在咖啡店看书，写实摄影风格","workflow":"zimage-t2i-fp8"}' | \
  PROJECT_BASE_PATH="H:/VCP/VCPzhangduan/VCPToolBox" \
  SERVER_PORT=6005 \
  IMAGESERVER_IMAGE_KEY=6668test \
  VarHttpUrl=http://localhost \
  DEBUG_MODE=false \
  node ComfyUIGen.js 2>&1 | grep -E '"status"|"imageUrl"|"workflow"'

echo ""
echo "测试 2: Klein 文生图"
echo "------------------------------------------"
echo '{"prompt":"A young woman with brown fox ears, cinematic lighting","workflow":"klein-t2i-miracle"}' | \
  PROJECT_BASE_PATH="H:/VCP/VCPzhangduan/VCPToolBox" \
  SERVER_PORT=6005 \
  IMAGESERVER_IMAGE_KEY=6668test \
  VarHttpUrl=http://localhost \
  DEBUG_MODE=false \
  node ComfyUIGen.js 2>&1 | grep -E '"status"|"imageUrl"|"workflow"'

echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
