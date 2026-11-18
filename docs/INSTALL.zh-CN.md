# 安装与使用说明

> 适用：Operit + KernelSU 设备
> 目标：让 AI 的 root 操作「可回滚、可审计、防误删」

---

## ⚠️ 请先读这段

**安装后必须手动启用子包，否则 `guard_*` 工具不会出现。**

Operit 导入包时**不会自动打开子包开关**，即使 manifest 里写了 `enabled_by_default: true`。这是 Operit 的现有行为。

操作路径：

```
包管理 → 点开「Root 安全护栏」详情 → 找到子包开关（描述为「15 个工具：setup / status / ...」）→ 打开
```

打开后如果工具列表仍未刷新，**重启 Operit**。

> 这个问题在多次安装中稳定复现，不是偶发故障。

---

## 一、文件清单

| 文件 | 用途 |
|---|---|
| `root_guard-v1.2.0.toolpkg` | 插件本体（ToolPkg 格式，必备） |
| `README.md` | 功能清单、三层路径分层、双回收站设计 |
| `INSTALL.zh-CN.md` | 本文件：安装与使用 |
| `ROOT_SAFETY_PROTOCOL.md` | 完整操作协议（权限自检、操作分级、禁写清单、应急流程） |
| `operit.daily.json` | KSU 最小权能模板（可选，建议导入） |
| `LICENSE` | MIT 许可证 |

---

## 一·a、三十秒快速上手

如果你只想先跑起来，三步：

1. 导入 `root_guard-v1.2.0.toolpkg`（包管理 → 导入包）
2. 打开子包开关（包管理 → 点开「Root 安全护栏」→ 子包开关）
3. 对 AI 说：「调用 guard_setup，然后 guard_selftest」

看到 `PASS=50 FAIL=0` 就说明安装成功、工具链完好。

---

## 二、安装步骤

### 1. 导入插件

打开 Operit → 包管理 → **导入包** → 选择 `root_guard-v1.2.0.toolpkg`。

### 2. 启用

导入后在包列表中启用「Root 安全护栏」，**并打开子包开关**（见本文开头的警示）。

> 若工具列表里没有出现 `guard_*` 工具，说明子包开关未打开。第 1 步的警示已说明操作路径。

### 3. 首次初始化

对 AI 说：

> 调用 root_guard 的 guard_setup，然后 guard_status

`guard_setup` 会把内嵌的 5 个脚本释放到应用私有目录并设置可执行位，同时做语法校验。`guard_status` 会返回当前环境状态，用于确认安装成功。

---

## 三、常见问题

### 导入时提示「包已存在」

Operit 不支持同名包覆盖导入。需先在包管理中**卸载**旧版，确认包列表里已消失，再导入新版。

### 卸载后回收站会丢失吗

会。系统层回收站位于应用私有目录，卸载 App 时会被一并清除。如果回收站里有需要保留的内容，请先还原或转移到用户层目录。

### 工具调用返回 `Tool not found`

说明包已安装但子包未启用。检查子包开关，或重启 Operit。

---

## 四、KSU 模板（可选但建议）

1. 打开 KernelSU 管理器 → App Profile → 导入 `operit.daily.json`
2. 绑定给 Operit
3. 模板作用是只授予最小必要权能，把「不能改系统」从承诺变成机械约束

---

## 五、使用示例

对 AI 说：

- 「用 guard_backup 备份 `/data/xxx/save.dat`，原因：改档前保险」
- 「用 guard_trash 删除 `/sdcard/xxx.tmp`，原因：清理临时文件」
- 「用 guard_status 看一下护栏状态」
- 「用 guard_list 看看回收站里有什么」
- 「用 guard_locate 查一下交付物该放哪」
- 「用 guard_repair 看看账本里有没有已删除但未标记的残留」
- 「用 guard_selftest 跑一遍自测」

---

## 六、重要提醒

- **首次使用先跑 `guard_setup`**，否则其他工具会因脚本缺失而失败
- 删除一律走回收站（`trash/`），可还原
- 修改前备份（`backups/`），覆盖还原幂等
- 若设备没有 `/data_mirror` 通道，`guard_status` 会提示降级
- 回收站**没有自动过期机制**，需要手动清理；建议定期检查 `guard_status` 的占用统计
- 清理用 `guard_purge`（删实物），账本补标记用 `guard_repair`（不动实物）
- 疑难排查时先跑 `guard_selftest`：全通过则说明工具链本身正常，问题在调用方式

---

## 七、环境适配说明

- 脚本为 POSIX sh，兼容 Android toybox / mksh 与 Linux bash
- 数据通道自动探测 `/data_mirror`（有则优先使用）
- 回收站分两处，按删除目标所在分区自动选择：
  - **系统层回收站**：应用私有目录（承接 `/data` 卷上的删除）
  - **用户层回收站**：共享存储约定目录（承接 `/sdcard` 卷上的删除）

两处没有主次之分，分开是为了保证移动操作同卷、原子完成。