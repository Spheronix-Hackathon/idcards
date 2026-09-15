'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Search } from 'lucide-react';

export function NavbarButtons() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      activeStyle: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25',
      inactiveStyle:
        'bg-blue-50/90 text-blue-700 border-blue-200/90 hover:bg-blue-600 hover:text-white hover:border-blue-600',
    },
    {
      href: '/register',
      label: 'Register',
      icon: UserPlus,
      activeStyle: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25',
      inactiveStyle:
        'bg-purple-50/90 text-purple-700 border-purple-200/90 hover:bg-purple-600 hover:text-white hover:border-purple-600',
    },
    {
      href: '/retrieve-id',
      label: 'Retrieve ID',
      icon: Search,
      activeStyle: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25',
      inactiveStyle:
        'bg-sky-50/90 text-sky-700 border-sky-200/90 hover:bg-sky-600 hover:text-white hover:border-sky-600',
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 sm:gap-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 shadow-sm active:scale-95 ${
              isActive ? `${item.activeStyle} scale-[1.02]` : item.inactiveStyle
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isActive ? 'text-white' : 'text-current'
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
