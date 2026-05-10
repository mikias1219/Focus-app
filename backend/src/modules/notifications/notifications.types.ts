export type AppNotificationType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'focus_started'
  | 'focus_stopped'
  | 'distraction_logged'
  | 'profile_updated';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  createdAt: string;
}
