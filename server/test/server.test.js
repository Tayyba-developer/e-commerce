import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

test('server can start on a fallback port when requested port is busy', async () => {
  const busyPort = await getFreePort();
  const blocker = net.createServer();
  await new Promise((resolve) => blocker.listen(busyPort, '127.0.0.1', resolve));

  try {
    const child = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(busyPort) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const output = await new Promise((resolve, reject) => {
      let data = '';
      child.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });
      child.stderr.on('data', (chunk) => {
        data += chunk.toString();
      });
      child.on('exit', (code) => resolve({ code, data }));
      child.on('error', reject);
      setTimeout(() => resolve({ code: null, data }), 3000);
    });

    assert.match(output.data, /localhost:\d+/);
    child.kill();
  } finally {
    blocker.close();
  }
});
