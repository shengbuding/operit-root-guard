#!/bin/sh
# guard-log.sh — guard 操作日志记录器（只追加，不覆盖）
# 配套: ROOT_SAFETY_PROTOCOL.md §6（日志）
# 用法: guard-log.sh <log_file> <level> <command> <reason> <result>
# 行格式: ISO8601(含偏移) | level | command | reason | result
# 退出码: 0 成功; 2 用法错误
set -u

if [ $# -lt 5 ]; then
  echo "用法: guard-log.sh <log_file> <level> <command> <reason> <result>" >&2
  exit 2
fi

LOG_FILE="$1"; LEVEL="$2"; CMD="$3"; REASON="$4"; RESULT="$5"

# 字段校验：任一分隔符或控制字符都会破坏行格式（日志注入）
for _v in "$LEVEL" "$CMD" "$REASON" "$RESULT"; do
  case "$_v" in
    *'|'*) echo "拒绝: 日志字段含 '|'（分隔符）" >&2; exit 3 ;;
  esac
  if [ "$_v" != "$(printf '%s' "$_v" | tr -d '\t\r\n')" ]; then
    echo "拒绝: 日志字段含控制字符" >&2; exit 3
  fi
done

TS="$(date '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date '+%Y-%m-%dT%H:%M:%S')"
printf '%s | %s | %s | %s | %s\n' "$TS" "$LEVEL" "$CMD" "$REASON" "$RESULT" >> "$LOG_FILE"
exit 0