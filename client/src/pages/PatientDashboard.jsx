import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import EmergencyOverlay from '../components/EmergencyOverlay';
import SensorGraphs from '../components/SensorGraphs';
import useGeolocation from '../hooks/useGeolocation';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const [emergency, setEmergency] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [status, setStatus] = useState('monitoring');

  useEffect(() => {
    api.get('/patient/emergency/active').then(({ data }) => {
      if (data) setStatus('emergency');
      setEmergency(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    if (location) {
      socket.emit('location', location);
      api.post('/patient/location', location).catch(() => {});
    }
    const simulateData = () => {
      const acc = { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4, z: 9.8 + (Math.random() - 0.5) * 2 };
      const gyro = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 };
      api.post('/patient/sensor-data', { accelerometer: acc, gyroscope: gyro }).catch(() => {});
    };
    const id = setInterval(simulateData, 2000);
    return () => clearInterval(id);
  }, [user?._id, location]);

  const handleSimulateFall = async () => {
    try {
      await api.post('/patient/emergency/simulate');
      setShowOverlay(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      {showOverlay && (
        <EmergencyOverlay
          location={location}
          onClose={() => setShowOverlay(false)}
          onEmergency={() => setStatus('emergency')}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <div
          className={`px-4 py-2 rounded-full font-medium ${
            status === 'emergency' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}
        >
          {status === 'emergency' ? 'Emergency' : 'Monitoring'}
        </div>
      </div>

      {status === 'emergency' && emergency && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10">
          <h3 className="font-semibold text-red-400">Active Emergency</h3>
          <p className="text-sm text-gray-300 mt-1">
            Help has been notified. Your location is being shared.
          </p>
          <button
            onClick={async () => {
              try {
                await api.post('/patient/emergency/cancel');
                setStatus('monitoring');
                setEmergency(null);
                toast.success('Emergency cancelled');
              } catch (e) {
                toast.error('Failed to cancel');
              }
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Cancel emergency (false alarm)
          </button>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <button
          onClick={handleSimulateFall}
          disabled={showOverlay || status === 'emergency'}
          className="btn-primary"
        >
          Simulate Fall Detection
        </button>
        <p className="text-sm text-gray-400 mt-2">Starts 30-second confirmation countdown</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/patient/contacts', label: 'Emergency Contacts', icon: '📞' },
          { to: '/patient/health-profile', label: 'Health Profile', icon: '🏥' },
          { to: '/patient/fall-history', label: 'Fall History', icon: '📋' },
          { to: '/patient/map', label: 'Live Map', icon: '📍' },
        ].map(({ to, label, icon }) => (
          <Link key={to} to={to} className="glass-card p-4 hover:bg-white/10 transition-colors block">
            <span className="text-2xl block mb-2">{icon}</span>
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-4">Real-time Sensor Data</h3>
        <SensorGraphs userId={user?._id} />
      </div>
    </div>
  );
}
