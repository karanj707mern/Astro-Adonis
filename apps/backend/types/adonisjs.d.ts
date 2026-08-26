/**
 * Global type augmentations for AdonisJS.
 *
 * - Merges `validateUsing` onto HttpRequest (normally applied at runtime by
 *   the VineJS provider, whose declaration never joins this program).
 * - Declares `requestId`, `guestToken`, and the JWT-backed `auth` object set
 *   by AuthMiddleware / RequestContextMiddleware.
 */
import type { RequestValidator } from '@adonisjs/core/http';
import type { Role, User } from '@prisma/client';

declare module '@adonisjs/core/http' {
  interface HttpRequest extends RequestValidator {}

  interface HttpContext {
    /** Set by RequestContextMiddleware for tracing. */
    requestId: string;
    /** Set by GuestTokenMiddleware for anonymous carts/wishlists. */
    guestToken?: string;
    /** Set by AuthMiddleware; guaranteed present on protected routes. */
    auth?: {
      user: Pick<User, 'id' | 'name' | 'email' | 'role'> & {
        role: Role;
        [key: string]: unknown;
      };
    };
  }
}
