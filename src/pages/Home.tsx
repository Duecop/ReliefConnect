import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import IncidentMap from '../components/IncidentMap';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { AlertCircle, Users, Package, ArrowRight, Activity, Clock } from 'lucide-react';

export default function Home() {
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    availableVolunteers: 0,
    resourceCenters: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentIncidents();
    fetchStats();
  }, []);

  const fetchRecentIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      setRecentIncidents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [activeIncidentsCount, volunteersCount, resourcesCount] = await Promise.all([
        supabase.from('incidents').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('volunteers').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('resources').select('id', { count: 'exact' }).eq('status', 'available')
      ]);

      setStats({
        activeIncidents: activeIncidentsCount.count || 0,
        availableVolunteers: volunteersCount.count || 0,
        resourceCenters: resourcesCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Emergency Response at a Glance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-3 rounded-full mr-4">
                  <AlertCircle className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Active Incidents</p>
                  <h3 className="text-3xl font-bold text-primary-600">{stats.activeIncidents}</h3>
                </div>
              </div>
              <Link to="/incidents" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View all incidents <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-secondary-100 p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Available Volunteers</p>
                  <h3 className="text-3xl font-bold text-secondary-600">{stats.availableVolunteers}</h3>
                </div>
              </div>
              <Link to="/volunteers" className="text-sm text-secondary-600 hover:text-secondary-700 flex items-center">
                View all volunteers <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-warning-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-warning-100 p-3 rounded-full mr-4">
                  <Package className="h-6 w-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Resource Centers</p>
                  <h3 className="text-3xl font-bold text-warning-600">{stats.resourceCenters}</h3>
                </div>
              </div>
              <Link to="/resources" className="text-sm text-warning-600 hover:text-warning-700 flex items-center">
                View all resources <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Incident Map</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <IncidentMap height="400px" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin inline-block h-8 w-8 border-b-2 border-primary-600 rounded-full"></div>
                </div>
              ) : recentIncidents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No active incidents reported
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                          incident.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                          'bg-secondary-100 text-secondary-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(incident.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          <span className="text-primary-600 font-medium">{incident.status}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/incidents?id=${incident.id}`}
                        className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        View details <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-gray-50 p-3 border-t border-gray-100">
                <Link to="/incidents" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center">
                  View all incidents <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 