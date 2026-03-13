'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Key,
  FileText,
  CreditCard,
  Wallet,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  BarChart3,
  Gauge,
  UserCog,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { label: 'Conducteurs', icon: Users, href: '/drivers' },
      { label: 'V\u00e9hicules', icon: Car, href: '/vehicles' },
      { label: 'Locations', icon: Key, href: '/rentals' },
      { label: 'Contrats', icon: FileText, href: '/contracts' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Pr\u00eats', icon: CreditCard, href: '/loans' },
      { label: 'Paiements', icon: Wallet, href: '/payments' },
    ],
  },
  {
    title: 'Op\u00e9rations',
    items: [
      { label: 'Suivi GPS', icon: MapPin, href: '/tracking' },
      { label: 'Incidents', icon: AlertTriangle, href: '/incidents' },
      { label: 'Support', icon: LifeBuoy, href: '/support' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'KYC', icon: Gauge, href: '/kyc' },
      { label: 'Scoring', icon: Gauge, href: '/scoring' },
      { label: 'Utilisateurs', icon: UserCog, href: '/users' },
      { label: 'Param\u00e8tres', icon: Settings, href: '/settings' },
    ],
  },
  {
    title: 'Analytique',
    items: [
      { label: 'Rapports', icon: BarChart3, href: '/analytics' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { admin, logout } = useAuthStore();

  const adminName = admin
    ? `${admin.firstName} ${admin.lastName}`
    : 'Administrateur';

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
          'hidden lg:flex'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary-foreground">DF</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">DAMFlotte</p>
                <p className="text-[10px] text-muted-foreground font-medium">CLD</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const NavLink = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                          sidebarCollapsed && 'justify-center px-2'
                        )}
                      >
                        <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-primary')} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );

                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return NavLink;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3 shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(adminName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{adminName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {admin?.role || 'Admin'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="w-full flex justify-center p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">D\u00e9connexion</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
        >
          <ChevronLeft
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </button>
      </aside>
    </TooltipProvider>
  );
}
