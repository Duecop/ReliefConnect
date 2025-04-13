import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Search, Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import IncidentForm from '../components/IncidentForm';
import type { Database } from '../types/supabase';

// Base incident type from the database
type IncidentBase = Database['public']['Tables']['incidents']['Row'];

// Extended incident type with address in location
interface Incident extends Omit<IncidentBase, 'location'> {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    fetchIncidents();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('incidents')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'incidents' }, 
        () => fetchIncidents()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchIncidents() {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include address
      const incidentsWithAddress = (data || []).map(incident => ({
        ...incident,
        location: {
          ...incident.location,
          address: incident.location?.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`
        }
      }));
      
      setIncidents(incidentsWithAddress);
    } catch (error) {
      toast.error('Failed to fetch incidents');
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(incident: Incident) {
    setSelectedIncident(incident);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedIncident(null);
  }

  function handleSaveForm() {
    setShowForm(false);
    setSelectedIncident(null);
    fetchIncidents();
  }

  const filteredIncidents = incidents.filter(incident => {
    // Filter by status
    if (filterStatus !== 'all' && incident.status !== filterStatus) {
      return false;
    }
    
    // Filter by severity
    if (filterSeverity !== 'all' && incident.severity !== filterSeverity) {
      return false;
    }
    
    // Search by title or location
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        incident.title.toLowerCase().includes(searchLower) ||
        incident.location.address.toLowerCase().includes(searchLower) ||
        incident.type.toLowerCase().includes(searchLower)
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
      <IncidentForm 
        incident={selectedIncident || undefined}
        onSave={handleSaveForm}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Active Incidents</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          Report Incident
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
              placeholder="Search incidents..."
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
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No incidents found</h3>
          <p className="mt-2 text-gray-500">
            {incidents.length === 0 
              ? 'There are currently no reported incidents.' 
              : 'No incidents match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              onClick={() => handleEdit(incident)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{incident.location.address}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                  incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {incident.severity}
                </span>
              </div>
              
              <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                {incident.description || 'No description provided'}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(incident.created_at).toLocaleDateString()}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  incident.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {incident.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}