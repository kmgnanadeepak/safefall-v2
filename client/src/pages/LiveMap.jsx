import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useGeolocation from '../hooks/useGeolocation';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, onUpdate }) {
  const map = useMapEvents({
    click(e) {
      onUpdate?.(e.latlng);
    },
  });
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return position ? <Marker position={position}><Popup>Your location</Popup></Marker> : null;
}

export default function LiveMap() {
  const { location, error, loading } = useGeolocation();
  const [loc, setLoc] = useState(null);

  useEffect(() => {
    if (location) {
      setLoc([location.lat, location.lng]);
      api.post('/patient/location', location).catch(() => {});
    }
  }, [location]);

  const defaultCenter = [28.6139, 77.209];

  if (loading && !loc) {
    return (
      <div className="glass-card p-8 text-center">
        <p>Requesting location permission...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Map</h1>
      {error && (
        <div className="glass-card p-4 border-amber-500/30 bg-amber-500/10">
          <p className="text-amber-400 text-sm">
            Location access denied. Showing default view. Enable location for live tracking.
          </p>
        </div>
      )}
      <div className="glass-card overflow-hidden h-[500px]">
        <MapContainer
          center={loc || defaultCenter}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={loc} onUpdate={(latlng) => setLoc([latlng.lat, latlng.lng])} />
        </MapContainer>
      </div>
    </div>
  );
}
