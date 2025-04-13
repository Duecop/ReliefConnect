import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Search, Plus, Filter, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import VolunteerForm from '../components/VolunteerForm';
import type { Database } from '../types/supabase';

type VolunteerBase = Database['public']['Tables']['volunteers']['Row'];

// Extended volunteer type with address in location
interface Volunteer extends Omit<VolunteerBase, 'location'> {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    checkUser();
    fetchVolunteers();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('volunteers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'volunteers' }, 
        () => fetchVolunteers()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchVolunteers() {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include address
      const volunteersWithAddress = (data || []).map(volunteer => ({
        ...volunteer,
        location: {
          ...volunteer.location,
          address: volunteer.location?.address || `${volunteer.location.lat.toFixed(4)}, ${volunteer.location.lng.toFixed(4)}`
        }
      }));
      
      setVolunteers(volunteersWithAddress);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(volunteer: Volunteer) {
    setSelectedVolunteer(volunteer);
    setShowForm(true);
  }

  function handleAdd() {
    setSelectedVolunteer(null);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedVolunteer(null);
  }

  function handleSaveForm() {
    setShowForm(false);
    setSelectedVolunteer(null);
    fetchVolunteers();
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Volunteer deleted successfully');
      setDeleteConfirm(null);
      fetchVolunteers();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      toast.error('Failed to delete volunteer');
    }
  }

  // Available skills for filtering
  const allSkills = [...new Set(volunteers.flatMap(v => v.skills || []))].sort();

  const filteredVolunteers = volunteers.filter(volunteer => {
    // Filter by status
    if (filterStatus !== 'all' && volunteer.status !== filterStatus) {
      return false;
    }
    
    // Filter by skill
    if (filterSkill !== 'all' && !(volunteer.skills || []).includes(filterSkill)) {
      return false;
    }
    
    // Search by name or location
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        volunteer.name.toLowerCase().includes(searchLower) ||
        volunteer.location.address.toLowerCase().includes(searchLower) ||
        (volunteer.current_task || '').toLowerCase().includes(searchLower) ||
        (volunteer.skills || []).some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <VolunteerForm 
        volunteer={selectedVolunteer || undefined}
        currentUserId={currentUserId}
        onSave={handleSaveForm}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        </div>
        
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          disabled={!currentUserId}
        >
          <Plus size={16} />
          Add Volunteer
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search volunteers..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {allSkills.length > 0 && (
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="bg-white rounded-lg shadow-md p-6 space-y-4 relative"
          >
            {deleteConfirm === volunteer.id ? (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-4 z-10 rounded-lg">
                <p className="text-center mb-4">Are you sure you want to delete this volunteer?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(volunteer.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {volunteer.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Status: <span className={volunteer.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {volunteer.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(volunteer)}
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(volunteer.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {volunteer.skills && volunteer.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {volunteer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {volunteer.current_task && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Current Task
                </h4>
                <p className="text-sm text-gray-600">{volunteer.current_task}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700">Location</h4>
              <p className="text-sm text-gray-600">
                {volunteer.location.address}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No volunteers found</h3>
          <p className="mt-2 text-gray-500">
            {volunteers.length === 0 
              ? 'There are currently no volunteers registered.' 
              : 'No volunteers match your filters.'}
          </p>
        </div>
      )}
    </div>
  );
}