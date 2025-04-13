import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import UserProfile from '../components/UserProfile';
import { User } from '@supabase/supabase-js';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    }
    
    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // This shouldn't happen as we redirect in useEffect, but just in case
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <UserProfile user={user} />
    </div>
  );
} 