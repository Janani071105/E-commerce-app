const API_BASE = 'http://localhost:4000/api';
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth-token')}`
});

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const toggleUserStatus = async (id) => {
  const response = await fetch(`${API_BASE}/admin/toggle-status/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to toggle user status');
  return response.json();
};