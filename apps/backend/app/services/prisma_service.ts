import { Prisma, PrismaClient } from '@prisma/client';
import { inject } from '@adonisjs/fold';
import env from '#start/env';
import logger from '@adonisjs/core/services/logger';

@inject()
export default class PrismaService {
  private client: PrismaClient;

  constructor() {
    const logLevels: Prisma.LogLevel[] =
      env.get('NODE_ENV') === 'development'
        ? ['query', 'error', 'warn']
        : ['error', 'warn'];

    this.client = new PrismaClient({ log: logLevels });

    if (logLevels.includes('query')) {
      this.client.$on('query', (event: Prisma.QueryEvent) => {
        logger.debug(
          { query: event.query, duration: `${event.duration}ms` },
          'Prisma query',
        );
      });
    }

    this.client.$on('error', (event: Prisma.LogEvent) => {
      logger.error({ message: event.message }, 'Prisma error');
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
