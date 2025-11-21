import { projectId, publicAnonKey } from "./supabase/info";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a65856ea`;

export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  tags: string[];
  authorId: string;
  author: {
    name: string;
    country: string;
    avatar?: string;
  };
  upvotes: number;
  comments: number;
  timestamp: string;
  createdAt: string;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
}

export interface Contributor {
  id: string;
  name: string;
  country: string;
  avatar?: string;
  posts: number;
  totalUpvotes: number;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    country: string;
    avatar?: string;
  };
  timestamp: string;
  createdAt: string;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth APIs
export async function signup(email: string, password: string, name: string, country: string): Promise<{ user: User }> {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, country }),
  });
}

export async function signin(email: string, password: string): Promise<{ accessToken: string; user: User }> {
  const result = await fetchAPI('/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store access token
  if (result.accessToken) {
    localStorage.setItem('accessToken', result.accessToken);
  }
  
  return result;
}

export async function getCurrentUser(): Promise<{ user: User }> {
  return fetchAPI('/user');
}

export function signout() {
  localStorage.removeItem('accessToken');
}

// Post APIs
export async function createPost(
  title: string,
  description: string,
  content: string,
  category: string,
  tags: string[]
): Promise<{ post: Post }> {
  return fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, description, content, category, tags }),
  });
}

export async function getPosts(sort?: string, category?: string): Promise<{ posts: Post[] }> {
  const params = new URLSearchParams();
  if (sort) params.append('sort', sort);
  if (category) params.append('category', category);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/posts${query}`);
}

export async function upvotePost(postId: string): Promise<{ upvotes: number; isUpvoted: boolean }> {
  return fetchAPI(`/posts/${postId}/upvote`, {
    method: 'POST',
  });
}

export async function bookmarkPost(postId: string): Promise<{ isBookmarked: boolean }> {
  return fetchAPI(`/posts/${postId}/bookmark`, {
    method: 'POST',
  });
}

export async function getBookmarks(): Promise<{ posts: Post[] }> {
  return fetchAPI('/bookmarks');
}

export async function getContributors(): Promise<{ contributors: Contributor[] }> {
  return fetchAPI('/contributors');
}

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  return fetchAPI(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function getComments(postId: string): Promise<{ comments: Comment[] }> {
  return fetchAPI(`/posts/${postId}/comments`);
}

export async function createComment(postId: string, content: string): Promise<{ comment: Comment }> {
  return fetchAPI(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return fetchAPI(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export async function saveDraft(
  title: string,
  description: string,
  content: string,
  category: string,
  tags: string[]
): Promise<{ draft: any }> {
  return fetchAPI('/drafts', {
    method: 'POST',
    body: JSON.stringify({ title, description, content, category, tags }),
  });
}

export async function getDrafts(): Promise<{ drafts: any[] }> {
  return fetchAPI('/drafts');
}

export async function followUser(userId: string): Promise<{ isFollowing: boolean }> {
  return fetchAPI(`/users/${userId}/follow`, {
    method: 'POST',
  });
}

export async function updateProfile(
  name: string,
  country: string,
  bio?: string,
  website?: string
): Promise<{ user: User }> {
  return fetchAPI('/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, country, bio, website }),
  });
}

export async function searchPosts(query: string): Promise<{ posts: Post[] }> {
  const params = new URLSearchParams();
  params.append('q', query);
  return fetchAPI(`/search?${params.toString()}`);
}