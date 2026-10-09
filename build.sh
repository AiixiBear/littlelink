#!/usr/bin/env bash

# 遇到錯誤立即停止執行
set -e

# 定義輸出目錄
OUTPUT_DIR="dist"
NODE_BINARY="${NODE_BINARY:-node}"

# 1. 讀取 TZ.txt 資訊與 Commit Hash
AIIXI_TZ=$(sed -n '1p' TZ.txt)
TZ_NAME=$(sed -n '2p' TZ.txt)
COMMIT_HASH=$(echo "${CF_PAGES_COMMIT_SHA:-local}" | cut -c1-7)

echo "Starting build process..."
echo "TimeZone: ${AIIXI_TZ} (${TZ_NAME})"
echo "Commit SHA: ${COMMIT_HASH}"

# 2. 使用 Astro 建置頁面
echo "Building pages with Astro..."
"$NODE_BINARY" ./node_modules/astro/bin/astro.mjs build
"$NODE_BINARY" ./node_modules/js-beautify/js/bin/html-beautify.js \
  --replace \
  --type html \
  --indent-size 2 \
  --wrap-line-length 100 \
  --no-preserve-newlines \
  --indent-inner-html \
  --end-with-newline \
  "${OUTPUT_DIR}/404.html" \
  "${OUTPUT_DIR}/zh-tw/index.html" \
  "${OUTPUT_DIR}/en/index.html" \
  "${OUTPUT_DIR}/ja/index.html"

# 3. 定義需要注入部署資訊的 HTML / JS 檔案列表
HTML_FILES=(
  "${OUTPUT_DIR}/zh-tw/index.html"
  "${OUTPUT_DIR}/en/index.html"
  "${OUTPUT_DIR}/ja/index.html"
)
JS_FILES=(
  "${OUTPUT_DIR}/zh-tw/main.js"
  "${OUTPUT_DIR}/en/main_en.js"
  "${OUTPUT_DIR}/ja/main_ja.js"
)

# 4. 替換時區變數 (AIIXI_TZ 與 TZ_NAME)：HTML 與 JS 都要處理
for file in "${HTML_FILES[@]}" "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s#AIIXI_TZ#${AIIXI_TZ}#g; s#TZ_NAME#${TZ_NAME}#g" "$file"
  fi
done

# 5. 替換 COMMIT_HASH_PLACEHOLDER (包含 404 頁)
ALL_TARGET_FILES=("${HTML_FILES[@]}" "${OUTPUT_DIR}/404.html")
for file in "${ALL_TARGET_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s/COMMIT_HASH_PLACEHOLDER/${COMMIT_HASH}/g" "$file"
  fi
done

echo "Build successfully completed! Files are ready in ${OUTPUT_DIR}/"
