import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation, useVoiceRecording } from '../hooks/useCustom';
import { complaintService } from '../services/complaintService';
import { FiMapPin, FiMic, FiSend, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function ReportComplaint() {
  const { user } = useAuth();
  const { location, error: geoError, getCurrentLocation } = useGeolocation();
  const { isRecording, audioBlob, error: audioError, startRecording, stopRecording } = useVoiceRecording();
  const [description, setDescription] = useState('');
  const [complaintType, setComplaintType] = useState('text');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

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

    if (!location) {
      toast.error('Please enable location access');
      return;
    }

    setLoading(true);

    try {
      const complaintData = {
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        complaintType,
        userId: user.uid,
        audioUrl: null,
      };

      const response = await complaintService.createComplaint(complaintData);
      toast.success('Complaint submitted successfully!');
      setDescription('');
      setComplaintType('text');
    } catch (error) {
      toast.error('Failed to submit complaint: ' + error.message);
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
              </div>
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

          {/* Voice Recording Section */}
          {complaintType === 'voice' && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiMic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium mb-4">Record Your Complaint</p>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isRecording ? 'Recording...' : 'Start Recording'}
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
    </div>
  );
}
