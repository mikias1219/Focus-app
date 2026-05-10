import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    if (!dto.email && !dto.password) {
      throw new BadRequestException('No profile updates were provided');
    }
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        password: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
      },
      select: { id: true, email: true, createdAt: true },
    });
    this.notifications.emit(
      userId,
      'profile_updated',
      'Profile updated',
      'Your profile details were changed successfully.',
    );
    return updated;
  }
}
