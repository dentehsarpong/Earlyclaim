import { API_BASE_URL } from '../apiConfig';

/**
 * Helper utility to construct correct image URLs.
 * Prepends the backend API URL for images stored on the server.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

  // If the path is a full URL, return as is.
  if (imagePath.startsWith('http')) {
      return imagePath;
  }

  // If the path starts with /uploads/ (legacy local storage), prepend backend URL.
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  return imagePath;
};
