import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  unreadCount: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'light',
  notifications: [
    {
      id: '1',
      title: 'Nouveau conducteur',
      message: 'Kouam\u00e9 Jean a soumis sa demande KYC',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Paiement re\u00e7u',
      message: 'Paiement de 150 000 FCFA re\u00e7u via Wave',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'V\u00e9hicule en maintenance',
      message: 'Toyota Hilux AB-1234-CD en maintenance programm\u00e9e',
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ],
  unreadCount: 3,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem('dam_theme', theme);
    }
  },

  addNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
