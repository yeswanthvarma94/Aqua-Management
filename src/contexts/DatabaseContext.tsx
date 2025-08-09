import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { useAuth } from './AuthContext';

// Enable PouchDB plugins
PouchDB.plugin(PouchDBFind);

interface DatabaseContextType {
  db: PouchDB.Database | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncData: () => Promise<void>;
  isOffline: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<PouchDB.Database | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isOffline, setIsOffline] = useState(false);
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      initializeDatabase();
    } else {
      // Clean up database when user logs out
      if (db) {
        db.close();
        setDb(null);
      }
    }
  }, [user, session]);

  const initializeDatabase = async () => {
    try {
      // Create local database
      const localDB = new PouchDB(`aqua_data_${user?.id}`, {
        auto_compaction: true,
      });

      // Create indexes for common queries
      await localDB.createIndex({
        index: { fields: ['type', 'organizationId'] }
      });

      await localDB.createIndex({
        index: { fields: ['type', 'createdAt'] }
      });

      await localDB.createIndex({
        index: { fields: ['type', 'date'] }
      });

      setDb(localDB);

      // Start sync if online
      if (navigator.onLine) {
        syncData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  const syncData = async () => {
    if (!db || !user || !session) return;

    setSyncStatus('syncing');
    
    try {
      // In a real implementation, you would sync with Supabase here
      // For now, we'll just simulate a sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatus('idle');
      setIsOffline(false);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setIsOffline(true);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (db) syncData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  const value = {
    db,
    syncStatus,
    syncData,
    isOffline,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}