import React, { useState, useEffect } from 'react';
import { 
  Fish, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalTanks: number;
  activeTanks: number;
  totalFish: number;
  todayFeedings: number;
  pendingTasks: number;
  monthlyExpenses: number;
  avgTemperature: number;
  avgPh: number;
}

export function MobileDashboard() {
  const { hapticFeedback, isOnline } = useMobile();
  const { db, syncData } = useDatabase();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTanks: 0,
    activeTanks: 0,
    totalFish: 0,
    todayFeedings: 0,
    pendingTasks: 0,
    monthlyExpenses: 0,
    avgTemperature: 0,
    avgPh: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [db]);

  const loadDashboardData = async () => {
    if (!db) return;

    try {
      // Load tanks
      const tanksResult = await db.find({
        selector: { type: 'tank', organizationId: user?.organizationId }
      });
      
      // Load feeding records for today
      const today = new Date().toISOString().split('T')[0];
      const feedingsResult = await db.find({
        selector: { 
          type: 'feeding',
          organizationId: user?.organizationId,
          date: { $gte: today }
        }
      });

      // Load expenses for current month
      const currentMonth = new Date().toISOString().substring(0, 7);
      const expensesResult = await db.find({
        selector: {
          type: 'expense',
          organizationId: user?.organizationId,
          date: { $gte: currentMonth }
        }
      });

      // Calculate stats
      const tanks = tanksResult.docs;
      const activeTanks = tanks.filter(tank => tank.status === 'active');
      const totalFish = tanks.reduce((sum, tank) => sum + (tank.fishCount || 0), 0);
      const monthlyExpenses = expensesResult.docs.reduce((sum, expense) => sum + expense.amount, 0);
      
      setStats({
        totalTanks: tanks.length,
        activeTanks: activeTanks.length,
        totalFish,
        todayFeedings: feedingsResult.docs.length,
        pendingTasks: 3, // Mock data
        monthlyExpenses,
        avgTemperature: 26.5, // Mock data
        avgPh: 7.2 // Mock data
      });

      // Load recent activities
      const activitiesResult = await db.find({
        selector: { 
          type: { $in: ['feeding', 'expense', 'tank_update'] },
          organizationId: user?.organizationId
        },
        sort: [{ createdAt: 'desc' }],
        limit: 5
      });
      
      setRecentActivities(activitiesResult.docs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    hapticFeedback('medium');
    setIsRefreshing(true);
    
    try {
      if (isOnline) {
        await syncData();
      }
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <div className="bg-white rounded-xl p-4 shadow-mobile">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-dashboard h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-blue-100 text-sm">Welcome back, {user?.name || 'User'}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Fish}
            title="Total Tanks"
            value={stats.totalTanks}
            subtitle={`${stats.activeTanks} active`}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Fish"
            value={stats.totalFish.toLocaleString()}
            subtitle="Across all tanks"
            color="green"
          />
          <StatCard
            icon={Droplets}
            title="Today's Feedings"
            value={stats.todayFeedings}
            subtitle="Completed"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Expenses"
            value={`₹${stats.monthlyExpenses.toLocaleString()}`}
            subtitle="This month"
            color="orange"
          />
        </div>

        {/* Water Quality */}
        <div className="bg-white rounded-xl p-4 shadow-mobile">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Water Quality</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="font-semibold">{stats.avgTemperature}°C</p>
              </div>
            </div>
            <div className="flex items-center">
              <Droplets className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">pH Level</p>
                <p className="font-semibold">{stats.avgPh}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.pendingTasks > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="font-medium text-yellow-800">Pending Tasks</p>
                <p className="text-sm text-yellow-700">{stats.pendingTasks} tasks require attention</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-4 shadow-mobile">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {activity.type === 'feeding' && 'Feeding completed'}
                        {activity.type === 'expense' && 'Expense recorded'}
                        {activity.type === 'tank_update' && 'Tank updated'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-mobile">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              <Plus className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">Add Tank</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <Fish className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-600 font-medium">Record Feeding</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}