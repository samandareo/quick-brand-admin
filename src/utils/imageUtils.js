import config from '../config/config';

/**
 * Convert relative image URL to full URL with server domain
 * @param {string} imageUrl - Relative image URL (e.g., /images/banners/image.webp)
 * @returns {string} - Full URL with server domain
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it starts with /, prepend the ecommerce API URL
  if (imageUrl.startsWith('/')) {
    return `${config.apiUrlEcommerce}${imageUrl}`;
  }
  
  // If it doesn't start with /, add it
  return `${config.apiUrlEcommerce}/${imageUrl}`;
};

/**
 * Get image URL for different image types
 * @param {string} imageUrl - Image URL from API
 * @param {string} type - Type of image (banner, product, variant)
 * @returns {string} - Full URL with server domain
 */
export const getImageUrl = (imageUrl, type = 'banner') => {
  if (!imageUrl) return '';
  
  // Handle object input (extract URL property)
  if (typeof imageUrl === 'object' && imageUrl !== null) {
    imageUrl = imageUrl.url || imageUrl.thumbnail || '';
  }
  
  // Ensure we have a string
  if (typeof imageUrl !== 'string') {
    console.warn('getImageUrl: Expected string but received:', typeof imageUrl, imageUrl);
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Ensure the URL starts with /
  const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${config.apiUrlEcommerce}${normalizedUrl}`;
};

/**
 * Get multiple image URLs for arrays of images
 * @param {Array} images - Array of image objects or URLs
 * @param {string} type - Type of images
 * @returns {Array} - Array of full URLs
 */
export const getImageUrls = (images, type = 'banner') => {
  if (!Array.isArray(images)) return [];
  
  return images.map(image => {
    if (typeof image === 'string') {
      return getImageUrl(image, type);
    } else if (image && image.url) {
      return getImageUrl(image.url, type);
    }
    return '';
  }).filter(url => url !== '');
};

/**
 * Get image URL from processed image object
 * @param {Object} processedImage - Processed image object from API
 * @param {string} type - Type of image
 * @returns {string} - Full URL with server domain
 */
export const getProcessedImageUrl = (processedImage, type = 'banner') => {
  if (!processedImage) return '';
  
  if (typeof processedImage === 'string') {
    return getImageUrl(processedImage, type);
  }
  
  if (processedImage.url) {
    return getImageUrl(processedImage.url, type);
  }
  
  return '';
};
