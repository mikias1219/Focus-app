import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FocusSessionsModule } from './modules/focus-sessions/focus-sessions.module';
import { DistractionsModule } from './modules/distractions/distractions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HistoryModule } from './modules/history/history.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Optional backend/.env overrides repo-root ../.env (Nest merges last file wins on conflicts).
      envFilePath: [join(process.cwd(), '.env'), join(process.cwd(), '..', '.env')],
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    FocusSessionsModule,
    DistractionsModule,
    AnalyticsModule,
    HistoryModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
