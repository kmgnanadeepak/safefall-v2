import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EmergencyOverlay({ onClose, onEmergency, location }) {
  const [countdown, setCountdown] = useState(30);
  const triggered = useRef(false);

  const handleEmergency = async () => {
    if (triggered.current) return;
    triggered.current = true;
    try {
      await api.post('/patient/emergency/create', { location });
      onEmergency?.();
      onClose();
      toast.success('Emergency triggered - help is on the way');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger emergency');
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          handleEmergency();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleOK = async () => {
    try {
      await api.post('/patient/emergency/countdown-ok');
      onClose();
      toast.success('No emergency - you are OK');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-red-900/95 backdrop-blur-md">
      <div className="text-center max-w-md px-6">
        <h2 className="text-3xl font-bold text-white mb-4">Fall Detected</h2>
        <p className="text-white/90 mb-6">Are you OK? Respond within {countdown} seconds or emergency will be triggered.</p>
        <div className="text-6xl font-bold text-white mb-8">{countdown}</div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleOK}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
          >
            I am OK
          </button>
          <button
            onClick={handleEmergency}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
          >
            Emergency – Need Help
          </button>
        </div>
      </div>
    </div>
  );
}
