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
  X,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Conducteurs', icon: Users, href: '/drivers' },
  { label: 'V\u00e9hicules', icon: Car, href: '/vehicles' },
  { label: 'Locations', icon: Key, href: '/rentals' },
  { label: 'Contrats', icon: FileText, href: '/contracts' },
  { label: 'KYC', icon: Gauge, href: '/kyc' },
  { label: 'Pr\u00eats', icon: CreditCard, href: '/loans' },
  { label: 'Paiements', icon: Wallet, href: '/payments' },
  { label: 'Suivi GPS', icon: MapPin, href: '/tracking' },
  { label: 'Incidents', icon: AlertTriangle, href: '/incidents' },
  { label: 'Support', icon: LifeBuoy, href: '/support' },
  { label: 'Rapports', icon: BarChart3, href: '/analytics' },
  { label: 'Scoring', icon: Gauge, href: '/scoring' },
  { label: 'Utilisateurs', icon: UserCog, href: '/users' },
  { label: 'Param\u00e8tres', icon: Settings, href: '/settings' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  return (
    <Sheet open={sidebarMobileOpen} onOpenChange={setSidebarMobileOpen}>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">DF</span>
            </div>
            <div>
              <p className="text-sm font-bold">DAMFlotte</p>
              <p className="text-[10px] text-muted-foreground font-medium">CLD</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
