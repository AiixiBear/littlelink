#!/usr/bin/env bash

# 遇到錯誤立即停止執行
set -e

# 定義輸出目錄
OUTPUT_DIR="public"

# 1. 讀取 TZ.txt 資訊與 Commit Hash
AIIXI_TZ=$(sed -n '1p' TZ.txt)
TZ_NAME=$(sed -n '2p' TZ.txt)
COMMIT_HASH=$(echo "${CF_PAGES_COMMIT_SHA:-local}" | cut -c1-7)

echo "Starting build process..."
echo "TimeZone: ${AIIXI_TZ} (${TZ_NAME})"
echo "Commit SHA: ${COMMIT_HASH}"

# 2. 清理並建立乾淨的 public/ 目錄
echo "Cleaning and creating ${OUTPUT_DIR}/ directory..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 3. 複製所有檔案到 public/ (排除不需要公開的原始碼、Git 檔案或設定檔)
echo "Copying files to ${OUTPUT_DIR}/..."
cp -R css en zh-tw images ja js 404.html robots.txt sitemap.xml _redirects "$OUTPUT_DIR/"

# 4. 定義 public/ 內需要處理的 HTML / JS 檔案列表
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

# 5. 替換時區變數 (AIIXI_TZ 與 TZ_NAME)：HTML 與 JS 都要處理
for file in "${HTML_FILES[@]}" "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s#AIIXI_TZ#${AIIXI_TZ}#g; s#TZ_NAME#${TZ_NAME}#g" "$file"
  fi
done

# 6. 替換 COMMIT_HASH_PLACEHOLDER (包含 404.html)
ALL_TARGET_FILES=("${HTML_FILES[@]}" "${OUTPUT_DIR}/404.html")
for file in "${ALL_TARGET_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i "s/COMMIT_HASH_PLACEHOLDER/${COMMIT_HASH}/g" "$file"
  fi
done

echo "Build successfully completed! Files are ready in ${OUTPUT_DIR}/"
