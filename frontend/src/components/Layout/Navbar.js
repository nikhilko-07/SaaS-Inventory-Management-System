'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '../../features/auth/authSlice';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Products', href: '/products' },
  { name: 'Settings', href: '/settings' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
    setMobileMenuOpen(false);
  };

  // Don't render anything on server
  if (!isClient) {
    return null;
  }

  // Don't show navbar on auth pages or if not authenticated
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-white text-xl font-bold">
                StockFlow
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop Right Section */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.organizationName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-gray-900 border-indigo-500 text-white'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.organizationName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.organizationName}</div>
                <div className="text-sm font-medium text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}