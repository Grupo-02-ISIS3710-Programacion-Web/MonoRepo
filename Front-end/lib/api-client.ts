// API client for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Products API
export async function fetchProducts() {
  return apiFetch('/products');
}

export async function fetchProductById(id: string) {
  return apiFetch(`/products/${id}`);
}

export async function fetchProductsByCategory(category: string) {
  const encoded = encodeURIComponent(category);
  return apiFetch(`/products/category/${encoded}`);
}

export async function fetchProductsBySkinType(skinType: string) {
  const encoded = encodeURIComponent(skinType);
  return apiFetch(`/products/skin-type/${encoded}`);
}

// Users API
export async function fetchUsers() {
  return apiFetch('/users');
}

export async function fetchUserById(id: string) {
  return apiFetch(`/users/${id}`);
}

export async function loginUser(identifier: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

// Routines API
export async function fetchRoutines() {
  return apiFetch('/routines');
}

export async function fetchRoutineById(id: string) {
  return apiFetch(`/routines/${id}`);
}

export async function createRoutine(routine: any) {
  return apiFetch('/routines', {
    method: 'POST',
    body: JSON.stringify(routine),
  });
}

export async function updateRoutine(id: string, routine: any) {
  return apiFetch(`/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(routine),
  });
}

export async function deleteRoutine(id: string) {
  return apiFetch(`/routines/${id}`, {
    method: 'DELETE',
  });
}

export async function upvoteRoutine(id: string) {
  return apiFetch(`/routines/${id}/upvote`, {
    method: 'POST',
  });
}

export async function downvoteRoutine(id: string) {
  return apiFetch(`/routines/${id}/downvote`, {
    method: 'POST',
  });
}

// Comments API
export async function fetchComments(routineId: string) {
  return apiFetch(`/routines/${routineId}/comments`);
}

export async function createComment(routineId: string, comment: any) {
  return apiFetch(`/routines/${routineId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  });
}

export async function updateComment(id: string, comment: any) {
  return apiFetch(`/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(comment),
  });
}

export async function deleteComment(id: string) {
  return apiFetch(`/comments/${id}`, {
    method: 'DELETE',
  });
}

// AI API
export async function generateRoutineWithAI(params: any) {
  return apiFetch('/ai/routines/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function suggestProductsWithAI(params: any) {
  return apiFetch('/ai/products/suggest', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchAITools() {
  return apiFetch('/ai/tools');
}

export async function chatWithAI(prompt: string) {
  return apiFetch('/ai/agent/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export async function searchWithAI(query: string) {
  return apiFetch('/ai/agent/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}
