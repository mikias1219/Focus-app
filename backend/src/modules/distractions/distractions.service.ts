import { Injectable } from '@nestjs/common';
import { DistractionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DistractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, sessionId: string, type: DistractionType) {
    const event = await this.prisma.distractionEvent.create({
      data: { userId, sessionId, type },
    });
    this.notifications.emit(
      userId,
      'distraction_logged',
      'Distraction logged',
      `Distraction recorded as "${type}".`,
    );
    return event;
  }
}
