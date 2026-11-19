# 变更日志

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.2.2] - 2026-11-19

安全加固：针对多轮审查发现的 5 个缺陷做系统性修复。声称"同类缺陷不再重犯"。

### 修复

- **工具链自身保护只查单个文件名**（严重）
  `guard-trash.sh` / `guard-backup.sh` 原本只检查目标目录是否含 `guard-trash.sh`（或 `guard-backup.sh`）一个文件，
  因此只含其余脚本（`guard-init.sh` / `guard-restore.sh` / `guard-log.sh` / `guard-selftest.sh`）的目录会被误判放行、
  整棵树被搬进回收站。这与早期 `kitPresent()` 只校验单一脚本是同一类错误，属重复踩坑。
  现改为遍历全部 6 个脚本名，并新增结构特征识别（同时存在 `manifest.log` 与 `trash/` 或 `backups/` 即判定为回收站）。

- **护栏路径硬保护**（严重）
  新增显式拒绝：目标为 `guard_data`、`.guard-trash`、各 `kit` 目录，或上述路径的父级时，直接拒绝。

- **日志分隔符注入**（严重）
  `guard.log` 以 `' | '` 分隔 5 列，但 `reason` 只过滤了 `\t\r\n`，未过滤 `|`。
  实测传 `reason = "reason | L1 | fake | OK"` 可伪造日志级别与结果列。
  现对 `target` / `reason` / `tr`（restore 入参）及 `guard-log.sh` 的全部字段增加 `|` 拒绝。

- **列表类工具缺少上界**
  `guard_list` 的 `limit` 与 `guard_audit` 的 `max_per_dir` 只有下界没有上界，
  传超大值会返回全量并可能撑爆上下文。现分别限制为 500 / 200，并在返回体中回显 `limit_clamped`。

- **`guard_purge` 参数描述有误导**
  原描述为"删除入回收站超过 N 天的条目"，未说明是必填项，模型可能不传 `older_than`。
  现标注为「必填项之一，必须与 `all=true` 二选一，两项都不给会被拒绝」。

### 新增

- **目录级操作需显式确认**
  `guard_trash` 目标是目录时，默认拒绝并要求 `confirm_dir=true`，同时返回目录规模预览
  （文件数 / 体积）。原因是目录会整棵树一次性移入回收站（同卷为原子 rename），
  一次确认的破坏面远大于单文件。

- 自测新增 T18 / T19 / T20，共 13 项断言：
  - T18：6 个脚本名逐一验证 + 回收站结构识别（7 项）
  - T19：reason / path / guard-log 字段的 `|` 注入拒绝（3 项）
  - T20：目录存在性、文件计数、目录整体移动（3 项）
- 自测总数 60 → **73**。

### 验证

- 包内脚本实测：`PASS=73 FAIL=0`
- 包大小 36,225 B
- sha256 `283fb02309f7a4083ef3c6befad85072b1c83a00d3d5725bcdcf4d84aa88833e`

---

## [1.2.1] - 2026-11-19

安全修复：`guard_purge` 在未显式指定清理范围时会退化为全量清理。此项为应用市场审核打回项。

### 修复

- **`guard_purge` 范围缺失即全删**：原实现 `let days = 0` 作为默认值，仅当传入 `older_than` 时才覆盖；
  因而在「不传任何参数」「只传 confirm」「`all=false`」「`older_than=""`」等情况下，
  `days` 始终为 `0`，`ageDays >= 0` 恒成立，**一次确认即可永久清空两处回收站的全部记录**，
  且预览中显示为 `older_than=0d` 看起来像是合理的显式条件。
- 现改为：范围必须显式提供，缺失或无效一律拒绝执行并返回 `rejected_reason`，不再推断默认值。
  - 无 `all` 且无 `older_than` → `missing_scope`
  - `older_than` 非纯十进制非负整数（含空串、空白、`abc`、`-5`）→ `invalid_older_than`
  - `all=true` 与 `older_than` 同时给出 → `both_all_and_older_than`（互斥）
  - `all=false` 且无 `older_than` → `all_false_without_older_than`
- 预览与执行结果统一新增 `scope` 字段，明确回显本次清理范围（`all` 或 `older_than=<n>d`）；
  审计日志 `purge.log` 的 `cond=` 字段同样改用该范围文本。

### 新增

- 自测用例 **T17 guard_purge 范围校验**（10 项断言，纯 shell 实现，不依赖 node，真机可跑）。
  覆盖上述全部拒绝分支、显式 `0` 与 `7` 的接受、`all` 与 `older_than` 互斥，
  并额外断言「任何无范围输入都不得产出可执行 scope」。
- 自测总数 50 → **60**。

---

## [1.2.0] - 2026-11-18

并发与审计正确性修复。本版本重点解决「工具报告成功、实际未生效」与「并发写账本丢行」两类隐性问题。

### 新增

- `guard_repair`：批量标记「账本有记录、实物已不存在」的历史残留，使其不再出现在清单里。默认只预览，需 `confirm=true` 才执行，不删任何实物。
- `guard_selftest`：运行内嵌自测，共 50 项用例，涵盖 init / trash / restore / backup / 拒绝用例 / 路径归一化 / 并发锁 / PURGED 标记。沙箱模式，不碰真实回收站。

### 修复

- **账本并发丢行**：原先 JS 侧用 `mv` 替换账本，会改变 inode，导致 shell 侧 `>>` 追加的内容丢失。改为 `cat >` 就地写，并让 JS 与 shell 共用 `mkdir` 锁。实测双写者各 15 行并发，一行不丢。
- **`guard_purge` 完整性**：真删后未回写账本，导致「工具报告删了 1 条，账本原封不动」。现将对应行就地改为 `PURGED|原因`，行数不变。
- **路径归一化**：写入账本时统一 `/storage/emulated/0` → `/sdcard`、`/data/data` → `/data/user/0`，读取端双侧兼容。避免同一文件以两种拼写存在。
- **工具链永不更新**：`kitPresent()` 早期只检查 `guard-trash.sh` 是否存在，存在就跳过重装，导致新增或更新的脚本永远不会被释放到 `guard_data/kit`。现改为校验全部内嵌脚本存在且可执行。
- **TOCTOU**：`realpathUnder` 合并为单次 shell 调用，消除「检查时存在、使用时不存在」的窗口。

### 变更

- 工具数 13 → 15。
- **manifest 新增 `min_supported_app_version: 1.12.2`**：应用市场发布强制要求该字段，格式须为 `x.y.z`。子包机制与工具注册已在 1.12.2 实测验证，故以此为最低支持版本。
- `guard-selftest.sh` 纳入 bundle，与其他脚本一起随 `guard_setup` 部署。
- 路径归一化禁止使用 `readlink -f`：它会把 `/data/user/0` 改写为 `/data/data`，反而造成不一致。仅用纯字符串替换。

---

## [1.1.0] - 2026-09-21

- 统一命名：系统层 / 用户层回收站。
- 修正路径分层判定的边界问题。
- 文档剥离环境特定信息。

---

## [1.0.0] - 2026-09-20

首个发布版。

- 双回收站（系统层 `/data` 卷 + 用户层 `/sdcard` 卷），按同卷就近原则分布。
- 删除→回收站，修改前备份，覆盖还原幂等。
- 环境自检、操作日志、落盘判据、违规审计。
- 工具 13 个：`guard_setup` / `guard_status` / `guard_init` / `guard_trash` / `guard_backup` / `guard_restore` / `guard_log` / `guard_list` / `guard_tier` / `guard_locate` / `guard_audit` / `guard_config` / `guard_purge`。
