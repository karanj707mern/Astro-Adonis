import 'reflect-metadata';
import { Ignitor } from '@adonisjs/core';
import { fileURLToPath, pathToFileURL } from 'node:url';

const importer = (filePath: string) => import(filePath);

console.log('[DEBUG] bin/server.ts process.execArgv:', process.execArgv);
console.log('[DEBUG] bin/server.ts import.meta.url:', import.meta.url);
const appRootFromMeta = new URL('../', import.meta.url);
const appRoot =
  appRootFromMeta.pathname.endsWith('/build/') ||
  appRootFromMeta.pathname.endsWith('\\build\\')
    ? new URL('../../', import.meta.url)
    : appRootFromMeta;

process.on('uncaughtException', (err) => {
  console.error('[GLOBAL uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[GLOBAL unhandledRejection]', reason);
});

new Ignitor(appRoot.href, { importer }).httpServer().start();
