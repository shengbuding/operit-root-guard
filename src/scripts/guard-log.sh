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
TS="$(date '+%Y-%m-%dT%H:%M:%S%z' 2>/dev/null || date '+%Y-%m-%dT%H:%M:%S')"
printf '%s | %s | %s | %s | %s\n' "$TS" "$LEVEL" "$CMD" "$REASON" "$RESULT" >> "$LOG_FILE"
exit 0