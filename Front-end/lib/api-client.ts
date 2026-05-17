// API client for communicating with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = { ...(options.headers || {}) } as Record<string, string>;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let detail = `${response.status} ${response.statusText}`
      try {
        const errBody = await response.json()
        if (errBody.message) detail += ` — ${Array.isArray(errBody.message) ? errBody.message.join(", ") : errBody.message}`
      } catch {}
      throw new Error(`API Error: ${detail}`)
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
export interface ProductFilters {
  search?: string;
  category?: string;
  brands?: string[];
  skinTypes?: string[];
  excludeIngredients?: string[];
}

export async function fetchProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'ALL')
    params.set('category', filters.category);
  if (filters.brands?.length) params.set('brands', filters.brands.join(','));
  if (filters.skinTypes?.length)
    params.set('skinTypes', filters.skinTypes.join(','));
  if (filters.excludeIngredients?.length)
    params.set('excludeIngredients', filters.excludeIngredients.join(','));

  const qs = params.toString();
  const products = await apiFetch(`/productos${qs ? `?${qs}` : ''}`);

  if (Array.isArray(products)) return products.map(normalizeProduct);
  return [normalizeProduct(products)];
}

export async function fetchProductById(id: string) {
  const product = await apiFetch<any>(`/productos/${id}`);
  return normalizeProduct(product);
}

export async function fetchProductsByCategory(category: string) {
  const encoded = encodeURIComponent(category);
  return apiFetch(`/productos/category/${encoded}`);
}

export async function fetchProductsBySkinType(skinType: string) {
  const encoded = encodeURIComponent(skinType);
  return apiFetch(`/productos/skin-type/${encoded}`);
}

export async function createProduct(product: any, images: File[]) {
  const form = new FormData();
  form.append('name', product.name);
  form.append('brand', product.brand);
  form.append('description', product.description);
  form.append('product_type', product.product_type);
  form.append('primary_category', product.primary_category);
  
  product.skin_type.forEach((st: string) => form.append('skin_type', st));
  if (product.additional_categories) {
    product.additional_categories.forEach((cat: string) => form.append('additional_categories', cat));
  }
  product.ingredients.forEach((ing: string) => form.append('ingredients', ing));

  images.forEach((image) => form.append('images', image));

  return apiFetch('/productos', {
    method: 'POST',
    body: form,
  });
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
    otherAlternatives?: { id: string; reason: string }[];
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

export async function fetchProductsBatch(productIds: string[]): Promise<any[]> {
  const results = await apiFetch<any[]>('/productos/batch', {
    method: 'POST',
    body: JSON.stringify({ productIds }),
  });
  return (results || []).map(normalizeProduct);
}

export function normalizeProduct(doc: any): any {
  return {
    id: doc._id?.toString() || doc.id,
    name: doc.name,
    brand: doc.brand,
    description: doc.description,
    skin_type: doc.skin_type || [],
    product_type: doc.product_type,
    category: doc.category || [],
    ingredients: doc.ingredients || [],
    image_url: doc.image_url || [],
    rating: doc.rating ?? 0,
    review_count: doc.review_count ?? 0,
  };
}

// AI Chat Persistence API
export async function createChat(userId: string, selectedFocusAreaIds?: string[]): Promise<{ chatId: string }> {
  return apiFetch('/ai/chats', {
    method: 'POST',
    body: JSON.stringify({ userId, selectedFocusAreaIds }),
  });
}

export async function getChat(chatId: string, userId: string): Promise<any> {
  return apiFetch(`/ai/chats/${chatId}?userId=${userId}`);
}

export async function getUserChats(userId: string): Promise<any[]> {
  return apiFetch(`/ai/chats?userId=${userId}`);
}

export async function saveChatMessage(chatId: string, userId: string, message: {
  role: string;
  content: string;
  recommendedProducts?: any[];
  draftUpdate?: any;
}): Promise<any> {
  return apiFetch(`/ai/chats/${chatId}/messages?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

export async function updateChatDraft(chatId: string, userId: string, draft: {
  name?: string;
  description?: string;
  type?: string;
  skinType?: string;
  steps?: any[];
}): Promise<any> {
  return apiFetch(`/ai/chats/${chatId}/draft?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(draft),
  });
}

export async function updateChatFocusAreas(chatId: string, userId: string, selectedFocusAreaIds: string[]): Promise<any> {
  return apiFetch(`/ai/chats/${chatId}/focus-areas?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ selectedFocusAreaIds }),
  });
}

export async function fetchProductBySlug(slug: string) {
  return fetchProductById(slug);
}



// API Comments

export async function fetchProductComments(productId: string, signal?: AbortSignal) {
  return apiFetch(`/comentarios/producto/${productId}`, { signal });
}

export async function createProductComment(productId: string, userId: string, comment: string) {
  return apiFetch('/comentarios', {
    method: 'POST',
    body: JSON.stringify({ productId, userId, comment }),
  });
}

export async function upvoteProductComment(commentId: string, userId: string) {
  return apiFetch(`/comentarios/${commentId}/upvote`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function deleteProductComment(commentId: string) {
  return apiFetch(`/comentarios/${commentId}`, {
        method: 'DELETE',
  });
}

// Subscription API
export async function createSubscription(data: {
  cardTokenId: string;
  payerEmail: string;
  userId: string;
}): Promise<{ preapprovalId: string; status: string }> {
  return apiFetch('/suscripciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPremiumStatus(userId: string): Promise<{ isPremium: boolean }> {
  return apiFetch(`/suscripciones/status/${userId}`);
}

export async function cancelSubscription(preapprovalId: string): Promise<{ message: string }> {
  return apiFetch(`/suscripciones/${preapprovalId}`, {
    method: 'DELETE',
  });
}
