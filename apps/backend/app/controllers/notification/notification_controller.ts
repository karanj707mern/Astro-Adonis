import type { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/fold';
import NotificationService from './notification_service.js';
import {
  adminNotificationQueryValidator,
  notificationPreferenceValidator,
} from './notification_validators.js';

@inject()
export default class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getUserNotifications({ auth, request, response }: HttpContext) {
    const page = Math.max(1, Number(request.input('page', 1)));
    const limit = Math.min(
      100,
      Math.max(1, Number(request.input('limit', 20))),
    );
    const result = await this.notificationService.getUserNotifications(
      auth!.user.id,
      page,
      limit,
    );
    return response.json(result);
  }

  async getUnreadCount({ auth }: HttpContext) {
    return this.notificationService.getUnreadCount(auth!.user.id);
  }

  async markNotificationAsRead({ auth, params, response }: HttpContext) {
    const notificationId = Number(params.id);
    const result = await this.notificationService.markNotificationAsRead(
      notificationId,
      auth!.user.id,
    );
    return response.json(result);
  }

  async markAllNotificationsAsRead({ auth }: HttpContext) {
    return this.notificationService.markAllNotificationsAsRead(auth!.user.id);
  }

  async getUserPreferences({ auth }: HttpContext) {
    return this.notificationService.getUserPreferences(auth!.user.id);
  }

  async updateNotificationPreference({ auth, request }: HttpContext) {
    const dto = await request.validateUsing(notificationPreferenceValidator);
    return this.notificationService.updateNotificationPreference(
      auth!.user.id,
      dto,
    );
  }

  async findAdminNotifications({ request }: HttpContext) {
    const query = await request.validateUsing(adminNotificationQueryValidator);
    return this.notificationService.findAdminNotifications({
      orderId: query.orderId,
      status: query.status,
      channel: query.channel,
      type: query.type,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  async getHealth() {
    return this.notificationService.getHealth();
  }
}
