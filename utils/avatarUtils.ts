// Get the base URL without /api suffix for static file access
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  // Remove /api suffix if present to get base URL for uploads
  return apiUrl.replace(/\/api$/, '');
};

export function getAvatarUrl(avatarUrl: string | null | undefined, userName: string = 'User'): string {
  if (!avatarUrl) {
    // Return default avatar from UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1B8A44&color=fff&size=128`;
  }

  // If avatar_url already contains http/https, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  const BASE_URL = getBaseUrl();

  // If avatar_url starts with /uploads, prepend BASE_URL
  if (avatarUrl.startsWith('/uploads')) {
    return `${BASE_URL}${avatarUrl}`;
  }

  // Otherwise, assume it's a relative path and prepend BASE_URL
  return `${BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
}

// Add cache busting to force reload of updated images
export function getAvatarUrlWithCacheBust(avatarUrl: string | null | undefined, userName: string = 'User'): string {
  const url = getAvatarUrl(avatarUrl, userName);
  
  // Don't add cache bust to default avatars
  if (url.includes('ui-avatars.com')) {
    return url;
  }
  
  // Add timestamp to force reload
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}
