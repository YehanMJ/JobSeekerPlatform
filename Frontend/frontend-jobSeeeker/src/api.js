// Basic API service for backend integration
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Update if backend runs elsewhere

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Example usage:
// api.get('/jobs')
// api.post('/users', data)
