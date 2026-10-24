import {spawn} from 'node:child_process';

// Async spawning also works on sandbox hosts where Node's synchronous spawn reports EPERM.
// Never include command arguments in errors: RPC URLs can contain credentials.
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {stdio:['ignore','pipe','pipe'], ...options});
    let stdout = '';
    child.stdout?.on('data', data => { stdout += data; });
    child.stderr?.resume();
    child.once('error', () => reject(new Error(`${command} could not be started.`)));
    child.once('close', code => code === 0 ? resolve(stdout.trim()) : reject(new Error(`${command} failed with exit code ${code}.`)));
  });
}
