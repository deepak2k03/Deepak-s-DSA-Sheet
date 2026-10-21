import { apiUrl } from '../config';
import { getStoredToken } from './auth';
import { visualizerAlgorithms, type VisualizerAlgorithm } from '../data/visualizers';

export interface AdminVisualizersResponse {
  items: VisualizerAlgorithm[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    total: number;
    live: number;
    awaiting: number;
  };
  r2?: R2StatusResponse;
}


const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
  };
};

export async function fetchPublicVisualizers(
  category?: string,
  search?: string,
  type?: string
): Promise<VisualizerAlgorithm[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);

    const res = await fetch(apiUrl(`/api/visualizers?${params.toString()}`));
    if (!res.ok) throw new Error('Failed to fetch from API');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return visualizerAlgorithms;
  } catch (error) {
    console.warn('Falling back to local visualizers registry:', error);
    return visualizerAlgorithms;
  }
}

export async function fetchVisualizerStats(): Promise<{
  total: number;
  algorithms: number;
  dataStructures: number;
  problems: number;
  live: number;
  awaiting: number;
}> {
  try {
    const res = await fetch(apiUrl('/api/visualizers/stats'));
    if (!res.ok) throw new Error('Failed to fetch visualizer stats');
    return await res.json();
  } catch (error) {
    return { total: 0, algorithms: 0, dataStructures: 0, problems: 0, live: 0, awaiting: 0 };
  }
}

export async function fetchAdminMinimalProblems(): Promise<Array<{
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  link: string;
  hasVisualizer?: boolean;
  visualizerSlug?: string;
}>> {
  try {
    const res = await fetch(apiUrl('/api/admin/problems/list-minimal'), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch minimal problems:', error);
    return [];
  }
}

export async function fetchVisualizerBySlug(
  slug: string
): Promise<VisualizerAlgorithm | null> {
  try {
    const res = await fetch(apiUrl(`/api/visualizers/${encodeURIComponent(slug)}`));
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('API fetch error');
    }
    return await res.json();
  } catch (error) {
    console.warn('Falling back to local registry by slug:', error);
    const local = visualizerAlgorithms.find((item) => item.slug === slug);
    return local || null;
  }
}

export async function fetchAdminVisualizers(params: {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  status?: string;
  type?: string;
}): Promise<AdminVisualizersResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.query) queryParams.append('query', params.query);
  if (params.category && params.category !== 'All') queryParams.append('category', params.category);
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.type && params.type !== 'all') queryParams.append('type', params.type);

  const res = await fetch(apiUrl(`/api/admin/visualizers?${queryParams.toString()}`), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to fetch visualizers');
  }

  return await res.json();
}

export async function createAdminVisualizer(data: Partial<VisualizerAlgorithm>): Promise<VisualizerAlgorithm> {
  const res = await fetch(apiUrl('/api/admin/visualizers'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to create visualizer');
  }

  return await res.json();
}

export async function updateAdminVisualizer(
  id: string,
  data: Partial<VisualizerAlgorithm>
): Promise<VisualizerAlgorithm> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to update visualizer');
  }

  return await res.json();
}

export async function toggleAdminVisualizerStatus(
  id: string,
  status: 'available' | 'unavailable'
): Promise<VisualizerAlgorithm> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}/status`), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to toggle status');
  }

  return await res.json();
}

export async function getAdminVisualizerCode(id: string): Promise<{
  code: string;
  fileName: string;
  filePath: string;
}> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}/code`), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to fetch code');
  }

  return await res.json();
}

export async function saveAdminVisualizerCode(id: string, code: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}/code`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to save code');
  }
}

export async function deleteAdminVisualizer(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to delete visualizer');
  }
}

export interface R2StatusResponse {
  configured: boolean;
  bucket?: string;
  accountId?: string;
  publicBaseUrl?: string | null;
  status?: string;
  message?: string;
}

export async function checkR2Status(): Promise<R2StatusResponse> {
  try {
    const res = await fetch(apiUrl('/api/admin/visualizers/r2-status'), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return { configured: false, status: 'error', message: 'Failed to query R2 status' };
    }
    return await res.json();
  } catch (err: any) {
    return { configured: false, status: 'error', message: err.message || 'Network error' };
  }
}

export async function uploadAdminVisualizer(formData: FormData): Promise<VisualizerAlgorithm> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers['x-auth-token'] = token;

  const res = await fetch(apiUrl('/api/admin/visualizers/upload'), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to upload visualizer');
  }

  return await res.json();
}

export async function replaceAdminVisualizerFile(
  id: string,
  file: File
): Promise<{ msg: string; visualizer: VisualizerAlgorithm }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers['x-auth-token'] = token;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl(`/api/admin/visualizers/${id}/upload`), {
    method: 'PUT',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to upload HTML animation file');
  }

  return await res.json();
}

export interface VisualizerCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDefault: boolean;
  count: number;
}

export async function fetchVisualizerCategories(): Promise<VisualizerCategoryItem[]> {
  try {
    const res = await fetch(apiUrl('/api/visualizers/categories'));
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.warn('Failed to fetch categories from API, using default list:', err);
    return [];
  }
}

export async function createAdminVisualizerCategory(
  name: string,
  description?: string
): Promise<VisualizerCategoryItem> {
  const res = await fetch(apiUrl('/api/admin/visualizers/categories'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to create category');
  }

  return await res.json();
}

export async function deleteAdminVisualizerCategory(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/visualizers/categories/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Failed to delete category');
  }
}


