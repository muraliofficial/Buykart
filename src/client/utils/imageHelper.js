/**
 * Resolves full usable image URL for products.
 * Handles Cloudinary URLs, absolute paths, and fallback placeholders.
 */
export const getProductImageUrl = (product) => {
  if (!product || !product.image) {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
  }
  
  if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
    return product.image;
  }

  const cleanName = product.image.replace(/^inventory[\\/]/, '');
  return `/public/img/inventory/${cleanName}`;
};
