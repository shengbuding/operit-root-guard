/* METADATA
{
    "name": "root_guard",
    "display_name": { "zh": "Root 安全护栏", "en": "Root Guard" },
    "description": {
        "zh": "Root 操作安全护栏（防误删/防幻觉）：回收站、修改前备份、还原、日志、环境自检。单文件可分享。首次使用先跑 guard_setup，再 guard_status 自检。",
        "en": "Safety toolkit for root operations against accidental deletions: trash, pre-modify backup, restore, logging, environment check."
    },
    "enabledByDefault": false,
    "category": "System",
    "tools": [
        {
            "name": "guard_setup",
            "description": { "zh": "首次安装/更新：释放内嵌 guard 脚本到 /data/local/tmp/guard-kit/ 并设权限。", "en": "Install/update: extract bundled guard scripts to /data/local/tmp/guard-kit/." },
            "parameters": []
        },
        {
            "name": "guard_status",
            "description": { "zh": "环境自检：root 通道、权能、数据通道（/data_mirror 或 /data/data）、回收站与脚本状态。", "en": "Environment self-check." },
            "parameters": []
        },
        {
            "name": "guard_init",
            "description": { "zh": "初始化回收站（主站 /data 卷 + 副站 sdcard 卷），幂等。", "en": "Initialize trash (idempotent)." },
            "parameters": []
        },
        {
            "name": "guard_trash",
            "description": { "zh": "删除→回收站（代替裸 rm）。单目标、绝对路径、必须填原因。", "en": "Move file to trash instead of rm." },
            "parameters": [
                { "name": "target", "description": { "zh": "目标绝对路径", "en": "Absolute path" }, "type": "string", "required": true },
                { "name": "reason", "description": { "zh": "删除原因", "en": "Reason" }, "type": "string", "required": true }
            ]
        },
        {
            "name": "guard_backup",
            "description": { "zh": "修改前备份：副本进回收站 backups/，原件不动。", "en": "Backup before modify." },
            "parameters": [
                { "name": "target", "description": { "zh": "目标绝对路径", "en": "Absolute path" }, "type": "string", "required": true },
                { "name": "reason", "description": { "zh": "备份原因", "en": "Reason" }, "type": "string", "required": true }
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
        }
    ]
}*/
const rootGuard = (function () {
    const KIT_DIR = "/data/local/tmp/guard-kit";
    const BUNDLE = {"guard-init.sh":"IyEvYmluL3NoCiMgZ3VhcmQtaW5pdC5zaCDigJQg5Yid5aeL5YyWIGd1YXJkIOWbnuaUtuerme+8iOS4u+ermT0vZGF0YSDljbfvvIzlia/nq5k9c2RjYXJkIOWNt++8iQojIOmFjeWllzogUk9PVF9TQUZFVFlfUFJPVE9DT0wubWQgwqc177yI5Zue5pS256uZ5py65Yi277yJCiMg54m55oCnOiDluYLnrYnvvIjph43lpI3miafooYzlronlhajvvInvvJstLWRyeS1ydW4g5Y+q5omT5Y2w6K6h5YiS44CCCiMg55So5rOVOiBndWFyZC1pbml0LnNoIFstLWRyeS1ydW5dCiMg6YCA5Ye656CBOiAwIOaIkOWKnzsgMSDlpLHotKU7IDIg55So5rOV6ZSZ6K+vCnNldCAtdQoKTUFJTl9ST09UPSIke0dVQVJEX1RSQVNIX0RBVEFfUk9PVDotL2RhdGEvbG9jYWwvdG1wL29wZXJpdC10cmFzaH0iClNEQ19ST09UPSIke0dVQVJEX1RSQVNIX1NEQ0FSRF9ST09UOi0vc2RjYXJkL0Rvd25sb2FkL09wZXJpdC8uZ3VhcmQtdHJhc2h9IgoKRFJZPTAKY2FzZSAiJHsxOi19IiBpbgogIC0tZHJ5LXJ1bikgRFJZPTEgOzsKICAiIikgOiA7OwogICopIGVjaG8gIueUqOazlTogZ3VhcmQtaW5pdC5zaCBbLS1kcnktcnVuXSIgPiYyOyBleGl0IDIgOzsKZXNhYwoKaWYgWyAiJHtHVUFSRF9UUkFTSF9EQVRBX1JPT1Q6LX0iICE9ICIiIF0gfHwgWyAiJHtHVUFSRF9UUkFTSF9TRENBUkRfUk9PVDotfSIgIT0gIiIgXTsgdGhlbgogIGVjaG8gIuazqOaEjzog546v5aKD5Y+Y6YePIG92ZXJyaWRlIOeUn+aViO+8iOa1i+ivleaooeW8j++8iSIKICBlY2hvICIgIERBVEE9JE1BSU5fUk9PVCIKICBlY2hvICIgIFNEQ0FSRD0kU0RDX1JPT1QiCmZpCgppbml0X3Jvb3QoKSB7CiAgUj0iJDEiOyBUQUc9IiQyIgogIGlmIFsgIiREUlkiID0gMSBdOyB0aGVuCiAgICBlY2hvICJbZHJ5LXJ1bl0g5bCG5Yid5aeL5YyWOiAkUiAoJFRBRykiCiAgICByZXR1cm4gMAogIGZpCiAgbWtkaXIgLXAgIiRSL3RyYXNoIiB8fCByZXR1cm4gMQogIG1rZGlyIC1wICIkUi9iYWNrdXBzIiB8fCByZXR1cm4gMQogIFsgLWYgIiRSL21hbmlmZXN0LmxvZyIgXSB8fCA6ID4gIiRSL21hbmlmZXN0LmxvZyIKICBbIC1mICIkUi9ndWFyZC5sb2ciIF0gfHwgOiA+ICIkUi9ndWFyZC5sb2ciCiAgaWYgWyAhIC1mICIkUi9SRUFETUUubWQiIF07IHRoZW4KICAgIGNhdCA+ICIkUi9SRUFETUUubWQiIDw8J0VPRicKIyBndWFyZCDlm57mlLbnq5kKLSBtYW5pZmVzdC5sb2c6IFRTViDorrDlvZXvvIjml7bpl7QgLyDljp/ot6/lvoQgLyDlm57mlLbot6/lvoQgLyDljp/lm6AgLyDmk43kvZzogIXvvIkKLSB0cmFzaC86IOWunumZheWtmOaUvu+8iDzml7bpl7TmiLM+Xzzmlofku7blkI0+77yJ4oCU4oCU5Yig6Zmk5pe255qE5Y675aSECi0gYmFja3Vwcy86IOWkh+S7veWtmOaUvu+8iDzml7bpl7TmiLM+Xzzmlofku7blkI0+77yJ4oCU4oCU5L+u5pS55YmN5aSH5Lu955qE5Y675aSECi0gZ3VhcmQubG9nOiDmk43kvZzml6Xlv5cKLSDov5jljp86IGd1YXJkLXJlc3RvcmUuc2ggPHRyYXNoIOaIliBiYWNrdXBzIOWGhei3r+W+hD4KLSDkv53nlZnmnJ8gPj0zMCDlpKnvvJvmuIXnkIbpnIDnlKjmiLfmibnlh4bvvIhMMu+8iQpFT0YKICBmaQogIGVjaG8gIuW3suWwsee7qjogJFIgKCRUQUcpIgogIHJldHVybiAwCn0KCmluaXRfcm9vdCAiJE1BSU5fUk9PVCIgIuS4u+ermSAvZGF0YSDljbciIHx8IHsgZWNobyAi5aSx6LSlOiAkTUFJTl9ST09UIiA+JjI7IGV4aXQgMTsgfQppbml0X3Jvb3QgIiRTRENfUk9PVCIgIuWJr+ermSBzZGNhcmQg5Y23IiB8fCB7IGVjaG8gIuWksei0pTogJFNEQ19ST09UIiA+JjI7IGV4aXQgMTsgfQoKaWYgWyAiJERSWSIgPSAwIF0gJiYgWyAtZCAiJFNEQ19ST09UIiBdOyB0aGVuCiAgOiA+ICIkU0RDX1JPT1QvLm5vbWVkaWEiCmZpCgplY2hvICLlrozmiJAiCmV4aXQgMA==","guard-trash.sh":"IyEvYmluL3NoCiMgZ3VhcmQtdHJhc2guc2gg4oCUIOWIoOmZpOKGkuWbnuaUtuerme+8iOS7o+abv+ijuCBybe+8iQojIOmFjeWllzogUk9PVF9TQUZFVFlfUFJPVE9DT0wubWQgwqc177yI5Zue5pS256uZ5py65Yi277yJCiMg6K6+6K6h57qm5p2fOiDljZXnm67moIfjgIHlkIzljbfjgIHnu53lr7not6/lvoTvvJvmi5Lnu53nqbrlj4LmlbAv6YCa6YWN56ymL+i3r+W+hOepv+i2ii/npoHlhpnmuIXljZUv5LiN5a2Y5Zyo77ybCiMgICAgICAgICAgIOW8uuWItuiusOW9lSBtYW5pZmVzdCArIGd1YXJkLmxvZ++8m+i3qOWNty/ml6Dms5XlkIzljbfml7bmi5Lnu53jgIIKIyDnlKjms5U6IGd1YXJkLXRyYXNoLnNoIDx0YXJnZXRfcGF0aD4gPHJlYXNvbj4KIyDpgIDlh7rnoIE6IDAg5oiQ5Yqf5YWl5Zue5pS256uZOyAyIOeUqOazlemUmeivrzsgMyDlronlhajmi5Lnu507IDQg56e75Yqo5aSx6LSlCnNldCAtdQoKTUFJTl9ST09UPSIke0dVQVJEX1RSQVNIX0RBVEFfUk9PVDotL2RhdGEvbG9jYWwvdG1wL29wZXJpdC10cmFzaH0iClNEQ19ST09UPSIke0dVQVJEX1RSQVNIX1NEQ0FSRF9ST09UOi0vc2RjYXJkL0Rvd25sb2FkL09wZXJpdC8uZ3VhcmQtdHJhc2h9IgoKdXNhZ2UoKSB7IGVjaG8gIueUqOazlTogZ3VhcmQtdHJhc2guc2ggPHRhcmdldF9wYXRoPiA8cmVhc29uPiIgPiYyOyB9CgppZiBbICQjIC1uZSAyIF07IHRoZW4gdXNhZ2U7IGV4aXQgMjsgZmkKVEFSR0VUPSIkMSI7IFJFQVNPTj0iJDIiClsgLW4gIiRUQVJHRVQiIF0gfHwgeyBlY2hvICLmi5Lnu506IOepuuebruagh+i3r+W+hCIgPiYyOyBleGl0IDM7IH0KWyAtbiAiJFJFQVNPTiIgXSB8fCB7IGVjaG8gIuaLkue7nTog6ZyA6KaB5aGr5YaZ5Y6f5ZugIiA+JjI7IGV4aXQgMzsgfQppZiBbICIkUkVBU09OIiAhPSAiJChwcmludGYgJyVzJyAiJFJFQVNPTiIgfCB0ciAtZCAnXHRcclxuJykiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOWOn+WboOWQq+aOp+WItuWtl+espiIgPiYyOyBleGl0IDMKZmkKCiMg6KeE6IyD5YyWOiDljrvlsL7pg6jmlpzmnaDvvIjkv53nlZnmoLkgL++8iQp3aGlsZSBbICIkVEFSR0VUIiAhPSAiLyIgXSAmJiBbICIke1RBUkdFVCUvfSIgIT0gIiRUQVJHRVQiIF07IGRvIFRBUkdFVD0iJHtUQVJHRVQlL30iOyBkb25lCgojIOe7neWvuei3r+W+hApjYXNlICIkVEFSR0VUIiBpbgogIC8qKSA6IDs7CiAgKikgZWNobyAi5ouS57udOiDku4XmjqXlj5fnu53lr7not6/lvoQ6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg5o6n5Yi25a2X56ym77yI6Ziy5pel5b+X5rOo5YWlL+ihjOegtOWdj++8iQppZiBbICIkVEFSR0VUIiAhPSAiJChwcmludGYgJyVzJyAiJFRBUkdFVCIgfCB0ciAtZCAnXHRcclxuJykiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOi3r+W+hOWQq+aOp+WItuWtl+espiIgPiYyOyBleGl0IDMKZmkKCiMg6YCa6YWN56ym77yI5pyq5bGV5byA77yJCmNhc2UgIiRUQVJHRVQiIGluCiAgKicqJyp8Kic/Jyp8KidbJyp8KiddJyopIGVjaG8gIuaLkue7nTog6Lev5b6E5ZCr6YCa6YWN56ymOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIOi3r+W+hOepv+i2igpjYXNlICIkVEFSR0VUIiBpbgogICouLiopIGVjaG8gIuaLkue7nTog6Lev5b6E5ZCrICcuLic6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg5qC5L+aMgui9veeCuQpjYXNlICIkVEFSR0VUIiBpbgogIC98L2RhdGF8L3NkY2FyZHwvc3RvcmFnZXwvc3RvcmFnZS9lbXVsYXRlZHwvc3RvcmFnZS9lbXVsYXRlZC8wKQogICAgZWNobyAi5ouS57udOiDmoLkv5oyC6L2954K5OiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIOemgeWGmea4heWNle+8iOWNj+iuriDCpzTvvIkrIOeOr+Wig+iHqui6q+S/neaKpO+8iFVidW50dSDns7vnu5/nm67lvZXvvIkKY2FzZSAiJFRBUkdFVCIgaW4KICAvc3lzdGVtfC9zeXN0ZW0vKnwvdmVuZG9yfC92ZW5kb3IvKnwvcHJvZHVjdHwvcHJvZHVjdC8qfC9zeXN0ZW1fZXh0fC9zeXN0ZW1fZXh0Lyp8XAogIC9ib290fC9ib290Lyp8L2luaXRfYm9vdHwvaW5pdF9ib290Lyp8L3ZibWV0YXwvdmJtZXRhLyp8XAogIC9wZXJzaXN0fC9wZXJzaXN0Lyp8L2Vmc3wvZWZzLyp8L21ldGFkYXRhfC9tZXRhZGF0YS8qfC9maXJtd2FyZXwvZmlybXdhcmUvKnxcCiAgL21vZGVtc3QqfC9mc2d8L2ZzZy8qfC9mc2N8L2ZzYy8qfFwKICAvZGF0YS9zeXN0ZW18L2RhdGEvc3lzdGVtLyp8L2RhdGEvbWlzY3wvZGF0YS9taXNjLyp8L2RhdGEvYWRifC9kYXRhL2FkYi8qfFwKICAvZGF0YS92ZW5kb3J8L2RhdGEvdmVuZG9yLyp8L2RhdGEvYXBleHwvZGF0YS9hcGV4Lyp8L2RldnwvZGV2Lyp8XAogIC91c3J8L3Vzci8qfC9iaW58L2Jpbi8qfC9zYmlufC9zYmluLyp8L2xpYnwvbGliLyp8L2xpYjY0fC9saWI2NC8qfFwKICAvZXRjfC9ldGMvKnwvdmFyfC92YXIvKnwvcm9vdHwvcm9vdC8qfC9vcHR8L29wdC8qfC9zcnZ8L3Nydi8qKQogICAgZWNobyAi5ouS57udOiDnpoHlhpnmuIXljZUv546v5aKD6Lev5b6EOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIGd1YXJkIOW3peWFt+mTvuiHqui6q+S/neaKpAppZiBbIC1kICIkVEFSR0VUIiBdICYmIFsgLWYgIiRUQVJHRVQvZ3VhcmQtdHJhc2guc2giIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOebruagh+ebruW9leWQqyBndWFyZCDlt6Xlhbfpk77vvIzlj5fkv53miqQ6ICRUQVJHRVQiID4mMjsgZXhpdCAzCmZpCgojIOWtmOWcqOaApwppZiBbICEgLWUgIiRUQVJHRVQiIF0gJiYgWyAhIC1MICIkVEFSR0VUIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDnm67moIfkuI3lrZjlnKg6ICRUQVJHRVQiID4mMjsgZXhpdCAzCmZpCgojIOWNt+WIpOWumu+8iOWQjOWNt+WOn+WIme+8my9kYXRhX21pcnJvciDkuLogL2RhdGEg6K6+5aSH55qE6ZWc5YOP6YCa6YGT77yM6KeG5ZCMIC9kYXRhIOWNt++8iQpjYXNlICIkVEFSR0VUIiBpbgogIC9kYXRhLyp8L2RhdGFfbWlycm9yLyopIFJPT1Q9IiRNQUlOX1JPT1QiIDs7CiAgL3NkY2FyZC8qfC9zdG9yYWdlL2VtdWxhdGVkLyopIFJPT1Q9IiRTRENfUk9PVCIgOzsKICAqKSBlY2hvICLmi5Lnu506IOaXoOazleehruWumuWQjOWNt+WbnuaUtuerme+8iOS7heaUr+aMgSAvZGF0YSDkuI4gL3NkY2FyZCDljbfvvIk6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMgb3ZlcnJpZGUg5oOF5b2i5o+Q56S6CmlmIFsgIiRST09UIiAhPSAiL2RhdGEvbG9jYWwvdG1wL29wZXJpdC10cmFzaCIgXSAmJiBbICIkUk9PVCIgIT0gIi9zZGNhcmQvRG93bmxvYWQvT3Blcml0Ly5ndWFyZC10cmFzaCIgXTsgdGhlbgogIGVjaG8gIuazqOaEjzog5Zue5pS256uZ5qC55Li66Z2e5bi46KeE6Lev5b6E77yIb3ZlcnJpZGUg55Sf5pWI77yJOiAkUk9PVCIgPiYyCmZpCgojIOWbnuaUtuermeiHqui6qy/niLbnuqfkv53miqQKaWYgWyAiJFRBUkdFVCIgPSAiJFJPT1QiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOebruagh+aYr+WbnuaUtuermeiHqui6qzogJFRBUkdFVCIgPiYyOyBleGl0IDMKZmkKY2FzZSAiJFJPT1QiIGluCiAgIiRUQVJHRVQiLyopIGVjaG8gIuaLkue7nTog55uu5qCH5piv5Zue5pS256uZ54i257qnOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIOWbnuaUtuermeWwsee7quajgOafpQppZiBbICEgLWQgIiRST09UL3RyYXNoIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDlm57mlLbnq5nmnKrlsLHnu6o6ICRST09U77yI5YWI6L+Q6KGMIGd1YXJkLWluaXQuc2jvvIkiID4mMjsgZXhpdCAzCmZpCgpTQ1JJUFRfRElSPSIkKGNkICIkKGRpcm5hbWUgIiQwIikiICYmIHB3ZCkiCmxvZ19ldmVudCgpIHsKICBpZiBbIC14ICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giIF07IHRoZW4KICAgICIkU0NSSVBUX0RJUi9ndWFyZC1sb2cuc2giICIkUk9PVC9ndWFyZC5sb2ciICIkMSIgIiQyIiAiJDMiICIkNCIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogIGVsc2UKICAgIHByaW50ZiAnJXMgfCAlcyB8ICVzIHwgJXMgfCAlc1xuJyAiJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicpIiAiJDEiICIkMiIgIiQzIiAiJDQiID4+ICIkUk9PVC9ndWFyZC5sb2ciIHx8IGVjaG8gIuitpuWRijog5pel5b+X5YaZ5YWl5aSx6LSlIiA+JjIKICBmaQp9CgpUUz0iJChkYXRlICcrJVklbSVkXyVIJU0lUycpIgpCQVNFPSIkKGJhc2VuYW1lICIkVEFSR0VUIikiCkRFU1Q9IiRST09UL3RyYXNoLyR7VFN9XyR7QkFTRX0iCmlmIFsgLWUgIiRERVNUIiBdIHx8IFsgLUwgIiRERVNUIiBdOyB0aGVuIERFU1Q9IiR7REVTVH1fJCQiOyBmaQoKaWYgbXYgIiRUQVJHRVQiICIkREVTVCIgMj4vZGV2L251bGw7IHRoZW4KICBPUD0iJChpZCAtdW4gMj4vZGV2L251bGwgfHwgZWNobyB1bmtub3duKSIKICBNVFM9IiQoZGF0ZSAnKyVZLSVtLSVkVCVIOiVNOiVTJXonIDI+L2Rldi9udWxsIHx8IGRhdGUpIgogIHByaW50ZiAnJXNcdCVzXHQlc1x0JXNcdCVzXG4nICIkTVRTIiAiJFRBUkdFVCIgIiRERVNUIiAiJFJFQVNPTiIgIiRPUCIgPj4gIiRST09UL21hbmlmZXN0LmxvZyIgfHwgZWNobyAi6K2m5ZGKOiBtYW5pZmVzdCDlhpnlhaXlpLHotKUiID4mMgogIGxvZ19ldmVudCAiTDIiICJtdiAkVEFSR0VUIC0+ICRERVNUIiAiJFJFQVNPTiIgIk9LIgogIGVjaG8gIuW3suWFpeWbnuaUtuermTogJERFU1QiCiAgZWNobyAi6L+Y5Y6f5ZG95LukOiBndWFyZC1yZXN0b3JlLnNoICckREVTVCciCiAgZXhpdCAwCmVsc2UKICBsb2dfZXZlbnQgIkwyIiAibXYgJFRBUkdFVCAtPiAkREVTVCIgIiRSRUFTT04iICJGQUlMIgogIGVjaG8gIumUmeivrzog56e75Yqo5aSx6LSlOiAkVEFSR0VUIiA+JjIKICBleGl0IDQKZmk=","guard-restore.sh":"IyEvYmluL3NoCiMgZ3VhcmQtcmVzdG9yZS5zaCDigJQg5LuO5Zue5pS256uZ6L+Y5Y6f5paH5Lu2CiMg6YWN5aWXOiBST09UX1NBRkVUWV9QUk9UT0NPTC5tZCDCpzXvvIjlm57mlLbnq5nmnLrliLbvvIkKIyDop4TliJk6IOS7heaOpeWPl+WbnuaUtuermSB0cmFzaC8g5YaF6Lev5b6E77yb5oyJIG1hbmlmZXN0IOWMuemFjeWOn+i3r+W+hO+8mwojICAgICAgIOWOn+i3r+W+hOW3suWtmOWcqC/ljp/nm67lvZXkuI3lrZjlnKjml7bmi5Lnu53vvJttdiDov5jljp/vvIjlkIzljbfkv53lsZ7mgKfvvInjgIIKIyDnlKjms5U6IGd1YXJkLXJlc3RvcmUuc2ggPHRyYXNoZWRfcGF0aD4KIyDpgIDlh7rnoIE6IDAg5bey6L+Y5Y6fOyAyIOeUqOazlemUmeivrzsgMyDlronlhajmi5Lnu50v5qCh6aqM5aSx6LSlOyA0IOenu+WKqOWksei0pQpzZXQgLXUKCk1BSU5fUk9PVD0iJHtHVUFSRF9UUkFTSF9EQVRBX1JPT1Q6LS9kYXRhL2xvY2FsL3RtcC9vcGVyaXQtdHJhc2h9IgpTRENfUk9PVD0iJHtHVUFSRF9UUkFTSF9TRENBUkRfUk9PVDotL3NkY2FyZC9Eb3dubG9hZC9PcGVyaXQvLmd1YXJkLXRyYXNofSIKCmlmIFsgJCMgLW5lIDEgXTsgdGhlbiBlY2hvICLnlKjms5U6IGd1YXJkLXJlc3RvcmUuc2ggPHRyYXNoZWRfcGF0aD4iID4mMjsgZXhpdCAyOyBmaQpUPSIkMSIKWyAtbiAiJFQiIF0gfHwgeyBlY2hvICLmi5Lnu506IOepuuWPguaVsCIgPiYyOyBleGl0IDM7IH0KY2FzZSAiJFQiIGluCiAgLyopIDogOzsKICAqKSBlY2hvICLmi5Lnu506IOmcgOimgee7neWvuei3r+W+hDogJFQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCmlmIFsgIiRUIiAhPSAiJChwcmludGYgJyVzJyAiJFQiIHwgdHIgLWQgJ1x0XHJcbicpIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDot6/lvoTlkKvmjqfliLblrZfnrKYiID4mMjsgZXhpdCAzCmZpCgpjYXNlICIkVCIgaW4KICAiJE1BSU5fUk9PVCIvdHJhc2gvKikgUk9PVD0iJE1BSU5fUk9PVCIgOzsKICAiJFNEQ19ST09UIi90cmFzaC8qKSBST09UPSIkU0RDX1JPT1QiIDs7CiAgIiRNQUlOX1JPT1QiL2JhY2t1cHMvKikgUk9PVD0iJE1BSU5fUk9PVCIgOzsKICAiJFNEQ19ST09UIi9iYWNrdXBzLyopIFJPT1Q9IiRTRENfUk9PVCIgOzsKICAqKSBlY2hvICLmi5Lnu506IOS4jeWcqOWbnuaUtuermSB0cmFzaC8g5oiWIGJhY2t1cHMvIOWGhTogJFQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCmlmIFsgISAtZSAiJFQiIF0gJiYgWyAhIC1MICIkVCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Zue5pS25paH5Lu25LiN5a2Y5ZyoOiAkVCIgPiYyOyBleGl0IDMKZmkKClsgLWYgIiRST09UL21hbmlmZXN0LmxvZyIgXSB8fCB7IGVjaG8gIuaLkue7nTogbWFuaWZlc3Qg5LiN5a2Y5ZyoIiA+JjI7IGV4aXQgMzsgfQoKT1JJRz0iJChhd2sgLUYgJ1x0JyAtdiB0PSIkVCIgJyQzPT10IHtvPSQyfSBFTkR7cHJpbnQgb30nICIkUk9PVC9tYW5pZmVzdC5sb2ciKSIKaWYgWyAteiAiJE9SSUciIF07IHRoZW4KICBlY2hvICLmi5Lnu506IG1hbmlmZXN0IOS4reaXoOatpOiusOW9lTogJFQiID4mMjsgZXhpdCAzCmZpCgpjYXNlICIkVCIgaW4KICAiJFJPT1QiL2JhY2t1cHMvKikKICAgICMg5aSH5Lu95byP6L+Y5Y6f77yaY3AgLXAg6KaG55uW5Y6f5paH5Lu277yI6KaB5rGC5Y6f55uu5b2V5Zyo5L2N77yb6YeN5aSN6L+Y5Y6f5YWB6K644oCU4oCU5bmC562J6KaG55uW77yJCiAgICBQRElSPSIkKGRpcm5hbWUgIiRPUklHIikiCiAgICBpZiBbICEgLWQgIiRQRElSIiBdOyB0aGVuCiAgICAgIGVjaG8gIuaLkue7nTog5Y6f55uu5b2V5LiN5a2Y5ZyoOiAkUERJUiIgPiYyOyBleGl0IDMKICAgIGZpCiAgICBTRD0iJChjZCAiJChkaXJuYW1lICIkMCIpIiAmJiBwd2QpIgogICAgaWYgY3AgLXAgIiRUIiAiJE9SSUciIDI+L2Rldi9udWxsOyB0aGVuCiAgICAgIE9QPSIkKGlkIC11biAyPi9kZXYvbnVsbCB8fCBlY2hvIHVua25vd24pIgogICAgICBNVFM9IiQoZGF0ZSAnKyVZLSVtLSVkVCVIOiVNOiVTJXonIDI+L2Rldi9udWxsIHx8IGRhdGUpIgogICAgICBwcmludGYgJyVzXHQlc1x0JXNcdCVzXHQlc1xuJyAiJE1UUyIgIiRPUklHIiAiJFQiICJSRVNUT1JFRC1GUk9NLUJBQ0tVUCIgIiRPUCIgPj4gIiRST09UL21hbmlmZXN0LmxvZyIgfHwgZWNobyAi6K2m5ZGKOiBtYW5pZmVzdCDlhpnlhaXlpLHotKUiID4mMgogICAgICBpZiBbIC14ICIkU0QvZ3VhcmQtbG9nLnNoIiBdOyB0aGVuCiAgICAgICAgIiRTRC9ndWFyZC1sb2cuc2giICIkUk9PVC9ndWFyZC5sb2ciICJSRVNUT1JFIiAiY3AgJFQgLT4gJE9SSUciICLlpIfku73ov5jljp8o6KaG55uWKSIgIk9LIiB8fCBlY2hvICLorablkYo6IOaXpeW/l+WGmeWFpeWksei0pSIgPiYyCiAgICAgIGVsc2UKICAgICAgICBwcmludGYgJyVzIHwgJXMgfCAlcyB8ICVzIHwgJXNcbicgIiQoZGF0ZSAnKyVZLSVtLSVkVCVIOiVNOiVTJXonKSIgIlJFU1RPUkUiICJjcCAkVCAtPiAkT1JJRyIgIuWkh+S7vei/mOWOnyjopobnm5YpIiAiT0siID4+ICIkUk9PVC9ndWFyZC5sb2ciIHx8IHRydWUKICAgICAgZmkKICAgICAgZWNobyAi5bey5LuO5aSH5Lu96KaG55uW6L+Y5Y6fOiAkT1JJRyIKICAgICAgZXhpdCAwCiAgICBlbHNlCiAgICAgIGVjaG8gIumUmeivrzog5aSH5Lu96L+Y5Y6f5aSx6LSlOiAkVCIgPiYyOyBleGl0IDQKICAgIGZpCiAgICA7Owplc2FjCgppZiBbIC1lICIkT1JJRyIgXSB8fCBbIC1MICIkT1JJRyIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Y6f6Lev5b6E5bey5a2Y5ZyoOiAkT1JJRyIgPiYyOyBleGl0IDMKZmkKClBESVI9IiQoZGlybmFtZSAiJE9SSUciKSIKaWYgWyAhIC1kICIkUERJUiIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog5Y6f55uu5b2V5LiN5a2Y5ZyoOiAkUERJUiIgPiYyOyBleGl0IDMKZmkKClNDUklQVF9ESVI9IiQoY2QgIiQoZGlybmFtZSAiJDAiKSIgJiYgcHdkKSIKbG9nX2V2ZW50KCkgewogIGlmIFsgLXggIiRTQ1JJUFRfRElSL2d1YXJkLWxvZy5zaCIgXTsgdGhlbgogICAgIiRTQ1JJUFRfRElSL2d1YXJkLWxvZy5zaCIgIiRST09UL2d1YXJkLmxvZyIgIiQxIiAiJDIiICIkMyIgIiQ0IiB8fCBlY2hvICLorablkYo6IOaXpeW/l+WGmeWFpeWksei0pSIgPiYyCiAgZWxzZQogICAgcHJpbnRmICclcyB8ICVzIHwgJXMgfCAlcyB8ICVzXG4nICIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JykiICIkMSIgIiQyIiAiJDMiICIkNCIgPj4gIiRST09UL2d1YXJkLmxvZyIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogIGZpCn0KCmlmIG12ICIkVCIgIiRPUklHIiAyPi9kZXYvbnVsbDsgdGhlbgogIE9QPSIkKGlkIC11biAyPi9kZXYvbnVsbCB8fCBlY2hvIHVua25vd24pIgogIE1UUz0iJChkYXRlICcrJVktJW0tJWRUJUg6JU06JVMleicgMj4vZGV2L251bGwgfHwgZGF0ZSkiCiAgcHJpbnRmICclc1x0JXNcdCVzXHQlc1x0JXNcbicgIiRNVFMiICIkT1JJRyIgIiRUIiAiUkVTVE9SRUQiICIkT1AiID4+ICIkUk9PVC9tYW5pZmVzdC5sb2ciIHx8IGVjaG8gIuitpuWRijogbWFuaWZlc3Qg5YaZ5YWl5aSx6LSlIiA+JjIKICBsb2dfZXZlbnQgIlJFU1RPUkUiICJtdiAkVCAtPiAkT1JJRyIgIui/mOWOn+aTjeS9nCIgIk9LIgogIGVjaG8gIuW3sui/mOWOnzogJE9SSUciCiAgZXhpdCAwCmVsc2UKICBsb2dfZXZlbnQgIlJFU1RPUkUiICJtdiAkVCAtPiAkT1JJRyIgIui/mOWOn+aTjeS9nCIgIkZBSUwiCiAgZWNobyAi6ZSZ6K+vOiDov5jljp/lpLHotKU6ICRUIiA+JjIKICBleGl0IDQKZmk=","guard-backup.sh":"IyEvYmluL3NoCiMgZ3VhcmQtYmFja3VwLnNoIOKAlCDkv67mlLnliY3lpIfku73vvIjlia/mnKzov5vlm57mlLbnq5kgYmFja3Vwcy/vvIzkuI3np7vliqjljp/mlofku7bvvIkKIyDphY3lpZc6IFJPT1RfU0FGRVRZX1BST1RPQ09MLm1kIMKnNe+8iOWbnuaUtuermeacuuWItu+8iS8gwqcz77yI5qCH5YeG5pON5L2c5rWBLeWkh+S7ve+8iQojIOiuvuiuoee6puadnzog5Y2V55uu5qCH44CB57ud5a+56Lev5b6E77yb5ouS57ud56m65Y+C5pWwL+mAmumFjeespi/ot6/lvoTnqb/otoov56aB5YaZ5riF5Y2VL+S4jeWtmOWcqC/nm67lvZXvvJsKIyAgICAgICAgICAgY3AgLXAg5L+d55WZ5bGe5oCn77yb6K6w5b2VIG1hbmlmZXN0KEJBQ0tVUDopICsgZ3VhcmQubG9n77yb5LiN6KaG55uW5ZCM5ZCN5aSH5Lu944CCCiMg55So5rOVOiBndWFyZC1iYWNrdXAuc2ggPHRhcmdldF9wYXRoPiA8cmVhc29uPgojIOmAgOWHuueggTogMCDmiJDlip/lpIfku707IDIg55So5rOV6ZSZ6K+vOyAzIOWuieWFqOaLkue7nTsgNCDlpIfku73lpLHotKUKc2V0IC11CgpNQUlOX1JPT1Q9IiR7R1VBUkRfVFJBU0hfREFUQV9ST09UOi0vZGF0YS9sb2NhbC90bXAvb3Blcml0LXRyYXNofSIKU0RDX1JPT1Q9IiR7R1VBUkRfVFJBU0hfU0RDQVJEX1JPT1Q6LS9zZGNhcmQvRG93bmxvYWQvT3Blcml0Ly5ndWFyZC10cmFzaH0iCgp1c2FnZSgpIHsgZWNobyAi55So5rOVOiBndWFyZC1iYWNrdXAuc2ggPHRhcmdldF9wYXRoPiA8cmVhc29uPiIgPiYyOyB9CgppZiBbICQjIC1uZSAyIF07IHRoZW4gdXNhZ2U7IGV4aXQgMjsgZmkKVEFSR0VUPSIkMSI7IFJFQVNPTj0iJDIiClsgLW4gIiRUQVJHRVQiIF0gfHwgeyBlY2hvICLmi5Lnu506IOepuuebruagh+i3r+W+hCIgPiYyOyBleGl0IDM7IH0KWyAtbiAiJFJFQVNPTiIgXSB8fCB7IGVjaG8gIuaLkue7nTog6ZyA6KaB5aGr5YaZ5Y6f5ZugIiA+JjI7IGV4aXQgMzsgfQppZiBbICIkUkVBU09OIiAhPSAiJChwcmludGYgJyVzJyAiJFJFQVNPTiIgfCB0ciAtZCAnXHRcclxuJykiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOWOn+WboOWQq+aOp+WItuWtl+espiIgPiYyOyBleGl0IDMKZmkKCiMg6KeE6IyD5YyWOiDljrvlsL7pg6jmlpzmnaDvvIjkv53nlZnmoLkgL++8iQp3aGlsZSBbICIkVEFSR0VUIiAhPSAiLyIgXSAmJiBbICIke1RBUkdFVCUvfSIgIT0gIiRUQVJHRVQiIF07IGRvIFRBUkdFVD0iJHtUQVJHRVQlL30iOyBkb25lCgojIOe7neWvuei3r+W+hApjYXNlICIkVEFSR0VUIiBpbgogIC8qKSA6IDs7CiAgKikgZWNobyAi5ouS57udOiDku4XmjqXlj5fnu53lr7not6/lvoQ6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg5o6n5Yi25a2X56ymCmlmIFsgIiRUQVJHRVQiICE9ICIkKHByaW50ZiAnJXMnICIkVEFSR0VUIiB8IHRyIC1kICdcdFxyXG4nKSIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog6Lev5b6E5ZCr5o6n5Yi25a2X56ymIiA+JjI7IGV4aXQgMwpmaQoKIyDpgJrphY3nrKbvvIjmnKrlsZXlvIDvvIkKY2FzZSAiJFRBUkdFVCIgaW4KICAqJyonKnwqJz8nKnwqJ1snKnwqJ10nKikgZWNobyAi5ouS57udOiDot6/lvoTlkKvpgJrphY3nrKY6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg6Lev5b6E56m/6LaKCmNhc2UgIiRUQVJHRVQiIGluCiAgKi4uKikgZWNobyAi5ouS57udOiDot6/lvoTlkKsgJy4uJzogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDmoLkv5oyC6L2954K5CmNhc2UgIiRUQVJHRVQiIGluCiAgL3wvZGF0YXwvc2RjYXJkfC9zdG9yYWdlfC9zdG9yYWdlL2VtdWxhdGVkfC9zdG9yYWdlL2VtdWxhdGVkLzApCiAgICBlY2hvICLmi5Lnu506IOaguS/mjILovb3ngrk6ICRUQVJHRVQiID4mMjsgZXhpdCAzIDs7CmVzYWMKCiMg56aB5YaZ5riF5Y2V77yI5Y2P6K6uIMKnNO+8iSsg546v5aKD6Ieq6Lqr5L+d5oqkCmNhc2UgIiRUQVJHRVQiIGluCiAgL3N5c3RlbXwvc3lzdGVtLyp8L3ZlbmRvcnwvdmVuZG9yLyp8L3Byb2R1Y3R8L3Byb2R1Y3QvKnwvc3lzdGVtX2V4dHwvc3lzdGVtX2V4dC8qfFwKICAvYm9vdHwvYm9vdC8qfC9pbml0X2Jvb3R8L2luaXRfYm9vdC8qfC92Ym1ldGF8L3ZibWV0YS8qfFwKICAvcGVyc2lzdHwvcGVyc2lzdC8qfC9lZnN8L2Vmcy8qfC9tZXRhZGF0YXwvbWV0YWRhdGEvKnwvZmlybXdhcmV8L2Zpcm13YXJlLyp8XAogIC9tb2RlbXN0KnwvZnNnfC9mc2cvKnwvZnNjfC9mc2MvKnxcCiAgL2RhdGEvc3lzdGVtfC9kYXRhL3N5c3RlbS8qfC9kYXRhL21pc2N8L2RhdGEvbWlzYy8qfC9kYXRhL2FkYnwvZGF0YS9hZGIvKnxcCiAgL2RhdGEvdmVuZG9yfC9kYXRhL3ZlbmRvci8qfC9kYXRhL2FwZXh8L2RhdGEvYXBleC8qfC9kZXZ8L2Rldi8qfFwKICAvdXNyfC91c3IvKnwvYmlufC9iaW4vKnwvc2Jpbnwvc2Jpbi8qfC9saWJ8L2xpYi8qfC9saWI2NHwvbGliNjQvKnxcCiAgL2V0Y3wvZXRjLyp8L3ZhcnwvdmFyLyp8L3Jvb3R8L3Jvb3QvKnwvb3B0fC9vcHQvKnwvc3J2fC9zcnYvKikKICAgIGVjaG8gIuaLkue7nTog56aB5YaZ5riF5Y2VL+eOr+Wig+i3r+W+hDogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyBndWFyZCDlt6Xlhbfpk77oh6rouqvkv53miqQKaWYgWyAtZCAiJFRBUkdFVCIgXSAmJiBbIC1mICIkVEFSR0VUL2d1YXJkLWJhY2t1cC5zaCIgXTsgdGhlbgogIGVjaG8gIuaLkue7nTog55uu5qCH55uu5b2V5ZCrIGd1YXJkIOW3peWFt+mTvu+8jOWPl+S/neaKpDogJFRBUkdFVCIgPiYyOyBleGl0IDMKZmkKCiMg5a2Y5Zyo5oCnICsg5LuF5paH5Lu2CmlmIFsgISAtZSAiJFRBUkdFVCIgXSAmJiBbICEgLUwgIiRUQVJHRVQiIF07IHRoZW4KICBlY2hvICLmi5Lnu506IOebruagh+S4jeWtmOWcqDogJFRBUkdFVCIgPiYyOyBleGl0IDMKZmkKaWYgWyAhIC1mICIkVEFSR0VUIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDku4XmlK/mjIHluLjop4Tmlofku7bvvIjkuI3lpIfku73nm67lvZUv6K6+5aSH77yJOiAkVEFSR0VUIiA+JjI7IGV4aXQgMwpmaQoKIyDljbfliKTlrprvvIjlkIzljbfljp/liJnvvJsvZGF0YV9taXJyb3Ig5Li6IC9kYXRhIOiuvuWkh+eahOmVnOWDj+mAmumBk++8jOinhuWQjCAvZGF0YSDljbfvvIkKY2FzZSAiJFRBUkdFVCIgaW4KICAvZGF0YS8qfC9kYXRhX21pcnJvci8qKSBST09UPSIkTUFJTl9ST09UIiA7OwogIC9zZGNhcmQvKnwvc3RvcmFnZS9lbXVsYXRlZC8qKSBST09UPSIkU0RDX1JPT1QiIDs7CiAgKikgZWNobyAi5ouS57udOiDml6Dms5Xnoa7lrprlkIzljbflm57mlLbnq5nvvIjku4XmlK/mjIEgL2RhdGHjgIEvZGF0YV9taXJyb3Ig5LiOIC9zZGNhcmQg5Y2377yJOiAkVEFSR0VUIiA+JjI7IGV4aXQgMyA7Owplc2FjCgojIG92ZXJyaWRlIOaDheW9ouaPkOekugppZiBbICIkUk9PVCIgIT0gIi9kYXRhL2xvY2FsL3RtcC9vcGVyaXQtdHJhc2giIF0gJiYgWyAiJFJPT1QiICE9ICIvc2RjYXJkL0Rvd25sb2FkL09wZXJpdC8uZ3VhcmQtdHJhc2giIF07IHRoZW4KICBlY2hvICLms6jmhI86IOWbnuaUtuermeagueS4uumdnuW4uOinhOi3r+W+hO+8iG92ZXJyaWRlIOeUn+aViO+8iTogJFJPT1QiID4mMgpmaQoKIyDlm57mlLbnq5noh6rouqsv54i257qn5L+d5oqkCmlmIFsgIiRUQVJHRVQiID0gIiRST09UIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDnm67moIfmmK/lm57mlLbnq5noh6rouqs6ICRUQVJHRVQiID4mMjsgZXhpdCAzCmZpCmNhc2UgIiRST09UIiBpbgogICIkVEFSR0VUIi8qKSBlY2hvICLmi5Lnu506IOebruagh+aYr+WbnuaUtuermeeItue6pzogJFRBUkdFVCIgPiYyOyBleGl0IDMgOzsKZXNhYwoKIyDlm57mlLbnq5nlsLHnu6rmo4Dmn6UKaWYgWyAhIC1kICIkUk9PVC9iYWNrdXBzIiBdOyB0aGVuCiAgZWNobyAi5ouS57udOiDlpIfku73ljLrmnKrlsLHnu6o6ICRST09UL2JhY2t1cHPvvIjlhYjov5DooYwgZ3VhcmQtaW5pdC5zaO+8iSIgPiYyOyBleGl0IDMKZmkKClNDUklQVF9ESVI9IiQoY2QgIiQoZGlybmFtZSAiJDAiKSIgJiYgcHdkKSIKbG9nX2V2ZW50KCkgewogIGlmIFsgLXggIiRTQ1JJUFRfRElSL2d1YXJkLWxvZy5zaCIgXTsgdGhlbgogICAgIiRTQ1JJUFRfRElSL2d1YXJkLWxvZy5zaCIgIiRST09UL2d1YXJkLmxvZyIgIiQxIiAiJDIiICIkMyIgIiQ0IiB8fCBlY2hvICLorablkYo6IOaXpeW/l+WGmeWFpeWksei0pSIgPiYyCiAgZWxzZQogICAgcHJpbnRmICclcyB8ICVzIHwgJXMgfCAlcyB8ICVzXG4nICIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JykiICIkMSIgIiQyIiAiJDMiICIkNCIgPj4gIiRST09UL2d1YXJkLmxvZyIgfHwgZWNobyAi6K2m5ZGKOiDml6Xlv5flhpnlhaXlpLHotKUiID4mMgogIGZpCn0KClRTPSIkKGRhdGUgJyslWSVtJWRfJUglTSVTJykiCkJBU0U9IiQoYmFzZW5hbWUgIiRUQVJHRVQiKSIKREVTVD0iJFJPT1QvYmFja3Vwcy8ke1RTfV8ke0JBU0V9IgppZiBbIC1lICIkREVTVCIgXSB8fCBbIC1MICIkREVTVCIgXTsgdGhlbiBERVNUPSIke0RFU1R9XyQkIjsgZmkKCmlmIGNwIC1wICIkVEFSR0VUIiAiJERFU1QiIDI+L2Rldi9udWxsOyB0aGVuCiAgT1A9IiQoaWQgLXVuIDI+L2Rldi9udWxsIHx8IGVjaG8gdW5rbm93bikiCiAgTVRTPSIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JyAyPi9kZXYvbnVsbCB8fCBkYXRlKSIKICBwcmludGYgJyVzXHQlc1x0JXNcdCVzXHQlc1xuJyAiJE1UUyIgIiRUQVJHRVQiICIkREVTVCIgIkJBQ0tVUDogJFJFQVNPTiIgIiRPUCIgPj4gIiRST09UL21hbmlmZXN0LmxvZyIgfHwgZWNobyAi6K2m5ZGKOiBtYW5pZmVzdCDlhpnlhaXlpLHotKUiID4mMgogIGxvZ19ldmVudCAiTDIiICJjcCAkVEFSR0VUIC0+ICRERVNUIiAi5aSH5Lu9OiAkUkVBU09OIiAiT0siCiAgZWNobyAi5aSH5Lu95a6M5oiQOiAkREVTVCIKICBlY2hvICLopobnm5bov5jljp/lkb3ku6Q6IGd1YXJkLXJlc3RvcmUuc2ggJyRERVNUJyIKICBleGl0IDAKZWxzZQogIGxvZ19ldmVudCAiTDIiICJjcCAkVEFSR0VUIC0+ICRERVNUIiAi5aSH5Lu9OiAkUkVBU09OIiAiRkFJTCIKICBlY2hvICLplJnor686IOWkh+S7veWksei0pTogJFRBUkdFVCIgPiYyCiAgZXhpdCA0CmZp","guard-log.sh":"IyEvYmluL3NoCiMgZ3VhcmQtbG9nLnNoIOKAlCBndWFyZCDmk43kvZzml6Xlv5forrDlvZXlmajvvIjlj6rov73liqDvvIzkuI3opobnm5bvvIkKIyDphY3lpZc6IFJPT1RfU0FGRVRZX1BST1RPQ09MLm1kIMKnNu+8iOaXpeW/l++8iQojIOeUqOazlTogZ3VhcmQtbG9nLnNoIDxsb2dfZmlsZT4gPGxldmVsPiA8Y29tbWFuZD4gPHJlYXNvbj4gPHJlc3VsdD4KIyDooYzmoLzlvI86IElTTzg2MDEo5ZCr5YGP56e7KSB8IGxldmVsIHwgY29tbWFuZCB8IHJlYXNvbiB8IHJlc3VsdAojIOmAgOWHuueggTogMCDmiJDlip87IDIg55So5rOV6ZSZ6K+vCnNldCAtdQoKaWYgWyAkIyAtbHQgNSBdOyB0aGVuCiAgZWNobyAi55So5rOVOiBndWFyZC1sb2cuc2ggPGxvZ19maWxlPiA8bGV2ZWw+IDxjb21tYW5kPiA8cmVhc29uPiA8cmVzdWx0PiIgPiYyCiAgZXhpdCAyCmZpCgpMT0dfRklMRT0iJDEiOyBMRVZFTD0iJDIiOyBDTUQ9IiQzIjsgUkVBU09OPSIkNCI7IFJFU1VMVD0iJDUiClRTPSIkKGRhdGUgJyslWS0lbS0lZFQlSDolTTolUyV6JyAyPi9kZXYvbnVsbCB8fCBkYXRlICcrJVktJW0tJWRUJUg6JU06JVMnKSIKcHJpbnRmICclcyB8ICVzIHwgJXMgfCAlcyB8ICVzXG4nICIkVFMiICIkTEVWRUwiICIkQ01EIiAiJFJFQVNPTiIgIiRSRVNVTFQiID4+ICIkTE9HX0ZJTEUiCmV4aXQgMA=="};

    function sq(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; }

    async function runShell(command) {
        const result = await Tools.System.shell(String(command));
        return {
            output: String((result && result.output) || ""),
            exitCode: result && typeof result.exitCode === "number" ? result.exitCode : -1
        };
    }

    async function kitPresent() {
        const r = await runShell("[ -x " + KIT_DIR + "/guard-trash.sh ] && echo YES || echo NO");
        return r.output.indexOf("YES") >= 0;
    }

    async function guard_setup() {
        try {
            if (await kitPresent()) {
                return { success: true, note: "guard-kit 已存在（如需更新：先删除 /data/local/tmp/guard-kit 再重跑）", kit_dir: KIT_DIR };
            }
            await runShell("mkdir -p " + KIT_DIR);
            const names = Object.keys(BUNDLE);
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                await runShell("printf '%s' '" + BUNDLE[name] + "' > " + KIT_DIR + "/" + name + ".b64");
                await runShell("base64 -d " + KIT_DIR + "/" + name + ".b64 > " + KIT_DIR + "/" + name + " && rm -f " + KIT_DIR + "/" + name + ".b64");
            }
            await runShell("chmod 755 " + KIT_DIR + "/*.sh");
            const ok = await kitPresent();
            return { success: ok, kit_dir: KIT_DIR, files: names };
        } catch (e) { return { success: false, error: String((e && e.message) || e) }; }
    }

    async function guard_status() {
        try {
            const id = await runShell("id");
            const caps = await runShell("grep -E '^(Uid|Gid|Groups|Cap(Inh|Prm|Eff|Bnd)|NoNewPrivs)' /proc/self/status");
            const dm = await runShell("[ -d /data_mirror/data_ce/null/0 ] && echo MIRROR_OK || echo MIRROR_ABSENT");
            const tm = await runShell("[ -d /data/local/tmp/operit-trash/trash ] && echo OK || echo ABSENT");
            const ts = await runShell("[ -d /sdcard/Download/Operit/.guard-trash/trash ] && echo OK || echo ABSENT");
            const kit = await kitPresent();
            return {
                root_id: id.output.trim(),
                caps: caps.output.trim(),
                data_channel: dm.output.indexOf("MIRROR_OK") >= 0 ? "/data_mirror/data_ce/null/0" : "/data/data（镜像不可用）",
                trash_main: tm.output.trim(),
                trash_sdcard: ts.output.trim(),
                guard_kit: kit ? "已安装" : "未安装（先跑 guard_setup）",
                kit_dir: KIT_DIR
            };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_init() {
        try {
            await guard_setup();
            const r = await runShell("sh " + KIT_DIR + "/guard-init.sh");
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_trash(params) {
        try {
            await guard_setup();
            const target = params && params.target ? String(params.target) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            if (!target || !reason) { return { error: "需要 target 与 reason" }; }
            const r = await runShell("sh " + KIT_DIR + "/guard-trash.sh " + sq(target) + " " + sq(reason));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_backup(params) {
        try {
            await guard_setup();
            const target = params && params.target ? String(params.target) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            if (!target || !reason) { return { error: "需要 target 与 reason" }; }
            const r = await runShell("sh " + KIT_DIR + "/guard-backup.sh " + sq(target) + " " + sq(reason));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_restore(params) {
        try {
            await guard_setup();
            const t = params && params.trashed_path ? String(params.trashed_path) : "";
            if (!t) { return { error: "需要 trashed_path" }; }
            const r = await runShell("sh " + KIT_DIR + "/guard-restore.sh " + sq(t));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    async function guard_log(params) {
        try {
            await guard_setup();
            const level = params && params.level ? String(params.level) : "L1";
            const command = params && params.command ? String(params.command) : "";
            const reason = params && params.reason ? String(params.reason) : "";
            const result = params && params.result ? String(params.result) : "OK";
            const r = await runShell("sh " + KIT_DIR + "/guard-log.sh /data/local/tmp/operit-trash/guard.log " + sq(level) + " " + sq(command) + " " + sq(reason) + " " + sq(result));
            return { exitCode: r.exitCode, output: r.output.trim() };
        } catch (e) { return { error: String((e && e.message) || e) }; }
    }

    return { guard_setup, guard_status, guard_init, guard_trash, guard_backup, guard_restore, guard_log };
})();
exports.guard_setup = rootGuard.guard_setup;
exports.guard_status = rootGuard.guard_status;
exports.guard_init = rootGuard.guard_init;
exports.guard_trash = rootGuard.guard_trash;
exports.guard_backup = rootGuard.guard_backup;
exports.guard_restore = rootGuard.guard_restore;
exports.guard_log = rootGuard.guard_log;
