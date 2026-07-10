const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      const firstError = Object.values(err)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : (typeof firstError === 'string' ? firstError : 'Registration failed'));
    }
    return res.json();
  },

  getTasks: async () => {
    const res = await fetch(`${API_URL}/tasks/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  createTask: async (title, description) => {
    const res = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, completed: false }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id, data) => {
    const res = await fetch(`${API_URL}/tasks/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return true;
  },
};
