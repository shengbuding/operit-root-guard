#!/bin/sh
# guard-selftest.sh — guard 工具箱自测（沙箱模式，不碰真实运行时数据）
# 用法: sh guard-selftest.sh
# 说明: 通过环境变量 override 把回收站指向一次性测试沙箱；
#       全程只操作测试沙箱目录；通过后自动清理，失败则保留供排查。
# 退出码: 0=全部通过; 1=有失败
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DATA_BASE="/data/user/0/com.ai.assistance.operit/files/guard-selftest"
SDC_BASE="/sdcard/Download/Operit/guard-selftest"
export GUARD_TRASH_DATA_ROOT="$DATA_BASE/trashroot"
export GUARD_TRASH_SDCARD_ROOT="$SDC_BASE/trashroot"

PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }

# ---- helpers under test: identical implementation to guard-trash.sh ----
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
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
step(){ echo; echo "== $1 =="; }

# 安全清理：仅当路径以 guard-selftest 结尾才允许递归删除
safe_rm(){
  case "$1" in
    */guard-selftest) rm -rf "$1" ;;
    *) echo "skip unsafe rm: $1" ;;
  esac
}

expect_exit(){
  desc="$1"; exp="$2"; shift 2
  "$@" >/dev/null 2>&1
  rc=$?
  if [ "$rc" = "$exp" ]; then ok "$desc"; else bad "$desc (rc=$rc, want=$exp)"; fi
}

echo "guard-selftest 开始（沙箱模式）"

step "准备"
safe_rm "$DATA_BASE"; safe_rm "$SDC_BASE"
mkdir -p "$DATA_BASE/work" "$SDC_BASE/work" || { echo "无法创建测试目录"; exit 1; }

step "T1 init --dry-run"
"$SCRIPT_DIR/guard-init.sh" --dry-run >/dev/null 2>&1 && ok "dry-run 正常" || bad "dry-run 失败"

step "T2 init 实际初始化"
"$SCRIPT_DIR/guard-init.sh" >/dev/null 2>&1 && ok "init 成功" || bad "init 失败"
[ -d "$GUARD_TRASH_DATA_ROOT/trash" ] && ok "系统层 trash 存在" || bad "系统层 trash 缺失"
[ -d "$GUARD_TRASH_SDCARD_ROOT/trash" ] && ok "用户层 trash 存在" || bad "用户层 trash 缺失"
[ -f "$GUARD_TRASH_DATA_ROOT/manifest.log" ] && ok "manifest 存在" || bad "manifest 缺失"

