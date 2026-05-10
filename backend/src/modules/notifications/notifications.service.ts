import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotificationsGateway } from './notifications.gateway';
import {
  AppNotification,
  AppNotificationType,
} from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  emit(
    userId: string,
    type: AppNotificationType,
    title: string,
    message: string,
  ) {
    const payload: AppNotification = {
      id: randomUUID(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
    };
    this.gateway.notifyUser(userId, payload);
  }
}
