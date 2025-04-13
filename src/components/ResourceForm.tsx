import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type ResourceRow = Database['public']['Tables']['resources']['Row'];
type ResourceInsert = Database['public']['Tables']['resources']['Insert'];

// Extended location type with address
interface LocationWithAddress {
  lat: number;
  lng: number;
  address: string;
}

interface ResourceFormProps {
  resource?: ResourceRow & { location: LocationWithAddress };
  onSave: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ resource, onSave, onCancel }: ResourceFormProps) {
  const [name, setName] = useState(resource?.name || '');
  const [type, setType] = useState(resource?.type || '');
  const [quantity, setQuantity] = useState(resource?.quantity || 0);
  const [address, setAddress] = useState(resource?.location?.address || '');
  const [lat, setLat] = useState(resource?.location?.lat || 0);
  const [lng, setLng] = useState(resource?.location?.lng || 0);
  const [status, setStatus] = useState<'available' | 'allocated' | 'depleted'>(
    resource?.status || 'available'
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resourceData: ResourceInsert = {
        name,
        type,
        quantity,
        status,
        location: {
          lat,
          lng
        },
      };

      let error;

      if (resource?.id) {
        // Update existing resource
        const { error: updateError } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id);
        
        error = updateError;
      } else {
        // Insert new resource
        const { error: insertError } = await supabase
          .from('resources')
          .insert([resourceData]);
        
        error = insertError;
      }

      if (error) throw error;

      toast.success(resource?.id ? 'Resource updated!' : 'Resource added!');
      onSave();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {resource?.id ? 'Edit Resource' : 'Add New Resource'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a type</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medical">Medical Supplies</option>
            <option value="shelter">Shelter</option>
            <option value="clothing">Clothing</option>
            <option value="tools">Tools</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'available' | 'allocated' | 'depleted')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="depleted">Depleted</option>
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
              step="any"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              step="any"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            {loading ? 'Saving...' : (resource?.id ? 'Update Resource' : 'Add Resource')}
          </button>
        </div>
      </form>
    </div>
  );
} 