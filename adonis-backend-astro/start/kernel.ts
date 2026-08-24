import router from '@adonisjs/core/services/router';

export const serverMiddleware: (() => Promise<{ default: any }>)[] = [
  // () => import('@adonisjs/static/static_middleware'),
  // () => import('@adonisjs/cors/cors_middleware'),
  // () => import('@adonisjs/bodyparser/bodyparser_middleware'),
];

/**
 * Named middleware store (AdonisJS v7 pattern).
 * Usage in routes: .middleware(middleware.auth())
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  admin: () => import('#middleware/role_middleware'),
});
