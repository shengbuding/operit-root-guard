#!/usr/bin/env node
/**
 * gen.js — 把 shell 脚本打包成 scripts.bundle.json（base64）
 * 用法：node gen.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// 必须与 kitPresent() 里校验的清单一致
const SCRIPTS = [
  'guard-init.sh',
  'guard-trash.sh',
  'guard-restore.sh',
  'guard-backup.sh',
  'guard-log.sh',
  'guard-selftest.sh',
];

function main() {
  const bundle = {};
  let total = 0;

  for (const name of SCRIPTS) {
    const p = path.join(DIR, 'scripts', name);
    if (!fs.existsSync(p)) {
      console.error('ERROR: 缺少脚本 ' + name);
      process.exit(1);
    }
    const buf = fs.readFileSync(p);            // 二进制读，保 UTF-8 原样
    const b64 = buf.toString('base64');
    bundle[name] = b64;
    total += buf.length;
    console.log('  ' + name + ': ' + buf.length + ' B -> ' + b64.length + ' B(base64)');
  }

  const out = path.join(DIR, 'scripts.bundle.json');
  // 目标文件可能属主不同且不可写；同目录内 rename 只需目录写权限
  const tmp = out + '.new';
  fs.writeFileSync(tmp, JSON.stringify(bundle), 'utf8');
  fs.renameSync(tmp, out);

  // 自校验：解码回来必须与原文件逐字节相同
  let bad = 0;
  for (const name of SCRIPTS) {
    const raw = fs.readFileSync(path.join(DIR, 'scripts', name));
    const dec = Buffer.from(bundle[name], 'base64');
    if (Buffer.compare(raw, dec) !== 0) {
      console.error('ERROR: ' + name + ' 往返不一致');
      bad++;
    }
  }
  if (bad) process.exit(1);

  console.log('');
  console.log('OK: ' + SCRIPTS.length + ' 个脚本, 原始 ' + total + ' B, bundle ' + fs.statSync(out).size + ' B');
  console.log('往返校验: 全部逐字节一致');
}

main();