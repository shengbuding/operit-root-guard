/* METADATA
{
    "name": "root_guard",
    "version": "1.2.0",
    "display_name": { "zh": "Root 安全护栏", "en": "Root Guard" },
    "description": {
        "zh": "Root 操作安全护栏 v1.2.0：回收站、修改前备份、还原、日志、环境自检；新增落盘判据/审计、回收站清单、占用统计。v1.2.0 修复 guard_purge 真删后账本未标记的问题。",
        "en": "Root safety guardrails v1.2.0: trash, backup, restore, logging, env check; plus path-policy locate/audit, trash listing, usage stats. v1.2.0 fixes manifest not being marked after a real purge."
    },
    "enabledByDefault": false,
    "category": "System",
    "tools": [
        {
            "name": "guard_setup",
            "description": { "zh": "安装/更新：释放内嵌 guard 脚本到 guard_data/kit 并设权限。force=true 强制重装并做语法校验。", "en": "Install/update guard scripts. force=true to reinstall with syntax check." },
            "parameters": [
                { "name": "force", "description": { "zh": "强制重装（默认 false，已存在则短路）", "en": "Force reinstall" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_status",
            "description": { "zh": "环境自检：root 通道、权能、数据通道、回收站状态与占用（含大小/文件数/条目数）。", "en": "Environment self-check incl. trash usage." },
            "parameters": []
        },
        {
            "name": "guard_init",
            "description": { "zh": "初始化双回收站（系统层 /data 卷 + 用户层 /sdcard 卷），幂等。", "en": "Initialize trash (idempotent)." },
            "parameters": []
        },
        {
            "name": "guard_trash",
            "description": { "zh": "删除→回收站（代替裸 rm）。单目标、绝对路径、必须填原因。成功后返回回收站状态。", "en": "Move file to trash instead of rm; returns trash status." },
            "parameters": [
                { "name": "target", "description": { "zh": "目标绝对路径", "en": "Absolute path" }, "type": "string", "required": true },
                { "name": "reason", "description": { "zh": "删除原因", "en": "Reason" }, "type": "string", "required": true },
                { "name": "silent", "description": { "zh": "单次关闭回收站状态报告", "en": "Suppress trash status for this call" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_backup",
            "description": { "zh": "修改前备份：副本进 backups/，原件不动。成功后返回回收站状态。", "en": "Backup before modify; returns trash status." },
            "parameters": [
                { "name": "target", "description": { "zh": "目标绝对路径", "en": "Absolute path" }, "type": "string", "required": true },
                { "name": "reason", "description": { "zh": "备份原因", "en": "Reason" }, "type": "string", "required": true },
                { "name": "silent", "description": { "zh": "单次关闭回收站状态报告", "en": "Suppress trash status for this call" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_restore",
            "description": { "zh": "从回收站 trash/ 或 backups/ 还原（backups 为覆盖还原，幂等）。", "en": "Restore from trash or backups." },
            "parameters": [
                { "name": "trashed_path", "description": { "zh": "回收站内路径", "en": "Path in trash/backups" }, "type": "string", "required": true }
            ]
        },
        {
            "name": "guard_log",
            "description": { "zh": "写一条 guard 操作日志。", "en": "Append guard log entry." },
            "parameters": [
                { "name": "level", "description": { "zh": "级别（L1/L2/L3）", "en": "Level" }, "type": "string", "required": true },
                { "name": "command", "description": { "zh": "命令描述", "en": "Command" }, "type": "string", "required": true },
                { "name": "reason", "description": { "zh": "理由", "en": "Reason" }, "type": "string", "required": true },
                { "name": "result", "description": { "zh": "结果", "en": "Result" }, "type": "string", "required": true }
            ]
        },
        {
            "name": "guard_list",
            "description": { "zh": "列出回收站内容（系统层+用户层，按时间倒序）。用于回答「里面有什么／何时删的／为什么删」。", "en": "List trash entries from both system and user trash (newest first)." },
            "parameters": [
                { "name": "limit", "description": { "zh": "最多返回条数（默认 20）", "en": "Max entries (default 20)" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "guard_tier",
            "description": { "zh": "判定任意路径属于哪一层：L1系统层(卸载即清) / L2用户层(约定目录) / L3禁写区 / unknown。", "en": "Classify a path: L1 (uninstall-cleared) / L2 (user layer) / L3 (forbidden) / unknown." },
            "parameters": [
                { "name": "path", "description": { "zh": "待判定路径", "en": "Path to classify" }, "type": "string", "required": true }
            ]
        },
        {
            "name": "guard_locate",
            "description": { "zh": "落盘判据：给定用途返回合法落盘路径+分层+约束。AI 写文件前应先调用。注意这是判据不是强制。", "en": "Path policy: given purpose, return canonical path+tier+rules. Call before writing files. Advisory, not enforced." },
            "parameters": [
                { "name": "purpose", "description": { "zh": "用途：deliver/evidence/archive/ledger/tmp/junk/bulk", "en": "Purpose: deliver/evidence/archive/ledger/tmp/junk/bulk" }, "type": "string", "required": true },
                { "name": "name", "description": { "zh": "期望文件名（可选）", "en": "Desired filename (optional)" }, "type": "string", "required": false },
                { "name": "file_count", "description": { "zh": "预计文件数（用于大件判定）", "en": "Expected file count" }, "type": "number", "required": false },
                { "name": "size_mb", "description": { "zh": "预计体积 MB（用于大件判定）", "en": "Expected size in MB" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "guard_audit",
            "description": { "zh": "审计违规落盘：扫描禁止区（/sdcard 根、Download 顶层、Operit 顶层、/data/local/tmp、files 顶层），列出可疑 AI 产物及建议落点。", "en": "Audit forbidden write locations and suggest canonical destinations." },
            "parameters": [
                { "name": "max_per_dir", "description": { "zh": "每个禁止区最多列几项（默认 30）", "en": "Max entries per dir (default 30)" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "guard_config",
            "description": { "zh": "读取/修改护栏配置（如 report_trash 回收站状态报告开关）。", "en": "Read/modify guard config (e.g. report_trash)." },
            "parameters": [
                { "name": "report_trash", "description": { "zh": "是否在 trash/backup 后返回回收站状态", "en": "Whether to return trash status after trash/backup" }, "type": "boolean", "required": false },
                { "name": "show", "description": { "zh": "只读查询当前配置", "en": "Just show current config" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_purge",
            "description": { "zh": "清理回收站（按天数或全部）。默认只预览不删，须 confirm=true 才真删；删后将账本对应行就地标记为 PURGED（行数不变）。", "en": "Purge trash by age or all. Dry-run by default; requires confirm=true. Marks the matching ledger line as PURGED in place (no new lines)." },
            "parameters": [
                { "name": "older_than", "description": { "zh": "删除入回收站超过 N 天的条目", "en": "Purge entries older than N days" }, "type": "number", "required": false },
                { "name": "all", "description": { "zh": "清空全部（与 older_than 二选一）", "en": "Purge everything" }, "type": "boolean", "required": false },
                { "name": "confirm", "description": { "zh": "true=真正执行删除；不传或 false=只预览", "en": "true = really delete; omitted/false = preview only" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_repair",
            "description": { "zh": "修复历史残留：账本有记录但回收站已无实物的条目，批量标记为 PURGED，使之不再出现在清单里。默认只预览，须 confirm=true。不删任何实物。", "en": "Repair stale ledger entries (record exists, file gone) by marking them PURGED. Dry-run by default; requires confirm=true. Deletes nothing." },
            "parameters": [
                { "name": "confirm", "description": { "zh": "true=真执行标记；不传或 false=只预览", "en": "true = apply marks; omitted/false = preview only" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "guard_selftest",
            "description": { "zh": "运行内嵌自测（沙箱模式，不碰真实回收站）：验证 init / trash / restore / backup / 拒绝用例 / 归一化 / 并发锁 / PURGED 标记，共 50 项。", "en": "Run embedded self-test (sandbox mode, does not touch real trash): 50 checks covering init/trash/restore/backup/reject cases/normalization/concurrency lock/PURGED marking." },
            "parameters": []
        }
    ]
}*/
const rootGuard = (function () {
    const GUARD_DATA = "/data/user/0/com.ai.assistance.operit/files/guard_data";
    const KIT_DIR = GUARD_DATA + "/kit";
    const TRASH_SYS = GUARD_DATA;
    const TRASH_USER = "/sdcard/Download/Operit/.guard-trash";
    const SCRATCH = "/sdcard/Download/Operit/_scratch";
    const USER_DELIVER = "/sdcard/Download/Operit/root_guard_release";
    const CONFIG_FILE = GUARD_DATA + "/config.json";
    const USAGE_CACHE = GUARD_DATA + "/.usage-cache";
    const USAGE_TTL = 300;

    const L1_PREFIX = "/data/user/0/com.ai.assistance.operit/";
    const L1_PREFIX_DE = "/data/user_de/0/com.ai.assistance.operit/";
    const L1_PREFIX_EXT = "/sdcard/Android/data/com.ai.assistance.operit/";
    const L2_PATHS = [SCRATCH, TRASH_USER, USER_DELIVER];

    const FORBIDDEN = [
        "/sdcard",
        "/storage/emulated/0",
        "/storage/self/primary",
        "/sdcard/Download",
        "/sdcard/Download/Operit",
        "/data/local/tmp",
        "/data/user/0/com.ai.assistance.operit/files"
    ];

    const BUNDLE = {"guard-init.sh":"IyEvYmluL3NoCiMgZ3VhcmQtaW5pdC5zaCDigJQg5Yid5aeL5YyWIGd1YXJkIOWbnuaUtuerme+8iOezu+e7n+WxgiAvZGF0YSDljbcgKyDnlKjmiLflsYIgL3NkY2FyZCDljbfvvIkKIyDphY3lpZc6IFJPT1RfU0FGRVRZX1BST1RPQ09MLm1kIMKnNe+8iOWbnuaUtuermeacuuWItu+8iQojIOeJueaApzog5bmC562J77yI6YeN5aSN5omn6KGM5a6J5YWo77yJ77ybLS1kcnktcnVuIOWPquaJk+WNsOiuoeWIkuOAggojIOeUqOazlTogZ3VhcmQtaW5pdC5zaCBbLS1kcnktcnVuXQojIOmAgOWHuueggTogMCDmiJDlip87IDEg5aSx6LSlOyAyIOeUqOazlemUmeivrwpzZXQgLXUKClNZU19ST09UPSIke0dVQVJEX1RSQVNIX0RBVEFfUk9PVDotL2RhdGEvdXNlci8wL2NvbS5haS5hc3Npc3RhbmNlLm9wZXJpdC9maWxlcy9ndWFyZF9kYXRhfSIKVVNFUl9ST09UPSIke0dVQVJEX1RSQVNIX1NEQ0FSRF9ST09UOi0vc2RjYXJkL0Rvd25sb2FkL09wZXJpdC8uZ3VhcmQtdHJhc2h9IgoKRFJZPTAKY2FzZSAiJHsxOi19IiBpbgogIC0tZHJ5LXJ1bikgRFJZPTEgOzsKICAiIikgOiA7OwogICopIGVjaG8gIueUqOazlTogZ3VhcmQtaW5pdC5zaCBbLS1kcnktcnVuXSIgPiYyOyBleGl0IDIgOzsKZXNhYwoKaWYgWyAiJHtHVUFSRF9UUkFTSF9EQVRBX1JPT1Q6LX0iICE9ICIiIF0gfHwgWyAiJHtHVUFSRF9UUkFTSF9TRENBUkRfUk9PVDotfSIgIT0gIiIgXTsgdGhlbgogIGVjaG8gIuazqOaEjzog546v5aKD5Y+Y6YePIG92ZXJyaWRlIOeUn+aViO+8iOa1i+ivleaooeW8j++8iSIKICBlY2hvICIgIFNZUz0kU1lTX1JPT1QiCiAgZWNobyAiICBVU0VSPSRVU0VSX1JPT1QiCmZpCgppbml0X3Jvb3QoKSB7CiAgUj0iJDEiOyBUQUc9IiQyIgogIGlmIFsgIiREUlkiID0gMSBdOyB0aGVuCiAgICBlY2hvICJbZHJ5LXJ1bl0g5bCG5Yid5aeL5YyWOiAkUiAoJFRBRykiCiAgICByZXR1cm4gMAogIGZpCiAgbWtkaXIgLXAgIiRSL3RyYXNoIiB8fCByZXR1cm4gMQogIG1rZGlyIC1wICIkUi9iYWNrdXBzIiB8fCByZXR1cm4gMQogIFsgLWYgIiRSL21hbmlmZXN0LmxvZyIgXSB8fCA6ID4gIiRSL21hbmlmZXN0LmxvZyIKICBbIC1mICIkUi9ndWFyZC5sb2ciIF0gfHwgOiA+ICIkUi9ndWFyZC5sb2ciCiAgaWYgWyAhIC1mICIkUi9SRUFETUUubWQiIF07IHRoZW4KICAgIGNhdCA+ICIkUi9SRUFETUUubWQiIDw8J0VPRicKIyBndWFyZCDlm57mlLbnq5kKLSBtYW5pZmVzdC5sb2c6IFRTViDorrDlvZXvvIjml7bpl7QgLyDljp/ot6/lvoQgLyDlm57mlLbot6/lvoQgLyDljp/lm6AgLyDmk43kvZzogIXvvIkKLSB0cmFzaC86IOWunumZheWtmOaUvu+8iDzml7bpl7TmiLM+Xzzmlofku7blkI0+77yJ4oCU4oCU5Yig6Zmk5pe255qE5Y675aSECi0gYmFja3Vwcy86IOWkh+S7veWtmOaUvu+8iDzml7bpl7TmiLM+Xzzmlofku7blkI0+77yJ4oCU4oCU5L+u5pS55YmN5aSH5Lu955qE5Y675aSECi0gZ3VhcmQubG9nOiDmk43kvZzml6Xlv5cKLSDov5jljp86IGd1YXJkLXJlc3RvcmUuc2ggPHRyYXNoIOaIliBiYWNrdXBzIOWGhei3r+W+hD4KLSDkv53nlZnmnJ8gPj0zMCDlpKnvvJvmuIXnkIbpnIDnlKjmiLfmibnlh4bvvIhMMu+8iQoKIyMg5pys55uu5b2V5a6a5L2NCui/meaYr+ezu+e7n+WxguWbnuaUtuerme+8iEwx77yJ77yM5om/5o6lIC9kYXRhIOWNt+S4iueahOWIoOmZpO+8m+WQjOebruW9lei/mOWtmOaUvuiEmuacrO+8iGtpdC/vvInkuI7lpIfku73vvIhiYWNrdXBzL++8ie+8jArkuI3lj6rmmK/kuIDkuKrlm57mlLbnrrHjgILlj6bmnInnlKjmiLflsYLlm57mlLbnq5nvvIhMMu+8ieWcqOWFseS6q+WtmOWCqOe6puWumuebruW9leS4i+eahCAuZ3VhcmQtdHJhc2gv77yMCuaJv+aOpSAvc2RjYXJkIOWNt+S4iueahOWIoOmZpOOAguS4pOWkhOayoeacieS4u+asoeS5i+WIhu+8jOWIhuW8gOaYr+S4uuS6huS/neivgSBtdiDlkIzljbfjgIHljp/lrZDlrozmiJDjgIIKRU9GCiAgZmkKICBlY2hvICLlt7LlsLHnu6o6ICRSICgkVEFHKSIKICByZXR1cm4gMAp9Cgppbml0X3Jvb3QgIiRTWVNfUk9PVCIgIuezu+e7n+Wxgu+8iC9kYXRhIOWNt++8iSIgfHwgeyBlY2hvICLlpLHotKU6ICRTWVNfUk9PVCIgPiYyOyBleGl0IDE7IH0KaW5pdF9yb290ICIkVVNFUl9ST09UIiAi55So5oi35bGC77yIL3NkY2FyZCDljbfvvIkiIHx8IHsgZWNobyAi5aSx6LSlOiAkVVNFUl9ST09UIiA+JjI7IGV4aXQgMTsgfQoKaWYgWyAiJERSWSIgPSAwIF0gJiYgWyAtZCAiJFVTRVJfUk9PVCIgXTsgdGhlbgogIDogPiAiJFVTRVJfUk9PVC8ubm9tZWRpYSIKZmkKCmVjaG8gIuWujOaIkCIKZXhpdCAw","guard-trash.sh":"IyEvYmluL3NoCiMgZ3VhcmQtdHJhc2guc2gg4oCUIOWIoOmZpOKGkuWbnuaUtuerme+8iOS7o+abv+ijuCBybe+8iQojIOmFjeWllzogUk9PVF9TQUZFVFlfUFJPVE9DT0wubWQgwqc177yI5Zue5pS256uZ5py65Yi277yJCiMg6K6+6K6h57qm5p2fOiDljZXnm67moIfjgIHlkIzljbfjgIHnu53lr7not6/lvoTvvJvmi5Lnu53nqbrlj4LmlbAv6YCa6YWN56ymL+i3r+W+hOepv+i2ii/npoHlhpnmuIXljZUv5LiN5a2Y5Zyo77ybCiMgICAgICAgICAgIOW8uuWItuiusOW9lSBtYW5pZmVzdCArIGd1YXJkLmxvZ++8m+i3qOWNty/ml6Dms5XlkIzljbfml7bmi5Lnu53jgIIKIyDnlKjms5U6IGd1YXJkLXRyYXNoLnNoIDx0YXJnZXRfcGF0aD4gPHJlYXNvbj4KIyDpgIDlh7rnoIE6IDAg5oiQ5Yqf5YWl5Zue5pS256uZOyAyIOeUqOazlemUmeivrzsgMyDlronlhajmi5Lnu507IDQg56e75Yqo5aSx6LSlCgojIC0tLS0gYWNjb3VudCB3cml0ZSBsb2NrIChzYW1lIGxvY2sgYXMgd2l0aExlZGdlckxvY2sgb24gSlMgc2lkZSkgLS0tLQojIFJlYXNvbjogdGhpcyBzaWRlIGFwcGVuZHMgd2l0aCA+PjsgaWYgSlMgc2lkZSByZXBsYWNlcyB0aGUgZmlsZSB3aXRoIG12LAojIGFwcGVuZGVkIGxpbmVzIGFyZSBsb3N0LiBCb3RoIHNpZGVzIGhvbm9yaW5nIHRoaXMgbG9jayBrZWVwcyB0aGVtIGNvbnNpc3RlbnQuCiMgLS0tLSBwYXRoIG5vcm1hbGl6YXRpb24gKHN0cmluZy1vbmx5LCBubyByZWFkbGluaykgLS0tLQojIERvIE5PVCB1c2UgcmVhZGxpbmsgLWYgaGVyZTogaXQgcmV3cml0ZXMgL2RhdGEvdXNlci8wIC0+IC9kYXRhL2RhdGEsCiMgd2hpY2ggd291bGQgbWFrZSBsZWRnZXIgcGF0aHMgbWlzbWF0Y2ggSlMtc2lkZSBjb25zdGFudHMuCiMgT25seSBjb2xsYXBzZSB0aGUgYWxpYXMgcHJlZml4ZXMgc28gYm90aCBzaWRlcyBhZ3JlZSBvbiBvbmUgc3BlbGxpbmcuCm5vcm1fcGF0aCgpIHsKICBfcD0iJDEiCiAgY2FzZSAiJF9wIiBpbgogICAgL3N0b3JhZ2UvZW11bGF0ZWQvMC8qKSBfcD0iL3NkY2FyZC8ke19wIy9zdG9yYWdlL2VtdWxhdGVkLzAvfSIgOzsKICAgIC9zdG9yYWdlL3NlbGYvcHJpbWFyeS8qKSBfcD0iL3NkY2FyZC8ke19wIy9zdG9yYWdlL3NlbGYvcHJpbWFyeS99IiA7OwogICAgL2RhdGEvZGF0YS8qKSBfcD0iL2RhdGEvdXNlci8wLyR7X3AjL2RhdGEvZGF0YS99IiA7OwogIGVzYWMKICBwcmludGYgJyVzJyAiJF9wIgp9CgpsZWRnZXJfYXBwZW5kKCkgewogIF9tZj0iJDEiOyBzaGlmdAogIF9sb2NrPSIke19tZn0ubG9jayIKICBfbj0wCiAgd2hpbGUgISBta2RpciAiJF9sb2NrIiAyPi9kZXYvbnVsbDsgZG8KICAgIF9uPSQoKF9uKzEpKQogICAgWyAiJF9uIiAtZ2UgMTAwIF0gJiYgeyBlY2hvICJ3YXJuOiBsZWRnZXIgbG9jayB0aW1lb3V0IiA+JjI7IHJldHVybiAxOyB9CiAgICBzbGVlcCAwLjA1CiAgZG9uZQogIHByaW50ZiAnJXNcbicgIiQqIiA+PiAiJF9tZiIKICBfcmM9JD8KICBybWRpciAiJF9sb2NrIiAyPi9kZXYvbnVsbAogIHJldHVybiAkX3JjCn0KCnNldCAtdQoKU1lTX1JPT1Q9IiR7R1VBUkRfVFJBU0hfREFUQV9ST09UOi0vZGF0YS91c2VyLzAvY29tLmFpLmFzc2lzdGFuY2Uub3Blcml0L2ZpbGVzL2d1YXJkX2RhdGF9IgpVU0VSX1JPT1Q9IiR7R1VBUkRfVFJBU0hfU0RDQVJEX1JPT1Q6LS9zZGNhcmQvRG93bmxvYWQvT3Blcml0Ly5ndWFyZC10cmFzaH0iCgp1c2FnZSgpIHsgZWNobyAi55So5rOVOiBndWFyZC10cmFzaC5zaCA8dGFyZ2V0X3BhdGg+IDxyZWFzb24+IiA+JjI7IH0KCmlmIFsgJCMgLW5lIDIgXTsgdGhlbiB1c2FnZTsgZXhpdCAyOyBmaQpUQVJHRVQ9IiQxIjsgUkVBU09OPSIkMiIKWyAtbiAiJFRBUkdFVCIgXSB8fCB7IGVjaG8gIuaLkue7nTog56m655uu5qCH6Lev5b6EIiA+JjI7IGV4aXQgMzsgfQpbIC1uICIkUkVBU09OIiBdIHx8IHsgZWNobyAi5ouS57udOiDpnIDopoHloavlhpnljp/lm6AiID4mMjsgZXhpdCAzOyB9CmlmIFsgIiRSRUFTT04iICE9ICIkKHByaW50ZiAnJXMnICIkUkVBU09OIiB8IHRyIC1kICdcdFxyXG4nKSIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Y6f5Zug5ZCr5o6n5Yi25a2X56ymIiA+JjI7IGV4aXQgMwpmaQoKIyDop4TojIPljJY6IOWOu+WwvumDqOaWnOadoO+8iOS/neeVmeaguSAv77yJCndoaWxlIFsgIiRUQVJHRVQiICE9ICIvIiBdICYmIFsgIiR7VEFSR0VUJS99IiAhPSAiJFRBUkdFVCIgXTsgZG8gVEFSR0VUPSIke1RBUkdFVCUvfSI7IGRvbmUKCiMg57ud5a+56Lev5b6ECmNhc2UgIiRUQVJHRVQiIGluCiAgLyopIDogOzsKICAqKSBlY2hvICLmi5Lnu506IOS7heaOpeWPl+e7neWvuei3r+W+hDogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDmjqfliLblrZfnrKbvvIjpmLLml6Xlv5fms6jlhaUv6KGM56C05Z2P77yJCmlmIFsgIiRUQVJHRVQiICE9ICIkKHByaW50ZiAnJXMnICIkVEFSR0VUIiB8IHRyIC1kICdcdFxyXG4nKSIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog6Lev5b6E5ZCr5o6n5Yi25a2X56ymIiA+JjI7IGV4aXQgMwpmaQoKIyDpgJrphY3nrKbvvIjmnKrlsZXlvIDvvIkKY2FzZSAiJFRBUkdFVCIgaW4KICAqJyonKnwqJz8nKnwqJ1snKnwqJ10nKikgZWNobyAi5ouS57udOiDot6/lvoTlkKvpgJrphY3nrKY6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg6Lev5b6E56m/6LaKCmNhc2UgIiRUQVJHRVQiIGluCiAgKi4uKikgZWNobyAi5ouS57udOiDot6/lvoTlkKsgJy4uJzogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDmoLkv5oyC6L2954K5CmNhc2UgIiRUQVJHRVQiIGluCiAgL3wvZGF0YXwvc2RjYXJkfC9zdG9yYWdlfC9zdG9yYWdlL2VtdWxhdGVkfC9zdG9yYWdlL2VtdWxhdGVkLzApCiAgICBlY2hvICLmi5Lnu506IOaguS/mjILovb3ngrk6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg56aB5YaZ5riF5Y2V77yI5Y2P6K6uIMKnNO+8iSsg546v5aKD6Ieq6Lqr5L+d5oqk77yIVWJ1bnR1IOezu+e7n+ebruW9le+8iQpjYXNlICIkVEFSR0VUIiBpbgogIC9zeXN0ZW18L3N5c3RlbS8qfC92ZW5kb3J8L3ZlbmRvci8qfC9wcm9kdWN0fC9wcm9kdWN0Lyp8L3N5c3RlbV9leHR8L3N5c3RlbV9leHQvKnxcCiAgL2Jvb3R8L2Jvb3QvKnwvaW5pdF9ib290fC9pbml0X2Jvb3QvKnwvdmJtZXRhfC92Ym1ldGEvKnxcCiAgL3BlcnNpc3R8L3BlcnNpc3QvKnwvZWZzfC9lZnMvKnwvbWV0YWRhdGF8L21ldGFkYXRhLyp8L2Zpcm13YXJlfC9maXJtd2FyZS8qfFwKICAvbW9kZW1zdCp8L2ZzZ3wvZnNnLyp8L2ZzY3wvZnNjLyp8XAogIC9kYXRhL3N5c3RlbXwvZGF0YS9zeXN0ZW0vKnwvZGF0YS9taXNjfC9kYXRhL21pc2MvKnwvZGF0YS9hZGJ8L2RhdGEvYWRiLyp8XAogIC9kYXRhL3ZlbmRvcnwvZGF0YS92ZW5kb3IvKnwvZGF0YS9hcGV4fC9kYXRhL2FwZXgvKnwvZGV2fC9kZXYvKnxcCiAgL3VzcnwvdXNyLyp8L2JpbnwvYmluLyp8L3NiaW58L3NiaW4vKnwvbGlifC9saWIvKnwvbGliNjR8L2xpYjY0Lyp8XAogIC9ldGN8L2V0Yy8qfC92YXJ8L3Zhci8qfC9yb290fC9yb290Lyp8L29wdHwvb3B0Lyp8L3Nydnwvc3J2LyopCiAgICBlY2hvICLmi5Lnu506IOemgeWGmea4heWNlS/njq/looPot6/lvoQ6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMgZ3VhcmQg5bel5YW36ZO+6Ieq6Lqr5L+d5oqkCmlmIFsgLWQgIiRUQVJHRVQiIF0gJiYgWyAtZiAiJFRBUkdFVC9ndWFyZC10cmFzaC5zaCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog55uu5qCH55uu5b2V5ZCrIGd1YXJkIOW3peWFt+mTvu+8jOWPl+S/neaKpDogJFRBUkdFVCIgPiYyOyBleGl0IDMKZmkKCiMg5a2Y5Zyo5oCnCmlmIFsgISAtZSAiJFRBUkdFVCIgXSAmJiBbICEgLUwgIiRUQVJHRVQiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOebruagh+S4jeWtmOWcqDogJFRBUkdFVCIgPiYyOyBleGl0IDMKZmkKCiMg5Y235Yik5a6a77yI5ZCM5Y235Y6f5YiZ77ybL2RhdGFfbWlycm9yIOS4uiAvZGF0YSDorr7lpIfnmoTplZzlg4/pgJrpgZPvvIzop4blkIwgL2RhdGEg5Y2377yJCmNhc2UgIiRUQVJHRVQiIGluCiAgL2RhdGEvKnwvZGF0YV9taXJyb3IvKikgUk9PVD0iJFNZU19ST09UIiA7OwogIC9zZGNhcmQvKnwvc3RvcmFnZS9lbXVsYXRlZC8qKSBST09UPSIkVVNFUl9ST09UIiA7OwogICopIGVjaG8gIuaLkue7nTog5peg5rOV56Gu5a6a5ZCM5Y235Zue5pS256uZ77yI5LuF5pSv5oyBIC9kYXRhIOS4jiAvc2RjYXJkIOWNt++8iTogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyBvdmVycmlkZSDmg4XlvaLmj5DnpLoKaWYgWyAiJFJPT1QiICE9ICIvZGF0YS91c2VyLzAvY29tLmFpLmFzc2lzdGFuY2Uub3Blcml0L2ZpbGVzL2d1YXJkX2RhdGEiIF0gJiYgWyAiJFJPT1QiICE9ICIvc2RjYXJkL0Rvd25sb2FkL09wZXJpdC8uZ3VhcmQtdHJhc2giIF07IHRoZW4KICBlY2hvICLms6jmhI86IOWbnuaUtuermeagueS4uumdnuW4uOinhOi3r+W+hO+8iG92ZXJyaWRlIOeUn+aViO+8iTogJFJPT1QiID4mMgpmaQoKIyDlm57mlLbnq5noh6rouqsv54i257qn5L+d5oqkCmlmIFsgIiRUQVJHRVQiID0gIiRST09UIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDnm67moIfmmK/lm57mlLbnq5noh6rouqs6ICRUQVJHRVQiID4mMjsgZXhpdCAzCmZpCmNhc2UgIiRST09UIiBpbgogICIkVEFSR0VUIi8qKSBlY2hvICLmi5Lnu506IOebruagh+aYr+WbnuaUtuermeeItue6pzogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDlm57mlLbnq5nlsLHnu6rmo4Dmn6UKaWYgWyAhIC1kICIkUk9PVC90cmFzaCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Zue5pS256uZ5pyq5bCx57uqOiAkUk9PVO+8iOWFiOi/kOihjCBndWFyZC1pbml0LnNo77yJIiA+JjI7IGV4aXQgMwpmaQoKU0NSSVBUX0RJUj0iJChjZCAiJChkaXJuYW1lICIkMCIpIiAmJiBwd2QpIgpsb2dfZXZlbnQoKSB7CiAgaWYgWyAteCAiJFNDUklQVF9ESVIvZ3VhcmQtbG9nLnNoIiBdOyB0aGVuCiAgICAiJFNDUklQVF9ESVIvZ3VhcmQtbG9nLnNoIiAiJFJPT1QvZ3VhcmQubG9nIiAiJDEiICIkMiIgIiQzIiAiJDQiIHx8IGVjaG8gIuitpuWRijog5pel5b+X5YaZ5YWl5aSx6LSlIiA+JjIKICBlbHNlCiAgICBwcmludGYgJyVzIHwgJXMgfCAlcyB8ICVzIHwgJXNcbicgIiQoZGF0ZSAnKyVZLSVtLSVkVCVIOiVNOiVTJXonKSIgIiQxIiAiJDIiICIkMyIgIiQ0IiA+PiAiJFJPT1QvZ3VhcmQubG9nIiB8fCBlY2hvICLorablkYo6IOaXpeW/l+WGmeWFpeWksei0pSIgPiYyCiAgZmkKfQoKVFM9IiQoZGF0ZSAnKyVZJW0lZF8lSCVNJVMnKSIKQkFTRT0iJChiYXNlbmFtZSAiJFRBUkdFVCIpIgpERVNUPSIkUk9PVC90cmFzaC8ke1RTfV8ke0JBU0V9IgppZiBbIC1lICIkREVTVCIgXSB8fCBbIC1MICIkREVTVCIgXTsgdGhlbiBERVNUPSIke0RFU1R9XyQkIjsgZmkKCmlmIG12ICIkVEFSR0VUIiAiJERFU1QiIDI+L2Rldi9udWxsOyB0aGVuCiAgT1A9IiQoaWQgLXVuIDI+L2Rldi9udWxsIHx8IGVjaG8gdW5rbm93bikiCiAgTVRTPSIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JyAyPi9kZXYvbnVsbCB8fCBkYXRlKSIKICBsZWRnZXJfYXBwZW5kICIkUk9PVC9tYW5pZmVzdC5sb2ciICIkKHByaW50ZiAnJXNcdCVzXHQlc1x0JXNcdCVzJyAiJE1UUyIgIiQobm9ybV9wYXRoICIkVEFSR0VUIikiICIkKG5vcm1fcGF0aCAiJERFU1QiKSIgIiRSRUFTT04iICIkT1AiKSIgfHwgZWNobyAi6K2m5ZGKOiBtYW5pZmVzdCDlhpnlhaXlpLHotKUiID4mMgogIGxvZ19ldmVudCAiTDIiICJtdiAkVEFSR0VUIC0+ICRERVNUIiAiJFJFQVNPTiIgIk9LIgogIGVjaG8gIuW3suWFpeWbnuaUtuermTogJERFU1QiCiAgZWNobyAi6L+Y5Y6f5ZG95LukOiBndWFyZC1yZXN0b3JlLnNoICckREVTVCciCiAgZXhpdCAwCmVsc2UKICBsb2dfZXZlbnQgIkwyIiAibXYgJFRBUkdFVCAtPiAkREVTVCIgIiRSRUFTT04iICJGQUlMIgogIGVjaG8gIumUmeivrzog56e75Yqo5aSx6LSlOiAkVEFSR0VUIiA+JjIKICBleGl0IDQKZmk=","guard-restore.sh":"IyEvYmluL3NoCiMgZ3VhcmQtcmVzdG9yZS5zaCDigJQg5LuO5Zue5pS256uZ6L+Y5Y6f5paH5Lu2CiMg6YWN5aWXOiBST09UX1NBRkVUWV9QUk9UT0NPTC5tZCDCpzXvvIjlm57mlLbnq5nmnLrliLbvvIkKIyDop4TliJk6IOS7heaOpeWPl+WbnuaUtuermSB0cmFzaC8g5YaF6Lev5b6E77yb5oyJIG1hbmlmZXN0IOWMuemFjeWOn+i3r+W+hO+8mwojICAgICAgIOWOn+i3r+W+hOW3suWtmOWcqC/ljp/nm67lvZXkuI3lrZjlnKjml7bmi5Lnu53vvJttdiDov5jljp/vvIjlkIzljbfkv53lsZ7mgKfvvInjgIIKIyDnlKjms5U6IGd1YXJkLXJlc3RvcmUuc2ggPHRyYXNoZWRfcGF0aD4KIyDpgIDlh7rnoIE6IDAg5bey6L+Y5Y6fOyAyIOeUqOazlemUmeivrzsgMyDlronlhajmi5Lnu50v5qCh6aqM5aSx6LSlOyA0IOenu+WKqOWksei0pQoKIyAtLS0tIGFjY291bnQgd3JpdGUgbG9jayAoc2FtZSBsb2NrIGFzIHdpdGhMZWRnZXJMb2NrIG9uIEpTIHNpZGUpIC0tLS0KIyBSZWFzb246IHRoaXMgc2lkZSBhcHBlbmRzIHdpdGggPj47IGlmIEpTIHNpZGUgcmVwbGFjZXMgdGhlIGZpbGUgd2l0aCBtdiwKIyBhcHBlbmRlZCBsaW5lcyBhcmUgbG9zdC4gQm90aCBzaWRlcyBob25vcmluZyB0aGlzIGxvY2sga2VlcHMgdGhlbSBjb25zaXN0ZW50LgojIC0tLS0gcGF0aCBub3JtYWxpemF0aW9uIChzdHJpbmctb25seSwgbm8gcmVhZGxpbmspIC0tLS0KIyBEbyBOT1QgdXNlIHJlYWRsaW5rIC1mIGhlcmU6IGl0IHJld3JpdGVzIC9kYXRhL3VzZXIvMCAtPiAvZGF0YS9kYXRhLAojIHdoaWNoIHdvdWxkIG1ha2UgbGVkZ2VyIHBhdGhzIG1pc21hdGNoIEpTLXNpZGUgY29uc3RhbnRzLgojIE9ubHkgY29sbGFwc2UgdGhlIGFsaWFzIHByZWZpeGVzIHNvIGJvdGggc2lkZXMgYWdyZWUgb24gb25lIHNwZWxsaW5nLgpub3JtX3BhdGgoKSB7CiAgX3A9IiQxIgogIGNhc2UgIiRfcCIgaW4KICAgIC9zdG9yYWdlL2VtdWxhdGVkLzAvKikgX3A9Ii9zZGNhcmQvJHtfcCMvc3RvcmFnZS9lbXVsYXRlZC8wL30iIDs7CiAgICAvc3RvcmFnZS9zZWxmL3ByaW1hcnkvKikgX3A9Ii9zZGNhcmQvJHtfcCMvc3RvcmFnZS9zZWxmL3ByaW1hcnkvfSIgOzsKICAgIC9kYXRhL2RhdGEvKikgX3A9Ii9kYXRhL3VzZXIvMC8ke19wIy9kYXRhL2RhdGEvfSIgOzsKICBlc2FjCiAgcHJpbnRmICclcycgIiRfcCIKfQoKbGVkZ2VyX2FwcGVuZCgpIHsKICBfbWY9IiQxIjsgc2hpZnQKICBfbG9jaz0iJHtfbWZ9LmxvY2siCiAgX249MAogIHdoaWxlICEgbWtkaXIgIiRfbG9jayIgMj4vZGV2L251bGw7IGRvCiAgICBfbj0kKChfbisxKSkKICAgIFsgIiRfbiIgLWdlIDEwMCBdICYmIHsgZWNobyAid2FybjogbGVkZ2VyIGxvY2sgdGltZW91dCIgPiYyOyByZXR1cm4gMTsgfQogICAgc2xlZXAgMC4wNQogIGRvbmUKICBwcmludGYgJyVzXG4nICIkKiIgPj4gIiRfbWYiCiAgX3JjPSQ/CiAgcm1kaXIgIiRfbG9jayIgMj4vZGV2L251bGwKICByZXR1cm4gJF9yYwp9CgpzZXQgLXUKClNZU19ST09UX1JBVz0iJHtHVUFSRF9UUkFTSF9EQVRBX1JPT1Q6LS9kYXRhL3VzZXIvMC9jb20uYWkuYXNzaXN0YW5jZS5vcGVyaXQvZmlsZXMvZ3VhcmRfZGF0YX0iClVTRVJfUk9PVF9SQVc9IiR7R1VBUkRfVFJBU0hfU0RDQVJEX1JPT1Q6LS9zZGNhcmQvRG93bmxvYWQvT3Blcml0Ly5ndWFyZC10cmFzaH0iCgojIG5vcm1hbGl6ZSByb290cyB0b28gc28gcHJlZml4IGNvbXBhcmUgbWF0Y2hlcyBUClNZU19ST09UPSIkKG5vcm1fcGF0aCAiJFNZU19ST09UX1JBVyIpIgpVU0VSX1JPT1Q9IiQobm9ybV9wYXRoICIkVVNFUl9ST09UX1JBVyIpIgoKaWYgWyAkIyAtbmUgMSBdOyB0aGVuIGVjaG8gIueUqOazlTogZ3VhcmQtcmVzdG9yZS5zaCA8dHJhc2hlZF9wYXRoPiIgPiYyOyBleGl0IDI7IGZpClQ9IiQxIgpbIC1uICIkVCIgXSB8fCB7IGVjaG8gIuaLkue7nTog56m65Y+C5pWwIiA+JjI7IGV4aXQgMzsgfQpjYXNlICIkVCIgaW4KICAvKikgOiA7OwogICopIGVjaG8gIuaLkue7nTog6ZyA6KaB57ud5a+56Lev5b6EOiAkVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKaWYgWyAiJFQiICE9ICIkKHByaW50ZiAnJXMnICIkVCIgfCB0ciAtZCAnXHRcclxuJykiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOi3r+W+hOWQq+aOp+WItuWtl+espiIgPiYyOyBleGl0IDMKZmkKCiMgbm9ybWFsaXplIEJFRk9SRSB0aGUgY2FzZSBjaGVjazogcHJlZml4IGNvbXBhcmUgbXVzdCB1c2Ugb25lIHNwZWxsaW5nClRfUkFXPSIkVCIKVD0iJChub3JtX3BhdGggIiRUIikiCgpjYXNlICIkVCIgaW4KICAiJFNZU19ST09UIi90cmFzaC8qKSBST09UPSIkU1lTX1JPT1QiIDs7CiAgIiRVU0VSX1JPT1QiL3RyYXNoLyopIFJPT1Q9IiRVU0VSX1JPT1QiIDs7CiAgIiRTWVNfUk9PVCIvYmFja3Vwcy8qKSBST09UPSIkU1lTX1JPT1QiIDs7CiAgIiRVU0VSX1JPT1QiL2JhY2t1cHMvKikgUk9PVD0iJFVTRVJfUk9PVCIgOzsKICAqKSBlY2hvICLmi5Lnu506IOS4jeWcqOWbnuaUtuermSB0cmFzaC8g5oiWIGJhY2t1cHMvIOWGhTogJFRfUkFXIiA+JjI7IGV4aXQgMyA7Owplc2FjCgppZiBbICEgLWUgIiRUIiBdICYmIFsgISAtTCAiJFQiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOWbnuaUtuaWh+S7tuS4jeWtmOWcqDogJFRfUkFXIiA+JjI7IGV4aXQgMwpmaQoKWyAtZiAiJFJPT1QvbWFuaWZlc3QubG9nIiBdIHx8IHsgZWNobyAi5ouS57udOiBtYW5pZmVzdCDkuI3lrZjlnKgiID4mMjsgZXhpdCAzOyB9CgpPUklHPSIkKGF3ayAtRiAnXHQnIC12IHQ9IiRUIiAnCiAgZnVuY3Rpb24gbm9ybShwKSB7CiAgICBpZiAocCB+IC9eXC9zdG9yYWdlXC9lbXVsYXRlZFwvMFwvLykgeyBzdWIoL15cL3N0b3JhZ2VcL2VtdWxhdGVkXC8wXC8vLCAiIiwgcCk7IHJldHVybiAiL3NkY2FyZC8iIHAgfQogICAgaWYgKHAgfiAvXlwvc3RvcmFnZVwvc2VsZlwvcHJpbWFyeVwvLykgeyBzdWIoL15cL3N0b3JhZ2VcL3NlbGZcL3ByaW1hcnlcLy8sICIiLCBwKTsgcmV0dXJuICIvc2RjYXJkLyIgcCB9CiAgICBpZiAocCB+IC9eXC9kYXRhXC9kYXRhXC8vKSB7IHN1YigvXlwvZGF0YVwvZGF0YVwvLywgIiIsIHApOyByZXR1cm4gIi9kYXRhL3VzZXIvMC8iIHAgfQogICAgcmV0dXJuIHAKICB9CiAgbm9ybSgkMyk9PXQge289JDJ9CiAgRU5Ee3ByaW50IG99JyAiJFJPT1QvbWFuaWZlc3QubG9nIikiCmlmIFsgLXogIiRPUklHIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiBtYW5pZmVzdCDkuK3ml6DmraTorrDlvZU6ICRUX1JBVyIgPiYyOyBleGl0IDMKZmkKCmNhc2UgIiRUIiBpbgogICIkUk9PVCIvYmFja3Vwcy8qKQogICAgIyDlpIfku73lvI/ov5jljp/vvJpjcCAtcCDopobnm5bljp/mlofku7bvvIjopoHmsYLljp/nm67lvZXlnKjkvY3vvJvph43lpI3ov5jljp/lhYHorrjigJTigJTluYLnrYnopobnm5bvvIkKICAgIFBESVI9IiQoZGlybmFtZSAiJE9SSUciKSIKICAgIGlmIFsgISAtZCAiJFBESVIiIF07IHRoZW4KICAgICAgZWNobyAi5ouS57udOiDljp/nm67lvZXkuI3lrZjlnKg6ICRQRElSIiA+JjI7IGV4aXQgMwogICAgZmkKICAgIFNEPSIkKGNkICIkKGRpcm5hbWUgIiQwIikiICYmIHB3ZCkiCiAgICBpZiBjcCAtcCAiJFQiICIkT1JJRyIgMj4vZGV2L251bGw7IHRoZW4KICAgICAgT1A9IiQoaWQgLXVuIDI+L2Rldi9udWxsIHx8IGVjaG8gdW5rbm93bikiCiAgICAgIE1UUz0iJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicgMj4vZGV2L251bGwgfHwgZGF0ZSkiCiAgICAgIGxlZGdlcl9hcHBlbmQgIiRST09UL21hbmlmZXN0LmxvZyIgIiQocHJpbnRmICclc1x0JXNcdCVzXHQlc1x0JXMnICIkTVRTIiAiJChub3JtX3BhdGggIiRPUklHIikiICIkKG5vcm1fcGF0aCAiJFQiKSIgIlJFU1RPUkVELUZST00tQkFDS1VQIiAiJE9QIikiIHx8IGVjaG8gIuitpuWRijogbWFuaWZlc3Qg5YaZ5YWl5aSx6LSlIiA+JjIKICAgICAgaWYgWyAteCAiJFNEL2d1YXJkLWxvZy5zaCIgXTsgdGhlbgogICAgICAgICIkU0QvZ3VhcmQtbG9nLnNoIiAiJFJPT1QvZ3VhcmQubG9nIiAiUkVTVE9SRSIgImNwICRUIC0+ICRPUklHIiAi5aSH5Lu96L+Y5Y6fKOimhueblikiICJPSyIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogICAgICBlbHNlCiAgICAgICAgcHJpbnRmICclcyB8ICVzIHwgJXMgfCAlcyB8ICVzXG4nICIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JykiICJSRVNUT1JFIiAiY3AgJFQgLT4gJE9SSUciICLlpIfku73ov5jljp8o6KaG55uWKSIgIk9LIiA+PiAiJFJPT1QvZ3VhcmQubG9nIiB8fCB0cnVlCiAgICAgIGZpCiAgICAgIGVjaG8gIuW3suS7juWkh+S7veimhueblui/mOWOnzogJE9SSUciCiAgICAgIGV4aXQgMAogICAgZWxzZQogICAgICBlY2hvICLplJnor686IOWkh+S7vei/mOWOn+Wksei0pTogJFQiID4mMjsgZXhpdCA0CiAgICBmaQogICAgOzsKZXNhYwoKaWYgWyAtZSAiJE9SSUciIF0gfHwgWyAtTCAiJE9SSUciIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOWOn+i3r+W+hOW3suWtmOWcqDogJE9SSUciID4mMjsgZXhpdCAzCmZpCgpQRElSPSIkKGRpcm5hbWUgIiRPUklHIikiCmlmIFsgISAtZCAiJFBESVIiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOWOn+ebruW9leS4jeWtmOWcqDogJFBESVIiID4mMjsgZXhpdCAzCmZpCgpTQ1JJUFRfRElSPSIkKGNkICIkKGRpcm5hbWUgIiQwIikiICYmIHB3ZCkiCmxvZ19ldmVudCgpIHsKICBpZiBbIC14ICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giIF07IHRoZW4KICAgICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giICIkUk9PVC9ndWFyZC5sb2ciICIkMSIgIiQyIiAiJDMiICIkNCIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogIGVsc2UKICAgIHByaW50ZiAnJXMgfCAlcyB8ICVzIHwgJXMgfCAlc1xuJyAiJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicpIiAiJDEiICIkMiIgIiQzIiAiJDQiID4+ICIkUk9PVC9ndWFyZC5sb2ciIHx8IGVjaG8gIuitpuWRijog5pel5b+X5YaZ5YWl5aSx6LSlIiA+JjIKICBmaQp9CgppZiBtdiAiJFQiICIkT1JJRyIgMj4vZGV2L251bGw7IHRoZW4KICBPUD0iJChpZCAtdW4gMj4vZGV2L251bGwgfHwgZWNobyB1bmtub3duKSIKICBNVFM9IiQoZGF0ZSAnKyVZLSVtLSVkVCVIOiVNOiVTJXonIDI+L2Rldi9udWxsIHx8IGRhdGUpIgogIGxlZGdlcl9hcHBlbmQgIiRST09UL21hbmlmZXN0LmxvZyIgIiQocHJpbnRmICclc1x0JXNcdCVzXHQlc1x0JXMnICIkTVRTIiAiJChub3JtX3BhdGggIiRPUklHIikiICIkKG5vcm1fcGF0aCAiJFQiKSIgIlJFU1RPUkVEIiAiJE9QIikiIHx8IGVjaG8gIuitpuWRijogbWFuaWZlc3Qg5YaZ5YWl5aSx6LSlIiA+JjIKICBsb2dfZXZlbnQgIlJFU1RPUkUiICJtdiAkVCAtPiAkT1JJRyIgIui/mOWOn+aTjeS9nCIgIk9LIgogIGVjaG8gIuW3sui/mOWOnzogJE9SSUciCiAgZXhpdCAwCmVsc2UKICBsb2dfZXZlbnQgIlJFU1RPUkUiICJtdiAkVCAtPiAkT1JJRyIgIui/mOWOn+aTjeS9nCIgIkZBSUwiCiAgZWNobyAi6ZSZ6K+vOiDov5jljp/lpLHotKU6ICRUIiA+JjIKICBleGl0IDQKZmk=","guard-backup.sh":"IyEvYmluL3NoCiMgZ3VhcmQtYmFja3VwLnNoIOKAlCDkv67mlLnliY3lpIfku73vvIjlia/mnKzov5vlm57mlLbnq5kgYmFja3Vwcy/vvIzkuI3np7vliqjljp/mlofku7bvvIkKIyDphY3lpZc6IFJPT1RfU0FGRVRZX1BST1RPQ09MLm1kIMKnNe+8iOWbnuaUtuermeacuuWItu+8iS8gwqcz77yI5qCH5YeG5pON5L2c5rWBLeWkh+S7ve+8iQojIOiuvuiuoee6puadnzog5Y2V55uu5qCH44CB57ud5a+56Lev5b6E77yb5ouS57ud56m65Y+C5pWwL+mAmumFjeespi/ot6/lvoTnqb/otoov56aB5YaZ5riF5Y2VL+S4jeWtmOWcqC/nm67lvZXvvJsKIyAgICAgICAgICAgY3AgLXAg5L+d55WZ5bGe5oCn77yb6K6w5b2VIG1hbmlmZXN0KEJBQ0tVUDopICsgZ3VhcmQubG9n77yb5LiN6KaG55uW5ZCM5ZCN5aSH5Lu944CCCiMg55So5rOVOiBndWFyZC1iYWNrdXAuc2ggPHRhcmdldF9wYXRoPiA8cmVhc29uPgojIOmAgOWHuueggTogMCDmiJDlip/lpIfku707IDIg55So5rOV6ZSZ6K+vOyAzIOWuieWFqOaLkue7nTsgNCDlpIfku73lpLHotKUKCiMgLS0tLSBhY2NvdW50IHdyaXRlIGxvY2sgKHNhbWUgbG9jayBhcyB3aXRoTGVkZ2VyTG9jayBvbiBKUyBzaWRlKSAtLS0tCiMgUmVhc29uOiB0aGlzIHNpZGUgYXBwZW5kcyB3aXRoID4+OyBpZiBKUyBzaWRlIHJlcGxhY2VzIHRoZSBmaWxlIHdpdGggbXYsCiMgYXBwZW5kZWQgbGluZXMgYXJlIGxvc3QuIEJvdGggc2lkZXMgaG9ub3JpbmcgdGhpcyBsb2NrIGtlZXBzIHRoZW0gY29uc2lzdGVudC4KIyAtLS0tIHBhdGggbm9ybWFsaXphdGlvbiAoc3RyaW5nLW9ubHksIG5vIHJlYWRsaW5rKSAtLS0tCiMgRG8gTk9UIHVzZSByZWFkbGluayAtZiBoZXJlOiBpdCByZXdyaXRlcyAvZGF0YS91c2VyLzAgLT4gL2RhdGEvZGF0YSwKIyB3aGljaCB3b3VsZCBtYWtlIGxlZGdlciBwYXRocyBtaXNtYXRjaCBKUy1zaWRlIGNvbnN0YW50cy4KIyBPbmx5IGNvbGxhcHNlIHRoZSBhbGlhcyBwcmVmaXhlcyBzbyBib3RoIHNpZGVzIGFncmVlIG9uIG9uZSBzcGVsbGluZy4Kbm9ybV9wYXRoKCkgewogIF9wPSIkMSIKICBjYXNlICIkX3AiIGluCiAgICAvc3RvcmFnZS9lbXVsYXRlZC8wLyopIF9wPSIvc2RjYXJkLyR7X3AjL3N0b3JhZ2UvZW11bGF0ZWQvMC99IiA7OwogICAgL3N0b3JhZ2Uvc2VsZi9wcmltYXJ5LyopIF9wPSIvc2RjYXJkLyR7X3AjL3N0b3JhZ2Uvc2VsZi9wcmltYXJ5L30iIDs7CiAgICAvZGF0YS9kYXRhLyopIF9wPSIvZGF0YS91c2VyLzAvJHtfcCMvZGF0YS9kYXRhL30iIDs7CiAgZXNhYwogIHByaW50ZiAnJXMnICIkX3AiCn0KCmxlZGdlcl9hcHBlbmQoKSB7CiAgX21mPSIkMSI7IHNoaWZ0CiAgX2xvY2s9IiR7X21mfS5sb2NrIgogIF9uPTAKICB3aGlsZSAhIG1rZGlyICIkX2xvY2siIDI+L2Rldi9udWxsOyBkbwogICAgX249JCgoX24rMSkpCiAgICBbICIkX24iIC1nZSAxMDAgXSAmJiB7IGVjaG8gIndhcm46IGxlZGdlciBsb2NrIHRpbWVvdXQiID4mMjsgcmV0dXJuIDE7IH0KICAgIHNsZWVwIDAuMDUKICBkb25lCiAgcHJpbnRmICclc1xuJyAiJCoiID4+ICIkX21mIgogIF9yYz0kPwogIHJtZGlyICIkX2xvY2siIDI+L2Rldi9udWxsCiAgcmV0dXJuICRfcmMKfQoKc2V0IC11CgpTWVNfUk9PVD0iJHtHVUFSRF9UUkFTSF9EQVRBX1JPT1Q6LS9kYXRhL3VzZXIvMC9jb20uYWkuYXNzaXN0YW5jZS5vcGVyaXQvZmlsZXMvZ3VhcmRfZGF0YX0iClVTRVJfUk9PVD0iJHtHVUFSRF9UUkFTSF9TRENBUkRfUk9PVDotL3NkY2FyZC9Eb3dubG9hZC9PcGVyaXQvLmd1YXJkLXRyYXNofSIKCnVzYWdlKCkgeyBlY2hvICLnlKjms5U6IGd1YXJkLWJhY2t1cC5zaCA8dGFyZ2V0X3BhdGg+IDxyZWFzb24+IiA+JjI7IH0KCmlmIFsgJCMgLW5lIDIgXTsgdGhlbiB1c2FnZTsgZXhpdCAyOyBmaQpUQVJHRVQ9IiQxIjsgUkVBU09OPSIkMiIKWyAtbiAiJFRBUkdFVCIgXSB8fCB7IGVjaG8gIuaLkue7nTog56m655uu5qCH6Lev5b6EIiA+JjI7IGV4aXQgMzsgfQpbIC1uICIkUkVBU09OIiBdIHx8IHsgZWNobyAi5ouS57udOiDpnIDopoHloavlhpnljp/lm6AiID4mMjsgZXhpdCAzOyB9CmlmIFsgIiRSRUFTT04iICE9ICIkKHByaW50ZiAnJXMnICIkUkVBU09OIiB8IHRyIC1kICdcdFxyXG4nKSIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Y6f5Zug5ZCr5o6n5Yi25a2X56ymIiA+JjI7IGV4aXQgMwpmaQoKIyDop4TojIPljJY6IOWOu+WwvumDqOaWnOadoO+8iOS/neeVmeaguSAv77yJCndoaWxlIFsgIiRUQVJHRVQiICE9ICIvIiBdICYmIFsgIiR7VEFSR0VUJS99IiAhPSAiJFRBUkdFVCIgXTsgZG8gVEFSR0VUPSIke1RBUkdFVCUvfSI7IGRvbmUKCiMg57ud5a+56Lev5b6ECmNhc2UgIiRUQVJHRVQiIGluCiAgLyopIDogOzsKICAqKSBlY2hvICLmi5Lnu506IOS7heaOpeWPl+e7neWvuei3r+W+hDogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDmjqfliLblrZfnrKYKaWYgWyAiJFRBUkdFVCIgIT0gIiQocHJpbnRmICclcycgIiRUQVJHRVQiIHwgdHIgLWQgJ1x0XHJcbicpIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDot6/lvoTlkKvmjqfliLblrZfnrKYiID4mMjsgZXhpdCAzCmZpCgojIOmAmumFjeespu+8iOacquWxleW8gO+8iQpjYXNlICIkVEFSR0VUIiBpbgogIConKicqfConPycqfConWycqfConXScqKSBlY2hvICLmi5Lnu506IOi3r+W+hOWQq+mAmumFjeespjogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDot6/lvoTnqb/otooKY2FzZSAiJFRBUkdFVCIgaW4KICAqLi4qKSBlY2hvICLmi5Lnu506IOi3r+W+hOWQqyAnLi4nOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIOaguS/mjILovb3ngrkKY2FzZSAiJFRBUkdFVCIgaW4KICAvfC9kYXRhfC9zZGNhcmR8L3N0b3JhZ2V8L3N0b3JhZ2UvZW11bGF0ZWR8L3N0b3JhZ2UvZW11bGF0ZWQvMCkKICAgIGVjaG8gIuaLkue7nTog5qC5L+aMgui9veeCuTogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDnpoHlhpnmuIXljZXvvIjljY/orq4gwqc077yJKyDnjq/looPoh6rouqvkv53miqQKY2FzZSAiJFRBUkdFVCIgaW4KICAvc3lzdGVtfC9zeXN0ZW0vKnwvdmVuZG9yfC92ZW5kb3IvKnwvcHJvZHVjdHwvcHJvZHVjdC8qfC9zeXN0ZW1fZXh0fC9zeXN0ZW1fZXh0Lyp8XAogIC9ib290fC9ib290Lyp8L2luaXRfYm9vdHwvaW5pdF9ib290Lyp8L3ZibWV0YXwvdmJtZXRhLyp8XAogIC9wZXJzaXN0fC9wZXJzaXN0Lyp8L2Vmc3wvZWZzLyp8L21ldGFkYXRhfC9tZXRhZGF0YS8qfC9maXJtd2FyZXwvZmlybXdhcmUvKnxcCiAgL21vZGVtc3QqfC9mc2d8L2ZzZy8qfC9mc2N8L2ZzYy8qfFwKICAvZGF0YS9zeXN0ZW18L2RhdGEvc3lzdGVtLyp8L2RhdGEvbWlzY3wvZGF0YS9taXNjLyp8L2RhdGEvYWRifC9kYXRhL2FkYi8qfFwKICAvZGF0YS92ZW5kb3J8L2RhdGEvdmVuZG9yLyp8L2RhdGEvYXBleHwvZGF0YS9hcGV4Lyp8L2RldnwvZGV2Lyp8XAogIC91c3J8L3Vzci8qfC9iaW58L2Jpbi8qfC9zYmlufC9zYmluLyp8L2xpYnwvbGliLyp8L2xpYjY0fC9saWI2NC8qfFwKICAvZXRjfC9ldGMvKnwvdmFyfC92YXIvKnwvcm9vdHwvcm9vdC8qfC9vcHR8L29wdC8qfC9zcnZ8L3Nydi8qKQogICAgZWNobyAi5ouS57udOiDnpoHlhpnmuIXljZUv546v5aKD6Lev5b6EOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIGd1YXJkIOW3peWFt+mTvuiHqui6q+S/neaKpAppZiBbIC1kICIkVEFSR0VUIiBdICYmIFsgLWYgIiRUQVJHRVQvZ3VhcmQtYmFja3VwLnNoIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDnm67moIfnm67lvZXlkKsgZ3VhcmQg5bel5YW36ZO+77yM5Y+X5L+d5oqkOiAkVEFSR0VUIiA+JjI7IGV4aXQgMwpmaQoKIyDlrZjlnKjmgKcgKyDku4Xmlofku7YKaWYgWyAhIC1lICIkVEFSR0VUIiBdICYmIFsgISAtTCAiJFRBUkdFVCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog55uu5qCH5LiN5a2Y5ZyoOiAkVEFSR0VUIiA+JjI7IGV4aXQgMwpmaQppZiBbICEgLWYgIiRUQVJHRVQiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOS7heaUr+aMgeW4uOinhOaWh+S7tu+8iOS4jeWkh+S7veebruW9lS/orr7lpIfvvIk6ICRUQVJHRVQiID4mMjsgZXhpdCAzCmZpCgojIOWNt+WIpOWumu+8iOWQjOWNt+WOn+WIme+8my9kYXRhX21pcnJvciDkuLogL2RhdGEg6K6+5aSH55qE6ZWc5YOP6YCa6YGT77yM6KeG5ZCMIC9kYXRhIOWNt++8iQpjYXNlICIkVEFSR0VUIiBpbgogIC9kYXRhLyp8L2RhdGFfbWlycm9yLyopIFJPT1Q9IiRTWVNfUk9PVCIgOzsKICAvc2RjYXJkLyp8L3N0b3JhZ2UvZW11bGF0ZWQvKikgUk9PVD0iJFVTRVJfUk9PVCIgOzsKICAqKSBlY2hvICLmi5Lnu506IOaXoOazleehruWumuWQjOWNt+WbnuaUtuerme+8iOS7heaUr+aMgSAvZGF0YeOAgS9kYXRhX21pcnJvciDkuI4gL3NkY2FyZCDljbfvvIk6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMgb3ZlcnJpZGUg5oOF5b2i5o+Q56S6CmlmIFsgIiRST09UIiAhPSAiL2RhdGEvdXNlci8wL2NvbS5haS5hc3Npc3RhbmNlLm9wZXJpdC9maWxlcy9ndWFyZF9kYXRhIiBdICYmIFsgIiRST09UIiAhPSAiL3NkY2FyZC9Eb3dubG9hZC9PcGVyaXQvLmd1YXJkLXRyYXNoIiBdOyB0aGVuCiAgZWNobyAi5rOo5oSPOiDlm57mlLbnq5nmoLnkuLrpnZ7luLjop4Tot6/lvoTvvIhvdmVycmlkZSDnlJ/mlYjvvIk6ICRST09UIiA+JjIKZmkKCiMg5Zue5pS256uZ6Ieq6LqrL+eItue6p+S/neaKpAppZiBbICIkVEFSR0VUIiA9ICIkUk9PVCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog55uu5qCH5piv5Zue5pS256uZ6Ieq6LqrOiAkVEFSR0VUIiA+JjI7IGV4aXQgMwpmaQpjYXNlICIkUk9PVCIgaW4KICAiJFRBUkdFVCIvKikgZWNobyAi5ouS57udOiDnm67moIfmmK/lm57mlLbnq5nniLbnuqc6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg5Zue5pS256uZ5bCx57uq5qOA5p+lCmlmIFsgISAtZCAiJFJPT1QvYmFja3VwcyIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5aSH5Lu95Yy65pyq5bCx57uqOiAkUk9PVC9iYWNrdXBz77yI5YWI6L+Q6KGMIGd1YXJkLWluaXQuc2jvvIkiID4mMjsgZXhpdCAzCmZpCgpTQ1JJUFRfRElSPSIkKGNkICIkKGRpcm5hbWUgIiQwIikiICYmIHB3ZCkiCmxvZ19ldmVudCgpIHsKICBpZiBbIC14ICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giIF07IHRoZW4KICAgICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giICIkUk9PVC9ndWFyZC5sb2ciICIkMSIgIiQyIiAiJDMiICIkNCIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogIGVsc2UKICAgIHByaW50ZiAnJXMgfCAlcyB8ICVzIHwgJXMgfCAlc1xuJyAiJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicpIiAiJDEiICIkMiIgIiQzIiAiJDQiID4+ICIkUk9PVC9ndWFyZC5sb2ciIHx8IGVjaG8gIuitpuWRijog5pel5b+X5YaZ5YWl5aSx6LSlIiA+JjIKICBmaQp9CgpUUz0iJChkYXRlICcrJVklbSVkXyVIJU0lUycpIgpCQVNFPSIkKGJhc2VuYW1lICIkVEFSR0VUIikiCkRFU1Q9IiRST09UL2JhY2t1cHMvJHtUU31fJHtCQVNFfSIKaWYgWyAtZSAiJERFU1QiIF0gfHwgWyAtTCAiJERFU1QiIF07IHRoZW4gREVTVD0iJHtERVNUfV8kJCI7IGZpCgppZiBjcCAtcCAiJFRBUkdFVCIgIiRERVNUIiAyPi9kZXYvbnVsbDsgdGhlbgogIE9QPSIkKGlkIC11biAyPi9kZXYvbnVsbCB8fCBlY2hvIHVua25vd24pIgogIE1UUz0iJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicgMj4vZGV2L251bGwgfHwgZGF0ZSkiCiAgbGVkZ2VyX2FwcGVuZCAiJFJPT1QvbWFuaWZlc3QubG9nIiAiJChwcmludGYgJyVzXHQlc1x0JXNcdCVzXHQlcycgIiRNVFMiICIkKG5vcm1fcGF0aCAiJFRBUkdFVCIpIiAiJChub3JtX3BhdGggIiRERVNUIikiICJCQUNLVVA6ICRSRUFTT04iICIkT1AiKSIgfHwgZWNobyAi6K2m5ZGKOiBtYW5pZmVzdCDlhpnlhaXlpLHotKUiID4mMgogIGxvZ19ldmVudCAiTDIiICJjcCAkVEFSR0VUIC0+ICRERVNUIiAi5aSH5Lu9OiAkUkVBU09OIiAiT0siCiAgZWNobyAi5aSH5Lu95a6M5oiQOiAkREVTVCIKICBlY2hvICLopobnm5bov5jljp/lkb3ku6Q6IGd1YXJkLXJlc3RvcmUuc2ggJyRERVNUJyIKICBleGl0IDAKZWxzZQogIGxvZ19ldmVudCAiTDIiICJjcCAkVEFSR0VUIC0+ICRERVNUIiAi5aSH5Lu9OiAkUkVBU09OIiAiRkFJTCIKICBlY2hvICLplJnor686IOWkh+S7veWksei0pTogJFRBUkdFVCIgPiYyCiAgZXhpdCA0CmZp","guard-log.sh":"IyEvYmluL3NoCiMgZ3VhcmQtbG9nLnNoIOKAlCBndWFyZCDmk43kvZzml6Xlv5forrDlvZXlmajvvIjlj6rov73liqDvvIzkuI3opobnm5bvvIkKIyDphY3lpZc6IFJPT1RfU0FGRVRZX1BST1RPQ09MLm1kIMKnNu+8iOaXpeW/l++8iQojIOeUqOazlTogZ3VhcmQtbG9nLnNoIDxsb2dfZmlsZT4gPGxldmVsPiA8Y29tbWFuZD4gPHJlYXNvbj4gPHJlc3VsdD4KIyDooYzmoLzlvI86IElTTzg2MDEo5ZCr5YGP56e7KSB8IGxldmVsIHwgY29tbWFuZCB8IHJlYXNvbiB8IHJlc3VsdAojIOmAgOWHuueggTogMCDmiJDlip87IDIg55So5rOV6ZSZ6K+vCnNldCAtdQoKaWYgWyAkIyAtbHQgNSBdOyB0aGVuCiAgZWNobyAi55So5rOVOiBndWFyZC1sb2cuc2ggPGxvZ19maWxlPiA8bGV2ZWw+IDxjb21tYW5kPiA8cmVhc29uPiA8cmVzdWx0PiIgPiYyCiAgZXhpdCAyCmZpCgpMT0dfRklMRT0iJDEiOyBMRVZFTD0iJDIiOyBDTUQ9IiQzIjsgUkVBU09OPSIkNCI7IFJFU1VMVD0iJDUiClRTPSIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JyAyPi9kZXYvbnVsbCB8fCBkYXRlICcrJVktJW0tJWRUJUg6JU06JVMnKSIKcHJpbnRmICclcyB8ICVzIHwgJXMgfCAlcyB8ICVzXG4nICIkVFMiICIkTEVWRUwiICIkQ01EIiAiJFJFQVNPTiIgIiRSRVNVTFQiID4+ICIkTE9HX0ZJTEUiCmV4aXQgMA==","guard-selftest.sh":"IyEvYmluL3NoCiMgZ3VhcmQtc2VsZnRlc3Quc2gg4oCUIGd1YXJkIOW3peWFt+euseiHqua1i++8iOaymeeuseaooeW8j++8jOS4jeeisOecn+Wunui/kOihjOaXtuaVsOaNru+8iQojIOeUqOazlTogc2ggZ3VhcmQtc2VsZnRlc3Quc2gKIyDor7TmmI46IOmAmui/h+eOr+Wig+WPmOmHjyBvdmVycmlkZSDmiorlm57mlLbnq5nmjIflkJHkuIDmrKHmgKfmtYvor5XmspnnrrHvvJsKIyAgICAgICDlhajnqIvlj6rmk43kvZzmtYvor5XmspnnrrHnm67lvZXvvJvpgJrov4flkI7oh6rliqjmuIXnkIbvvIzlpLHotKXliJnkv53nlZnkvpvmjpLmn6XjgIIKIyDpgIDlh7rnoIE6IDA95YWo6YOo6YCa6L+HOyAxPeacieWksei0pQpzZXQgLXUKClNDUklQVF9ESVI9IiQoY2QgIiQoZGlybmFtZSAiJDAiKSIgJiYgcHdkKSIKCkRBVEFfQkFTRT0iL2RhdGEvdXNlci8wL2NvbS5haS5hc3Npc3RhbmNlLm9wZXJpdC9maWxlcy9ndWFyZC1zZWxmdGVzdCIKU0RDX0JBU0U9Ii9zZGNhcmQvRG93bmxvYWQvT3Blcml0L2d1YXJkLXNlbGZ0ZXN0IgpleHBvcnQgR1VBUkRfVFJBU0hfREFUQV9ST09UPSIkREFUQV9CQVNFL3RyYXNocm9vdCIKZXhwb3J0IEdVQVJEX1RSQVNIX1NEQ0FSRF9ST09UPSIkU0RDX0JBU0UvdHJhc2hyb290IgoKUEFTUz0wOyBGQUlMPTAKb2soKXsgZWNobyAiUEFTUzogJDEiOyBQQVNTPSQoKFBBU1MrMSkpOyB9CgojIC0tLS0gaGVscGVycyB1bmRlciB0ZXN0OiBpZGVudGljYWwgaW1wbGVtZW50YXRpb24gdG8gZ3VhcmQtdHJhc2guc2ggLS0tLQpub3JtX3BhdGgoKSB7CiAgX3A9IiQxIgogIGNhc2UgIiRfcCIgaW4KICAgIC9zdG9yYWdlL2VtdWxhdGVkLzAvKikgX3A9Ii9zZGNhcmQvJHtfcCMvc3RvcmFnZS9lbXVsYXRlZC8wL30iIDs7CiAgICAvc3RvcmFnZS9zZWxmL3ByaW1hcnkvKikgX3A9Ii9zZGNhcmQvJHtfcCMvc3RvcmFnZS9zZWxmL3ByaW1hcnkvfSIgOzsKICAgIC9kYXRhL2RhdGEvKikgX3A9Ii9kYXRhL3VzZXIvMC8ke19wIy9kYXRhL2RhdGEvfSIgOzsKICBlc2FjCiAgcHJpbnRmICclcycgIiRfcCIKfQoKbGVkZ2VyX2FwcGVuZCgpIHsKICBfbWY9IiQxIjsgc2hpZnQKICBfbG9jaz0iJHtfbWZ9LmxvY2siCiAgX249MAogIHdoaWxlICEgbWtkaXIgIiRfbG9jayIgMj4vZGV2L251bGw7IGRvCiAgICBfbj0kKChfbisxKSkKICAgIFsgIiRfbiIgLWdlIDEwMCBdICYmIHsgZWNobyAid2FybjogbGVkZ2VyIGxvY2sgdGltZW91dCIgPiYyOyByZXR1cm4gMTsgfQogICAgc2xlZXAgMC4wNQogIGRvbmUKICBwcmludGYgJyVzXG4nICIkKiIgPj4gIiRfbWYiCiAgX3JjPSQ/CiAgcm1kaXIgIiRfbG9jayIgMj4vZGV2L251bGwKICByZXR1cm4gJF9yYwp9CmJhZCgpeyBlY2hvICJGQUlMOiAkMSI7IEZBSUw9JCgoRkFJTCsxKSk7IH0Kc3RlcCgpeyBlY2hvOyBlY2hvICI9PSAkMSA9PSI7IH0KCiMg5a6J5YWo5riF55CG77ya5LuF5b2T6Lev5b6E5LulIGd1YXJkLXNlbGZ0ZXN0IOe7k+WwvuaJjeWFgeiuuOmAkuW9kuWIoOmZpApzYWZlX3JtKCl7CiAgY2FzZSAiJDEiIGluCiAgICAqL2d1YXJkLXNlbGZ0ZXN0KSBybSAtcmYgIiQxIiA7OwogICAgKikgZWNobyAic2tpcCB1bnNhZmUgcm06ICQxIiA7OwogIGVzYWMKfQoKZXhwZWN0X2V4aXQoKXsKICBkZXNjPSIkMSI7IGV4cD0iJDIiOyBzaGlmdCAyCiAgIiRAIiA+L2Rldi9udWxsIDI+JjEKICByYz0kPwogIGlmIFsgIiRyYyIgPSAiJGV4cCIgXTsgdGhlbiBvayAiJGRlc2MiOyBlbHNlIGJhZCAiJGRlc2MgKHJjPSRyYywgd2FudD0kZXhwKSI7IGZpCn0KCmVjaG8gImd1YXJkLXNlbGZ0ZXN0IOW8gOWni++8iOaymeeuseaooeW8j++8iSIKCnN0ZXAgIuWHhuWkhyIKc2FmZV9ybSAiJERBVEFfQkFTRSI7IHNhZmVfcm0gIiRTRENfQkFTRSIKbWtkaXIgLXAgIiREQVRBX0JBU0Uvd29yayIgIiRTRENfQkFTRS93b3JrIiB8fCB7IGVjaG8gIuaXoOazleWIm+W7uua1i+ivleebruW9lSI7IGV4aXQgMTsgfQoKc3RlcCAiVDEgaW5pdCAtLWRyeS1ydW4iCiIkU0NSSVBUX0RJUi9ndWFyZC1pbml0LnNoIiAtLWRyeS1ydW4gPi9kZXYvbnVsbCAyPiYxICYmIG9rICJkcnktcnVuIOato+W4uCIgfHwgYmFkICJkcnktcnVuIOWksei0pSIKCnN0ZXAgIlQyIGluaXQg5a6e6ZmF5Yid5aeL5YyWIgoiJFNDUklQVF9ESVIvZ3VhcmQtaW5pdC5zaCIgPi9kZXYvbnVsbCAyPiYxICYmIG9rICJpbml0IOaIkOWKnyIgfHwgYmFkICJpbml0IOWksei0pSIKWyAtZCAiJEdVQVJEX1RSQVNIX0RBVEFfUk9PVC90cmFzaCIgXSAmJiBvayAi57O757uf5bGCIHRyYXNoIOWtmOWcqCIgfHwgYmFkICLns7vnu5/lsYIgdHJhc2gg57y65aSxIgpbIC1kICIkR1VBUkRfVFJBU0hfU0RDQVJEX1JPT1QvdHJhc2giIF0gJiYgb2sgIueUqOaIt+WxgiB0cmFzaCDlrZjlnKgiIHx8IGJhZCAi55So5oi35bGCIHRyYXNoIOe8uuWksSIKWyAtZiAiJEdVQVJEX1RSQVNIX0RBVEFfUk9PVC9tYW5pZmVzdC5sb2ciIF0gJiYgb2sgIm1hbmlmZXN0IOWtmOWcqCIgfHwgYmFkICJtYW5pZmVzdCDnvLrlpLEiCgpzdGVwICJUMyDlhaXlm57mlLbnq5nvvIgvZGF0YSDpk77vvIkiCnByaW50ZiAnaGVsbG8nID4gIiREQVRBX0JBU0Uvd29yay9mMS50eHQiCm91dD0kKCIkU0NSSVBUX0RJUi9ndWFyZC10cmFzaC5zaCIgIiREQVRBX0JBU0Uvd29yay9mMS50eHQiICJzZWxmdGVzdCBtb3ZlIiAyPi9kZXYvbnVsbCk7IHJjPSQ/CmlmIFsgJHJjIC1lcSAwIF0gJiYgWyAhIC1lICIkREFUQV9CQVNFL3dvcmsvZjEudHh0IiBdOyB0aGVuIG9rICJ0cmFzaCByYz0wIOS4lOWOn+aWh+S7tuW3suenu+i1sCI7IGVsc2UgYmFkICJ0cmFzaCDlpLHotKUgcmM9JHJjIG91dD0kb3V0IjsgZmkKZGVzdD0kKHByaW50ZiAnJXNcbicgIiRvdXQiIHwgaGVhZCAtbjEpOyBkZXN0PSR7ZGVzdCPlt7LlhaXlm57mlLbnq5k6IH0KaWYgWyAtZiAiJGRlc3QiIF0gJiYgWyAiJChjYXQgIiRkZXN0IikiID0gImhlbGxvIiBdOyB0aGVuIG9rICLlm57mlLbnq5nlhoXmlofku7blhoXlrrnkuIDoh7QiOyBlbHNlIGJhZCAi5Zue5pS256uZ5YaF5a655byC5bi4OiAkZGVzdCI7IGZpCmdyZXAgLXEgImYxLnR4dCIgIiRHVUFSRF9UUkFTSF9EQVRBX1JPT1QvbWFuaWZlc3QubG9nIiAmJiBvayAibWFuaWZlc3Qg6K6w5b2V5a2Y5ZyoIiB8fCBiYWQgIm1hbmlmZXN0IOaXoOiusOW9lSIKCnN0ZXAgIlQ0IOi/mOWOnyIKIiRTQ1JJUFRfRElSL2d1YXJkLXJlc3RvcmUuc2giICIkZGVzdCIgPi9kZXYvbnVsbCAyPiYxICYmIG9rICJyZXN0b3JlIHJjPTAiIHx8IGJhZCAicmVzdG9yZSDlpLHotKUiCmlmIFsgLWYgIiREQVRBX0JBU0Uvd29yay9mMS50eHQiIF0gJiYgWyAiJChjYXQgIiREQVRBX0JBU0Uvd29yay9mMS50eHQiKSIgPSAiaGVsbG8iIF07IHRoZW4gb2sgIui/mOWOn+WGheWuueS4gOiHtCI7IGVsc2UgYmFkICLov5jljp/lhoXlrrnlvILluLgiOyBmaQpncmVwIC1xICJSRVNUT1JFRCIgIiRHVUFSRF9UUkFTSF9EQVRBX1JPT1QvbWFuaWZlc3QubG9nIiAmJiBvayAibWFuaWZlc3Qg5ZCrIFJFU1RPUkVEIOiusOW9lSIgfHwgYmFkICJtYW5pZmVzdCDnvLogUkVTVE9SRUQiCgpzdGVwICJUNSB0cmFzaCDmi5Lnu53nlKjkvosiCmV4cGVjdF9leGl0ICLnqbrlj4LmlbDmi5Lnu50ocmMyKSIgMiAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giCmV4cGVjdF9leGl0ICLnvLrljp/lm6Dmi5Lnu50ocmMyKSIgMiAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIkREFUQV9CQVNFL3dvcmsvZjEudHh0IgpleHBlY3RfZXhpdCAi56aB5YaZ5riF5Y2V5ouS57udKHJjMykiIDMgIiRTQ1JJUFRfRElSL2d1YXJkLXRyYXNoLnNoIiAvc3lzdGVtL2J1aWxkLnByb3AgInRlc3QiCmV4cGVjdF9leGl0ICLpgJrphY3nrKbmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIkREFUQV9CQVNFL3dvcmsvKiIgInRlc3QiCmV4cGVjdF9leGl0ICLot6/lvoTnqb/otormi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIvZGF0YS91c2VyLzAvLi4veCIgInRlc3QiCmV4cGVjdF9leGl0ICLmoLnot6/lvoTmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIvIiAidGVzdCIKZXhwZWN0X2V4aXQgIuS4jeWtmOWcqOaLkue7nShyYzMpIiAzICIkU0NSSVBUX0RJUi9ndWFyZC10cmFzaC5zaCIgIiREQVRBX0JBU0Uvd29yay9ub3BlLnR4dCIgInRlc3QiCmV4cGVjdF9leGl0ICLnm7jlr7not6/lvoTmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICJ3b3JrL2YxLnR4dCIgInRlc3QiCmV4cGVjdF9leGl0ICLlm57mlLbnq5noh6rouqvmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIkR1VBUkRfVFJBU0hfREFUQV9ST09UIiAidGVzdCIKZXhwZWN0X2V4aXQgImd1YXJk6ZO+55uu5b2V5ouS57udKHJjMykiIDMgIiRTQ1JJUFRfRElSL2d1YXJkLXRyYXNoLnNoIiAiJFNDUklQVF9ESVIiICJ0ZXN0IgoKc3RlcCAiVDYgcmVzdG9yZSDmi5Lnu53nlKjkvosiCmV4cGVjdF9leGl0ICLpnZ7lm57mlLbnq5not6/lvoTmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtcmVzdG9yZS5zaCIgIiREQVRBX0JBU0Uvd29yay9mMS50eHQiCmV4cGVjdF9leGl0ICLkuI3lrZjlnKjlm57mlLbmlofku7bmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtcmVzdG9yZS5zaCIgIiRHVUFSRF9UUkFTSF9EQVRBX1JPT1QvdHJhc2gvbm9wZSIKCnN0ZXAgIlQ3IOi/mOWOn+WGsueqgeeUqOS+iyIKcHJpbnRmICd2MicgPiAiJERBVEFfQkFTRS93b3JrL2YyLnR4dCIKb3V0Mj0kKCIkU0NSSVBUX0RJUi9ndWFyZC10cmFzaC5zaCIgIiREQVRBX0JBU0Uvd29yay9mMi50eHQiICJjb25mbGljdCB0ZXN0IiAyPi9kZXYvbnVsbCkKZGVzdDI9JChwcmludGYgJyVzXG4nICIkb3V0MiIgfCBoZWFkIC1uMSk7IGRlc3QyPSR7ZGVzdDIj5bey5YWl5Zue5pS256uZOiB9CnByaW50ZiAnbmV3JyA+ICIkREFUQV9CQVNFL3dvcmsvZjIudHh0IgpleHBlY3RfZXhpdCAi5Y6f6Lev5b6E5bey5a2Y5Zyo4oaS5ouS57udKHJjMykiIDMgIiRTQ1JJUFRfRElSL2d1YXJkLXJlc3RvcmUuc2giICIkZGVzdDIiClsgLWYgIiRkZXN0MiIgXSAmJiBvayAi5Yay56qB5pe25Zue5pS25Lu25L+d55WZIiB8fCBiYWQgIuWGsueqgeaXtuWbnuaUtuS7tuS4ouWksSIKWyAiJChjYXQgIiREQVRBX0JBU0Uvd29yay9mMi50eHQiKSIgPSAibmV3IiBdICYmIG9rICLnjrDooYzmlofku7bmnKrooqvopobnm5YiIHx8IGJhZCAi546w6KGM5paH5Lu26KKr5pS55YqoIgoKc3RlcCAiVDggc2RjYXJkIOmTviIKcHJpbnRmICdzMScgPiAiJFNEQ19CQVNFL3dvcmsvczEudHh0IgpvdXRzPSQoIiRTQ1JJUFRfRElSL2d1YXJkLXRyYXNoLnNoIiAiJFNEQ19CQVNFL3dvcmsvczEudHh0IiAic2RjYXJkIHRlc3QiIDI+L2Rldi9udWxsKTsgcmNzPSQ/CmRlc3RzPSQocHJpbnRmICclc1xuJyAiJG91dHMiIHwgaGVhZCAtbjEpOyBkZXN0cz0ke2Rlc3RzI+W3suWFpeWbnuaUtuermTogfQppZiBbICRyY3MgLWVxIDAgXSAmJiBbIC1mICIkZGVzdHMiIF07IHRoZW4gb2sgInNkY2FyZCB0cmFzaCDmiJDlip8iOyBlbHNlIGJhZCAic2RjYXJkIHRyYXNoIOWksei0pSByYz0kcmNzIjsgZmkKIiRTQ1JJUFRfRElSL2d1YXJkLXJlc3RvcmUuc2giICIkZGVzdHMiID4vZGV2L251bGwgMj4mMSAmJiBbIC1mICIkU0RDX0JBU0Uvd29yay9zMS50eHQiIF0gJiYgb2sgInNkY2FyZCByZXN0b3JlIOaIkOWKnyIgfHwgYmFkICJzZGNhcmQgcmVzdG9yZSDlpLHotKUiCgpzdGVwICJUMTEgYmFja3VwIOmTvui3r++8iOS/ruaUueWJjeWkh+S7vSArIOimhueblui/mOWOn++8iSIKcHJpbnRmICdiLW9yaWcnID4gIiREQVRBX0JBU0Uvd29yay9iazEudHh0IgpvdXRiPSQoIiRTQ1JJUFRfRElSL2d1YXJkLWJhY2t1cC5zaCIgIiREQVRBX0JBU0Uvd29yay9iazEudHh0IiAic2VsZnRlc3QgYmFja3VwIiAyPi9kZXYvbnVsbCk7IHJjYj0kPwpkZXN0Yj0kKHByaW50ZiAnJXNcbicgIiRvdXRiIiB8IGhlYWQgLW4xKTsgZGVzdGI9JHtkZXN0YiPlpIfku73lrozmiJA6IH0KaWYgWyAkcmNiIC1lcSAwIF0gJiYgWyAtZiAiJGRlc3RiIiBdOyB0aGVuIG9rICJiYWNrdXAg5oiQ5YqfIjsgZWxzZSBiYWQgImJhY2t1cCDlpLHotKUgcmM9JHJjYiBvdXQ9JG91dGIiOyBmaQpbICIkKGNhdCAiJGRlc3RiIikiID0gImItb3JpZyIgXSAmJiBvayAi5aSH5Lu95YaF5a655LiA6Ie0IiB8fCBiYWQgIuWkh+S7veWGheWuueW8guW4uCIKcHJpbnRmICdiLW1vZCcgPiAiJERBVEFfQkFTRS93b3JrL2JrMS50eHQiCiIkU0NSSVBUX0RJUi9ndWFyZC1yZXN0b3JlLnNoIiAiJGRlc3RiIiA+L2Rldi9udWxsIDI+JjEgJiYgWyAiJChjYXQgIiREQVRBX0JBU0Uvd29yay9iazEudHh0IikiID0gImItb3JpZyIgXSAmJiBvayAi5aSH5Lu96KaG55uW6L+Y5Y6f5oiQ5YqfIiB8fCBiYWQgIuWkh+S7veimhueblui/mOWOn+Wksei0pSIKIiRTQ1JJUFRfRElSL2d1YXJkLXJlc3RvcmUuc2giICIkZGVzdGIiID4vZGV2L251bGwgMj4mMSAmJiBbICIkKGNhdCAiJERBVEFfQkFTRS93b3JrL2JrMS50eHQiKSIgPSAiYi1vcmlnIiBdICYmIG9rICLph43lpI3opobnm5bov5jljp/vvIjluYLnrYnvvIkiIHx8IGJhZCAi5bmC562J6L+Y5Y6f5aSx6LSlIgoKc3RlcCAiVDEyIGJhY2t1cCDmi5Lnu53nlKjkvosiCmV4cGVjdF9leGl0ICJiYWNrdXAg56aB5YaZ5riF5Y2V5ouS57udKHJjMykiIDMgIiRTQ1JJUFRfRElSL2d1YXJkLWJhY2t1cC5zaCIgL3N5c3RlbS9idWlsZC5wcm9wICJ0ZXN0IgpleHBlY3RfZXhpdCAiYmFja3VwIOmAmumFjeespuaLkue7nShyYzMpIiAzICIkU0NSSVBUX0RJUi9ndWFyZC1iYWNrdXAuc2giICIkREFUQV9CQVNFL3dvcmsvKiIgInRlc3QiCmV4cGVjdF9leGl0ICJiYWNrdXAg5LiN5a2Y5Zyo5ouS57udKHJjMykiIDMgIiRTQ1JJUFRfRElSL2d1YXJkLWJhY2t1cC5zaCIgIiREQVRBX0JBU0Uvd29yay9ub3BlIiAidGVzdCIKZXhwZWN0X2V4aXQgImJhY2t1cCDnm67lvZXmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtYmFja3VwLnNoIiAiJERBVEFfQkFTRS93b3JrIiAidGVzdCIKCnN0ZXAgIlQxMyByZXN0b3JlIOaJqeWxleaLkue7neeUqOS+iyIKZXhwZWN0X2V4aXQgImJhY2t1cCDot6/lvoTooqvnr6HmlLnmi5Lnu50ocmMzKSIgMyAiJFNDUklQVF9ESVIvZ3VhcmQtcmVzdG9yZS5zaCIgIiREQVRBX0JBU0Uvd29yay9iazEudHh0IgoKc3RlcCAiVDkgbWFuaWZlc3Qg5qC85byP5qCh6aqMIgphd2sgLUYgJ1x0JyAnTkYhPTV7YmFkPTF9IEVORHtpZihiYWQpZXhpdCAxOyBleGl0IDB9JyAiJEdVQVJEX1RSQVNIX0RBVEFfUk9PVC9tYW5pZmVzdC5sb2ciICYmIG9rICLns7vnu5/lsYIgbWFuaWZlc3QgNeWtl+autSIgfHwgYmFkICLns7vnu5/lsYIgbWFuaWZlc3Qg5qC85byP5byC5bi4Igphd2sgLUYgJ1x0JyAnTkYhPTV7YmFkPTF9IEVORHtpZihiYWQpZXhpdCAxOyBleGl0IDB9JyAiJEdVQVJEX1RSQVNIX1NEQ0FSRF9ST09UL21hbmlmZXN0LmxvZyIgJiYgb2sgIueUqOaIt+WxgiBtYW5pZmVzdCA15a2X5q61IiB8fCBiYWQgIueUqOaIt+WxgiBtYW5pZmVzdCDmoLzlvI/lvILluLgiCgpzdGVwICJUMTAg5pel5b+X5qCh6aqMIgpbIC1zICIkR1VBUkRfVFJBU0hfREFUQV9ST09UL2d1YXJkLmxvZyIgXSAmJiBvayAiZ3VhcmQubG9nIOmdnuepuiIgfHwgYmFkICJndWFyZC5sb2cg5Li656m6IgpncmVwIC1xICJzZWxmdGVzdCBtb3ZlIiAiJEdVQVJEX1RSQVNIX0RBVEFfUk9PVC9ndWFyZC5sb2ciICYmIG9rICLml6Xlv5flkKvmk43kvZzorrDlvZUiIHx8IGJhZCAi5pel5b+X57y66K6w5b2VIgoKc3RlcCAiVDE0IHBhdGggbm9ybWFsaXphdGlvbiAoL3N0b3JhZ2UgYWxpYXMpIgpwcmludGYgJ24xJyA+ICIkU0RDX0JBU0Uvd29yay9uMS50eHQiClNEQ19SRUFMPSQoY2QgIiRTRENfQkFTRSIgJiYgcHdkKQpjYXNlICIkU0RDX1JFQUwiIGluCiAgL3NkY2FyZC8qKSBTVE9SX1BBVEg9Ii9zdG9yYWdlL2VtdWxhdGVkLzAvJHtTRENfUkVBTCMvc2RjYXJkL30vd29yay9uMS50eHQiIDs7CiAgKikgU1RPUl9QQVRIPSIkU0RDX1JFQUwvd29yay9uMS50eHQiIDs7CmVzYWMKaWYgWyAtZSAiJFNUT1JfUEFUSCIgXTsgdGhlbgogIG91dG49JCgiJFNDUklQVF9ESVIvZ3VhcmQtdHJhc2guc2giICIkU1RPUl9QQVRIIiAibm9ybSB0ZXN0IiAyPi9kZXYvbnVsbCk7IHJjbj0kPwogIGlmIFsgJHJjbiAtZXEgMCBdOyB0aGVuCiAgICBsYXN0bj0kKHRhaWwgLW4xICIkR1VBUkRfVFJBU0hfU0RDQVJEX1JPT1QvbWFuaWZlc3QubG9nIikKICAgIGMybj0kKHByaW50ZiAnJXMnICIkbGFzdG4iIHwgYXdrIC1GICdcdCcgJ3twcmludCAkMn0nKQogICAgYzNuPSQocHJpbnRmICclcycgIiRsYXN0biIgfCBhd2sgLUYgJ1x0JyAne3ByaW50ICQzfScpCiAgICBjYXNlICIkYzJuIiBpbgogICAgICAvc3RvcmFnZS9lbXVsYXRlZC8wLyp8L3N0b3JhZ2Uvc2VsZi9wcmltYXJ5Lyp8L2RhdGEvZGF0YS8qKSBiYWQgIm9yaWdpbmFsIHBhdGggbm90IG5vcm1hbGl6ZWQ6ICRjMm4iIDs7CiAgICAgICopIG9rICJvcmlnaW5hbCBwYXRoIG5vcm1hbGl6ZWQiIDs7CiAgICBlc2FjCiAgICBjYXNlICIkYzNuIiBpbgogICAgICAvc3RvcmFnZS9lbXVsYXRlZC8wLyp8L3N0b3JhZ2Uvc2VsZi9wcmltYXJ5Lyp8L2RhdGEvZGF0YS8qKSBiYWQgInRyYXNoIHBhdGggbm90IG5vcm1hbGl6ZWQ6ICRjM24iIDs7CiAgICAgICopIG9rICJ0cmFzaCBwYXRoIG5vcm1hbGl6ZWQiIDs7CiAgICBlc2FjCiAgZWxzZQogICAgYmFkICJub3JtYWxpemF0aW9uIHRyYXNoIGZhaWxlZCByYz0kcmNuIgogIGZpCmVsc2UKICBvayAibm9ybWFsaXphdGlvbiBjYXNlIHNraXBwZWQgKHNhbmRib3ggbm90IHVuZGVyIC9zZGNhcmQpIgpmaQoKc3RlcCAiVDE1IGxlZGdlciBjb25jdXJyZW50IGFwcGVuZCAobm8gbG9zdCByb3dzKSIKQ0Y9IiRHVUFSRF9UUkFTSF9EQVRBX1JPT1QvbWFuaWZlc3QubG9nIgpiZWZvcmVfbj0kKGF3ayAnRU5Ee3ByaW50IE5SfScgIiRDRiIpCgojIHdyaXRlciBBIGluIGJhY2tncm91bmQKKAogIGk9MAogIHdoaWxlIFsgJGkgLWx0IDE1IF07IGRvCiAgICBpPSQoKGkrMSkpCiAgICBsZWRnZXJfYXBwZW5kICIkQ0YiICIkKHByaW50ZiAnQkdTRUVOXHQveGElZFx0L3lhJWRcdGNvbmNBJWRcdHJvb3QnICIkaSIgIiRpIiAiJGkiKSIKICAgIHNsZWVwIDAuMDAyCiAgZG9uZQopICYKQkdQSUQ9JCEKCiMgd3JpdGVyIEIgaW4gZm9yZWdyb3VuZApqPTAKd2hpbGUgWyAkaiAtbHQgMTUgXTsgZG8KICBqPSQoKGorMSkpCiAgbGVkZ2VyX2FwcGVuZCAiJENGIiAiJChwcmludGYgJ0ZHU0VFTlx0L3hiJWRcdC95YiVkXHRjb25jQiVkXHRyb290JyAiJGoiICIkaiIgIiRqIikiCiAgc2xlZXAgMC4wMDIKZG9uZQoKd2FpdCAkQkdQSUQgMj4vZGV2L251bGwKCmFmdGVyX249JChhd2sgJ0VORHtwcmludCBOUn0nICIkQ0YiKQpiZ19jbnQ9JChncmVwIC1jICdeQkdTRUVOJyAiJENGIiAyPi9kZXYvbnVsbCB8fCBlY2hvIDApCmZnX2NudD0kKGdyZXAgLWMgJ15GR1NFRU4nICIkQ0YiIDI+L2Rldi9udWxsIHx8IGVjaG8gMCkKZXhwZWN0X249JCgoYmVmb3JlX24gKyAzMCkpCgppZiBbICIkYWZ0ZXJfbiIgLWVxICIkZXhwZWN0X24iIF07IHRoZW4KICBvayAicm93IGNvdW50IGV4YWN0ICgkYmVmb3JlX24gLT4gJGFmdGVyX24pIgplbHNlCiAgYmFkICJyb3cgY291bnQgbWlzbWF0Y2ggKCRiZWZvcmVfbiAtPiAkYWZ0ZXJfbiwgd2FudCAkZXhwZWN0X24pIgpmaQpbICIkYmdfY250IiAtZXEgMTUgXSAmJiBvayAiYmFja2dyb3VuZCB3cml0ZXIgMTUvMTUga2VwdCIgfHwgYmFkICJiYWNrZ3JvdW5kIHdyaXRlciBsb3N0IHJvd3MgKCRiZ19jbnQvMTUpIgpbICIkZmdfY250IiAtZXEgMTUgXSAmJiBvayAiZm9yZWdyb3VuZCB3cml0ZXIgMTUvMTUga2VwdCIgfHwgYmFkICJmb3JlZ3JvdW5kIHdyaXRlciBsb3N0IHJvd3MgKCRmZ19jbnQvMTUpIgppZiBbIC1kICIke0NGfS5sb2NrIiBdOyB0aGVuIGJhZCAibGVkZ2VyIGxvY2sgbGVmdCBiZWhpbmQiOyBlbHNlIG9rICJsZWRnZXIgbG9jayBjbGVhbiI7IGZpCgpzdGVwICJUMTYgbGVkZ2VyIGluLXBsYWNlIFBVUkdFRCBtYXJraW5nIgpNRjI9IiRHVUFSRF9UUkFTSF9EQVRBX1JPT1QvbWFuaWZlc3QubG9nIgpwcmludGYgJ3AxJyA+ICIkREFUQV9CQVNFL3dvcmsvcDEudHh0IgpvdXRwPSQoIiRTQ1JJUFRfRElSL2d1YXJkLXRyYXNoLnNoIiAiJERBVEFfQkFTRS93b3JrL3AxLnR4dCIgInB1cmdlIG1hcmsgdGVzdCIgMj4vZGV2L251bGwpCnJjcD0kPwppZiBbICRyY3AgLWVxIDAgXTsgdGhlbgogIGxpbmVzcD0kKGF3ayAnRU5Ee3ByaW50IE5SfScgIiRNRjIiKQogIHRhcmdldHA9JChwcmludGYgJyVzXG4nICIkb3V0cCIgfCBoZWFkIC1uMSk7IHRhcmdldHA9JHt0YXJnZXRwI+W3suWFpeWbnuaUtuermTogfQogIGF3ayAtRiAnXHQnIC12IE9GUz0nXHQnIC12IHQ9IiR0YXJnZXRwIiAnJDM9PXQgJiYgaW5kZXgoJDQsIlBVUkdFRCIpIT0xIHskND0iUFVSR0VEfCIgJDR9IHtwcmludH0nICIkTUYyIiA+ICIkTUYyLm5ldyIKICBjcCAtZiAiJE1GMi5uZXciICIkTUYyIjsgcm0gLWYgIiRNRjIubmV3IgogIGxpbmVzMj0kKGF3ayAnRU5Ee3ByaW50IE5SfScgIiRNRjIiKQogIFsgIiRsaW5lc3AiIC1lcSAiJGxpbmVzMiIgXSAmJiBvayAicm93IGNvdW50IHVuY2hhbmdlZCBhZnRlciBtYXJrICgkbGluZXNwKSIgfHwgYmFkICJyb3cgY291bnQgY2hhbmdlZCAoJGxpbmVzcCAtPiAkbGluZXMyKSIKICBncmVwIC1xICJQVVJHRUR8cHVyZ2UgbWFyayB0ZXN0IiAiJE1GMiIgJiYgb2sgIlBVUkdFRCBtYXJrIGNvbnRlbnQgY29ycmVjdCIgfHwgYmFkICJQVVJHRUQgbWFyayBtaXNzaW5nIgogIGF3ayAtRiAnXHQnICdORiE9NXtiYWQ9MX0gRU5Ee2lmKGJhZClleGl0IDE7IGV4aXQgMH0nICIkTUYyIiAmJiBvayAic3RpbGwgNSBmaWVsZHMgYWZ0ZXIgbWFyayIgfHwgYmFkICJmaWVsZCBjb3VudCBicm9rZW4iCmVsc2UKICBiYWQgIlBVUkdFRCB0ZXN0IHByZWNvbmRpdGlvbiB0cmFzaCBmYWlsZWQgcmM9JHJjcCIKZmkKCmVjaG8KZWNobyAiPT09PT09PT09PT09PT09PT09PT0iCmVjaG8gIlBBU1M9JFBBU1MgRkFJTD0kRkFJTCIKaWYgWyAiJEZBSUwiIC1ndCAwIF07IHRoZW4KICBlY2hvICLmnInlpLHotKXpobnvvJrmspnnrrHkv53nlZnkvpvmjpLmn6Ug4oaSICREQVRBX0JBU0UgLyAkU0RDX0JBU0UiCiAgZXhpdCAxCmZpCmVjaG8gIua4heeQhuaymeeusS4uLiIKc2FmZV9ybSAiJERBVEFfQkFTRSI7IHNhZmVfcm0gIiRTRENfQkFTRSIKZWNobyAi5a6M5oiQ77yI5rKZ566x5bey5riF55CG77yJIgpleGl0IDA="};

    function sq(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; }

    // 纯 JS base64 编码（运行时不提供 btoa）
    const B64C = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function b64encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 0x80) bytes.push(c);
            else if (c < 0x800) { bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
            else if (c < 0xd800 || c >= 0xe000) { bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
            else if (c >= 0xd800 && c <= 0xdbff) {
                // 高位代理：必须有合法的低位代理跟随，否则用 U+FFFD 代替
                const c2 = (i + 1 < str.length) ? str.charCodeAt(i + 1) : -1;
                if (c2 >= 0xdc00 && c2 <= 0xdfff) {
                    i++;
                    const cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                    bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
                } else {
                    // 孤立高位代理 → U+FFFD
                    bytes.push(0xef, 0xbf, 0xbd);
                }
            }
            else {
                // 孤立低位代理 → U+FFFD
                bytes.push(0xef, 0xbf, 0xbd);
            }
        }
        let out = "";
        for (let i = 0; i < bytes.length; i += 3) {
            const b1 = bytes[i], b2 = bytes[i + 1], b3 = bytes[i + 2];
            out += B64C.charAt(b1 >> 2);
            out += B64C.charAt(((b1 & 3) << 4) | ((b2 === undefined ? 0 : b2) >> 4));
            out += (b2 === undefined) ? "=" : B64C.charAt(((b2 & 15) << 2) | ((b3 === undefined ? 0 : b3) >> 6));
            out += (b3 === undefined) ? "=" : B64C.charAt(b3 & 63);
        }
        return out;
    }

    function startsWith(p, pre) {
        if (p === pre) return true;
        return p.indexOf(pre + "/") === 0;
    }

    async function runShell(command) {
        const result = await Tools.System.shell(String(command));
        return {
            output: String((result && result.output) || ""),
            exitCode: result && typeof result.exitCode === "number" ? result.exitCode : -1
        };
    }

    async function readConfig() {
        try {
            const r = await runShell("[ -f " + sq(CONFIG_FILE) + " ] && cat " + sq(CONFIG_FILE) + " || echo __NONE__");
            const t = r.output.trim();
            if (t === "__NONE__" || t === "") return { report_trash: true };
            const o = JSON.parse(t);
            if (typeof o.report_trash !== "boolean") o.report_trash = true;
            return o;
        } catch (e) { return { report_trash: true }; }
    }

    async function writeConfig(cfg) {
        const json = JSON.stringify(cfg);
        const b64 = b64encode(json);
        await runShell("mkdir -p " + GUARD_DATA);
        await runShell("printf '%s' '" + b64 + "' | base64 -d > " + sq(CONFIG_FILE));
    }

    // MUST verify every bundled script, not just one.
    // Lesson: early versions only checked guard-trash.sh, so newly added or
    // updated scripts were never released and the OLD ones kept running.
    async function kitPresent() {
        const names = Object.keys(BUNDLE);
        if (!names.length) return false;
        let cmd = "ok=1; for f in";
        for (let i = 0; i < names.length; i++) cmd += " " + sq(names[i]);
        cmd += "; do [ -x " + KIT_DIR + "/$f ] || ok=0; done; [ $ok -eq 1 ] && echo YES || echo NO";
        const r = await runShell(cmd);
        return (r.output || "").indexOf("YES") >= 0;
    }

    async function guard_setup(params) {
        try {
            const force = !!(params && (params.force === true || params.force === "true"));
            if (!force && await kitPresent()) {
                return { success: true, note: "guard_data/kit 已存在（更新请传 force=true）", kit_dir: KIT_DIR };
            }
            await runShell("mkdir -p " + KIT_DIR);
            const names = Object.keys(BUNDLE);
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                await runShell("printf '%s' '" + BUNDLE[name] + "' > " + KIT_DIR + "/" + name + ".b64");
                await runShell("base64 -d " + KIT_DIR + "/" + name + ".b64 > " + KIT_DIR + "/" + name + " && rm -f " + KIT_DIR + "/" + name + ".b64");
            }
            await runShell("chmod 755 " + KIT_DIR + "/*.sh 2>/dev/null");
            const ok = await kitPresent();

            const check = { syntax: {}, executable: {}, all_ok: true };
            const chk = await runShell("cd " + KIT_DIR + " && for f in *.sh; do sh -n \"$f\" >/dev/null 2>&1 && echo \"SYNOK $f\" || echo \"SYNFAIL $f\"; done");
            const lines = chk.output.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const ln = lines[i].trim();
                if (ln.indexOf("SYNOK ") === 0) check.syntax[ln.substring(6)] = "ok";
                else if (ln.indexOf("SYNFAIL ") === 0) { check.syntax[ln.substring(8)] = "FAIL"; check.all_ok = false; }
            }
            for (let i = 0; i < names.length; i++) {
                const r2 = await runShell("[ -x " + KIT_DIR + "/" + names[i] + " ] && echo Y || echo N");
                check.executable[names[i]] = r2.output.indexOf("Y") >= 0 ? "ok" : "FAIL";
                if (r2.output.indexOf("Y") < 0) check.all_ok = false;
            }

            return { success: ok && check.all_ok, forced: force, kit_dir: KIT_DIR, files: names, verify: check };
        } catch (e) { return { success: false, error: String((e && e.message) || e) }; }
    }

    async function trashUsage() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const r = await runShell("cat " + USAGE_CACHE + " 2>/dev/null || echo __NONE__");
            const raw = r.output.trim();
            if (raw !== "__NONE__" && raw.length > 3) {
                try {
                    const c = JSON.parse(raw);
                    if (c && typeof c.ts === "number" && (now - c.ts) < USAGE_TTL) return c.data;
                } catch (e2) { }
            }
            async function one(root) {
                const s = await runShell("du -sh " + sq(root + "/trash") + " 2>/dev/null | cut -f1 || echo 0");
                const f = await runShell("find " + sq(root + "/trash") + " -type f 2>/dev/null | wc -l");
                const e = await runShell("ls -1A " + sq(root + "/trash") + " 2>/dev/null | wc -l");
                return {
                    size: (s.output.trim() || "0"),
                    files: parseInt(f.output.trim() || "0", 10),
                    entries: parseInt(e.output.trim() || "0", 10)
                };
            }
            const data = { system: await one(TRASH_SYS), user: await one(TRASH_USER) };
            const payload = JSON.stringify({ ts: now, data: data });
            await runShell("mkdir -p " + GUARD_DATA);
            await runShell("printf '%s' '" + b64encode(payload) + "' | base64 -d > " + USAGE_CACHE);
            return data;
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    // 确保 kit 就绪；失败时返回错误对象（而非静默忽略）
    async function ensureKit(toolName) {
        const st = await guard_setup();
        if (!st || st.success !== true) {
            return {
                error: "guard kit 未就绪，" + toolName + " 无法执行",
                hint: "试试 guard_setup { force: true }",
                setup_result: st
            };
        }
        return null;
    }

    async function statusFor(silent) {
        const cfg = await readConfig();
        if (silent) return { report: false, suppressed: "silent" };
        if (!cfg.report_trash) return { report: false, suppressed: "config" };
        const u = await trashUsage();
        return { report: true, usage: u };
    }

    async function guard_status() {
        try {
            const id = await runShell("id");
            const caps = await runShell("grep -E '^(Uid|Gid|Groups|Cap(Inh|Prm|Eff|Bnd)|NoNewPrivs)' /proc/self/status");
            const dm = await runShell("[ -d /data_mirror/data_ce/null/0 ] && echo MIRROR_OK || echo MIRROR_ABSENT");
            const tm = await runShell("[ -d " + sq(TRASH_SYS + "/trash") + " ] && echo OK || echo ABSENT");
            const ts = await runShell("[ -d " + sq(TRASH_USER + "/trash") + " ] && echo OK || echo ABSENT");
            const kit = await kitPresent();
            const u = await trashUsage();
            const cfg = await readConfig();
            return {
                root_id: id.output.trim(),
                caps: caps.output.trim(),
                data_channel: dm.output.indexOf("MIRROR_OK") >= 0 ? "/data_mirror/data_ce/null/0" : "/data/data（镜像不可用）",
                trash_system: tm.output.trim(),
                trash_user: ts.output.trim(),
                guard_kit: kit ? "已安装" : "未安装（先跑 guard_setup）",
                kit_dir: KIT_DIR,
                trash_usage: u,
                report_trash: cfg.report_trash
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_init() {
        try {
            const e0 = await ensureKit("guard_init");
            if (e0) return e0;
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-init.sh"));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_trash(params) {
        try {
            const e0 = await ensureKit("guard_trash");
            if (e0) return e0;
            const target = params && params.target ? String(params.target) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            const silent = !!(params && (params.silent === true || params.silent === "true"));
            if (!target || !reason) { return { error: "需要 target 与 reason" }; }
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-trash.sh") + " " + sq(target) + " " + sq(reason));
            const out = { exitCode: r.exitCode, output: r.output.trim() };
            if (r.exitCode === 0) out.trash_status = await statusFor(silent);
            return out;
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_backup(params) {
        try {
            const e0 = await ensureKit("guard_backup");
            if (e0) return e0;
            const target = params && params.target ? String(params.target) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            const silent = !!(params && (params.silent === true || params.silent === "true"));
            if (!target || !reason) { return { error: "需要 target 与 reason" }; }
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-backup.sh") + " " + sq(target) + " " + sq(reason));
            const out = { exitCode: r.exitCode, output: r.output.trim() };
            if (r.exitCode === 0) out.trash_status = await statusFor(silent);
            return out;
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_restore(params) {
        try {
            const e0 = await ensureKit("guard_restore");
            if (e0) return e0;
            const t = params && params.trashed_path ? String(params.trashed_path) : "";
            if (!t) { return { error: "需要 trashed_path" }; }
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-restore.sh") + " " + sq(t));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_log(params) {
        try {
            const e0 = await ensureKit("guard_log");
            if (e0) return e0;
            const level = params && params.level ? String(params.level) : "L1";
            const command = params && params.command ? String(params.command) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            const result = params && params.result ? String(params.result) : "OK";
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-log.sh") + " " + sq(TRASH_SYS + "/guard.log") + " " + sq(level) + " " + sq(command) + " " + sq(reason) + " " + sq(result));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    // Run embedded self-test (sandbox mode, does NOT touch real trash)
    async function guard_selftest() {
        try {
            const e0 = await ensureKit("guard_selftest");
            if (e0) return e0;
            const r = await runShell("sh " + sq(KIT_DIR + "/guard-selftest.sh") + " 2>&1; echo RC=$?");
            const out = r.output || "";
            const rcM = out.match(/RC=(\d+)/);
            const rc = rcM ? parseInt(rcM[1], 10) : -1;
            const passM = out.match(/PASS=(\d+)/);
            const failM = out.match(/FAIL=(\d+)/);
            return {
                exitCode: rc,
                pass: passM ? parseInt(passM[1], 10) : null,
                fail: failM ? parseInt(failM[1], 10) : null,
                all_ok: rc === 0,
                tail: out.split("\n").slice(-14).join("\n")
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_list(params) {
        try {
            const limit = params && params.limit ? parseInt(String(params.limit), 10) : 20;
            const lim = (isNaN(limit) || limit <= 0) ? 20 : limit;
            const r = await runShell(
                "cat " + sq(TRASH_SYS + "/manifest.log") + " 2>/dev/null; " +
                "cat " + sq(TRASH_USER + "/manifest.log") + " 2>/dev/null; echo"
            );
            const txt = r.output.replace(/\r/g, "");
            const rows = [];
            const lines = txt.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const ln = lines[i];
                if (!ln || ln.indexOf("\t") < 0) continue;
                const c = ln.split("\t");
                if (c.length < 5) continue;
                const tp = c[2] || "";
                const ev = c[3] || "";
                // 已清理 / 已还原的不列入清单
                if (ev.indexOf("PURGED") === 0 || ev === "RESTORED" || ev === "RESTORED-FROM-BACKUP") continue;
                // tier 判定同时接受 /sdcard 与 /storage/emulated/0 两种写法
                let tier = "unknown";
                if (tp.indexOf(TRASH_USER) === 0 || tp.indexOf("/storage/emulated/0/Download/Operit/.guard-trash") === 0) tier = "L2";
                else if (tp.indexOf(TRASH_SYS) === 0) tier = "L1";
                rows.push({ time: c[0], original: c[1], trashed: c[2], reason: c[3], operator: c[4], tier: tier });
            }
            rows.sort(function (a, b) { return a.time < b.time ? 1 : (a.time > b.time ? -1 : 0); });
            const out = rows.slice(0, lim);
            return { total: rows.length, shown: out.length, entries: out };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    function classify(p) {
        if (!p || p.charAt(0) !== "/") return { tier: "unknown", reason: "非绝对路径" };
        for (let i = 0; i < L2_PATHS.length; i++) {
            if (startsWith(p, L2_PATHS[i])) return { tier: "L2", reason: "用户层约定目录，卸载不清理，需列入卸载清单" };
        }
        if (startsWith(p, L1_PREFIX) || startsWith(p, L1_PREFIX_DE) || startsWith(p, L1_PREFIX_EXT)) {
            return { tier: "L1", reason: "系统层，卸载即清空" };
        }
        for (let i = 0; i < FORBIDDEN.length; i++) {
            const f = FORBIDDEN[i];
            if (p === f) return { tier: "L3", reason: "禁写区根目录本身" };
            if (startsWith(p, f)) {
                if (f === "/data/user/0/com.ai.assistance.operit/files" && startsWith(p, GUARD_DATA)) {
                    return { tier: "L1", reason: "系统层 guard_data，卸载即清空" };
                }
                return { tier: "L3", reason: "禁写区（顶层散落）" };
            }
        }
        return { tier: "unknown", reason: "不在已知分层内" };
    }

    async function guard_tier(params) {
        const p = params && params.path ? String(params.path) : "";
        if (!p) return { error: "需要 path" };
        const c = classify(p);
        return { path: p, tier: c.tier, reason: c.reason };
    }

    const PURPOSES = {
        deliver: { dir: USER_DELIVER, desc: "交付物（用户名下可见的出口，非 _scratch/deliver）" },
        evidence: { dir: SCRATCH + "/evidence", desc: "证据（证明某事的原始材料）" },
        archive: { dir: SCRATCH + "/archive", desc: "归档（现在不用、以后可能要）" },
        ledger: { dir: SCRATCH + "/ledger", desc: "账本（记录/md5/操作留底）" },
        tmp: { dir: SCRATCH + "/tmp", desc: "临时（本次任务中间产物）" },
        junk: { dir: SCRATCH + "/junk", desc: "垃圾（确认无价值，可定期清）" },
        bulk: { dir: GUARD_DATA + "/scratch", desc: "大件（>5000 文件 或 >100MB）" }
    };

    async function guard_locate(params) {
        try {
            const purpose = params && params.purpose ? String(params.purpose).trim() : "";
            const name = params && params.name ? String(params.name).trim() : "";
            const fc = params && params.file_count ? Number(params.file_count) : 0;
            const smb = params && params.size_mb ? Number(params.size_mb) : 0;

            if (!purpose) {
                return { error: "需要 purpose", allowed: Object.keys(PURPOSES) };
            }
            let key = purpose;
            let switched = null;

            if (key !== "bulk" && ((fc > 5000) || (smb > 100))) {
                switched = "检测到大件（文件数 " + fc + " / " + smb + "MB），改落 L1";
                key = "bulk";
            }
            const spec = PURPOSES[key];
            if (!spec) return { error: "未知 purpose: " + purpose, allowed: Object.keys(PURPOSES) };

            const full = name ? (spec.dir + "/" + name.replace(/^\/+/, "")) : spec.dir;
            const tierInfo = classify(full);

            return {
                path: full,
                dir: spec.dir,
                purpose: key,
                purpose_desc: spec.desc,
                tier: tierInfo.tier,
                tier_reason: tierInfo.reason,
                uninstall_cleared: tierInfo.tier === "L1",
                switched_from: switched,
                forbidden_dirs: FORBIDDEN,
                note: "这是落盘判据，不是强制。写完后可用 guard_tier 复核。"
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_audit(params) {
        try {
            const maxPer = params && params.max_per_dir ? parseInt(String(params.max_per_dir), 10) : 30;
            const lim = (isNaN(maxPer) || maxPer <= 0) ? 30 : maxPer;
            const result = [];
            for (let i = 0; i < FORBIDDEN.length; i++) {
                const d = FORBIDDEN[i];
                const r = await runShell("[ -d " + sq(d) + " ] && ls -1A " + sq(d) + " 2>/dev/null | head -" + String(lim + 1) + " || echo __NODIR__");
                const txt = r.output.replace(/\r/g, "").trim();
                if (txt === "__NODIR__") { result.push({ dir: d, exists: false, items: [] }); continue; }
                const items = [];
                const lines = txt.split("\n");
                for (let j = 0; j < lines.length && j < lim; j++) {
                    const nm = lines[j].trim();
                    if (!nm) continue;
                    items.push(nm);
                }
                result.push({ dir: d, exists: true, count_shown: items.length, items: items });
            }
            return {
                note: "禁止区用于发现 AI 产物散落；系统/其他应用的合法内容请勿误判。",
                recommended: SCRATCH,
                scan: result
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_config(params) {
        try {
            const cur = await readConfig();
            const show = !!(params && (params.show === true || params.show === "true"));
            if (show || !params || params.report_trash === undefined) {
                return { config: cur, file: CONFIG_FILE };
            }
            const v = (params.report_trash === true || params.report_trash === "true");
            cur.report_trash = v;
            cur.updated_at = new Date().toISOString();
            await writeConfig(cur);
            return { success: true, config: cur, file: CONFIG_FILE };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }


    // ---- purge 审计日志（双写：L1 App私有 + L2 用户层）----
    const PURGE_LOG_L1 = GUARD_DATA + "/purge.log";
    const PURGE_LOG_L2 = TRASH_USER + "/purge.log";

    async function auditPurge(rec) {
        const line = rec + "\n";
        const b64 = b64encode(line);
        await runShell("printf '%s' '" + b64 + "' | base64 -d >> " + sq(PURGE_LOG_L1) + " 2>/dev/null");
        await runShell("printf '%s' '" + b64 + "' | base64 -d >> " + sq(PURGE_LOG_L2) + " 2>/dev/null");
    }

    // ---- 账本就地改写（purge 后标记）----
    // manifest.log 每行 5 列：时间 / 原路径 / 回收站路径 / 事件 / 操作者
    // 真删成功后将该行第 4 列改为 "PURGED|原因"：
    //   • 行数不变，账本不膨胀
    //   • 保留原删除原因，可追溯
    //   • 读取端 indexOf("PURGED")===0 天然生效
    // 临时文件 + mv 原子替换，避免写坏。
    // ---- 账本标记（按行号精确定位，不靠路径匹配）----
    // 为什么用行号：同一个回收站路径会对应多个事件（删除 / 还原 / 再删除），
    // 拿路径做匹配会把 RESTORED 那行一起标掉。
    // markManifest(root, lineNo, expectPath) —— lineNo 从 1 开始
    // 账本修改锁：mkdir 原子性，带超时防死锁
    async function withLedgerLock(mfile, fn) {
        const lock = mfile + ".lock";
        const acq = await runShell(
            "i=0; while ! mkdir " + sq(lock) + " 2>/dev/null; do i=$((i+1)); " +
            "[ $i -ge 100 ] && { echo TIMEOUT; exit 1; }; sleep 0.05; done; echo OK");
        if ((acq.output || "").indexOf("OK") < 0) return { ok: false, why: "获取账本锁超时" };
        try {
            return await fn();
        } finally {
            await runShell("rmdir " + sq(lock) + " 2>/dev/null");
        }
    }

    // 按行号精确标记；锁内重校验，防并发丢行
    async function markManifest(root, lineNo, expectPath) {
        const mfile = root + "/manifest.log";
        const res = await withLedgerLock(mfile, async function () {
            const tmp = mfile + ".tmp." + Math.floor(Math.random() * 1e9);
            const probe =
                "awk -F'\\t' -v n=" + lineNo + " -v e=" + sq(expectPath) + " '" +
                "NR==n && $3==e && index($4,\"PURGED\")!=1 {print \"HIT\"}' " +
                sq(mfile) + " 2>/dev/null";
            const pr = await runShell(probe);
            if ((pr.output || "").indexOf("HIT") < 0) return { ok: false, why: "行号/路径不匹配或已标记" };

            const script =
                "awk -F'\\t' -v OFS='\\t' -v n=" + lineNo + " -v e=" + sq(expectPath) + " '" +
                "NR==n && $3==e && index($4,\"PURGED\")!=1 {$4=\"PURGED|\" $4} {print}' " +
                sq(mfile) + " > " + sq(tmp) + " 2>/dev/null; echo RC=$?";
            const r = await runShell(script);
            if ((r.output || "").indexOf("RC=0") < 0) {
                await runShell("rm -f " + sq(tmp) + " 2>/dev/null");
                return { ok: false, why: "awk 写临时文件失败" };
            }
            // 关键：用 cat > 就地写，不用 mv。
            // mv 会换 inode；shell 写入端用 >> 追加到旧 inode，
            // 两者并发时追加内容会被覆盖丢失（实测丢 3/20）。
            // cat > 保留 inode，锁内执行时一行不丢。
            const wr = await runShell("cat " + sq(tmp) + " > " + sq(mfile) + " 2>/dev/null; echo RC=$?");
            await runShell("rm -f " + sq(tmp) + " 2>/dev/null");
            if ((wr.output || "").indexOf("RC=0") < 0) {
                return { ok: false, why: "写回账本失败" };
            }
            return { ok: true, why: "" };
        });
        return res.ok;
    }

    // 真实路径校验：解析符号链接与 ..，必须落在 <root>/trash/ 之下
    // 规范化路径：readlink -f 会把 /sdcard 解析成 /storage/emulated/0，
    // 因此 root 与目标必须都规范化后再比较，否则前缀永远对不上。
    // 一次 shell 内完成：存在性 + 规范化，消除 [ -e ] 与 readlink -f 之间的 TOCTOU 窗口
    // 输出：第1行 OK|MISSING，第2行规范化后真实路径
    async function probePath(p) {
        const r = await runShell(
            "if [ -e " + sq(p) + " ]; then echo OK; readlink -f " + sq(p) +
            " 2>/dev/null || echo; else echo MISSING; echo; fi");
        const out = (r.output || "").split("\n");
        return { exists: (out[0] || "").trim() === "OK", real: (out[1] || "").trim() };
    }

    async function realpathUnder(root, p) {
        const pr = await probePath(p);
        if (!pr.exists) return { ok: false, real: "", why: "目标不存在", missing: true };
        if (!pr.real) return { ok: false, real: "", why: "readlink 失败" };

        const cr = await probePath(root);
        if (!cr.real) return { ok: false, real: "", why: "回收站根路径无法解析" };
        const safeRoot = cr.real + "/trash/";
        const rp = pr.real;

        if (rp.indexOf(safeRoot) !== 0) return { ok: false, real: rp, why: "规范化后不在 " + safeRoot + " 之下" };
        if (rp === cr.real + "/trash") return { ok: false, real: rp, why: "拒绝删回收站根目录" };
        if (rp.indexOf("..") >= 0) return { ok: false, real: rp, why: "规范化后仍含 .." };
        return { ok: true, real: rp, why: "" };
    }

    // ---- 历史残留修复：账本里有记录、回收站里没实物 ----
    // 场景：早期版本 purge 后未写回账本，导致这些条目永远停留在账本里，
    // guard_list 一直列出它们，但实物早已不在。本工具把它们标记为
    // PURGED|原因，使之不再出现在清单里。不删任何实物。
    async function guard_repair(params) {
        try {
            const dryRun = !(params && (params.confirm === true || params.confirm === "true"));
            const roots = [TRASH_SYS, TRASH_USER];
            const stale = [];

            for (let i = 0; i < roots.length; i++) {
                const root = roots[i];
                const mfile = root + "/manifest.log";
                const r = await runShell("cat " + sq(mfile) + " 2>/dev/null || echo");
                const lines = (r.output || "").replace(/\r/g, "").split("\n");

                // 先收集候选（跳过已处理的），再一次 shell 批量查存在性
                const cand = [];
                for (let j = 0; j < lines.length; j++) {
                    const ln = lines[j];
                    if (!ln || ln.indexOf("\t") < 0) continue;
                    const c = ln.split("\t");
                    if (c.length < 5) continue;
                    const ev = c[3] || "";
                    if (ev.indexOf("PURGED") === 0 || ev === "RESTORED" || ev === "RESTORED-FROM-BACKUP") continue;
                    const tp = c[2] || "";
                    if (!tp) continue;
                    cand.push({ lineNo: j + 1, tp: tp, c: c, ev: ev });
                }
                if (!cand.length) continue;

                // 用 NUL 分隔传入路径，一次循环输出 EXISTS/MISSING
                let cmd = "i=0; for p in";
                for (let k = 0; k < cand.length; k++) {
                    cmd += " " + sq(cand[k].tp);
                }
                cmd += "; do i=$((i+1)); if [ -e \"$p\" ]; then echo \"$i EXISTS\"; else echo \"$i MISSING\"; fi; done";

                const batch = await runShell(cmd);
                const flags = {};
                const blines = (batch.output || "").replace(/\r/g, "").split("\n");
                for (let b = 0; b < blines.length; b++) {
                    const m = blines[b].trim().split(" ");
                    if (m.length === 2) flags[m[0]] = m[1];
                }

                for (let k = 0; k < cand.length; k++) {
                    const c0 = cand[k];
                    const st = flags[String(k + 1)];
                    // 实物还在 → 不算残留，交给 guard_purge
                    if (st !== "MISSING") continue;
                    stale.push({
                        tier: (root === TRASH_USER ? "L2" : "L1"),
                        time: c0.c[0], original: c0.c[1], trashed: c0.tp,
                        reason: c0.ev, root: root, line_no: c0.lineNo
                    });
                }
            }

            if (dryRun) {
                return {
                    dry_run: true,
                    note: "预览模式：以下条目账本有记录但实物已不存在。确认后传 confirm=true 才标记。",
                    stale_count: stale.length,
                    items: stale.slice(0, 50)
                };
            }

            const fixed = [];
            const failed = [];
            for (let k = 0; k < stale.length; k++) {
                const it = stale[k];
                const ok = await markManifest(it.root, it.line_no, it.trashed);
                if (ok) {
                    fixed.push(it);
                    await auditPurge(new Date().toISOString() + "\tREPAIR\t" + it.trashed + "\t实物已缺失，账本补标记\ttier=" + it.tier + "\troot");
                } else {
                    failed.push(it);
                }
            }

            return {
                dry_run: false,
                stale_found: stale.length,
                repaired: fixed.length,
                failed: failed.length,
                items: fixed.slice(0, 50),
                errors: failed.slice(0, 10)
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_purge(params) {
        try {
            const dryRun = !(params && (params.confirm === true || params.confirm === "true"));
            const all = !!(params && (params.all === true || params.all === "true"));
            let days = 0;
            if (params && params.older_than !== undefined && params.older_than !== null && String(params.older_than).length) {
                days = parseInt(String(params.older_than), 10);
            }
            if (isNaN(days) || days < 0) days = -1;

            if (!all && days < 0) {
                return {
                    error: "需指定条件",
                    hint: "older_than=<天数> 或 all=true；默认只预览不删，须 confirm=true 才真删",
                    dry_run: dryRun
                };
            }

            const roots = [TRASH_SYS, TRASH_USER];
            const nowMs = Date.now();
            const picked = [];
            const rejected = [];

            for (let i = 0; i < roots.length; i++) {
                const root = roots[i];
                const mfile = root + "/manifest.log";
                const r = await runShell("cat " + sq(mfile) + " 2>/dev/null || echo");
                const txt = (r.output || "").replace(/\r/g, "");
                const lines = txt.split("\n");
                for (let j = 0; j < lines.length; j++) {
                    const ln = lines[j];
                    if (!ln || ln.indexOf("\t") < 0) continue;
                    const c = ln.split("\t");
                    if (c.length < 5) continue;
                    // 行号（账本内 1基），用于精确回写标记
                    const lineNo = j + 1;
                    const reason = c[3] || "";
                    // 跳过已清理记录，避免重复处理
                    if (reason.indexOf("PURGED") === 0 || reason === "RESTORED" || reason === "RESTORED-FROM-BACKUP") continue;
                    const tp = c[2] || "";
                    let ageDays = -1;
                    const t = Date.parse(c[0]);
                    if (!isNaN(t)) ageDays = Math.floor((nowMs - t) / 86400000);
                    let hit = false;
                    if (all) hit = true;
                    else if (days >= 0 && ageDays >= days) hit = true;
                    if (!hit) continue;

                    const gate = await realpathUnder(root, tp);
                    if (!gate.ok) {
                        // missing=true 表示目标本来就不在（账本残留），不算违规，静默跳过
                        // 其余均为越界/穿越，记入 rejected 并写审计日志
                        if (!gate.missing) {
                            rejected.push({
                                tier: (root === TRASH_USER ? "L2" : "L1"),
                                time: c[0], declared: tp, real: gate.real, why: gate.why
                            });
                        }
                        continue;
                    }

                    picked.push({
                        tier: (root === TRASH_USER ? "L2" : "L1"),
                        time: c[0], original: c[1], trashed: gate.real, declared: tp,
                        age_days: ageDays, manifest: mfile, root: root, line_no: lineNo
                    });
                }
            }

            if (dryRun) {
                if (rejected.length) {
                    await auditPurge(new Date().toISOString() + "\tDRYRUN_REJECT\tcount=" + rejected.length + "\t" + JSON.stringify(rejected.slice(0, 5)) + "\troot");
                }
                return {
                    dry_run: true,
                    note: "预览模式，未删除任何东西。确认后传 confirm=true 才真删",
                    condition: all ? "all" : ("older_than=" + days + "d"),
                    will_delete: picked.length,
                    rejected: rejected.length,
                    items: picked.slice(0, 50),
                    rejected_items: rejected.slice(0, 20)
                };
            }

            const done = [];
            const failed = [];
            for (let k = 0; k < picked.length; k++) {
                const it = picked[k];
                const rm = await runShell("rm -r -f " + sq(it.trashed) + " 2>&1; echo RC=$?");
                const ok = (rm.output || "").indexOf("RC=0") >= 0;
                const mts = new Date().toISOString();
                if (ok) {
                    done.push(it);
                    // 就地改写账本（不增行），使该条目不再被扫描/列出
                    it.manifest_marked = await markManifest(it.root, it.line_no, it.declared);
                    await auditPurge(mts + "\tPURGED\t" + it.trashed + "\tcond=" + (all ? "all" : ("older_than " + days + "d")) + "\ttier=" + it.tier + "\tpurge");
                } else {
                    it.err = rm.output;
                    failed.push(it);
                    await auditPurge(mts + "\tPURGE_FAIL\t" + it.trashed + "\terr=" + String(rm.output || "").replace(/\n/g, " ").slice(0, 120) + "\tpurge");
                }
            }

            for (let q = 0; q < rejected.length; q++) {
                const rj = rejected[q];
                await auditPurge(new Date().toISOString() + "\tREJECT\tdeclared=" + (rj.declared || "") + "\treal=" + (rj.real || "") + "\twhy=" + rj.why + "\tpurge");
            }

            return {
                dry_run: false,
                condition: all ? "all" : ("older_than=" + days + "d"),
                deleted: done.length,
                failed: failed.length,
                rejected: rejected.length,
                items: done.slice(0, 50),
                errors: failed.slice(0, 10),
                rejected_items: rejected.slice(0, 20)
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    return {
        guard_setup, guard_status, guard_init, guard_trash, guard_backup,
        guard_restore, guard_log, guard_list, guard_tier, guard_locate,
        guard_audit, guard_config, guard_purge, guard_repair, guard_selftest
    };
})();
exports.guard_setup = rootGuard.guard_setup;
exports.guard_status = rootGuard.guard_status;
exports.guard_init = rootGuard.guard_init;
exports.guard_trash = rootGuard.guard_trash;
exports.guard_backup = rootGuard.guard_backup;
exports.guard_restore = rootGuard.guard_restore;
exports.guard_log = rootGuard.guard_log;
exports.guard_list = rootGuard.guard_list;
exports.guard_tier = rootGuard.guard_tier;
exports.guard_locate = rootGuard.guard_locate;
exports.guard_audit = rootGuard.guard_audit;
exports.guard_config = rootGuard.guard_config;
exports.guard_purge = rootGuard.guard_purge;
exports.guard_repair = rootGuard.guard_repair;
exports.guard_selftest = rootGuard.guard_selftest;
