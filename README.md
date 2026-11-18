# Operit Root Guard（Root 安全护栏）

> 为 Operit + KernelSU 设计的 root 操作护栏插件。
> 核心目标：**删除必进回收站、修改必先备份、处处可还原、全程有日志**。

---

## 这是什么

当 AI 助手获得 root 权限后，主要风险是判断失误造成不可逆破坏。本插件把「谨慎」变成**机械约束**，而不是依赖 AI 自觉：

| 能力 | 说明 |
|---|---|
| **删除→回收站** | 不裸删（`rm`），一切删除进回收站，可还原 |
| **修改前备份** | 改文件前先复制副本，覆盖还原幂等 |
| **环境自检** | 一键检查 root 通道、权能、数据通道、回收站状态 |
| **操作日志** | 每次操作留痕（时间 / 命令 / 理由 / 结果） |
| **落盘判据** | 写文件前查询合法位置，避免文件散落 |
| **违规审计** | 扫描禁止写入的目录，列出可疑文件 |

---

## 安装

> ⚠️ **安装后必须手动启用子包，否则 `guard_*` 工具不会出现。**
> 路径：包管理 → 点开「Root 安全护栏」详情 → 打开子包开关（描述为「15 个工具：...」）。
> Operit 不会按 manifest 自动打开该开关，这是平台现状。

### 步骤

