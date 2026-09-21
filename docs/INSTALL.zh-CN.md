# Root 安全护栏插件（root_guard）— 安装与使用说明

> 适用：Operit + KernelSU 设备。目标：让 AI 的 root 操作「可回滚、可审计、防误删」。

## 一、文件清单
- `root_guard.js` — 插件本体（单文件，即全部内容）
- `operit.daily.json` — KSU 最小权能模板（参考用）
- 本说明

## 二、安装（3 步）
1. 把 `root_guard.js` 复制到：
   `Android/data/com.ai.assistance.operit/files/packages/`
   （用电脑文件管理器或手机上的文件管理器均可）
2. 打开 Operit → 工具箱/包管理 → 找到「Root 安全护栏」→ 启用
3. 对 AI 说："调用 root_guard 的 guard_setup 和 guard_status"（首次安装脚本 + 环境自检）

## 三、KSU 模板（可选但强烈建议）
1. KSU 管理器 → App Profile → 导入 `operit.daily.json`
2. 绑定给 Operit
3. 模板作用：只给最小权能（无 SYS_ADMIN/SYS_BOOT），把"不能改系统"变成机械约束

## 四、使用示例（对 AI 说）
- "用 guard_backup 备份 /data/xxx/save.dat，原因：改档前保险"
- "用 guard_trash 删除 /sdcard/xxx.tmp，原因：清理"
- "用 guard_status 看一下护栏状态"

## 五、重要提醒
- 首次使用先跑 guard_setup（释放脚本到 /data/local/tmp/guard-kit/）
- 删除永远走回收站（trash/），30 天内可还原
- 修改前备份（backups/），覆盖还原幂等
- 若某设备无 /data_mirror 通道，guard_status 会提示降级

## 六、环境适配说明
- 脚本为 POSIX sh，兼容 Android toybox/mksh 与 Ubuntu bash
- 数据通道自动探测：/data_mirror/data_ce/null/0（有则优先）
- 回收站：主站 /data/local/tmp/operit-trash/，副站 /sdcard/Download/Operit/.guard-trash/
