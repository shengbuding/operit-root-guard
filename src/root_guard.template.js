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

    const BUNDLE = __BUNDLE_JSON__;

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
