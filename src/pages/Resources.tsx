import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Plus, Filter, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ResourceForm from '../components/ResourceForm';
import type { Database } from '../types/supabase';

type ResourceBase = Database['public']['Tables']['resources']['Row'];

interface Resource extends Omit<ResourceBase, 'location'> {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('resources')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'resources' }, 
        () => fetchResources()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include address
      const resourcesWithAddress = (data || []).map(resource => ({
        ...resource,
        location: {
          ...resource.location,
          address: resource.location?.address || `${resource.location.lat.toFixed(4)}, ${resource.location.lng.toFixed(4)}`
        }
      }));
      
      setResources(resourcesWithAddress);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(resource: Resource) {
    setSelectedResource(resource);
    setShowForm(true);
  }

  function handleAdd() {
    setSelectedResource(null);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedResource(null);
  }

  function handleSaveForm() {
    setShowForm(false);
    setSelectedResource(null);
    fetchResources();
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Resource deleted successfully');
      setDeleteConfirm(null);
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  }

  const filteredResources = resources.filter(resource => {
    // Filter by type
    if (filterType !== 'all' && resource.type !== filterType) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== 'all' && resource.status !== filterStatus) {
      return false;
    }
    
    // Search by name or location
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        resource.name.toLowerCase().includes(searchLower) ||
        resource.location.address.toLowerCase().includes(searchLower) ||
        resource.type.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ResourceForm 
        resource={selectedResource || undefined}
        onSave={handleSaveForm}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        </div>
        
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Resource
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
              placeholder="Search resources..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="food">Food</option>
                <option value="water">Water</option>
                <option value="medical">Medical</option>
                <option value="shelter">Shelter</option>
                <option value="clothing">Clothing</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="depleted">Depleted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
          >
            {deleteConfirm === resource.id ? (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center p-4 z-10 rounded-lg">
                <p className="text-center mb-4">Are you sure you want to delete this resource?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(resource.id)}
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
            
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(resource)}
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(resource.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">Type: {resource.type}</p>
              <p className="text-sm text-gray-600">Quantity: {resource.quantity}</p>
              <p className="text-sm text-gray-600">Location: {resource.location.address}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                resource.status === 'available' 
                  ? 'bg-green-100 text-green-800'
                  : resource.status === 'allocated'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {resource.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No resources found</h3>
          <p className="mt-2 text-gray-500">
            {resources.length === 0 
              ? 'There are currently no resources available.' 
              : 'No resources match your filters.'}
          </p>
        </div>
      )}
    </div>
  );
}