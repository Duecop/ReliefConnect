import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import L from 'leaflet';
import type { Database } from '../types/supabase';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different severity levels
const severityIcons = {
  low: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'transition-all duration-300 hover:brightness-90 hover:scale-110'
  }),
  medium: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'transition-all duration-300 hover:brightness-90 hover:scale-110'
  }),
  high: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'transition-all duration-300 hover:brightness-90 hover:scale-110'
  })
};

// Helper component to update map view when incidents change
function MapUpdater({ incidents }: { incidents: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents.map(incident => [incident.location.lat, incident.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, map]);
  
  return null;
}

interface IncidentMapProps {
  height?: string;
  incidents?: any[];
  onIncidentClick?: (incident: any) => void;
}

export default function IncidentMap({ 
  height = '500px', 
  incidents = [],
  onIncidentClick 
}: IncidentMapProps) {
  const [loading, setLoading] = useState(true);
  const [mapIncidents, setMapIncidents] = useState<any[]>([]);
  
  useEffect(() => {
    if (incidents.length > 0) {
      setMapIncidents(incidents);
      setLoading(false);
      return;
    }
    
    // If no incidents provided, fetch from Supabase
    async function fetchIncidents() {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .eq('status', 'active');
        
        if (error) throw error;
        
        setMapIncidents(data || []);
      } catch (error) {
        console.error('Error fetching incidents for map:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIncidents();
  }, [incidents]);

  // Add CSS for custom popup styling
  useEffect(() => {
    // Add custom popup styles if not already present
    if (!document.getElementById('custom-map-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'custom-map-styles';
      styleEl.innerHTML = `
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .incident-popup-low {
          border-left: 4px solid #00e680;
        }
        .incident-popup-medium {
          border-left: 4px solid #e6ad00;
        }
        .incident-popup-high {
          border-left: 4px solid #e60000;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={[40, -74.5]} // Default center
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0 animate-fade-in"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={severityIcons[incident.severity as keyof typeof severityIcons] || severityIcons.medium}
            eventHandlers={{
              click: () => {
                if (onIncidentClick) {
                  onIncidentClick(incident);
                }
              }
            }}
          >
            <Popup 
              className="custom-popup"
              closeButton={true}
              maxWidth={300}
              minWidth={250}
              autoPan={true}
              autoClose={false}
            >
              <div className={`p-4 incident-popup-${incident.severity}`}>
                <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{incident.description}</p>
                <div className="mt-3 flex justify-between">
                  <p className="text-xs font-medium flex items-center">
                    Status: 
                    <span className={
                      incident.status === 'active' ? 'text-primary-600 ml-1' : 'text-secondary-600 ml-1'
                    }>
                      {incident.status}
                    </span>
                  </p>
                  <p className="text-xs font-medium flex items-center">
                    Severity: 
                    <span className={
                      incident.severity === 'high' ? 'text-danger-600 ml-1' : 
                      incident.severity === 'medium' ? 'text-warning-600 ml-1' : 'text-secondary-600 ml-1'
                    }>
                      {incident.severity}
                    </span>
                  </p>
                </div>
                {onIncidentClick && (
                  <button
                    onClick={() => onIncidentClick(incident)}
                    className="mt-3 w-full text-center text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 py-1.5 px-3 rounded transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater incidents={mapIncidents} />
      </MapContainer>
    </div>
  );
} 