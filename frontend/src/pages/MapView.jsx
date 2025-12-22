import { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { GoogleMap, LoadScript, Marker, HeatmapLayer } from '@react-google-maps/api';
import { FiFilter, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';

const mapStyles = {
  height: '100vh',
  width: '100%',
};

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = filter === 'all' ? {} : { status: filter };
      const response = await complaintService.getAllComplaints(filters);
      setComplaints(response.data || []);

      // Get heatmap data
      const heatmapResponse = await complaintService.dashboardService.getHeatmapData();
      const points = heatmapResponse.data.map((point) => ({
        location: new window.google.maps.LatLng(point.lat, point.lng),
        weight: point.weight,
      }));
      setHeatmapData(points);
    } catch (error) {
      toast.error('Failed to load complaints: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={mapStyles} center={center} zoom={12}>
          {/* Heatmap Layer */}
          {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}

          {/* Complaint Markers */}
          {complaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={{
                lat: complaint.latitude,
                lng: complaint.longitude,
              }}
              title={complaint.description}
            />
          ))}
        </GoogleMap>
      </LoadScript>

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
