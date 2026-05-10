import { BadRequestException, Injectable } from '@nestjs/common';
import { SessionStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FocusSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async start(userId: string, taskId: string) {
    const active = await this.prisma.focusSession.findFirst({
      where: { userId, status: SessionStatus.active },
    });
    if (active) throw new BadRequestException('An active session already exists');

    await this.prisma.task.update({
      where: { id_userId: { id: taskId, userId } },
      data: { status: TaskStatus.in_progress },
    });

    const session = await this.prisma.focusSession.create({
      data: { userId, taskId, startTime: new Date() },
      include: { task: true },
    });
    this.notifications.emit(
      userId,
      'focus_started',
      'Focus started',
      `Started execution on "${session.task.title}".`,
    );
    return session;
  }

  async stop(userId: string, sessionId: string) {
    const session = await this.prisma.focusSession.findFirst({
      where: { id: sessionId, userId, status: SessionStatus.active },
      include: { task: true },
    });
    if (!session) throw new BadRequestException('Active session not found');
    const endTime = new Date();
    const duration = Math.max(
      1,
      Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000),
    );
    const updated = await this.prisma.focusSession.update({
      where: { id: session.id },
      data: { endTime, duration, status: SessionStatus.completed },
      include: { task: true },
    });
    await this.prisma.task.update({
      where: { id_userId: { id: session.taskId, userId } },
      data: { status: TaskStatus.done },
    });
    this.notifications.emit(
      userId,
      'focus_stopped',
      'Focus completed',
      `Finished "${updated.task.title}" in ${Math.floor(duration / 60)}m ${duration % 60}s.`,
    );
    return updated;
  }

  active(userId: string) {
    return this.prisma.focusSession.findFirst({
      where: { userId, status: SessionStatus.active },
      include: { task: true },
    });
  }
}
