import { MenuItem } from './menu.model';

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
  },
  {
    label: 'Usuarios',
    route: '/users',
    permission: 'users.read',
  },
];
