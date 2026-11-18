"use strict";
// Root Guard ToolPkg — main entry
// Registers lifecycle hooks only; all guard tools live in packages/root_guard.js
function registerToolPkg() {
  return true;
}
exports.registerToolPkg = registerToolPkg;
