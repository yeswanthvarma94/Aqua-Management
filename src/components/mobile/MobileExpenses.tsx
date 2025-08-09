import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: 'feed' | 'medicine' | 'equipment' | 'maintenance' | 'labor' | 'utilities' | 'other';
  date: string;
  tankId?: string;
  tankName?: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
}

export function MobileExpenses() {
  const { hapticFeedback } = useMobile();
  const { db } = useDatabase();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedCategory, setSelectedCategory] = useState<'all' | Expense['category']>('all');

  useEffect(() => {
    loadExpenses();
  }, [db, selectedMonth]);

  const loadExpenses = async () => {
    if (!db || !user) return;

    try {
      const result = await db.find({
        selector: { 
          type: 'expense',
          organizationId: user.organizationId,
          date: { $gte: selectedMonth, $lt: selectedMonth + '-32' }
        },
        sort: [{ date: 'desc' }]
      });

      setExpenses(result.docs as Expense[]);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    selectedCategory === 'all' || expense.category === selectedCategory
  );

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feed': return 'bg-green-100 text-green-800';
      case 'medicine': return 'bg-red-100 text-red-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'labor': return 'bg-purple-100 text-purple-800';
      case 'utilities': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => (
    <div className="bg-white rounded-xl p-4 shadow-mobile mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">{expense.description}</h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Amount:</span>
              <span className="font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Date:</span>
              <span>{new Date(expense.date).toLocaleDateString()}</span>
            </div>
            {expense.tankName && (
              <div className="flex items-center justify-between">
                <span>Tank:</span>
                <span>{expense.tankName}</span>
              </div>
            )}
            {expense.notes && (
              <p className="text-gray-500 text-xs mt-2">{expense.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <button
            onClick={() => hapticFeedback('light')}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-900">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{filteredExpenses.length} transactions</p>
              <div className="flex items-center text-sm text-blue-700">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'feed', label: 'Feed' },
            { key: 'medicine', label: 'Medicine' },
            { key: 'equipment', label: 'Equipment' },
            { key: 'maintenance', label: 'Maintenance' }
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Category Breakdown */}
        {selectedCategory === 'all' && Object.keys(categoryTotals).length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-mobile mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">₹{amount.toLocaleString()}</span>
                      <div className="text-xs text-gray-500">
                        {((amount / totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Expense List */}
        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense._id} expense={expense} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory !== 'all' 
                ? `No ${selectedCategory} expenses for ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
                : `No expenses recorded for ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              }
            </p>
            <button
              onClick={() => hapticFeedback('light')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}