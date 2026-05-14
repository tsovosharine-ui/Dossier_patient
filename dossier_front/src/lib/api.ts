import axios from 'axios';
import { resolveApiBase } from './api-config';

const apiClient = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  config.baseURL = resolveApiBase();
  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    if (process.env.NODE_ENV === 'development') {
      const msg = err?.message;
      const url = err?.config?.baseURL && err?.config?.url ? `${err.config.baseURL}${err.config.url}` : err?.config?.url;
      console.warn('[API]', msg, url, err?.code, err?.response?.status);
    }
    return Promise.reject(err);
  }
);

export default apiClient;

export const fetchPatient = (id: string) => apiClient.get(`/patients/${id}`);
export const fetchObservation = (patientId: string) =>
  apiClient.get(`/patients/${patientId}/observation`);
export const updateObservation = (patientId: string, data: unknown) =>
  apiClient.put(`/patients/${patientId}/observation`, { data });
