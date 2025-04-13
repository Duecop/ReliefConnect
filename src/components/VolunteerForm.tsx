import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type VolunteerRow = Database['public']['Tables']['volunteers']['Row'];
type VolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];

// Extended location type with address
interface LocationWithAddress {
  lat: number;
  lng: number;
  address: string;
}

interface VolunteerFormProps {
  volunteer?: VolunteerRow & { location: LocationWithAddress };
  currentUserId: string;
  onSave: () => void;
  onCancel: () => void;
}

const AVAILABLE_SKILLS = [
  'First Aid',
  'Search and Rescue',
  'Medical',
  'Transportation',
  'Communication',
  'Logistics',
  'Food Service',
  'Mental Health',
  'Construction',
  'Childcare',
  'Language Translation',
  'Tech Support',
  'Administration'
];

export default function VolunteerForm({ volunteer, currentUserId, onSave, onCancel }: VolunteerFormProps) {
  const [name, setName] = useState(volunteer?.name || '');
  const [skills, setSkills] = useState<string[]>(volunteer?.skills || []);
  const [address, setAddress] = useState(volunteer?.location?.address || '');
  const [lat, setLat] = useState(volunteer?.location?.lat || 0);
  const [lng, setLng] = useState(volunteer?.location?.lng || 0);
  const [status, setStatus] = useState<'active' | 'inactive'>(volunteer?.status || 'active');
  const [currentTask, setCurrentTask] = useState(volunteer?.current_task || '');
  const [loading, setLoading] = useState(false);

  const handleSkillToggle = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const volunteerData: VolunteerInsert = {
        name,
        user_id: volunteer?.user_id || currentUserId,
        skills,
        location: {
          lat,
          lng
        },
        status,
        current_task: currentTask || undefined
      };

      let error;

      if (volunteer?.id) {
        // Update existing volunteer
        const { error: updateError } = await supabase
          .from('volunteers')
          .update(volunteerData)
          .eq('id', volunteer.id);
        
        error = updateError;
      } else {
        // Insert new volunteer
        const { error: insertError } = await supabase
          .from('volunteers')
          .insert([volunteerData]);
        
        error = insertError;
      }

      if (error) throw error;

      toast.success(volunteer?.id ? 'Volunteer updated!' : 'Volunteer added!');
      onSave();
    } catch (error) {
      console.error('Error saving volunteer:', error);
      toast.error('Failed to save volunteer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {volunteer?.id ? 'Edit Volunteer' : 'Add New Volunteer'}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_SKILLS.map(skill => (
              <div key={skill} className="flex items-center">
                <input
                  id={`skill-${skill}`}
                  type="checkbox"
                  checked={skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`skill-${skill}`} className="ml-2 text-sm text-gray-700">
                  {skill}
                </label>
              </div>
            ))}
          </div>
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
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="currentTask" className="block text-sm font-medium text-gray-700">
            Current Task (optional)
          </label>
          <textarea
            id="currentTask"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe the volunteer's current assignment"
          />
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
            {loading ? 'Saving...' : (volunteer?.id ? 'Update Volunteer' : 'Add Volunteer')}
          </button>
        </div>
      </form>
    </div>
  );
} 