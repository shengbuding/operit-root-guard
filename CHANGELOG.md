# 变更日志

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

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
