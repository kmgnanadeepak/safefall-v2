import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { getDemoEmergencies } from '../utils/demoData.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function HospitalDashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState({});
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    const load = () => {
      api.get('/hospital/emergencies')
        .then(({ data }) => {
          const list = Array.isArray(data) && data.length > 0 ? data : getDemoEmergencies();
          setEmergencies(list);
          setUseDemo(!Array.isArray(data) || data.length === 0);
        })
        .catch(() => {
          setEmergencies(getDemoEmergencies());
          setUseDemo(true);
        })
        .finally(() => setLoading(false));
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    emergencies.forEach((em) => {
      const pid = em.userId?._id;
      if (pid && (em.location?.lat != null || locations[pid])) return;
      if (pid && em.location?.lat != null) {
        setLocations((l) => ({ ...l, [pid]: [em.location.lat, em.location.lng] }));
      } else if (pid) {
        api.get(`/hospital/patients/${pid}/location`)
          .then(({ data }) => setLocations((l) => ({ ...l, [pid]: [data.lat, data.lng] })))
          .catch(() => {});
      }
    });
  }, [emergencies]);

  const acknowledge = async (id) => {
    if (String(id).startsWith('demo-')) return;
    try {
      await api.post(`/hospital/emergencies/${id}/acknowledge`);
      setEmergencies((e) => e.map((x) => (x._id === id ? { ...x, status: 'acknowledged' } : x)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const resolve = async (id) => {
    if (String(id).startsWith('demo-')) return;
    const notes = window.prompt('Resolution notes (optional)');
    try {
      await api.post(`/hospital/emergencies/${id}/resolve`, { notes: notes || undefined });
      setEmergencies((e) => e.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const getTimeSince = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  const markers = emergencies
    .map((em) => {
      const pos = locations[em.userId?._id] || (em.location?.lat != null ? [em.location.lat, em.location.lng] : null);
      return pos ? { ...em, pos } : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
      <p className="text-gray-400">Active emergency patients only</p>
      {useDemo && (
        <p className="text-amber-400/90 text-sm">Showing demo data. Real emergencies will appear here.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Active Emergencies</h3>
          {emergencies.length === 0 ? (
            <p className="text-gray-400">No active emergencies</p>
          ) : (
            emergencies.map((em) => (
              <div key={em._id} className="glass-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{em.userId?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{em.userId?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeSince(em.createdAt)} • {em.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {em.status === 'active' && (
                      <button
                        onClick={() => acknowledge(em._id)}
                        className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => resolve(em._id)}
                      className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/30"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="glass-card overflow-hidden h-[400px]">
          <h3 className="font-semibold p-4">Live Map</h3>
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={10}
            className="h-[calc(100%-3rem)] w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((em) => (
              <Marker key={em._id} position={em.pos}>
                <Popup>
                  <strong>{em.userId?.name}</strong><br />
                  {em.status} • {getTimeSince(em.createdAt)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
