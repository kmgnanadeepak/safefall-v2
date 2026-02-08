import { useState, useEffect } from 'react';
import api from '../services/api';
import { getDemoFallEvents } from '../utils/demoData.js';

export default function FallHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    api.get('/patient/fall-history')
      .then(({ data }) => {
        const list = Array.isArray(data) && data.length > 0 ? data : getDemoFallEvents();
        setEvents(list);
        setUseDemo(!Array.isArray(data) || data.length === 0);
      })
      .catch(() => {
        setEvents(getDemoFallEvents());
        setUseDemo(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Fall History</h1>
      {useDemo && (
        <p className="text-amber-400/90 text-sm">Showing demo data. Real events will appear here.</p>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-400">No fall events recorded.</p>
        ) : (
          events.map((e) => (
            <div key={e._id} className="glass-card p-4 border-l-4 border-primary/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {new Date(e.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {e.isEmergency ? 'Emergency' : 'False alarm'} • {e.resolved ? 'Resolved' : 'Active'}
                  </p>
                  {e.location?.lat != null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Location: {e.location.lat.toFixed(4)}, {e.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    e.isEmergency ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {e.isEmergency ? 'Emergency' : 'OK'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
