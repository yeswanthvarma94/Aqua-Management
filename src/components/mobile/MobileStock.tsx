import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface StockItem {
  _id: string;
  name: string;
  category: 'feed' | 'medicine' | 'equipment' | 'chemical';
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  expiryDate?: string;
  lastUpdated: string;
  createdAt: string;
}

export function MobileStock() {
  const { hapticFeedback } = useMobile();
  const { db } = useDatabase();
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | StockItem['category']>('all');

  useEffect(() => {
    loadStock();
  }, [db]);

  const loadStock = async () => {
    if (!db || !user) return;

    try {
      const result = await db.find({
        selector: { 
          type: 'stock',
          organizationId: user.organizationId 
        },
        sort: [{ name: 'asc' }]
      });

      setStockItems(result.docs as StockItem[]);
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (item: StockItem, change: number) => {
    if (!db) return;

    hapticFeedback('light');

    try {
      const updatedItem = {
        ...item,
        currentStock: Math.max(0, item.currentStock + change),
        lastUpdated: new Date().toISOString()
      };

      await db.put(updatedItem);
      await loadStock();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minStock);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feed': return 'bg-green-100 text-green-800';
      case 'medicine': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'chemical': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const StockCard = ({ item }: { item: StockItem }) => {
    const isLowStock = item.currentStock <= item.minStock;
    const expiringSoon = isExpiringSoon(item.expiryDate);
    const expired = isExpired(item.expiryDate);

    return (
      <div className="bg-white rounded-xl p-4 shadow-mobile mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
            </div>
            
            {item.supplier && (
              <p className="text-sm text-gray-600 mb-1">Supplier: {item.supplier}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm">
              <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                {item.currentStock} {item.unit}
              </span>
              <span className="text-gray-500">Min: {item.minStock} {item.unit}</span>
              <span className="text-gray-500">₹{item.costPerUnit}/{item.unit}</span>
            </div>

            {/* Alerts */}
            <div className="mt-2 space-y-1">
              {isLowStock && (
                <div className="flex items-center text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Low stock alert
                </div>
              )}
              {expired && (
                <div className="flex items-center text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expired
                </div>
              )}
              {expiringSoon && !expired && (
                <div className="flex items-center text-yellow-600 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expires in {Math.ceil((new Date(item.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Level Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Stock Level</span>
            <span className="text-xs text-gray-600">
              {item.minStock > 0 ? Math.round((item.currentStock / item.minStock) * 100) : 100}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                isLowStock ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${item.minStock > 0 ? Math.min((item.currentStock / (item.minStock * 2)) * 100, 100) : 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateStock(item, -1)}
              disabled={item.currentStock <= 0}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateStock(item, 1)}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Updated: {new Date(item.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Stock Management</h1>
          <button
            onClick={() => hapticFeedback('light')}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'feed', label: 'Feed' },
            { key: 'medicine', label: 'Medicine' },
            { key: 'equipment', label: 'Equipment' },
            { key: 'chemical', label: 'Chemical' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                hapticFeedback('light');
                setSelectedCategory(tab.key as any);
              }}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="font-medium text-red-800">Low Stock Alert</p>
                <p className="text-sm text-red-700">{lowStockItems.length} items need restocking</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <StockCard key={item._id} item={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stock items found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Add your first stock item to get started'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => hapticFeedback('light')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Stock Item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}