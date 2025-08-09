import React, { useState, useEffect } from 'react';
import { Fish, Clock, Plus, Calendar, CheckCircle } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface FeedingRecord {
  _id: string;
  tankId: string;
  tankName: string;
  feedType: string;
  amount: number;
  time: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export function MobileFeeding() {
  const { hapticFeedback } = useMobile();
  const { db } = useDatabase();
  const { user } = useAuth();
  const [feedings, setFeedings] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadFeedings();
  }, [db, selectedDate]);

  const loadFeedings = async () => {
    if (!db || !user) return;

    try {
      const result = await db.find({
        selector: { 
          type: 'feeding',
          organizationId: user.organizationId,
          date: selectedDate
        },
        sort: [{ time: 'asc' }]
      });

      setFeedings(result.docs as FeedingRecord[]);
    } catch (error) {
      console.error('Error loading feedings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedingComplete = async (feeding: FeedingRecord) => {
    if (!db) return;

    hapticFeedback('medium');

    try {
      const updatedFeeding = {
        ...feeding,
        completed: !feeding.completed,
        completedAt: !feeding.completed ? new Date().toISOString() : undefined
      };

      await db.put(updatedFeeding);
      await loadFeedings();
    } catch (error) {
      console.error('Error updating feeding:', error);
    }
  };

  const FeedingCard = ({ feeding }: { feeding: FeedingRecord }) => (
    <div className={`bg-white rounded-xl p-4 shadow-mobile mb-3 border-l-4 ${
      feeding.completed ? 'border-green-500' : 'border-blue-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Fish className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">{feeding.tankName}</h3>
            {feeding.completed && (
              <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{feeding.time}</span>
            </div>
            <p><strong>Feed Type:</strong> {feeding.feedType}</p>
            <p><strong>Amount:</strong> {feeding.amount} kg</p>
            {feeding.notes && (
              <p><strong>Notes:</strong> {feeding.notes}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => toggleFeedingComplete(feeding)}
          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            feeding.completed
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          {feeding.completed ? 'Completed' : 'Mark Done'}
        </button>
      </div>
    </div>
  );

  const completedCount = feedings.filter(f => f.completed).length;
  const totalCount = feedings.length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading feeding schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Feeding Schedule</h1>
          <button
            onClick={() => hapticFeedback('light')}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {feedings.length > 0 ? (
          <div className="space-y-3">
            {feedings.map((feeding) => (
              <FeedingCard key={feeding._id} feeding={feeding} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Fish className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedings scheduled</h3>
            <p className="text-gray-600 mb-6">
              No feeding schedule found for {new Date(selectedDate).toLocaleDateString()}
            </p>
            <button
              onClick={() => hapticFeedback('light')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Feeding Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}