import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { randomUUID } from 'node:crypto';
import RequestContextService from '#services/request_context_service';

export default class RequestContextMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const requestId =
      ctx.request.header('x-request-id') || randomUUID();
    const user = ctx.auth?.user;
    const ip = ctx.request.ip();
    const userAgent = ctx.request.header('user-agent');

    RequestContextService.run(
      {
        requestId,
        userId: user?.id,
        ip,
        userAgent,
      },
      () => next(),
    );
  }
}
