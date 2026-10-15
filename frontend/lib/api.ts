const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('spheronix_admin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Public Student Endpoints
  createStudent: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  retrieveStudent: async (studentId: string, email: string) => {
    const res = await fetch(`${API_BASE}/students/retrieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, email })
    });
    return res.json();
  },

  getStudent: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/students/${studentId}`);
    return res.json();
  },

  getStudentCard: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/id-card`);
    return res.json();
  },

  getStudentCardImageUrl: (studentId: string, download = false) => {
    return `${API_BASE}/students/${studentId}/id-card/image${download ? '?download=true' : ''}`;
  },

  getStudentCardPdfUrl: (studentId: string) => {
    return `${API_BASE}/students/${studentId}/id-card/pdf`;
  },

  getStudentPhotoUrl: (studentId: string) => {
    return `${API_BASE}/students/${studentId}/photo`;
  },

  // Admin Endpoints
  adminLogin: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  adminLogout: async () => {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('spheronix_admin_token');
        localStorage.removeItem('spheronix_admin_user');
      }
    }
  },

  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getStudents: async (params?: { page?: number; limit?: number; search?: string; status?: string; college?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.college) query.append('college', params.college);

    const res = await fetch(`${API_BASE}/admin/students?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getStudentDetails: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateStudentStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/admin/students/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  regenerateCard: async (studentIdOrId: string) => {
    const res = await fetch(`${API_BASE}/admin/id-cards/${studentIdOrId}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getTemplates: async () => {
    const res = await fetch(`${API_BASE}/admin/templates`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  uploadTemplate: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/admin/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    return res.json();
  },

  activateTemplate: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/templates/${id}/activate`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/audit-logs?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
