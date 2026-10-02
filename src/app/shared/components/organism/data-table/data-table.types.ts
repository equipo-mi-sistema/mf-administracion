export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  badgeVariant?: (value: any, row: T) => 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  isBadge?: boolean;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}
