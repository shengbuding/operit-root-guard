#!/bin/sh
# guard-init.sh — 初始化 guard 回收站（系统层 /data 卷 + 用户层 /sdcard 卷）
# 配套: ROOT_SAFETY_PROTOCOL.md §5（回收站机制）
# 特性: 幂等（重复执行安全）；--dry-run 只打印计划。
# 用法: guard-init.sh [--dry-run]
# 退出码: 0 成功; 1 失败; 2 用法错误
set -u

SYS_ROOT="${GUARD_TRASH_DATA_ROOT:-/data/user/0/com.ai.assistance.operit/files/guard_data}"
USER_ROOT="${GUARD_TRASH_SDCARD_ROOT:-/sdcard/Download/Operit/.guard-trash}"

DRY=0
case "${1:-}" in
  --dry-run) DRY=1 ;;
  "") : ;;
  *) echo "用法: guard-init.sh [--dry-run]" >&2; exit 2 ;;
esac

if [ "${GUARD_TRASH_DATA_ROOT:-}" != "" ] || [ "${GUARD_TRASH_SDCARD_ROOT:-}" != "" ]; then
  echo "注意: 环境变量 override 生效（测试模式）"
  echo "  SYS=$SYS_ROOT"
  echo "  USER=$USER_ROOT"
fi

init_root() {
  R="$1"; TAG="$2"
  if [ "$DRY" = 1 ]; then
    echo "[dry-run] 将初始化: $R ($TAG)"
    return 0
  fi
  mkdir -p "$R/trash" || return 1
  mkdir -p "$R/backups" || return 1
  [ -f "$R/manifest.log" ] || : > "$R/manifest.log"
  [ -f "$R/guard.log" ] || : > "$R/guard.log"
  if [ ! -f "$R/README.md" ]; then
    cat > "$R/README.md" <<'EOF'
# guard 回收站
- manifest.log: TSV 记录（时间 / 原路径 / 回收路径 / 原因 / 操作者）
- trash/: 实际存放（<时间戳>_<文件名>）——删除时的去处
- backups/: 备份存放（<时间戳>_<文件名>）——修改前备份的去处
- guard.log: 操作日志
- 还原: guard-restore.sh <trash 或 backups 内路径>
- 保留期 >=30 天；清理需用户批准（L2）

## 本目录定位
这是系统层回收站（L1），承接 /data 卷上的删除；同目录还存放脚本（kit/）与备份（backups/），
不只是一个回收箱。另有用户层回收站（L2）在共享存储约定目录下的 .guard-trash/，
承接 /sdcard 卷上的删除。两处没有主次之分，分开是为了保证 mv 同卷、原子完成。
EOF
  fi
  echo "已就绪: $R ($TAG)"
  return 0
}

init_root "$SYS_ROOT" "系统层（/data 卷）" || { echo "失败: $SYS_ROOT" >&2; exit 1; }
init_root "$USER_ROOT" "用户层（/sdcard 卷）" || { echo "失败: $USER_ROOT" >&2; exit 1; }

if [ "$DRY" = 0 ] && [ -d "$USER_ROOT" ]; then
  : > "$USER_ROOT/.nomedia"
fi

echo "完成"
exit 0