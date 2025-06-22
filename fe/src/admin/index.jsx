import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/clerk-react';

export default function Admin() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      exact: true,
    },
    {
      name: 'Companies',
      icon: Building2,
      path: '/admin/companies',
    },
    {
      name: 'Agents',
      icon: Users,
      path: '/admin/agents',
    },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          {!sidebarCollapsed && (
            <h1 className='text-xl font-bold text-gray-800'>Admin Panel</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className='p-4'>
          <ul className='space-y-2'>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} className='flex-shrink-0' />
                    {!sidebarCollapsed && (
                      <span className='ml-3 font-medium'>{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <Menu size={20} />
              </button>
              <h2 className='text-lg font-semibold text-gray-800'>
                {menuItems.find((item) => isActive(item))?.name || 'Dashboard'}
              </h2>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto p-6'>
          <div className='max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
