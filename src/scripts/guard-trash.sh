#!/bin/sh
# guard-trash.sh — 删除→回收站（代替裸 rm）
# 配套: ROOT_SAFETY_PROTOCOL.md §5（回收站机制）
# 设计约束: 单目标、同卷、绝对路径；拒绝空参数/通配符/路径穿越/禁写清单/不存在；
#           强制记录 manifest + guard.log；跨卷/无法同卷时拒绝。
# 用法: guard-trash.sh <target_path> <reason>
# 退出码: 0 成功入回收站; 2 用法错误; 3 安全拒绝; 4 移动失败

# ---- account write lock (same lock as withLedgerLock on JS side) ----
# Reason: this side appends with >>; if JS side replaces the file with mv,
# appended lines are lost. Both sides honoring this lock keeps them consistent.
# ---- path normalization (string-only, no readlink) ----
# Do NOT use readlink -f here: it rewrites /data/user/0 -> /data/data,
# which would make ledger paths mismatch JS-side constants.
# Only collapse the alias prefixes so both sides agree on one spelling.
norm_path() {
  _p="$1"
  case "$_p" in
    /storage/emulated/0/*) _p="/sdcard/${_p#/storage/emulated/0/}" ;;
    /storage/self/primary/*) _p="/sdcard/${_p#/storage/self/primary/}" ;;
    /data/data/*) _p="/data/user/0/${_p#/data/data/}" ;;
  esac
  printf '%s' "$_p"
}

ledger_append() {
  _mf="$1"; shift
  _lock="${_mf}.lock"
  _n=0
  while ! mkdir "$_lock" 2>/dev/null; do
    _n=$((_n+1))
    [ "$_n" -ge 100 ] && { echo "warn: ledger lock timeout" >&2; return 1; }
    sleep 0.05
  done
  printf '%s\n' "$*" >> "$_mf"
  _rc=$?
  rmdir "$_lock" 2>/dev/null
  return $_rc
}

set -u

SYS_ROOT="${GUARD_TRASH_DATA_ROOT:-/data/user/0/com.ai.assistance.operit/files/guard_data}"
USER_ROOT="${GUARD_TRASH_SDCARD_ROOT:-/sdcard/Download/Operit/.guard-trash}"

usage() { echo "用法: guard-trash.sh <target_path> <reason>" >&2; }

if [ $# -ne 2 ]; then usage; exit 2; fi
TARGET="$1"; REASON="$2"
[ -n "$TARGET" ] || { echo "拒绝: 空目标路径" >&2; exit 3; }
[ -n "$REASON" ] || { echo "拒绝: 需要填写原因" >&2; exit 3; }
if [ "$REASON" != "$(printf '%s' "$REASON" | tr -d '\t\r\n')" ]; then
  echo "拒绝: 原因含控制字符" >&2; exit 3
fi

# 日志分隔符注入（原因会写入 guard.log，含 | 会伪造列）
case "$REASON" in
  *'|'*) echo "拒绝: 原因含 '|'（日志分隔符）" >&2; exit 3 ;;
esac

# 规范化: 去尾部斜杠（保留根 /）
while [ "$TARGET" != "/" ] && [ "${TARGET%/}" != "$TARGET" ]; do TARGET="${TARGET%/}"; done

# 绝对路径
case "$TARGET" in
  /*) : ;;
  *) echo "拒绝: 仅接受绝对路径: $TARGET" >&2; exit 3 ;;
esac

# 控制字符（防日志注入/行破坏）
if [ "$TARGET" != "$(printf '%s' "$TARGET" | tr -d '\t\r\n')" ]; then
  echo "拒绝: 路径含控制字符" >&2; exit 3
fi

# 日志分隔符注入（guard.log 用 ' | ' 分隔，路径含 | 会伪造列）
case "$TARGET" in
  *'|'*) echo "拒绝: 路径含 '|'（日志分隔符）: $TARGET" >&2; exit 3 ;;
esac

# 通配符（未展开）
case "$TARGET" in
  *'*'*|*'?'*|*'['*|*']'*) echo "拒绝: 路径含通配符: $TARGET" >&2; exit 3 ;;
esac

# 路径穿越
case "$TARGET" in
  *..*) echo "拒绝: 路径含 '..': $TARGET" >&2; exit 3 ;;
esac

# 根/挂载点
case "$TARGET" in
  /|/data|/sdcard|/storage|/storage/emulated|/storage/emulated/0)
    echo "拒绝: 根/挂载点: $TARGET" >&2; exit 3 ;;
esac

# 禁写清单（协议 §4）+ 环境自身保护（Ubuntu 系统目录）
case "$TARGET" in
  /system|/system/*|/vendor|/vendor/*|/product|/product/*|/system_ext|/system_ext/*|\
  /boot|/boot/*|/init_boot|/init_boot/*|/vbmeta|/vbmeta/*|\
  /persist|/persist/*|/efs|/efs/*|/metadata|/metadata/*|/firmware|/firmware/*|\
  /modemst*|/fsg|/fsg/*|/fsc|/fsc/*|\
  /data/system|/data/system/*|/data/misc|/data/misc/*|/data/adb|/data/adb/*|\
  /data/vendor|/data/vendor/*|/data/apex|/data/apex/*|/dev|/dev/*|\
  /usr|/usr/*|/bin|/bin/*|/sbin|/sbin/*|/lib|/lib/*|/lib64|/lib64/*|\
  /etc|/etc/*|/var|/var/*|/root|/root/*|/opt|/opt/*|/srv|/srv/*)
    echo "拒绝: 禁写清单/环境路径: $TARGET" >&2; exit 3 ;;
esac

# guard 工具链自身保护（校验全部内嵌脚本，不能只查单个文件名）
# 教训：早期只检查一个脚本名，含其余脚本的目录会被误判放行。
if [ -d "$TARGET" ]; then
  _hit=""
  for _f in guard-init.sh guard-trash.sh guard-restore.sh guard-backup.sh guard-log.sh guard-selftest.sh; do
    if [ -f "$TARGET/$_f" ]; then _hit="$_f"; break; fi
  done
  if [ -n "$_hit" ]; then
    echo "拒绝: 目标目录含 guard 工具链($_hit)，受保护: $TARGET" >&2; exit 3
  fi
  # 结构特征：manifest.log 与 trash/ 或 backups/ 同时存在 → 是回收站
  if [ -f "$TARGET/manifest.log" ]; then
    if [ -d "$TARGET/trash" ] || [ -d "$TARGET/backups" ]; then
      echo "拒绝: 目标目录具回收站结构，受保护: $TARGET" >&2; exit 3
    fi
  fi
fi

# 硬保护：不得操作护栏自身、kit 目录，也不得操作它们的父级
if [ "$TARGET" = "$SYS_ROOT/kit" ] || [ "$TARGET" = "$USER_ROOT/kit" ]; then
  echo "拒绝: 目标是 guard kit 目录: $TARGET" >&2; exit 3
fi
for _pr in "$SYS_ROOT" "$USER_ROOT"; do
  [ -n "$_pr" ] || continue
  if [ "$TARGET" = "$_pr" ]; then
    echo "拒绝: 目标是护栏自身路径: $TARGET" >&2; exit 3
  fi
  case "$_pr" in
    "$TARGET"/*) echo "拒绝: 目标是护栏父级: $TARGET" >&2; exit 3 ;;
  esac
done

# 存在性
if [ ! -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
  echo "拒绝: 目标不存在: $TARGET" >&2; exit 3
fi

# 卷判定（同卷原则；/data_mirror 为 /data 设备的镜像通道，视同 /data 卷）
case "$TARGET" in
  /data/*|/data_mirror/*) ROOT="$SYS_ROOT" ;;
  /sdcard/*|/storage/emulated/*) ROOT="$USER_ROOT" ;;
  *) echo "拒绝: 无法确定同卷回收站（仅支持 /data 与 /sdcard 卷）: $TARGET" >&2; exit 3 ;;
esac

# override 情形提示
if [ "$ROOT" != "/data/user/0/com.ai.assistance.operit/files/guard_data" ] && [ "$ROOT" != "/sdcard/Download/Operit/.guard-trash" ]; then
  echo "注意: 回收站根为非常规路径（override 生效）: $ROOT" >&2
fi

# 回收站自身/父级保护
if [ "$TARGET" = "$ROOT" ]; then
  echo "拒绝: 目标是回收站自身: $TARGET" >&2; exit 3
fi
case "$ROOT" in
  "$TARGET"/*) echo "拒绝: 目标是回收站父级: $TARGET" >&2; exit 3 ;;
esac

# 回收站就绪检查
if [ ! -d "$ROOT/trash" ]; then
  echo "拒绝: 回收站未就绪: $ROOT（先运行 guard-init.sh）" >&2; exit 3
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
log_event() {
  if [ -x "$SCRIPT_DIR/guard-log.sh" ]; then
    "$SCRIPT_DIR/guard-log.sh" "$ROOT/guard.log" "$1" "$2" "$3" "$4" || echo "警告: 日志写入失败" >&2
  else
    printf '%s | %s | %s | %s | %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" "$2" "$3" "$4" >> "$ROOT/guard.log" || echo "警告: 日志写入失败" >&2
  fi
}

TS="$(date '+%Y%m%d_%H%M%S')"
BASE="$(basename "$TARGET")"
DEST="$ROOT/trash/${TS}_${BASE}"
if [ -e "$DEST" ] || [ -L "$DEST" ]; then DEST="${DEST}_$$"; fi

if mv "$TARGET" "$DEST" 2>/dev/null; then
  OP="$(id -un 2>/dev/null || echo unknown)"
  MTS="$(date '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date)"
  ledger_append "$ROOT/manifest.log" "$(printf '%s\t%s\t%s\t%s\t%s' "$MTS" "$(norm_path "$TARGET")" "$(norm_path "$DEST")" "$REASON" "$OP")" || echo "警告: manifest 写入失败" >&2
  log_event "L2" "mv $TARGET -> $DEST" "$REASON" "OK"
  echo "已入回收站: $DEST"
  echo "还原命令: guard-restore.sh '$DEST'"
  exit 0
else
  log_event "L2" "mv $TARGET -> $DEST" "$REASON" "FAIL"
  echo "错误: 移动失败: $TARGET" >&2
  exit 4
fi