1. 下载插件包 `root_guard-v1.2.0.toolpkg`（见 [Releases](https://github.com/shengbuding/operit-root-guard/releases/latest)，或仓库 `dist/` 目录）
2. 打开 Operit → 包管理 → **导入包** → 选择该文件
3. 导入后在包列表中**启用**「Root 安全护栏」
4. 对 AI 说：「调用 root_guard 的 guard_setup 和 guard_status」

### 注意

- **安装后必须手动打开子包开关**，否则工具不会出现。详见上方警示。
- 若导入时提示「包已存在」，需先在包管理中**卸载**旧版，再导入新版。
- `guard_setup` 会把内嵌脚本释放到应用私有目录，首次使用必须执行一次。

---

## 工具清单

| 工具 | 作用 |
|---|---|
| `guard_setup` | 安装/更新：释放内嵌脚本到 `guard_data/kit`。`force=true` 强制重装并做语法校验 |
| `guard_status` | 环境自检：root 通道、权能、数据通道、回收站状态与占用 |
| `guard_init` | 初始化双回收站（系统层 + 用户层），幂等 |
| `guard_trash` | 删除→回收站（代替裸 `rm`），必须填原因 |
| `guard_backup` | 修改前备份：副本进 `backups/`，原件不动 |
| `guard_restore` | 还原：`trash/` 为移动还原，`backups/` 为覆盖还原 |
| `guard_log` | 写一条操作日志 |
| `guard_list` | 列出回收站内容（读账本，倒序） |
| `guard_tier` | 判定任意路径属于哪一层：L1 / L2 / L3 |
| `guard_locate` | 落盘判据：给定用途返回合法落盘路径与分层 |
| `guard_audit` | 审计违规落盘：扫描禁止区，列出可疑产物 |
| `guard_config` | 读取/修改护栏配置（如回收站状态报告开关） |
| `guard_purge` | 清理回收站：`older_than` / `all`，默认只预览，需 `confirm=true` 才真删；删后就地标记账本 |
| `guard_repair` | 修复历史残留：账本有记录但实物已不存在的条目，批量标记为已清理。默认只预览，需 `confirm=true`，不删任何实物 |
| `guard_selftest` | 运行内嵌自测（沙箱模式，不碰真实回收站）：50 项用例，含归一化、并发锁、PURGED 标记 |

---

## 三层路径分层

插件用统一的 L1 / L2 / L3 词汇描述路径归属：

| 层级 | 含义 | 典型位置 | 卸载 App 时 |
|---|---|---|---|
| **L1 系统层** | 应用私有目录 | 应用数据目录内 | 自动清空 |
| **L2 用户层** | 用户可访问的约定目录 | 共享存储中的约定文件夹 | 保留 |
| **L3 禁写区** | 不应写入的位置 | 存储根、下载目录顶层、全局临时目录 | — |

### 落盘原则

**能放用户层的尽量放用户层**，L1 仅用于两种情况：

1. 文件数超过 5000 或体积超过 100 MB 的大件
2. 需要 App 进程直接读写的场景

这样做的原因是：用户层的文件在卸载后仍保留，便于迁移和检查；而 L1 会被卸载清空，只适合承接临时或超大内容。

---

## 双回收站

回收站按「**同卷就近**」原则设置，两个位置**没有主次之分**，只是服务于不同分区：

| 名称 | 位置 | 承接 |
|---|---|---|
| **系统层回收站** | 应用私有目录下的 `guard_data/` | `/data` 卷上的删除 |
| **用户层回收站** | 共享存储约定目录下的 `.guard-trash/` | `/sdcard` 卷上的删除 |

分成两处的原因是**保证 `mv` 同卷**：同卷移动是原子操作，瞬时完成；跨卷会退化为逐文件复制，大文件可能中断并留下半拷贝状态。无法同卷时脚本会拒绝操作。

> 系统层回收站所在目录同时存放脚本（`kit/`）和备份（`backups/`），不只是一个回收箱。

---

## 配合 KernelSU 模板

仓库提供 KSU 最小权能模板 `operit.daily.json`，导入并绑定给 Operit 后，可把「不能改系统」变成机械约束。

设计思路是三层防线：

1. **硬约束**（KSU 模板）：即使判断错了，也物理做不到
2. **流程约束**（本插件）：即使做错了，也随手能恢复
3. **验证**（自检与演练）：确认体系真实可用

---

## 兼容性

- Operit（`com.ai.assistance.operit`）
- KernelSU 设备（Android 10+）
- 脚本以 POSIX sh 编写，兼容 toybox / mksh / bash
- 数据通道自动探测 `/data_mirror`（部分设备需降级适配）

---

## 仓库结构

```
operit-root-guard/
├── dist/
│   ├── root_guard-v1.2.0.toolpkg   # 插件本体（推荐安装方式）
│   └── manifest.json.example          # manifest 参考
├── docs/
│   ├── INSTALL.zh-CN.md               # 安装与使用说明
│   ├── ROOT_SAFETY_PROTOCOL.md        # 完整协议（分层/禁写/演习）
│   └── operit.daily.json              # KSU 最小权能模板
├── packages/
│   └── root_guard.js                  # 单文件版（构建产物）
├── src/                               # 源码（构建入口）
│   ├── root_guard.template.js         # 模板，含 __BUNDLE_JSON__ 占位符
│   ├── manifest.json                  # 包描述
│   ├── main.js
│   ├── gen.js                         # shell → scripts.bundle.json
│   ├── assemble.js                    # 模板 + bundle → root_guard.js
│   ├── scripts/                       # 6 个 shell 脚本
│   └── resources/logo.svg
├── build.sh                           # 一键构建：./build.sh
├── CHANGELOG.md
└── LICENSE
```

**推荐用 `dist/` 里的 `.toolpkg`**：包含 manifest、内嵌脚本与图标，导入即可用。
`packages/root_guard.js` 是同一代码的单文件形式，供需要直接放到包目录的用户使用。

---

## 从源码构建

```bash
./build.sh           # 版本号取自 src/root_guard.template.js
./build.sh 1.2.1     # 或显式指定
```

构建流程：`src/scripts/*.sh` → `gen.js` 打包成 base64 bundle → `assemble.js` 注入模板 → 打 zip。
产物输出到 `packages/root_guard.js` 与 `dist/root_guard-v<ver>.toolpkg`。

构建可复现：相同源码两次构建 md5 一致（zip 时间戳已统一）。

---

## License

MIT
