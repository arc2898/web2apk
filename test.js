const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const entry = path.join(__dirname, 'build.js');

function run(...args) {
  return spawnSync(process.execPath, [entry, ...args], { encoding: 'utf8' });
}

const help = run();
assert.equal(help.status, 0);
assert.match(help.stdout, /Usage:/);

const invalidUrl = run('Example', 'icon.png', 'file:///tmp/site');
assert.equal(invalidUrl.status, 1);
assert.match(invalidUrl.stderr, /valid http/);

const validHelp = run('--help');
assert.equal(validHelp.status, 0);
assert.match(validHelp.stdout, /Web2APK/);

console.log('web2apk CLI validation tests passed');
