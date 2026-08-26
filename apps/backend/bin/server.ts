/*
|--------------------------------------------------------------------------
| HTTP server entry point
|--------------------------------------------------------------------------
|
| This file boots the AdonisJS HTTP server. It is the production entry
| used by "node build/bin/server.js" after "node ace build".
|
*/

await import('reflect-metadata');
const { Ignitor, prettyPrintError } = await import('@adonisjs/core');

/**
 * URL to the application root. AdonisJS needs it to resolve
 * paths to files and directories.
 */
const APP_ROOT = new URL('../', import.meta.url);

/**
 * The importer is used to import files in the context of the application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href);
  }
  return import(filePath);
};

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env');
    });
    app.listen('SIGTERM', () => app.terminate());
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate());
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1;
    prettyPrintError(error);
  });
