import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(userId: string) {
    const [completedTasks, totalFocusSeconds, distractionCount, tasks] =
      await Promise.all([
        this.prisma.task.count({ where: { userId, status: 'done' } }),
        this.prisma.focusSession.aggregate({
          where: { userId, status: 'completed' },
          _sum: { duration: true },
        }),
        this.prisma.distractionEvent.count({ where: { userId } }),
        this.prisma.task.findMany({
          where: { userId },
          select: { id: true, estimatedMinutes: true, sessions: { select: { duration: true } } },
        }),
      ]);

    const totalFocusMinutes = Math.floor((totalFocusSeconds._sum.duration ?? 0) / 60);
    let efficiencyBonus = 0;
    let totalEstimatedMinutes = 0;
    let totalActualMinutes = 0;
    for (const task of tasks) {
      const actualMinutes =
        task.sessions.reduce((acc, session) => acc + (session.duration ?? 0), 0) / 60;
      if (actualMinutes <= 0) continue;
      const estimatedMinutes = Math.max(1, task.estimatedMinutes);
      totalEstimatedMinutes += estimatedMinutes;
      totalActualMinutes += actualMinutes;
      const ratio = actualMinutes / estimatedMinutes;
      // Reward realistic execution near estimate, penalize very short/very long runs.
      if (ratio >= 0.85 && ratio <= 1.15) {
        efficiencyBonus += 8;
      } else if (ratio >= 0.6 && ratio < 0.85) {
        efficiencyBonus += 2;
      } else if (ratio > 1.15 && ratio <= 1.5) {
        efficiencyBonus += 1;
      } else {
        efficiencyBonus -= 8;
      }
    }
    const efficiencyRatio =
      totalEstimatedMinutes > 0
        ? Number((totalActualMinutes / totalEstimatedMinutes).toFixed(2))
        : 0;
    const productivityScore =
      completedTasks * 40 + totalFocusMinutes * 0.5 - distractionCount * 10 + efficiencyBonus;

    return {
      completedTasks,
      totalFocusMinutes,
      distractionCount,
      efficiencyBonus,
      efficiencyRatio,
      productivityScore: Math.max(0, Number(productivityScore.toFixed(2))),
    };
  }
}
