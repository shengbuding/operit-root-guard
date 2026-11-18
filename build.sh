#!/usr/bin/env bash
# 从源码构建 root_guard-v<ver>.toolpkg
# 用法: ./build.sh [版本号]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

VER="${1:-}"
if [ -z "$VER" ]; then
  VER=$(node -e "const s=require('fs').readFileSync('src/root_guard.template.js','utf8'); const m=s.match(/\"version\":\s*\"([0-9.]+)\"/); process.stdout.write(m?m[1]:'')")
fi
if [ -z "$VER" ]; then
  echo "ERROR: 无法确定版本号，请显式传入" >&2
  exit 1
fi
echo "==> 构建版本: $VER"

echo "==> [1/4] 打包 shell -> scripts.bundle.json"
node src/gen.js

echo "==> [2/4] 合成 root_guard.js -> packages/"
node src/assemble.js

echo "==> [3/4] 暂存包目录"
STAGE="$ROOT/.build"
rm -rf "$STAGE"
mkdir -p "$STAGE/packages" "$STAGE/resources"
cp src/manifest.json "$STAGE/manifest.json"
cp src/main.js "$STAGE/main.js"
cp src/resources/logo.svg "$STAGE/resources/logo.svg"
cp packages/root_guard.js "$STAGE/packages/root_guard.js"

# manifest 版本号对齐
node -e "
const fs=require('fs');
const p='$STAGE/manifest.json';
const d=JSON.parse(fs.readFileSync(p,'utf8'));
d.version='$VER';
fs.writeFileSync(p, JSON.stringify(d,null,2)+'\n');
"

echo "==> [4/4] 打包 .toolpkg"
OUT="$ROOT/dist/root_guard-v$VER.toolpkg"
mkdir -p "$ROOT/dist"
rm -f "$OUT"
# 可复现构建：统一文件时间戳，避免每次打包产生不同 md5
if command -v touch >/dev/null 2>&1; then
  find "$STAGE" -exec touch -t 198001010000 {} +
fi
(cd "$STAGE" && zip -r -q -X "$OUT" manifest.json main.js packages resources)
rm -rf "$STAGE"

echo
 echo "==> 完成: $OUT"
ls -la "$OUT"
md5sum "$OUT" 2>/dev/null || true
