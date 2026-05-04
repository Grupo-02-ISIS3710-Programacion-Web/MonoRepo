// API client for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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

function normalizeRoutine(routine: any) {
  return {
    ...routine,
    id: routine.id || routine._id,
  };
}

function normalizeRoutines(data: any) {
  if (Array.isArray(data)) {
    return data.map(normalizeRoutine);
  }
  return normalizeRoutine(data);
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
export async function fetchRoutines(page?: number, language: string = 'es', sort?: string) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (sort) params.append('sort', sort);

  const queryString = params.toString();
  const url = `/rutinas${queryString ? `?${queryString}` : ''}`;

  const result: any = await apiFetch(url, {
    headers: { 'Accept-Language': language },
  });

  if (result.routines) {
    return { ...result, routines: normalizeRoutines(result.routines) };
  }
  return normalizeRoutines(result);
}

export async function fetchRoutineById(id: string) {
  const result: any = await apiFetch(`/rutinas/${id}`);
  return normalizeRoutine(result);
}

export async function fetchRoutinesByUserId(userId: string, page: number = 1, language: string = 'es') {
  const result: any = await apiFetch(`/rutinas/user/${userId}?page=${page}`, {
    headers: { 'Accept-Language': language },
  });
  
  if (result.routines) {
    return { ...result, routines: normalizeRoutines(result.routines) };
  }
  return normalizeRoutines(result);
}

export async function createRoutine(routine: any) {
  return apiFetch('/rutinas', {
    method: 'POST',
    body: JSON.stringify(routine),
  });
}

export async function updateRoutine(id: string, routine: any) {
  return apiFetch(`/rutinas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(routine),
  });
}

export async function deleteRoutine(id: string) {
  return apiFetch(`/rutinas/${id}`, {
    method: 'DELETE',
  });
}

export async function hardDeleteRoutine(id: string) {
  return apiFetch(`/rutinas/${id}/hardDelete`, {
    method: 'DELETE',
  });
}

export async function upvoteRoutine(id: string, userId: string) {
  return apiFetch(`/rutinas/${id}/upvote`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function downvoteRoutine(id: string, userId: string) {
  return apiFetch(`/rutinas/${id}/downvote`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeUpvote(id: string, userId: string) {
  return apiFetch(`/rutinas/${id}/remove-upvote`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeDownvote(id: string, userId: string) {
  return apiFetch(`/rutinas/${id}/remove-downvote`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function incrementRoutineView(id: string) {
  return apiFetch(`/rutinas/${id}/view`, {
    method: 'POST',
  });
}

export async function getRoutineVoteCounts(id: string): Promise<{ upvotes: number; downvotes: number; views: number }> {
  return apiFetch(`/rutinas/${id}/votes`);
}

// Comments API
export async function fetchComments(routineId: string) {
  return apiFetch(`/rutinas/${routineId}/comments`);
}

export async function createComment(routineId: string, comment: any) {
  return apiFetch(`/rutinas/${routineId}/comments`, {
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

// AI API - Functions for AI-powered routine generation

export interface GenerateRoutineParams {
  userId: string;
  skinType: string;
  type: 'am' | 'pm';
  concerns?: string[];
  stepCount?: number;
  preferredProductIds?: string[];
}

export interface GenerateRoutineResponse {
  name: string;
  description: string;
  steps: {
    id: string;
    name: string;
    productId: string;
    notes: string;
    order: number;
  }[];
}

export async function generateRoutineWithAI(params: GenerateRoutineParams): Promise<GenerateRoutineResponse> {
  return apiFetch('/ai/routines/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface SuggestProductsParams {
  skinType: string;
  stepName: string;
  category?: string;
  concerns?: string[];
}

export interface SuggestProductsResponse {
  suggestions: {
    productId: string;
    reason: string;
  }[];
}

export async function suggestProductsWithAI(params: SuggestProductsParams): Promise<SuggestProductsResponse> {
  return apiFetch('/ai/products/suggest', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatWithAIParams {
  userId: string;
  messages: ChatMessage[];
  routineContext?: {
    skinType?: string;
    type?: string;
    currentSteps?: any[];
  };
}

export interface ChatWithAIResponse {
  response: string;
  recommendedProducts?: {
    productId: string;
    reason: string;
    otherAlternatives?: string[];
  }[];
  draftUpdate?: {
    steps?: {
      productId: string;
      name: string;
      notes: string;
    }[];
  };
}

export async function chatWithAI(params: ChatWithAIParams): Promise<ChatWithAIResponse> {
  return apiFetch('/ai/agent/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface SearchWithAIParams {
  query: string;
  skinType?: string;
}

export interface SearchWithAIResponse {
  results: {
    product: any;
    relevance: string;
  }[];
}

export async function searchWithAI(params: SearchWithAIParams): Promise<SearchWithAIResponse> {
  return apiFetch('/ai/agent/search', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
