/**
 * Resolves full usable image URL for products.
 * Safely handles Cloudinary URLs, empty objects {}, objects with url, absolute paths, and fallback placeholders.
 */

// Default high-quality placeholder for fresh grocery & essentials
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

/**
 * Checks whether a product has an actual user-uploaded image (not an empty object or null).
 */
export const hasProductImage = (product) => {
  if (!product || !product.image) return false;

  if (typeof product.image === 'string') {
    return product.image.trim().length > 0;
  }

  if (typeof product.image === 'object') {
    // If it's an empty object {}
    if (Object.keys(product.image).length === 0) return false;
    return Boolean(product.image.url || product.image.secure_url);
  }

  return false;
};

/**
 * Returns safe, valid image URL for rendering without throwing runtime errors.
 */
export const getProductImageUrl = (product) => {
  if (!product || !product.image) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Handle object representation (e.g. { url: '...' } or empty object {})
  if (typeof product.image === 'object') {
    if (product.image.secure_url) return product.image.secure_url;
    if (product.image.url) return product.image.url;
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Handle string representation
  if (typeof product.image === 'string') {
    const trimmed = product.image.trim();
    if (!trimmed) return DEFAULT_PRODUCT_IMAGE;

    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }

    const cleanName = trimmed.replace(/^inventory[\\/]/, '');
    return `/public/img/inventory/${cleanName}`;
  }

  return DEFAULT_PRODUCT_IMAGE;
};
