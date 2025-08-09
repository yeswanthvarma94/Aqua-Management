import React, { useState, useEffect } from 'react';
import { Fish, Plus, Thermometer, Droplets, TrendingUp, AlertCircle } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface Tank {
  _id: string;
  name: string;
  locationId: string;
  locationName: string;
  species: string;
  fishCount: number;
  capacity: number;
  temperature: number;
  ph: number;
  oxygenLevel: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastFed: string;
  createdAt: string;
}

export function MobileTanks() {
  const { hapticFeedback } = useMobile();
  const { db } = useDatabase();
  const { user } = useAuth();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'maintenance'>('all');

  useEffect(() => {
    loadTanks();
  }, [db]);

  const loadTanks = async () => {
    if (!db || !user) return;

    try {
      const result = await db.find({
        selector: { 
          type: 'tank',
          organizationId: user.organizationId 
        },
        sort: [{ createdAt: 'desc' }]
      });

      setTanks(result.docs as Tank[]);
    } catch (error) {
      console.error('Error loading tanks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTanks = tanks.filter(tank => 
    filter === 'all' || tank.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatus = (tank: Tank) => {
    const tempOk = tank.temperature >= 24 && tank.temperature <= 30;
    const phOk = tank.ph >= 6.5 && tank.ph <= 8.5;
    const oxygenOk = tank.oxygenLevel >= 5;

    if (tempOk && phOk && oxygenOk) return { status: 'good', color: 'text-green-600' };
    if (!tempOk || !phOk || !oxygenOk) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
  };

  const TankCard = ({ tank }: { tank: Tank }) => {
    const health = getHealthStatus(tank);
    const utilizationPercent = (tank.fishCount / tank.capacity) * 100;

    return (
      <div className="bg-white rounded-xl p-4 shadow-mobile mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Fish className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">{tank.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{tank.locationName}</p>
            <p className="text-sm text-gray-500">{tank.species}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tank.status)}`}>
              {tank.status}
            </span>
            <div className={`flex items-center ${health.color}`}>
              {health.status === 'critical' && <AlertCircle className="w-4 h-4 mr-1" />}
              <span className="text-xs font-medium capitalize">{health.status}</span>
            </div>
          </div>
        </div>

        {/* Tank Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Thermometer className="w-4 h-4 text-red-500 mr-1" />
            </div>
            <p className="text-xs text-gray-600">Temperature</p>
            <p className="font-semibold text-sm">{tank.temperature}°C</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Droplets className="w-4 h-4 text-blue-500 mr-1" />
            </div>
            <p className="text-xs text-gray-600">pH Level</p>
            <p className="font-semibold text-sm">{tank.ph}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            </div>
            <p className="text-xs text-gray-600">Oxygen</p>
            <p className="font-semibold text-sm">{tank.oxygenLevel} mg/L</p>
          </div>
        </div>

        {/* Fish Count and Utilization */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Fish Count</span>
            <span className="text-sm font-medium">{tank.fishCount.toLocaleString()} / {tank.capacity.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                utilizationPercent > 90 ? 'bg-red-500' : 
                utilizationPercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{utilizationPercent.toFixed(1)}% capacity</p>
        </div>

        {/* Last Fed */}
        <div className="text-xs text-gray-500">
          Last fed: {new Date(tank.lastFed).toLocaleString()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tanks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Tanks</h1>
          <button
            onClick={() => hapticFeedback('light')}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'maintenance', label: 'Maintenance' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                hapticFeedback('light');
                setFilter(tab.key as any);
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
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
        {filteredTanks.length > 0 ? (
          filteredTanks.map((tank) => (
            <TankCard key={tank._id} tank={tank} />
          ))
        ) : (
          <div className="text-center py-12">
            <Fish className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tanks found</h3>
            <p className="text-gray-600 mb-6">
              {filter !== 'all' 
                ? `No ${filter} tanks found` 
                : 'Add your first tank to get started'
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => hapticFeedback('light')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Tank
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}