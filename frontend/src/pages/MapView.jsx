import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllComplaints } from '../services/firestoreComplaintService';
import { toast } from 'react-toastify';

// Leaflet icon configuration is now handled globally in ../utils/leafletSetup.js

const defaultCenter = [28.6139, 77.209];

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setCenter(defaultCenter),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allComplaints = await getAllComplaints();
      const filtered = filter === 'all'
        ? allComplaints
        : allComplaints.filter(c => c.status === filter);
      setComplaints(filtered);
    } catch (err) {
      toast.error('Failed to load complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      <MapContainer center={center} zoom={12} style={{ height: '100vh', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map(c => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
            <Popup>
              <div>
                <p>{c.title || 'Complaint'}</p>
                <p>{c.address || c.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6">
            <p>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
