export const resolveImageUrl = (imagePath?: string): string => {
  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';

  if (!imagePath || typeof imagePath !== 'string') return fallbackImage;

  // 1. Return Base64 data strings directly
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }

  // 2. Return direct HTTP/HTTPS URLs directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // 3. Format relative backend paths cleanly
  const cleanPath = imagePath.replace(/\\/g, '/');
  const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  const baseUrl = BACKEND_URL.replace(/\/$/, '');

  return `${baseUrl}${formattedPath}`;
};