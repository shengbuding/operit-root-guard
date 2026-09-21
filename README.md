# Operit Root Guard（Root 安全护栏）

> 为 Operit + KernelSU 设计的 root 操作安全护栏插件：**删除必进回收站、修改必先备份、处处可还原、全程有日志**。
> 防止 AI 幻觉误操作 / 误删文件 / 不可逆破坏。

English | 中文

---

## 这是什么

当你给 Operit（或任何 AI 助手）授予 root 权限后，最大的担心是：**AI 判断失误造成不可逆破坏**。

本插件提供一套「机械护栏」：

- 🔒 **删除→回收站**：永不裸删（rm），一切删除进回收站，30 天内可还原
- 💾 **修改前备份**：改任何文件前自动备份副本（覆盖还原幂等）
- 🔍 **环境自检**：一键检查 root 通道/权能/数据通道/回收站状态
- 📋 **操作日志**：每次操作留痕（时间/命令/理由/结果）

## 安装（3 步）

1. 下载 [root_guard.js](https://github.com/shengbuding/operit-root-guard/releases)：
   - 或从本仓库 packages/root_guard.js 获取
2. 复制到你的设备：
   Android/data/com.ai.assistance.operit/files/packages/
3. 打开 Operit → 启用「Root 安全护栏」→ 对 AI 说：
   > 调用 root_guard 的 guard_setup 和 guard_status

## 工具清单

| 工具 | 作用 |
|---|---|
| guard_setup | 首次安装：释放内嵌脚本到 /data/local/tmp/guard-kit/ |
| guard_status | 环境自检（root/权能/数据通道/回收站） |
| guard_init | 初始化双回收站（幂等） |
| guard_trash | 删除→回收站（代替裸 rm，必须填原因） |
| guard_backup | 修改前备份（副本进 backups/） |
| guard_restore | 还原（trash 移动还原 / backups 覆盖还原） |
| guard_log | 写操作日志 |

## 配合 KSU 模板（推荐）

仓库内附 operit.daily.json：KSU 最小权能模板（无 SYS_ADMIN/SYS_BOOT）。
导入 KSU 管理器并绑定给 Operit，把"不能改系统"变成机械约束。

## 兼容性

- Operit（com.ai.assistance.operit）
- KernelSU 设备（Android 10+）
- 脚本 POSIX sh 编写，兼容 toybox/mksh/bash
- 数据通道自动探测 /data_mirror（部分设备需降级适配）

## 设计理念（三层防线）

1. **硬约束**（KSU 模板）：错了也物理做不到
2. **流程约束**（本插件）：错了也随手能恢复
3. **验证**（自检+演练）：体系真实可用

---

## English

**Operit Root Guard** — safety toolkit for AI-driven root operations.

- Trash-first deletions (no bare rm)
- Pre-modify backups with idempotent restore
- Environment self-check & audit logs
- Works with Operit + KernelSU

Install: copy root_guard.js to Android/data/com.ai.assistance.operit/files/packages/, enable in Operit, run guard_setup.

## License

MIT
