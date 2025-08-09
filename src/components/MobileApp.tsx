import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Fish, 
  DollarSign, 
  Package, 
  Settings,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';
import { MobileDashboard } from './mobile/MobileDashboard';
import { MobileLocations } from './mobile/MobileLocations';
import { MobileTanks } from './mobile/MobileTanks';
import { MobileFeeding } from './mobile/MobileFeeding';
import { MobileStock } from './mobile/MobileStock';
import { MobileExpenses } from './mobile/MobileExpenses';
import { MobileSettings } from './mobile/MobileSettings';
import { useMobile } from '../hooks/useMobile';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'locations', label: 'Locations', icon: MapPin, path: '/locations' },
  { id: 'tanks', label: 'Tanks', icon: Fish, path: '/tanks' },
  { id: 'stock', label: 'Stock', icon: Package, path: '/stock' },
  { id: 'expenses', label: 'Expenses', icon: DollarSign, path: '/expenses' },
];

export function MobileApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback, isOnline, batteryLevel } = useMobile();
  const { user, signOut } = useAuth();
  const { syncStatus } = useDatabase();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navigationItems.find(item => item.path === currentPath);
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [location.pathname]);

  const handleTabPress = (item: typeof navigationItems[0]) => {
    hapticFeedback('light');
    setActiveTab(item.id);
    navigate(item.path);
  };

  const handleSignOut = async () => {
    hapticFeedback('medium');
    await signOut();
    navigate('/login');
  };

  return (
    <div className="mobile-app h-screen-safe bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="status-bar bg-blue-600 text-white px-4 py-2 flex justify-between items-center text-sm pt-safe-top">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Aqua Manager</span>
          {syncStatus === 'syncing' && (
            <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-300" />
          )}
          <Signal className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          {batteryLevel && (
            <span className="text-xs">{Math.round(batteryLevel * 100)}%</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<MobileDashboard />} />
          <Route path="/locations" element={<MobileLocations />} />
          <Route path="/tanks" element={<MobileTanks />} />
          <Route path="/feeding" element={<MobileFeeding />} />
          <Route path="/stock" element={<MobileStock />} />
          <Route path="/expenses" element={<MobileExpenses />} />
          <Route path="/settings" element={<MobileSettings onSignOut={handleSignOut} />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav bg-white border-t border-gray-200 pb-safe-bottom">
        <div className="flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabPress(item)}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => {
              hapticFeedback('light');
              navigate('/settings');
            }}
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center transition-colors ${
              location.pathname === '/settings'
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className={`w-6 h-6 mb-1 ${location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-600'}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}