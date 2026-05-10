import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateTaskDto,
  ListTasksQueryDto,
  UpdateTaskDto,
} from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(userId: string, query: ListTasksQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 10, 50);
    const skip = (page - 1) * pageSize;

    const where: Prisma.TaskWhereInput = { userId };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    const now = query.date ? new Date(query.date) : new Date();
    if (query.period && query.period !== 'all') {
      const start = new Date(now);
      const end = new Date(now);
      if (query.period === 'day') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (query.period === 'week') {
        const day = start.getDay();
        const diffToMonday = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        end.setTime(start.getTime());
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (query.period === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      }
      where.OR = [
        ...(where.OR ?? []),
        { dueDate: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async create(userId: string, dto: CreateTaskDto) {
    const duplicate = await this.prisma.task.findFirst({
      where: {
        userId,
        title: {
          equals: dto.title.trim(),
          mode: 'insensitive',
        },
      },
    });
    if (duplicate) {
      throw new BadRequestException('Task title already exists for this user');
    }
    const task = await this.prisma.task.create({
      data: {
        ...dto,
        title: dto.title.trim(),
        userId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
    this.notifications.emit(
      userId,
      'task_created',
      'Task created',
      `"${task.title}" added to your daily plan.`,
    );
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    if (dto.title) {
      const duplicate = await this.prisma.task.findFirst({
        where: {
          userId,
          id: { not: id },
          title: {
            equals: dto.title.trim(),
            mode: 'insensitive',
          },
        },
      });
      if (duplicate) {
        throw new BadRequestException('Task title already exists for this user');
      }
    }
    const task = await this.prisma.task.update({
      where: { id_userId: { id, userId } },
      data: {
        ...dto,
        title: dto.title?.trim(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    this.notifications.emit(
      userId,
      'task_updated',
      'Task updated',
      `"${task.title}" was updated.`,
    );
    return task;
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.delete({ where: { id_userId: { id, userId } } });
    this.notifications.emit(
      userId,
      'task_deleted',
      'Task removed',
      `"${task.title}" was deleted.`,
    );
    return task;
  }
}
