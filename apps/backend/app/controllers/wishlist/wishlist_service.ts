import { PrismaClient } from '@prisma/client';
import {
  BadRequestException,
  NotFoundException,
} from '#exceptions/http_exceptions';
import RedisCacheService from '#services/redis_cache_service';

export default class WishlistService {
  constructor(
    private prisma: PrismaClient,
    private cache: RedisCacheService,
  ) {}

  private getGuestWishlistExpiryThreshold(): Date {
    return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  }

  async mergeGuestWishlist(userId: number, token: string) {
    if (!token) {
      throw new BadRequestException('Guest wishlist token is required');
    }

    const guestItems = await this.prisma.wishlist.findMany({
      where: {
        guestWishlistToken: token,
        createdAt: { gt: this.getGuestWishlistExpiryThreshold() },
      },
      select: { productId: true },
    });

    if (guestItems.length === 0) {
      return { message: 'No guest wishlist items to merge' };
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of guestItems) {
        const existing = await tx.wishlist.findFirst({
          where: { userId, productId: item.productId },
        });

        if (existing) {
          await tx.wishlist.update({
            where: { id: existing.id },
            data: {},
          });
        } else {
          await tx.wishlist.create({
            data: { userId, productId: item.productId },
          });
        }
      }

      await tx.wishlist.deleteMany({
        where: {
          guestWishlistToken: token,
          createdAt: { gt: this.getGuestWishlistExpiryThreshold() },
        },
      });
    });

    await this.cache.del(`wishlist:user:${userId}`);
    await this.cache.del(`wishlist:guest:${token}`);

    return this.findAll(userId);
  }

  /**
   * Lists wishlist items for a signed-in user and/or a guest token.
   * Guest items older than the expiry threshold are ignored.
   */
  async findAll(userId?: number, guestToken?: string) {
    if (!userId && !guestToken) {
      return [];
    }

    const cacheKey = userId
      ? `wishlist:user:${userId}`
      : `wishlist:guest:${guestToken}`;
    const cached =
      await this.cache.getJson<{ productId: number; createdAt: string }[]>(
        cacheKey,
      );
    if (cached) return cached;

    const items = await this.prisma.wishlist.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(guestToken
            ? [{
                guestWishlistToken: guestToken,
                createdAt: { gt: this.getGuestWishlistExpiryThreshold() },
              }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { productId: true, createdAt: true },
    });

    await this.cache.setJson(cacheKey, items, 300);
    return items;
  }

  async findOne(userId: number | undefined, productId: number) {
    const item = await this.prisma.wishlist.findFirst({
      where: userId ? { userId, productId } : undefined,
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    return item;
  }

  async add(userId: number | undefined, productId: number, guestToken?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!userId && !guestToken) {
      throw new BadRequestException(
        'A user id or guest wishlist token is required',
      );
    }

    const ownerFilter = userId
      ? { userId, productId }
      : { guestWishlistToken: guestToken!, productId };

    const existing = await this.prisma.wishlist.findFirst({
      where: ownerFilter,
    });

    if (existing) {
      return existing;
    }

    const created = await this.prisma.wishlist.create({
      data: { ...ownerFilter },
    });

    await this.cache.del(
      userId ? `wishlist:user:${userId}` : `wishlist:guest:${guestToken}`,
    );

    return created;
  }

  async remove(
    userId: number | undefined,
    productId: number,
    guestToken?: string,
  ) {
    if (!userId && !guestToken) {
      throw new BadRequestException(
        'A user id or guest wishlist token is required',
      );
    }

    const ownerFilter = userId
      ? { userId, productId }
      : { guestWishlistToken: guestToken!, productId };

    const item = await this.prisma.wishlist.findFirst({
      where: ownerFilter,
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlist.delete({
      where: { id: item.id },
    });

    await this.cache.del(
      userId ? `wishlist:user:${userId}` : `wishlist:guest:${guestToken}`,
    );

    return { message: 'Wishlist item removed' };
  }

  async clear(userId: number) {
    await this.prisma.wishlist.deleteMany({
      where: { userId },
    });

    await this.cache.del(`wishlist:user:${userId}`);

    return [];
  }
}
