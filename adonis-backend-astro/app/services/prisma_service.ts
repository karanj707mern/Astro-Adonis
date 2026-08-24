import { PrismaClient } from '@prisma/client';
import { inject } from '@adonisjs/fold';
import env from '#start/env';
import logger from '@adonisjs/core/services/logger';

@inject()
export default class PrismaService {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      log:
        env.get('NODE_ENV') === 'development'
          ? ['query', 'error', 'warn']
          : ['error', 'warn'],
    });

    (this.client as any).$on('query', (e: any) => {
      logger.debug(
        { query: e.query, duration: `${e.duration}ms` },
        'Prisma query',
      );
    });

    (this.client as any).$on('error', (e: any) => {
      logger.error({ message: e.message }, 'Prisma error');
    });
  }

  getClient(): PrismaClient {
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      logger.info('Prisma client connected');
    } catch (error) {
      logger.error(
        { message: (error as Error).message },
        'Prisma connection failed',
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    logger.info('Prisma client disconnected');
  }
}
