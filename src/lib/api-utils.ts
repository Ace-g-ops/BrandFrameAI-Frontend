/**
 * API Utility Functions
 * Helper functions for common API operations
 */

import { api } from './api';
import { handleApiError } from './axios';
import type { GeneratedImage, Preset } from './api';

/**
 * Retry an API call with exponential backoff
 */
export const retryApiCall = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('API call failed after retries');
};

/**
 * Validate file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG or PNG image.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit. Please upload a smaller image.',
    };
  }

  return { valid: true };
};

/**
 * Convert File to base64 (useful for previews)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Download image from URL
 */
export const downloadImage = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw new Error(`Failed to download image: ${handleApiError(error)}`);
  }
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get shot type display name
 */
export const getShotTypeLabel = (shotType: string): string => {
  const labels: Record<string, string> = {
    lifestyle: 'Lifestyle',
    hero: 'Hero',
    flat_lay: 'Flat Lay',
    context: 'Context',
    white_background: 'White Background',
    portrait: 'Portrait',
    landscape: 'Landscape',
    instagram_post: 'Instagram Post',
    square: 'Square',
    instagram_story: 'Instagram Story',
  };
  return labels[shotType] || shotType;
};

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return api.isAuthenticated();
};

/**
 * Logout and redirect
 */
export const logout = async (redirectTo = '/auth'): Promise<void> => {
  try {
    await api.logout();
    window.location.href = redirectTo;
  } catch (error) {
    // Clear token even if logout fails
    api.clearToken();
    window.location.href = redirectTo;
  }
};

/**
 * Get image URL (handles both relative and absolute URLs)
 */
export const getImageUrl = (url: string, baseUrl?: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If relative URL, prepend base URL
  const apiBase = baseUrl || import.meta.env.VITE_API_BASE_URL || 'https://brandframeai.fly.dev';
  return `${apiBase.replace('/api', '')}/storage/${url}`;
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Create a preset from a generated image
 */
export const createPresetFromImage = async (
  image: GeneratedImage,
  name: string,
  description?: string
): Promise<Preset> => {
  if (!image.structured_prompt) {
    throw new Error('Image does not have structured prompt data');
  }

  return api.createPreset({
    name,
    description: description || `Preset created from image ${image.id}`,
    shot_type: image.shot_type as any,
    structured_prompt: image.structured_prompt,
  });
};

