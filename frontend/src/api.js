const API_BASE = 'http://localhost:3000/api';

export const api = {
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  },

  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  },

  async put(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  },

  async upload(path, formData, method = 'POST') {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      // Do NOT set Content-Type header here. The browser will automatically set it to 
      // multipart/form-data with the correct boundary.
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');
    return data;
  }
};
