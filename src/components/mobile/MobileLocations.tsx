import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface Location {
  _id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  tankCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function MobileLocations() {
  const { hapticFeedback } = useMobile();
  const { db } = useDatabase();
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, [db]);

  const loadLocations = async () => {
    if (!db || !user) return;

    try {
      const result = await db.find({
        selector: { 
          type: 'location',
          organizationId: user.organizationId 
        },
        sort: [{ createdAt: 'desc' }]
      });

      setLocations(result.docs as Location[]);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLocation = () => {
    hapticFeedback('light');
    setShowAddForm(true);
  };

  const LocationCard = ({ location }: { location: Location }) => (
    <div className="bg-white rounded-xl p-4 shadow-mobile mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">{location.name}</h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              location.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {location.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{location.address}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{location.tankCount} tanks</span>
            <span className="mx-2">•</span>
            <span>Added {new Date(location.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => hapticFeedback('light')}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => hapticFeedback('medium')}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Locations</h1>
          <button
            onClick={handleAddLocation}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <LocationCard key={location._id} location={location} />
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first location to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddLocation}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Location
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}