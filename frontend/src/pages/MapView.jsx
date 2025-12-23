import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { complaintService } from '../services/complaintService';
import { FiFilter, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';

const defaultCenter = [28.6139, 77.209]; // Default center (e.g., Delhi)

// Default Leaflet marker icon fix for bundlers
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

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
      (position) => {
        setCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setCenter(defaultCenter);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = filter === 'all' ? {} : { status: filter };
      const response = await complaintService.getAllComplaints(filters);
      setComplaints(response.data || []);
    } catch (error) {
      toast.error('Failed to load complaints: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Complaint Markers */}
        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude, complaint.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {complaint.title || 'Complaint'}
                </p>
                <p className="text-xs text-gray-700">
                  {complaint.address || complaint.description}
                </p>
                {complaint.reportedBy && (
                  <p className="text-xs text-gray-500">
                    {complaint.reportedBy === 'me' ? 'Reported by me' : 'Reported by others'}
                  </p>
                )}
                {complaint.resolverName && (
                  <p className="text-xs text-blue-600">
                    Resolver: {complaint.resolverName}
                  </p>
                )}
                {complaint.status && (
                  <p className="text-xs text-gray-500">
                    Status: {complaint.status}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Placeholder for heatmap when no complaints */}
        {complaints.length === 0 && (
          <div className="absolute top-4 right-4 bg-white rounded shadow px-3 py-2 text-xs text-gray-600 z-[1000]">
            No complaints yet. Heatmap will appear once reports are submitted.
          </div>
        )}
      </MapContainer>

      {/* Filter Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 w-64">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>

        <div className="space-y-2">
          {['all', 'reported', 'verified', 'in_progress', 'resolved'].map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={filter === status}
                onChange={() => setFilter(status)}
                className="w-4 h-4"
              />
              <span className="text-gray-700 capitalize">{status.replace('_', ' ')}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Issues: <span className="font-semibold">{complaints.length}</span>
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-800 font-medium">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
