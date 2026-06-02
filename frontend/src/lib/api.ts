const API_BASE = import.meta.env.VITE_API_URL || 'https://dzd-api.demonzdevelopment.workers.dev/api';

// ─── Interfaces (matching Supabase schema) ──────────────────

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  downloads: number;
  redirect_url: string | null;
  file_path: string | null;
  image_url: string | null;
  source_url: string | null;
  author: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Changelog {
  id: string;
  project_id: string;
  version: string;
  title: string;
  changes: string;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id?: string;
  user_name: string;
  user_email?: string;
  comment_text: string;
  approved?: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface Stats {
  projectCount: number;
  articleCount: number;
  commentCount: number;
  totalDownloads: number;
  latestProject: {
    slug: string;
    name: string;
    tagline: string;
    image_url: string | null;
  } | null;
  latestArticle: {
    slug: string;
    title: string;
    summary: string;
    category: string | null;
    published_at: string | null;
  } | null;
}

// ─── API Error ──────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(body || res.statusText, res.status);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
    );
  }
}

/**
 * Build a full URL for a backend endpoint, respecting the Vite proxy
 * in dev (when VITE_API_URL is unset) and the production API URL otherwise.
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

// ─── Projects ───────────────────────────────────────────────

export async function fetchProjects(
  category?: string,
  search?: string,
  sort?: string,
): Promise<Project[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  const query = params.toString();
  return request<Project[]>(`/projects${query ? `?${query}` : ''}`);
}

export async function fetchProject(slug: string): Promise<Project> {
  return request<Project>(`/projects/${encodeURIComponent(slug)}`);
}

// ─── Changelogs ─────────────────────────────────────────────

export async function fetchChangelogs(projectSlug: string): Promise<Changelog[]> {
  return request<Changelog[]>(
    `/projects/${encodeURIComponent(projectSlug)}/changelogs`,
  );
}

// ─── Comments ───────────────────────────────────────────────

export async function fetchComments(projectSlug: string): Promise<Comment[]> {
  return request<Comment[]>(
    `/projects/${encodeURIComponent(projectSlug)}/comments`,
  );
}

export async function postComment(
  projectSlug: string,
  data: { user_name: string; user_email: string; comment_text: string },
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/projects/${encodeURIComponent(projectSlug)}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

// ─── Articles ───────────────────────────────────────────────

export async function fetchArticles(category?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  const query = params.toString();
  return request<Article[]>(`/articles${query ? `?${query}` : ''}`);
}

export async function fetchArticle(slug: string): Promise<Article> {
  return request<Article>(`/articles/${encodeURIComponent(slug)}`);
}

// ─── Contact ────────────────────────────────────────────────

export async function postContact(
  data: ContactMessage,
): Promise<{ message: string }> {
  return request<{ message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Stats ──────────────────────────────────────────────────

export async function fetchStats(): Promise<Stats> {
  return request<Stats>('/stats');
}