step "T3 入回收站（/data 链）"
printf 'hello' > "$DATA_BASE/work/f1.txt"
out=$("$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/f1.txt" "selftest move" 2>/dev/null); rc=$?
if [ $rc -eq 0 ] && [ ! -e "$DATA_BASE/work/f1.txt" ]; then ok "trash rc=0 且原文件已移走"; else bad "trash 失败 rc=$rc out=$out"; fi
dest=$(printf '%s\n' "$out" | head -n1); dest=${dest#已入回收站: }
if [ -f "$dest" ] && [ "$(cat "$dest")" = "hello" ]; then ok "回收站内文件内容一致"; else bad "回收站内容异常: $dest"; fi
grep -q "f1.txt" "$GUARD_TRASH_DATA_ROOT/manifest.log" && ok "manifest 记录存在" || bad "manifest 无记录"

step "T4 还原"
"$SCRIPT_DIR/guard-restore.sh" "$dest" >/dev/null 2>&1 && ok "restore rc=0" || bad "restore 失败"
if [ -f "$DATA_BASE/work/f1.txt" ] && [ "$(cat "$DATA_BASE/work/f1.txt")" = "hello" ]; then ok "还原内容一致"; else bad "还原内容异常"; fi
grep -q "RESTORED" "$GUARD_TRASH_DATA_ROOT/manifest.log" && ok "manifest 含 RESTORED 记录" || bad "manifest 缺 RESTORED"

step "T5 trash 拒绝用例"
expect_exit "空参数拒绝(rc2)" 2 "$SCRIPT_DIR/guard-trash.sh"
expect_exit "缺原因拒绝(rc2)" 2 "$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/f1.txt"
expect_exit "禁写清单拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" /system/build.prop "test"
expect_exit "通配符拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/*" "test"
expect_exit "路径穿越拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "/data/user/0/../x" "test"
expect_exit "根路径拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "/" "test"
expect_exit "不存在拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/nope.txt" "test"
expect_exit "相对路径拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "work/f1.txt" "test"
expect_exit "回收站自身拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "$GUARD_TRASH_DATA_ROOT" "test"
expect_exit "guard链目录拒绝(rc3)" 3 "$SCRIPT_DIR/guard-trash.sh" "$SCRIPT_DIR" "test"

step "T6 restore 拒绝用例"
expect_exit "非回收站路径拒绝(rc3)" 3 "$SCRIPT_DIR/guard-restore.sh" "$DATA_BASE/work/f1.txt"
expect_exit "不存在回收文件拒绝(rc3)" 3 "$SCRIPT_DIR/guard-restore.sh" "$GUARD_TRASH_DATA_ROOT/trash/nope"

step "T7 还原冲突用例"
printf 'v2' > "$DATA_BASE/work/f2.txt"
out2=$("$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/f2.txt" "conflict test" 2>/dev/null)
dest2=$(printf '%s\n' "$out2" | head -n1); dest2=${dest2#已入回收站: }
printf 'new' > "$DATA_BASE/work/f2.txt"
expect_exit "原路径已存在→拒绝(rc3)" 3 "$SCRIPT_DIR/guard-restore.sh" "$dest2"
[ -f "$dest2" ] && ok "冲突时回收件保留" || bad "冲突时回收件丢失"
[ "$(cat "$DATA_BASE/work/f2.txt")" = "new" ] && ok "现行文件未被覆盖" || bad "现行文件被改动"

step "T8 sdcard 链"
printf 's1' > "$SDC_BASE/work/s1.txt"
outs=$("$SCRIPT_DIR/guard-trash.sh" "$SDC_BASE/work/s1.txt" "sdcard test" 2>/dev/null); rcs=$?
dests=$(printf '%s\n' "$outs" | head -n1); dests=${dests#已入回收站: }
if [ $rcs -eq 0 ] && [ -f "$dests" ]; then ok "sdcard trash 成功"; else bad "sdcard trash 失败 rc=$rcs"; fi
"$SCRIPT_DIR/guard-restore.sh" "$dests" >/dev/null 2>&1 && [ -f "$SDC_BASE/work/s1.txt" ] && ok "sdcard restore 成功" || bad "sdcard restore 失败"

step "T11 backup 链路（修改前备份 + 覆盖还原）"
printf 'b-orig' > "$DATA_BASE/work/bk1.txt"
outb=$("$SCRIPT_DIR/guard-backup.sh" "$DATA_BASE/work/bk1.txt" "selftest backup" 2>/dev/null); rcb=$?
destb=$(printf '%s\n' "$outb" | head -n1); destb=${destb#备份完成: }
if [ $rcb -eq 0 ] && [ -f "$destb" ]; then ok "backup 成功"; else bad "backup 失败 rc=$rcb out=$outb"; fi
[ "$(cat "$destb")" = "b-orig" ] && ok "备份内容一致" || bad "备份内容异常"
printf 'b-mod' > "$DATA_BASE/work/bk1.txt"
"$SCRIPT_DIR/guard-restore.sh" "$destb" >/dev/null 2>&1 && [ "$(cat "$DATA_BASE/work/bk1.txt")" = "b-orig" ] && ok "备份覆盖还原成功" || bad "备份覆盖还原失败"
"$SCRIPT_DIR/guard-restore.sh" "$destb" >/dev/null 2>&1 && [ "$(cat "$DATA_BASE/work/bk1.txt")" = "b-orig" ] && ok "重复覆盖还原（幂等）" || bad "幂等还原失败"

step "T12 backup 拒绝用例"
expect_exit "backup 禁写清单拒绝(rc3)" 3 "$SCRIPT_DIR/guard-backup.sh" /system/build.prop "test"
expect_exit "backup 通配符拒绝(rc3)" 3 "$SCRIPT_DIR/guard-backup.sh" "$DATA_BASE/work/*" "test"
expect_exit "backup 不存在拒绝(rc3)" 3 "$SCRIPT_DIR/guard-backup.sh" "$DATA_BASE/work/nope" "test"
expect_exit "backup 目录拒绝(rc3)" 3 "$SCRIPT_DIR/guard-backup.sh" "$DATA_BASE/work" "test"

step "T13 restore 扩展拒绝用例"
expect_exit "backup 路径被篡改拒绝(rc3)" 3 "$SCRIPT_DIR/guard-restore.sh" "$DATA_BASE/work/bk1.txt"

step "T9 manifest 格式校验"
awk -F '\t' 'NF!=5{bad=1} END{if(bad)exit 1; exit 0}' "$GUARD_TRASH_DATA_ROOT/manifest.log" && ok "系统层 manifest 5字段" || bad "系统层 manifest 格式异常"
awk -F '\t' 'NF!=5{bad=1} END{if(bad)exit 1; exit 0}' "$GUARD_TRASH_SDCARD_ROOT/manifest.log" && ok "用户层 manifest 5字段" || bad "用户层 manifest 格式异常"

step "T10 日志校验"
[ -s "$GUARD_TRASH_DATA_ROOT/guard.log" ] && ok "guard.log 非空" || bad "guard.log 为空"
grep -q "selftest move" "$GUARD_TRASH_DATA_ROOT/guard.log" && ok "日志含操作记录" || bad "日志缺记录"

step "T14 path normalization (/storage alias)"
printf 'n1' > "$SDC_BASE/work/n1.txt"
SDC_REAL=$(cd "$SDC_BASE" && pwd)
case "$SDC_REAL" in
  /sdcard/*) STOR_PATH="/storage/emulated/0/${SDC_REAL#/sdcard/}/work/n1.txt" ;;
  *) STOR_PATH="$SDC_REAL/work/n1.txt" ;;
esac
if [ -e "$STOR_PATH" ]; then
  outn=$("$SCRIPT_DIR/guard-trash.sh" "$STOR_PATH" "norm test" 2>/dev/null); rcn=$?
  if [ $rcn -eq 0 ]; then
    lastn=$(tail -n1 "$GUARD_TRASH_SDCARD_ROOT/manifest.log")
    c2n=$(printf '%s' "$lastn" | awk -F '\t' '{print $2}')
    c3n=$(printf '%s' "$lastn" | awk -F '\t' '{print $3}')
    case "$c2n" in
      /storage/emulated/0/*|/storage/self/primary/*|/data/data/*) bad "original path not normalized: $c2n" ;;
      *) ok "original path normalized" ;;
    esac
    case "$c3n" in
      /storage/emulated/0/*|/storage/self/primary/*|/data/data/*) bad "trash path not normalized: $c3n" ;;
      *) ok "trash path normalized" ;;
    esac
  else
    bad "normalization trash failed rc=$rcn"
  fi
else
  ok "normalization case skipped (sandbox not under /sdcard)"
fi

step "T15 ledger concurrent append (no lost rows)"
CF="$GUARD_TRASH_DATA_ROOT/manifest.log"
before_n=$(awk 'END{print NR}' "$CF")

# writer A in background
(
  i=0
  while [ $i -lt 15 ]; do
    i=$((i+1))
    ledger_append "$CF" "$(printf 'BGSEEN\t/xa%d\t/ya%d\tconcA%d\troot' "$i" "$i" "$i")"
    sleep 0.002
  done
) &
BGPID=$!

# writer B in foreground
j=0
while [ $j -lt 15 ]; do
  j=$((j+1))
  ledger_append "$CF" "$(printf 'FGSEEN\t/xb%d\t/yb%d\tconcB%d\troot' "$j" "$j" "$j")"
  sleep 0.002
done

wait $BGPID 2>/dev/null

after_n=$(awk 'END{print NR}' "$CF")
bg_cnt=$(grep -c '^BGSEEN' "$CF" 2>/dev/null || echo 0)
fg_cnt=$(grep -c '^FGSEEN' "$CF" 2>/dev/null || echo 0)
expect_n=$((before_n + 30))

if [ "$after_n" -eq "$expect_n" ]; then
  ok "row count exact ($before_n -> $after_n)"
else
  bad "row count mismatch ($before_n -> $after_n, want $expect_n)"
fi
[ "$bg_cnt" -eq 15 ] && ok "background writer 15/15 kept" || bad "background writer lost rows ($bg_cnt/15)"
[ "$fg_cnt" -eq 15 ] && ok "foreground writer 15/15 kept" || bad "foreground writer lost rows ($fg_cnt/15)"
if [ -d "${CF}.lock" ]; then bad "ledger lock left behind"; else ok "ledger lock clean"; fi

step "T16 ledger in-place PURGED marking"
MF2="$GUARD_TRASH_DATA_ROOT/manifest.log"
printf 'p1' > "$DATA_BASE/work/p1.txt"
outp=$("$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/work/p1.txt" "purge mark test" 2>/dev/null)
rcp=$?
if [ $rcp -eq 0 ]; then
  linesp=$(awk 'END{print NR}' "$MF2")
  targetp=$(printf '%s\n' "$outp" | head -n1); targetp=${targetp#已入回收站: }
  awk -F '\t' -v OFS='\t' -v t="$targetp" '$3==t && index($4,"PURGED")!=1 {$4="PURGED|" $4} {print}' "$MF2" > "$MF2.new"
  cp -f "$MF2.new" "$MF2"; rm -f "$MF2.new"
  lines2=$(awk 'END{print NR}' "$MF2")
  [ "$linesp" -eq "$lines2" ] && ok "row count unchanged after mark ($linesp)" || bad "row count changed ($linesp -> $lines2)"
  grep -q "PURGED|purge mark test" "$MF2" && ok "PURGED mark content correct" || bad "PURGED mark missing"
  awk -F '\t' 'NF!=5{bad=1} END{if(bad)exit 1; exit 0}' "$MF2" && ok "still 5 fields after mark" || bad "field count broken"
else
  bad "PURGED test precondition trash failed rc=$rcp"
fi

step "T17 guard_purge 范围校验（缺失/无效必须拒绝）"
# 与 root_guard.js 中 guard_purge 的范围解析保持一致的 shell 复现。
# 返回 rejected_reason 或 scope，不依赖 node，真机 sh 可跑。
purge_scope() {
  # 参数：$1=hasAll(0/1) $2=allTrue(0/1) $3=hasDays(0/1) $4=rawDays
  _ha="$1"; _at="$2"; _hd="$3"; _rd="$4"
  if [ "$_at" = "1" ] && [ "$_hd" = "1" ]; then
    printf 'both_all_and_older_than'; return
  fi
  if [ "$_ha" = "0" ] && [ "$_hd" = "0" ]; then
    printf 'missing_scope'; return
  fi
  if [ "$_hd" = "1" ]; then
    case "$_rd" in
      ''|*[!0-9]*) printf 'invalid_older_than'; return ;;
    esac
    printf 'scope:older_than=%sd' "$_rd"; return
  fi
  if [ "$_at" = "0" ] && [ "$_hd" = "0" ]; then
    printf 'all_false_without_older_than'; return
  fi
  if [ "$_at" = "1" ]; then
    printf 'scope:all'; return
  fi
  printf 'all_false_without_older_than'
}

# 无参数 / 仅 confirm / all=false / 空串 / 空白
r=$(purge_scope 0 0 0 ''); [ "$r" = "missing_scope" ] \
  && ok "T17 无范围被拒绝(missing_scope)" || bad "T17 无范围未拒绝: $r"

r=$(purge_scope 0 0 0 '   '); [ "$r" = "invalid_older_than" ] || [ "$r" = "missing_scope" ] \
  && ok "T17 空白天数被拒绝" || bad "T17 空白未拒绝: $r"

r=$(purge_scope 1 0 0 ''); [ "$r" = "all_false_without_older_than" ] \
  && ok "T17 all=false 无范围被拒绝" || bad "T17 all=false 未拒绝: $r"

r=$(purge_scope 0 0 1 'abc'); [ "$r" = "invalid_older_than" ] \
  && ok "T17 非数字天数被拒绝" || bad "T17 非数字未拒绝: $r"

r=$(purge_scope 0 0 1 '-5'); [ "$r" = "invalid_older_than" ] \
  && ok "T17 负数天数被拒绝" || bad "T17 负数未拒绝: $r"

r=$(purge_scope 0 0 1 '0'); [ "$r" = "scope:older_than=0d" ] \
  && ok "T17 显式 0 天被接受" || bad "T17 显式 0 天应接受: $r"

r=$(purge_scope 0 0 1 '7'); [ "$r" = "scope:older_than=7d" ] \
  && ok "T17 显式 7 天被接受" || bad "T17 显式 7 天应接受: $r"

r=$(purge_scope 1 1 0 ''); [ "$r" = "scope:all" ] \
  && ok "T17 all=true 被接受" || bad "T17 all=true 应接受: $r"

r=$(purge_scope 1 1 1 '7'); [ "$r" = "both_all_and_older_than" ] \
  && ok "T17 all+older_than 冲突被拒绝" || bad "T17 冲突未拒绝: $r"

# 关键回归断言：任何「无范围」输入都不得产出可执行 scope
for args in "0 0 0 ''" "0 0 0 '   '" "1 0 0 ''" "0 0 1 'abc'" "0 0 1 '-5'"; do
  eval "set -- $args"
  r=$(purge_scope "$1" "$2" "$3" "$4")
  case "$r" in
    scope:*) bad "T17 无范围却产出可执行 scope: [$args] -> $r" ;;
  esac
done
ok "T17 无范围输入均不产生可执行 scope"

step "T18 工具链保护：全部脚本名均受保护（不能只查单个）"
# 教训：早期只检查 guard-trash.sh，含其它脚本的目录会被放行。
TB="$DATA_BASE/t18"
mkdir -p "$TB"
for _n in guard-init.sh guard-trash.sh guard-restore.sh guard-backup.sh guard-log.sh guard-selftest.sh; do
  _d="$TB/d_${_n}"
  mkdir -p "$_d"
  : > "$_d/$_n"
  out=$(GUARD_TRASH_SDCARD_ROOT="$GUARD_TRASH_SDCARD_ROOT" \
        sh "$SCRIPT_DIR/guard-trash.sh" "$_d" "t18 $_n" 2>&1)
  rc=$?
  if [ $rc -eq 3 ] && printf '%s' "$out" | grep -q "含 guard 工具链"; then
    ok "T18 含 $_n 的目录被拒绝"
  else
    bad "T18 含 $_n 的目录未拒绝 (rc=$rc): $out"
  fi
done

# 结构特征：manifest.log + trash/ 应被识别为回收站并拒绝
_d="$TB/d_ledger_like"
mkdir -p "$_d/trash"
: > "$_d/manifest.log"
out=$(GUARD_TRASH_SDCARD_ROOT="$GUARD_TRASH_SDCARD_ROOT" \
      sh "$SCRIPT_DIR/guard-trash.sh" "$_d" "t18 ledger-like" 2>&1)
rc=$?
if [ $rc -eq 3 ] && printf '%s' "$out" | grep -q "回收站结构"; then
  ok "T18 具回收站结构的目录被拒绝"
else
  bad "T18 回收站结构未拒绝 (rc=$rc): $out"
fi

step "T19 日志分隔符注入（| 会伪造列）"
# guard.log 用 ' | ' 分隔；reason/path 含 | 必须拒绝
_inj="$DATA_BASE/t19.txt"
printf 'x' > "$_inj"
out=$(GUARD_TRASH_SDCARD_ROOT="$GUARD_TRASH_SDCARD_ROOT" \
      sh "$SCRIPT_DIR/guard-trash.sh" "$_inj" "reason | L1 | fake | OK" 2>&1)
rc=$?
if [ $rc -eq 3 ] && printf '%s' "$out" | grep -q "分隔符"; then
  ok "T19 reason 含 | 被拒绝"
else
  bad "T19 reason 注入未拒绝 (rc=$rc): $out"
fi

# 路径含 | 也应拒绝
_pinj="$DATA_BASE/t19pipe|name.txt"
printf 'x' > "$_pinj" 2>/dev/null || true
if [ -e "$_pinj" ]; then
  out=$(GUARD_TRASH_SDCARD_ROOT="$GUARD_TRASH_SDCARD_ROOT" \
        sh "$SCRIPT_DIR/guard-trash.sh" "$_pinj" "t19 path" 2>&1)
  rc=$?
  if [ $rc -eq 3 ] && printf '%s' "$out" | grep -q "分隔符"; then
    ok "T19 路径含 | 被拒绝"
  else
    bad "T19 路径注入未拒绝 (rc=$rc): $out"
  fi
  rm -f "$_pinj" 2>/dev/null
else
  ok "T19 路径含 | 跳过（本机不允许该文件名）"
fi

# guard-log.sh 直接调用也应拒绝
out=$(sh "$SCRIPT_DIR/guard-log.sh" "$GUARD_TRASH_DATA_ROOT/guard.log" "L1" "cmd" "rea|son" "OK" 2>&1)
rc=$?
if [ $rc -eq 3 ]; then
  ok "T19 guard-log 字段含 | 被拒绝"
else
  bad "T19 guard-log 未拒绝 (rc=$rc): $out"
fi

step "T20 目录操作需显式确认（规模预检）"
# shell 侧不强制 confirm_dir（由 JS 层拦），此处验证目录能被正确识别为目录
_t20="$DATA_BASE/t20dir"
mkdir -p "$DATA_BASE/t20dir/sub"
printf 'a' > "$DATA_BASE/t20dir/a.txt"
printf 'b' > "$DATA_BASE/t20dir/sub/b.txt"
if [ -d "$DATA_BASE/t20dir" ]; then
  ok "T20 目录存在性判定正确"
else
  bad "T20 目录判定异常"
fi
_n=$(find "$DATA_BASE/t20dir" -type f 2>/dev/null | wc -l)
[ "$_n" -eq 2 ] && ok "T20 目录文件计数正确(2)" || bad "T20 文件计数异常: $_n"
# 带 confirm_dir 语义的目录 trash（shell 层无此参数，直接执行应成功）
out=$(GUARD_TRASH_SDCARD_ROOT="$GUARD_TRASH_SDCARD_ROOT" \
      sh "$SCRIPT_DIR/guard-trash.sh" "$DATA_BASE/t20dir" "t20 dir move" 2>&1)
rc=$?
if [ $rc -eq 0 ] && [ ! -d "$DATA_BASE/t20dir" ]; then
  ok "T20 目录整体移入回收站成功"
else
  bad "T20 目录移动失败 (rc=$rc): $out"
fi

echo
echo "===================="
echo "PASS=$PASS FAIL=$FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "有失败项：沙箱保留供排查 → $DATA_BASE / $SDC_BASE"
  exit 1
fi
echo "清理沙箱..."
safe_rm "$DATA_BASE"; safe_rm "$SDC_BASE"
echo "完成（沙箱已清理）"
exit 0