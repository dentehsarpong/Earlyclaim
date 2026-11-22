/**
 * Helper utility to construct correct image URLs.
 * Prepends the backend API URL for images stored on the server.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

  // If the path starts with /uploads/ (legacy local storage), prepend backend URL.
  // Otherwise, if it's already a full URL (from Supabase/Cloudinary), return as is.
  if (imagePath.startsWith('/uploads/')) {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://earlyclaim.onrender.com';
    return `${backendUrl}${imagePath}`;
  }

  return imagePath;
};
