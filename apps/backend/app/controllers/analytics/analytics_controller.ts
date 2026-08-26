import type { HttpContext } from '@adonisjs/core/http';
import AnalyticsService from './analytics_service.js';
import {
  recentlyViewedQueryValidator,
  salesStatsQueryValidator,
} from './analytics_validators.js';

export default class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  async getSalesStats({ request }: HttpContext) {
    const dto = await request.validateUsing(salesStatsQueryValidator);
    return this.analyticsService.getSalesStats(dto);
  }

  async getOrdersOverview() {
    return this.analyticsService.getOrdersOverview();
  }

  async getRecoverableCarts(ctx: HttpContext) {
    const userId = ctx.auth?.user?.id;
    return this.analyticsService.getRecoverableCarts(userId, ctx.guestToken);
  }

  async runAbandonedCartSweep() {
    return this.analyticsService.runAbandonedCartSweep();
  }

  async recordView({ auth, request }: HttpContext) {
    const userId = auth!.user.id;
    const productId = Number(request.input('productId'));
    return this.analyticsService.recordView(userId, productId);
  }

  async getRecentlyViewed({ auth, request }: HttpContext) {
    const userId = auth!.user.id;
    const dto = await request.validateUsing(recentlyViewedQueryValidator);
    return this.analyticsService.getRecentlyViewed(userId, dto.limit ?? 20);
  }

  async clearHistory({ auth }: HttpContext) {
    const userId = auth!.user.id;
    return this.analyticsService.clearHistory(userId);
  }
}
