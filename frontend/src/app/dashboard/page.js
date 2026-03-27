'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchDashboard } from '../../features/dashboard/dashboardSlice';
import { 
  CubeIcon, 
  ShoppingBagIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { stats, lowStockItems, isLoading } = useSelector((state) => state.dashboard);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated && mounted) {
      dispatch(fetchDashboard());
    }
  }, [dispatch, isAuthenticated, mounted]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-3 sm:ml-5 w-0 flex-1">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-base sm:text-lg font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Welcome back, {user?.organizationName || 'User'}!
        </h1>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={CubeIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Total Quantity"
          value={stats?.totalQuantity || 0}
          icon={ShoppingBagIcon}
          color="text-green-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
        />
      </div>

      {/* Low Stock Items Section - Responsive */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
            Low Stock Items
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Products that are below their low stock threshold
          </p>
        </div>
        
        {lowStockItems && lowStockItems.length > 0 ? (
          <div className="border-t border-gray-200">
            {/* Mobile View - Card Layout */}
            <div className="block md:hidden divide-y divide-gray-200">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="text-base font-semibold text-red-600">{item.quantityOnHand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Threshold</p>
                      <p className="text-base font-semibold text-gray-700">{item.lowStockThreshold}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Threshold
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-red-600 font-semibold">{item.quantityOnHand}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lowStockThreshold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <ExclamationTriangleIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock items</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">All products are above their thresholds</p>
          </div>
        )}
      </div>
    </div>
  );
}