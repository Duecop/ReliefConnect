import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { LogOut, Save, Loader, User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [volunteerId, setVolunteerId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        
        // First, check if the user has a volunteer record
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteers')
          .select('id, name')
          .eq('user_id', user.id)
          .single();
        
        if (volunteerError && volunteerError.code !== 'PGRST116') {
          // PGRST116 is the error for no rows returned, which is fine
          console.error('Error fetching volunteer data:', volunteerError);
        }
        
        if (volunteerData) {
          setVolunteerId(volunteerData.id);
          setName(volunteerData.name);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user.id]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // If the user has a volunteer record, update it
      if (volunteerId) {
        const { error } = await supabase
          .from('volunteers')
          .update({ name })
          .eq('id', volunteerId);
        
        if (error) throw error;
      } else {
        // Create a new volunteer record
        const { error: insertError } = await supabase
          .from('volunteers')
          .insert([{
            user_id: user.id,
            name,
            skills: [],
            location: {
              lat: 0,
              lng: 0
            },
            status: 'active'
          }]);
        
        if (insertError) throw insertError;
        
        // Get the new volunteer ID
        const { data: newVolunteer, error: fetchError } = await supabase
          .from('volunteers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        setVolunteerId(newVolunteer.id);
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
      
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Email can't be changed</p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
      
      {volunteerId && (
        <p className="mt-4 text-sm text-gray-600">
          You're registered as a volunteer. Visit the Volunteers page to update your skills and availability.
        </p>
      )}
    </div>
  );
} 