export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  exact?: boolean;
  children?: MenuItem[];
  isOpen?: boolean;
}
