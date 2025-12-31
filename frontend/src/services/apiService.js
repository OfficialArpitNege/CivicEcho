import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Send a complaint to the backend API for NLP analysis and storage
 */
export const createComplaintToBackend = async (complaintData) => {
    try {
        const response = await api.post('/complaints', complaintData);
        return response.data;
    } catch (error) {
        console.error('❌ API Error creating complaint:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Failed to submit complaint to backend');
    }
};

export default {
    createComplaint: createComplaintToBackend,
};
