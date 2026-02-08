import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Permission denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    const t = setTimeout(() => setLoading(false), 2000);
    return () => {
      clearTimeout(t);
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  return { location, error, loading };
}
