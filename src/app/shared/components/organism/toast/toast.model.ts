export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
