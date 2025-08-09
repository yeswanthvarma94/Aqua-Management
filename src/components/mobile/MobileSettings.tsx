import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Wifi, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Info,
  HelpCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';

interface MobileSettingsProps {
  onSignOut: () => void;
}

export function MobileSettings({ onSignOut }: MobileSettingsProps) {
  const { hapticFeedback, isOnline, platform } = useMobile();
  const { user } = useAuth();
  const { syncStatus, syncData } = useDatabase();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSync = async () => {
    hapticFeedback('medium');
    await syncData();
  };

  const toggleDarkMode = () => {
    hapticFeedback('light');
    setDarkMode(!darkMode);
  };

  const toggleNotifications = () => {
    hapticFeedback('light');
    setNotifications(!notifications);
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    action, 
    toggle, 
    value, 
    onToggle 
  }: any) => (
    <div className="bg-white rounded-xl p-4 shadow-mobile mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="p-2 bg-gray-100 rounded-lg mr-3">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        
        {toggle ? (
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : action ? (
          <button
            onClick={action}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* User Profile */}
        <div className="bg-white rounded-xl p-4 shadow-mobile mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Role: {user?.role || 'Owner'}</p>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">App Settings</h3>
          
          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Feeding reminders and alerts"
            toggle={true}
            value={notifications}
            onToggle={toggleNotifications}
          />
          
          <SettingItem
            icon={darkMode ? Sun : Moon}
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            toggle={true}
            value={darkMode}
            onToggle={toggleDarkMode}
          />
        </div>

        {/* Data & Sync */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Data & Sync</h3>
          
          <div className="bg-white rounded-xl p-4 shadow-mobile mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <Database className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Sync Data</h3>
                  <p className="text-sm text-gray-600">
                    {syncStatus === 'syncing' ? 'Syncing...' : 
                     syncStatus === 'error' ? 'Sync failed' : 'Last synced recently'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSync}
                disabled={syncStatus === 'syncing' || !isOnline}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>

          <SettingItem
            icon={Wifi}
            title="Network Status"
            subtitle={isOnline ? 'Connected' : 'Offline'}
          />
        </div>

        {/* Security */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Security</h3>
          
          <SettingItem
            icon={Shield}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            action={() => hapticFeedback('light')}
          />
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Support</h3>
          
          <SettingItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get help and contact support"
            action={() => hapticFeedback('light')}
          />
          
          <SettingItem
            icon={Info}
            title="About"
            subtitle={`Version 1.0.0 • Platform: ${platform}`}
            action={() => hapticFeedback('light')}
          />
        </div>

        {/* Sign Out */}
        <div className="mb-8">
          <button
            onClick={() => {
              hapticFeedback('medium');
              onSignOut();
            }}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-600">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}