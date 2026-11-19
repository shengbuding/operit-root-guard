#!/bin/sh
# guard-restore.sh — 从回收站还原文件
# 配套: ROOT_SAFETY_PROTOCOL.md §5（回收站机制）
# 规则: 仅接受回收站 trash/ 内路径；按 manifest 匹配原路径；
#       原路径已存在/原目录不存在时拒绝；mv 还原（同卷保属性）。
# 用法: guard-restore.sh <trashed_path>
# 退出码: 0 已还原; 2 用法错误; 3 安全拒绝/校验失败; 4 移动失败

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

SYS_ROOT_RAW="${GUARD_TRASH_DATA_ROOT:-/data/user/0/com.ai.assistance.operit/files/guard_data}"
USER_ROOT_RAW="${GUARD_TRASH_SDCARD_ROOT:-/sdcard/Download/Operit/.guard-trash}"

# normalize roots too so prefix compare matches T
SYS_ROOT="$(norm_path "$SYS_ROOT_RAW")"
USER_ROOT="$(norm_path "$USER_ROOT_RAW")"

if [ $# -ne 1 ]; then echo "用法: guard-restore.sh <trashed_path>" >&2; exit 2; fi
T="$1"
[ -n "$T" ] || { echo "拒绝: 空参数" >&2; exit 3; }
case "$T" in
  /*) : ;;
  *) echo "拒绝: 需要绝对路径: $T" >&2; exit 3 ;;
esac

if [ "$T" != "$(printf '%s' "$T" | tr -d '\t\r\n')" ]; then
  echo "拒绝: 路径含控制字符" >&2; exit 3
fi

# 日志分隔符注入
case "$T" in
  *'|'*) echo "拒绝: 路径含 '|'（日志分隔符）: $T" >&2; exit 3 ;;
esac

# normalize BEFORE the case check: prefix compare must use one spelling
T_RAW="$T"
T="$(norm_path "$T")"

case "$T" in
  "$SYS_ROOT"/trash/*) ROOT="$SYS_ROOT" ;;
  "$USER_ROOT"/trash/*) ROOT="$USER_ROOT" ;;
  "$SYS_ROOT"/backups/*) ROOT="$SYS_ROOT" ;;
  "$USER_ROOT"/backups/*) ROOT="$USER_ROOT" ;;
  *) echo "拒绝: 不在回收站 trash/ 或 backups/ 内: $T_RAW" >&2; exit 3 ;;
esac

if [ ! -e "$T" ] && [ ! -L "$T" ]; then
  echo "拒绝: 回收文件不存在: $T_RAW" >&2; exit 3
fi

[ -f "$ROOT/manifest.log" ] || { echo "拒绝: manifest 不存在" >&2; exit 3; }

ORIG="$(awk -F '\t' -v t="$T" '
  function norm(p) {
    if (p ~ /^\/storage\/emulated\/0\//) { sub(/^\/storage\/emulated\/0\//, "", p); return "/sdcard/" p }
    if (p ~ /^\/storage\/self\/primary\//) { sub(/^\/storage\/self\/primary\//, "", p); return "/sdcard/" p }
    if (p ~ /^\/data\/data\//) { sub(/^\/data\/data\//, "", p); return "/data/user/0/" p }
    return p
  }
  norm($3)==t {o=$2}
  END{print o}' "$ROOT/manifest.log")"
if [ -z "$ORIG" ]; then
  echo "拒绝: manifest 中无此记录: $T_RAW" >&2; exit 3
fi

case "$T" in
  "$ROOT"/backups/*)
    # 备份式还原：cp -p 覆盖原文件（要求原目录在位；重复还原允许——幂等覆盖）
    PDIR="$(dirname "$ORIG")"
    if [ ! -d "$PDIR" ]; then
      echo "拒绝: 原目录不存在: $PDIR" >&2; exit 3
    fi
    SD="$(cd "$(dirname "$0")" && pwd)"
    if cp -p "$T" "$ORIG" 2>/dev/null; then
      OP="$(id -un 2>/dev/null || echo unknown)"
      MTS="$(date '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date)"
      ledger_append "$ROOT/manifest.log" "$(printf '%s\t%s\t%s\t%s\t%s' "$MTS" "$(norm_path "$ORIG")" "$(norm_path "$T")" "RESTORED-FROM-BACKUP" "$OP")" || echo "警告: manifest 写入失败" >&2
      if [ -x "$SD/guard-log.sh" ]; then
        "$SD/guard-log.sh" "$ROOT/guard.log" "RESTORE" "cp $T -> $ORIG" "备份还原(覆盖)" "OK" || echo "警告: 日志写入失败" >&2
      else
        printf '%s | %s | %s | %s | %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "RESTORE" "cp $T -> $ORIG" "备份还原(覆盖)" "OK" >> "$ROOT/guard.log" || true
      fi
      echo "已从备份覆盖还原: $ORIG"
      exit 0
    else
      echo "错误: 备份还原失败: $T" >&2; exit 4
    fi
    ;;
esac

if [ -e "$ORIG" ] || [ -L "$ORIG" ]; then
  echo "拒绝: 原路径已存在: $ORIG" >&2; exit 3
fi

PDIR="$(dirname "$ORIG")"
if [ ! -d "$PDIR" ]; then
  echo "拒绝: 原目录不存在: $PDIR" >&2; exit 3
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
log_event() {
  if [ -x "$SCRIPT_DIR/guard-log.sh" ]; then
    "$SCRIPT_DIR/guard-log.sh" "$ROOT/guard.log" "$1" "$2" "$3" "$4" || echo "警告: 日志写入失败" >&2
  else
    printf '%s | %s | %s | %s | %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" "$2" "$3" "$4" >> "$ROOT/guard.log" || echo "警告: 日志写入失败" >&2
  fi
}

if mv "$T" "$ORIG" 2>/dev/null; then
  OP="$(id -un 2>/dev/null || echo unknown)"
  MTS="$(date '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date)"
  ledger_append "$ROOT/manifest.log" "$(printf '%s\t%s\t%s\t%s\t%s' "$MTS" "$(norm_path "$ORIG")" "$(norm_path "$T")" "RESTORED" "$OP")" || echo "警告: manifest 写入失败" >&2
  log_event "RESTORE" "mv $T -> $ORIG" "还原操作" "OK"
  echo "已还原: $ORIG"
  exit 0
else
  log_event "RESTORE" "mv $T -> $ORIG" "还原操作" "FAIL"
  echo "错误: 还原失败: $T" >&2
  exit 4
fi