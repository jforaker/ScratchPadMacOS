#!/usr/bin/env node

const childProcess = require('child_process');

const originalExecFileSync = childProcess.execFileSync;

childProcess.execFileSync = function patchedExecFileSync(file, ...rest) {
  if (typeof file === 'string' && file.endsWith('setup_env.sh')) {
    return Buffer.from('');
  }

  return originalExecFileSync.call(childProcess, file, ...rest);
};

const cli = require('../node_modules/react-native/cli.js');

if (cli && typeof cli.run === 'function') {
  cli.run();
} else {
  process.exitCode = 1;
  console.error('Unable to start React Native CLI from wrapper.');
}
