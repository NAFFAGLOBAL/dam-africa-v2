'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarProps {
  admin?: {
    name: string;
    role: string;
  };
}

export default function Sidebar({ admin }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: '📊' },
    { name: 'Conducteurs', href: '/drivers', icon: '👥' },
    { name: 'Vérification KYC', href: '/kyc', icon: '📄' },
    { name: 'Prêts', href: '/loans', icon: '💰' },
    { name: 'Paiements', href: '/payments', icon: '💳' },
    { name: 'Scores de Crédit', href: '/credit', icon: '📈' },
    { name: 'Véhicules', href: '/vehicles', icon: '🚗' },
    { name: 'Rapports', href: '/reports', icon: '📑' },
    { name: 'Paramètres', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">DAM Africa</h1>
            <p className="text-sm text-gray-500 mt-1">IVORY-FLEET AI</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                      transition-colors duration-200
                      ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Admin info and logout */}
          <div className="p-4 border-t border-gray-200">
            {admin && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
