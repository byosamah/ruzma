
export interface Notification {
  id: string;
  user_id: string;
  type: 'payment_proof' | 'deadline_warning' | 'project_limit' | 'storage_limit';
  title: string;
  message: string;
  related_project_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationAction {
  onClick: () => void;
  route: string;
}
