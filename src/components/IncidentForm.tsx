import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type IncidentRow = Database['public']['Tables']['incidents']['Row'];
type IncidentInsert = Database['public']['Tables']['incidents']['Insert'];

// Extended location type that includes address
interface LocationWithAddress {
  lat: number;
  lng: number;
  address: string;
}

interface IncidentFormProps {
  incident?: IncidentRow & { location: LocationWithAddress };
  onSave: () => void;
  onCancel: () => void;
}

export default function IncidentForm({ incident, onSave, onCancel }: IncidentFormProps) {
  const [title, setTitle] = useState(incident?.title || '');
  const [description, setDescription] = useState(incident?.description || '');
  const [type, setType] = useState(incident?.type || '');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>(incident?.severity || 'medium');
  const [address, setAddress] = useState(incident?.location?.address || '');
  const [lat, setLat] = useState(incident?.location?.lat || 0);
  const [lng, setLng] = useState(incident?.location?.lng || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If address is provided, try to geocode it
    if (address && !lat && !lng) {
      geocodeAddress(address);
    }
  }, [address]);

  const geocodeAddress = async (address: string) => {
    try {
      // In a real app, you would use a geocoding service
      // For this example, we'll simulate it with random coordinates
      setLat(Math.random() * 10 + 30); // Random latitude around 30-40
      setLng(Math.random() * 10 - 80); // Random longitude around -70 to -80
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Failed to geocode address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only include lat and lng in the location object for the database
      const incidentData: IncidentInsert = {
        title,
        description,
        type,
        severity,
        location: { 
          lat, 
          lng
        },
      };

      let error;

      if (incident?.id) {
        // Update existing incident
        const { error: updateError } = await supabase
          .from('incidents')
          .update(incidentData)
          .eq('id', incident.id);
        
        error = updateError;
      } else {
        // Insert new incident
        const { error: insertError } = await supabase
          .from('incidents')
          .insert([{ ...incidentData, status: 'active' }]);
        
        error = insertError;
      }

      if (error) throw error;

      toast.success(incident?.id ? 'Incident updated!' : 'Incident reported!');
      onSave();
    } catch (error) {
      console.error('Error saving incident:', error);
      toast.error('Failed to save incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {incident?.id ? 'Edit Incident' : 'Report New Incident'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Incident Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a type</option>
            <option value="flood">Flood</option>
            <option value="fire">Fire</option>
            <option value="earthquake">Earthquake</option>
            <option value="hurricane">Hurricane</option>
            <option value="tornado">Tornado</option>
            <option value="medical">Medical Emergency</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Location Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter full address"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              id="lat"
              type="number"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="any"
              required
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              id="lng"
              type="number"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="any"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (incident?.id ? 'Update Incident' : 'Report Incident')}
          </button>
        </div>
      </form>
    </div>
  );
} 