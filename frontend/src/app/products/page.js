'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchProducts, deleteProduct, createProduct, updateProduct, adjustStock } from '../../features/products/productSlice';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProductModal from '../../components/Products/ProductModal';
import StockAdjustModal from '../../components/Products/StockAdjustModal';

export default function Products() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, pagination, isLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [mounted, setMounted] = useState(false);

  // Function to refresh products
  const refreshProducts = useCallback(() => {
    dispatch(fetchProducts({ search, page, limit: 10 }));
  }, [dispatch, search, page]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && mounted) {
      refreshProducts();
    }
  }, [dispatch, search, page, isAuthenticated, mounted, refreshProducts]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsProductModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
      refreshProducts();
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleProductSaved = async (productData) => {
    let result;
    if (modalMode === 'create') {
      result = await dispatch(createProduct(productData));
    } else {
      result = await dispatch(updateProduct({ id: selectedProduct.id, data: productData }));
    }
    
    if (result.payload && !result.error) {
      refreshProducts();
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleStockAdjusted = async (adjustmentData) => {
    const result = await dispatch(adjustStock(adjustmentData));
    if (result.payload && !result.error) {
      refreshProducts();
      setIsStockModalOpen(false);
      setSelectedProduct(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setModalMode('create');
            setIsProductModalOpen(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="w-full sm:max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by name or SKU"
          />
        </div>
      </div>

      <div className="block md:hidden space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1 text-indigo-600 hover:text-indigo-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-1 text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <button
                  onClick={() => handleAdjustStock(product)}
                  className={`text-base font-semibold hover:text-indigo-600 ${
                    product.quantityOnHand === 0 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {product.quantityOnHand}
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-500">Selling Price</p>
                <p className="text-base font-semibold text-gray-900">
                  ${product.sellingPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            
            <div>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.quantityOnHand <= (product.lowStockThreshold || 5)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.quantityOnHand <= (product.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleAdjustStock(product)}
                      className={`hover:text-indigo-600 font-medium ${
                        product.quantityOnHand === 0 ? 'text-red-600' : ''
                      }`}
                    >
                      {product.quantityOnHand}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.quantityOnHand <= (product.lowStockThreshold || 5)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.quantityOnHand <= (product.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.sellingPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * 10, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        mode={modalMode}
        onSave={handleProductSaved}
      />

      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProduct}
        onAdjust={handleStockAdjusted}
      />
    </div>
  );
}