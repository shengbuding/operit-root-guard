#!/usr/bin/env node
/**
 * assemble.js — 从 root_guard.template.js + scripts.bundle.json 生成 root_guard.js
 * 用法：node assemble.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const TPL = path.join(DIR, 'root_guard.template.js');
const BUNDLE = path.join(DIR, 'scripts.bundle.json');
const OUT = path.join(DIR, '..', 'packages', 'root_guard.js');

function main() {
  const tpl = fs.readFileSync(TPL, 'utf8');
  const bundleText = fs.readFileSync(BUNDLE, 'utf8');

  // 校验 bundle 是合法 JSON
  let bundle;
  try {
    bundle = JSON.parse(bundleText);
  } catch (e) {
    console.error('ERROR: scripts.bundle.json 不是合法 JSON:', e.message);
    process.exit(1);
  }
  const keys = Object.keys(bundle);
  if (!keys.length) {
    console.error('ERROR: scripts.bundle.json 为空');
    process.exit(1);
  }

  const marker = '__BUNDLE_JSON__';
  const count = tpl.split(marker).length - 1;
  if (count !== 1) {
    console.error('ERROR: 模板中 ' + marker + ' 出现 ' + count + ' 次，应为 1 次');
    process.exit(1);
  }

  // 用紧凑 JSON（单行）替换，避免换行破坏代码结构
  const compact = JSON.stringify(bundle);
  const out = tpl.replace(marker, compact);

  fs.writeFileSync(OUT, out, 'utf8');

  console.log('OK: 已生成 ' + OUT);
  console.log('  模板: ' + fs.statSync(TPL).size + ' B');
  console.log('  bundle: ' + keys.length + ' 个脚本, ' + fs.statSync(BUNDLE).size + ' B');
  console.log('  输出: ' + fs.statSync(OUT).size + ' B');
  console.log('  脚本清单: ' + keys.join(', '));
}

main();