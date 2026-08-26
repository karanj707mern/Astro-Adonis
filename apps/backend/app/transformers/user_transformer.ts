import type { User as PrismaUser } from '@prisma/client';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserTransformer extends BaseTransformer<PrismaUser> {
  /**
   * Derives up-to-two-letter initials from the user's display name.
   */
  private getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('');
  }

  toObject() {
    const user = this.pick(this.resource, [
      'id',
      'name',
      'email',
      'createdAt',
      'updatedAt',
    ]);

    return {
      ...user,
      initials: this.getInitials(this.resource.name),
    };
  }
}
