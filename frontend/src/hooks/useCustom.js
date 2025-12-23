import { useState, useCallback, useRef } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // Handle various geolocation errors gracefully
        let errorMessage = err.message;
        
        if (err.code === 1) {
          errorMessage = 'Location access denied. You can still submit complaints using the map to select a location.';
        } else if (err.code === 2) {
          errorMessage = 'Location unavailable. You can still submit complaints using the map to select a location.';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out. You can still submit complaints using the map to select a location.';
        }
        
        console.warn('Geolocation error:', err);
        setError(errorMessage);
        setLoading(false);
        
        // Set a default location (city center) for demo purposes
        setLocation({
          latitude: 28.7041,  // Delhi coordinates as default
          longitude: 77.1025,
          isDefault: true,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, error, loading, getCurrentLocation };
};

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }, [isRecording]);

  return { isRecording, audioBlob, error, startRecording, stopRecording };
};
