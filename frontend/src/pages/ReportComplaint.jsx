import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGeolocation, useVoiceRecording } from '../hooks/useCustom';
import { createComplaint } from '../services/firestoreComplaintService';
import { FiMapPin, FiMic, FiSend, FiAlertCircle, FiCamera, FiX, FiMap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function ReportComplaint() {
  const { user, userRole, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  // Only citizens can report complaints
  if (!user || userRole === 'authority') {
    return <Navigate to="/" replace />;
  }
  const { location, error: geoError, getCurrentLocation } = useGeolocation();
  const { isRecording, audioBlob, error: audioError, startRecording, stopRecording } = useVoiceRecording();
  const [description, setDescription] = useState('');
  const [complaintType, setComplaintType] = useState('text');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Use manual location if set, otherwise fallback to GPS
  const activeLocation = manualLocation ?
    { latitude: manualLocation.lat, longitude: manualLocation.lng } :
    location;



  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a complaint description');
      return;
    }

    if (!activeLocation) {
      toast.error('Please enable location or select it on the map');
      return;
    }

    setLoading(true);

    try {
      const complaintData = {
        description,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        complaintType,
        imageBase64: imagePreview || null,
        address: manualLocation ? 'Manual Selection' : 'GPS Location'
      };

      await createComplaint(user.uid, user.email, complaintData);
      toast.success('✅ Complaint submitted successfully!');
      setDescription('');
      setComplaintType('text');
      setManualLocation(null);
      removeImage();
    } catch (error) {
      toast.error('❌ Failed to submit complaint: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report an Issue</h1>
        <p className="text-gray-600 mb-8">Help us improve your community</p>

        {/* Error Messages */}
        {geoError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Location Error</p>
                <p className="text-yellow-700 text-sm">{geoError}</p>
              </div>
            </div>
          </div>
        )}

        {audioError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-600 mr-3 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Microphone Error</p>
                <p className="text-red-700 text-sm">{audioError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Location Display */}
          {location && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
              <FiMapPin className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-blue-900 font-medium">Location Detected</p>
                <p className="text-blue-700 text-sm">
                  Latitude: {location.latitude.toFixed(4)}, Longitude: {location.longitude.toFixed(4)}
                </p>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-blue-600 text-sm mt-2 hover:underline"
                >
                  Update Location
                </button>
                <div className="text-xs text-gray-500 mt-1">
                  {manualLocation ? '(Manually Selected)' : '(GPS Detected)'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="ml-auto flex items-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-sm font-medium shadow-sm"
              >
                <FiMap /> Select on Map
              </button>
            </div>
          )}

          {!location && !manualLocation && (
  <div className="space-y-4">
    <button
      type="button"
      onClick={getCurrentLocation}
      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
    >
      📍 Allow Location Access
    </button>

    <button
      type="button"
      onClick={() => setMapModalOpen(true)}
      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 transition"
    >
      <FiMap /> Select location manually on map
    </button>
  </div>
)}

          {/* Type Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">Report Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={complaintType === 'text'}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Text Description</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="voice"
                  checked={complaintType === 'voice'}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Voice Recording</span>
              </label>
            </div>
          </div>

          {/* Text Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue you want to report (water leak, garbage, road damage, power outage, safety issue, etc.)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">Attach Photo (Optional)</label>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiCamera className="w-4 h-4" />
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={handleGallerySelect}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                🖼️ Gallery
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <p className="text-gray-700 text-sm p-3 bg-gray-50">
                  ✓ Image selected: {selectedImage?.name}
                </p>
              </div>
            )}
          </div>

          {/* Voice Recording Section */}
          {complaintType === 'voice' && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiMic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium mb-4">Record Your Complaint</p>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    toast.info('Voice recording is not available yet. Please use text description for now.');
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Start Recording
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Stop Recording
                </button>
              </div>
              {audioBlob && (
                <p className="text-green-600 text-sm mt-4">✓ Audio recorded successfully</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-semibold flex items-center justify-center gap-2"
          >
            <FiSend />
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>


      {/* Map Selection Modal */}
      {
        mapModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Pinpoint Location</h3>
                <button
                  onClick={() => setMapModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex-1 relative">
                <MapContainer
                  center={
                    location
                      ? [location.latitude, location.longitude]
                      : [28.6139, 77.2090] // Default (New Delhi)
                  }
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={manualLocation || (location ? { lat: location.latitude, lng: location.longitude } : null)}
                    setPosition={setManualLocation}
                  />
                </MapContainer>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold z-[400]">
                  Tap anywhere to move marker
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setMapModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!manualLocation && location) {
                      setManualLocation({ lat: location.latitude, lng: location.longitude });
                    }
                    setMapModalOpen(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
