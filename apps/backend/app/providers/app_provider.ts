import type { ApplicationService } from '@adonisjs/core/types';
import NotificationService from '#controllers/notification/notification_service';
import BullMqService from '#controllers/notification/notification_queue';
import RabbitMqService from '#controllers/notification/rabbitmq_service';
import CronService from '#services/cron_service';
import type { PrismaClient } from '@prisma/client';
import AbandonedCartService from '#services/abandoned_cart_service';

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    const container = this.app.container;

    container.singleton(BullMqService, () => new BullMqService());

    container.singleton(RabbitMqService, () => new RabbitMqService());

    container.singleton(NotificationService, async () => {
      const db = (await container.make('Database')) as PrismaClient;
      return new NotificationService(
        db,
        await container.make(BullMqService),
      );
    });

    container.singleton(CronService, async () => {
      return new CronService(await container.make(AbandonedCartService));
    });
  }

  async boot() {
    const rabbitMq = await this.app.container.make(RabbitMqService);
    await rabbitMq.connect();

    const notificationService = await this.app.container.make(NotificationService);
    notificationService.startProcessing();

    // CronService schedules jobs in its constructor
    await this.app.container.make(CronService);
  }
}
