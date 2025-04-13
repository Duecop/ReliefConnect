import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Users, Box } from 'lucide-react';
import { AuthContext } from '../App';
import IncidentMap from '../components/IncidentMap';
import toast from 'react-hot-toast';

function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    availableVolunteers: 0,
    resourceCenters: 0,
    resolvedIncidents: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to real-time updates
    const incidentsSubscription = supabase
      .channel('incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, 
        () => {
          fetchIncidents();
          fetchStats();
        }
      )
      .subscribe();

    fetchIncidents();
    fetchStats();
    fetchRecentIncidents();

    return () => {
      incidentsSubscription.unsubscribe();
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('status', 'active');
      
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setLoading(false);
    }
  };

  const fetchRecentIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setRecentIncidents(data || []);
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [activeIncidentsCount, resolvedIncidentsCount, volunteersCount, resourcesCount] = await Promise.all([
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'resolved'),
        supabase.from('volunteers').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'available')
      ]);

      setStats({
        activeIncidents: activeIncidentsCount.count || 0,
        resolvedIncidents: resolvedIncidentsCount.count || 0,
        availableVolunteers: volunteersCount.count || 0,
        resourceCenters: resourcesCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleIncidentClick = (incident: any) => {
    navigate(`/incidents?id=${incident.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Response Dashboard</h1>
        {user && (
          <button
            onClick={() => navigate('/incidents')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Report New Incident
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Incidents</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.activeIncidents}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.resolvedIncidents}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Volunteers</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.availableVolunteers}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Box className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resource Centers</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.resourceCenters}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Live Incident Map</h2>
              {incidents.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {incidents.length} active incidents
                </span>
              )}
            </div>
            <div className="p-4">
              <IncidentMap
                incidents={incidents}
                height="500px"
                onIncidentClick={handleIncidentClick}
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Incidents</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentIncidents.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No recent incidents</p>
              ) : (
                recentIncidents.map(incident => (
                  <div 
                    key={incident.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{incident.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                        incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{incident.description}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatDate(incident.created_at)}</span>
                      <span className={`${
                        incident.status === 'active' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;