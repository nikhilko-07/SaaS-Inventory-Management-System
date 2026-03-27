'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../../features/settings/settingSlice';
import { Toaster } from 'react-hot-toast';

export default function Settings() {
  const dispatch = useDispatch();
  const { settings, isLoading } = useSelector((state) => state.settings);
  const [threshold, setThreshold] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setThreshold(settings.defaultLowStockThreshold);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await dispatch(updateSettings({ defaultLowStockThreshold: parseInt(threshold) }));
    setIsSaving(false);
  };

  if (isLoading && !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster position="top-right" />
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Global Settings</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Configure default settings for your inventory management system.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                Default Low Stock Threshold
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="threshold"
                  id="threshold"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter threshold value"
                  min="0"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Products will be marked as low stock when quantity is at or below this value,
                unless a product has its own custom threshold.
              </p>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Settings</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Default Low Stock Threshold</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{settings?.defaultLowStockThreshold || 5}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}