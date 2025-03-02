import { spawn } from 'child_process';

// Use spawn to run the command with proper argument handling
const child = spawn('node', [
  '--experimental-specifier-resolution=node',
  '--loader', 'ts-node/esm',
  'index.ts'
], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start process:', error);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
}); 