import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryQueryDto } from './dto/history-query.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(userId: string, query: HistoryQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const taskWhere: Prisma.TaskWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.taskId ? { id: query.taskId } : {}),
      ...(startDate || endDate
        ? {
            OR: [
              { createdAt: { gte: startDate, lte: endDate } },
              { dueDate: { gte: startDate, lte: endDate } },
            ],
          }
        : {}),
    };

    const sessionWhere: Prisma.FocusSessionWhereInput = {
      userId,
      ...(query.taskId ? { taskId: query.taskId } : {}),
      ...(startDate || endDate
        ? { startTime: { gte: startDate, lte: endDate } }
        : {}),
    };
    const distractionWhere: Prisma.DistractionEventWhereInput = {
      userId,
      ...(startDate || endDate
        ? { timestamp: { gte: startDate, lte: endDate } }
        : {}),
      ...(query.taskId
        ? { session: { taskId: query.taskId } }
        : {}),
    };

    const [tasks, sessions, distractions, taskTotal, sessionTotal, distractionTotal] = await Promise.all([
      this.prisma.task.findMany({
        where: taskWhere,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.focusSession.findMany({
        where: sessionWhere,
        skip,
        take: pageSize,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.distractionEvent.findMany({
        where: distractionWhere,
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.task.count({ where: taskWhere }),
      this.prisma.focusSession.count({ where: sessionWhere }),
      this.prisma.distractionEvent.count({ where: distractionWhere }),
    ]);
    return {
      tasks,
      sessions,
      distractions,
      page,
      pageSize,
      totals: {
        tasks: taskTotal,
        sessions: sessionTotal,
        distractions: distractionTotal,
      },
      totalPages: {
        tasks: Math.max(1, Math.ceil(taskTotal / pageSize)),
        sessions: Math.max(1, Math.ceil(sessionTotal / pageSize)),
        distractions: Math.max(1, Math.ceil(distractionTotal / pageSize)),
      },
    };
  }
}
