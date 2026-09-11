import { useState, useEffect } from 'react';

/**
 * Resolves full usable image URL for products.
 * Safely handles Cloudinary responsive variants (jpg_300, jpg_700, jpg_xl),
 * empty objects {}, objects with url, absolute paths, and fallback placeholders.
 */

// Default high-quality placeholder for fresh grocery & essentials
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

/**
 * Converts any Cloudinary URL or image string into responsive format variants:
 * - jpg_300: 300px thumbnail (product cards, grids)
 * - jpg_700: 700px medium (modals, detail cards)
 * - jpg_xl:  1200px extra-large (lightbox, zoom)
 */
export const convertImageSizes = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      jpg_300: DEFAULT_PRODUCT_IMAGE,
      jpg_700: DEFAULT_PRODUCT_IMAGE,
      jpg_xl: DEFAULT_PRODUCT_IMAGE,
      original: DEFAULT_PRODUCT_IMAGE,
    };
  }

  // Handle Cloudinary dynamic on-the-fly transformations
  if (rawUrl.includes('cloudinary.com') && rawUrl.includes('/upload/')) {
    // Clean existing transformation flags if present (e.g. /upload/w_300,c_fill/)
    const cleanUrl = rawUrl.replace(/\/upload\/(?:[a-z]_[^/]+\/)+/, '/upload/');
    return {
      jpg_300: cleanUrl.replace('/upload/', '/upload/w_300,c_fill,q_auto,f_jpg/'),
      jpg_700: cleanUrl.replace('/upload/', '/upload/w_700,c_limit,q_auto,f_jpg/'),
      jpg_xl: cleanUrl.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_jpg/'),
      original: cleanUrl,
    };
  }

  return {
    jpg_300: rawUrl,
    jpg_700: rawUrl,
    jpg_xl: rawUrl,
    original: rawUrl,
  };
};

/**
 * Custom React Hook: useImage (also exported as useImageSizeConverter)
 * Converts any product object, image object, or raw image URL into responsive sizes:
 * {
 *   jpg_300: string,
 *   jpg_700: string,
 *   jpg_xl: string,
 *   original: string,
 *   src: string,
 *   url: string,
 *   hasImage: boolean
 * }
 * Formats supported: jpg_300, jpg_700, jpg_xl type
 */
export const useImage = (productOrUrl, preferredSize = 'jpg_700') => {
  const computeSizes = (input, sizeKey) => {
    if (!input) {
      return {
        jpg_300: DEFAULT_PRODUCT_IMAGE,
        jpg_700: DEFAULT_PRODUCT_IMAGE,
        jpg_xl: DEFAULT_PRODUCT_IMAGE,
        original: DEFAULT_PRODUCT_IMAGE,
        src: DEFAULT_PRODUCT_IMAGE,
        url: DEFAULT_PRODUCT_IMAGE,
        hasImage: false,
      };
    }

    // 1. If input is an object that already has format variants directly
    if (typeof input === 'object' && (input.jpg_300 || input.jpg_700 || input.jpg_xl)) {
      const orig = input.url || input.secure_url || input.original || input.jpg_700 || input.jpg_300;
      const res = {
        jpg_300: input.jpg_300 || orig,
        jpg_700: input.jpg_700 || orig,
        jpg_xl: input.jpg_xl || orig,
        original: orig || DEFAULT_PRODUCT_IMAGE,
      };
      const chosen = res[sizeKey] || res.jpg_700 || res.original;
      return {
        ...res,
        src: chosen,
        url: chosen,
        hasImage: true,
      };
    }

    // 2. If input is a product object with image property
    if (typeof input === 'object' && input.image) {
      if (typeof input.image === 'object' && (input.image.jpg_300 || input.image.jpg_700 || input.image.jpg_xl)) {
        const orig = input.image.url || input.image.secure_url || input.image.original || input.image.jpg_700 || input.image.jpg_300;
        const res = {
          jpg_300: input.image.jpg_300 || orig,
          jpg_700: input.image.jpg_700 || orig,
          jpg_xl: input.image.jpg_xl || orig,
          original: orig || DEFAULT_PRODUCT_IMAGE,
        };
        const chosen = res[sizeKey] || res.jpg_700 || res.original;
        return {
          ...res,
          src: chosen,
          url: chosen,
          hasImage: true,
        };
      }
    }

    // 3. Fallback to resolving via getProductImageUrl and convertImageSizes
    const rawUrl = typeof input === 'string' ? input : getProductImageUrl(input);
    const converted = convertImageSizes(rawUrl);
    const hasImg = hasProductImage(typeof input === 'object' ? input : { image: input });
    const chosen = converted[sizeKey] || converted.jpg_700 || converted.original;

    return {
      ...converted,
      src: chosen,
      url: chosen,
      hasImage: hasImg,
    };
  };

  const [sizes, setSizes] = useState(() => computeSizes(productOrUrl, preferredSize));

  useEffect(() => {
    setSizes(computeSizes(productOrUrl, preferredSize));
  }, [productOrUrl, preferredSize]);

  return sizes;
};

// Export useImageSizeConverter as alias for useImage
export const useImageSizeConverter = useImage;

/**
 * Checks whether a product has an actual user-uploaded image (not an empty object or null).
 */
export const hasProductImage = (product) => {
  if (!product || !product.image) return false;

  if (typeof product.image === 'string') {
    return product.image.trim().length > 0;
  }

  if (typeof product.image === 'object') {
    if (Object.keys(product.image).length === 0) return false;
    return Boolean(
      product.image.url ||
      product.image.secure_url ||
      product.image.jpg_300 ||
      product.image.jpg_700 ||
      product.image.jpg_xl
    );
  }

  return false;
};

/**
 * Returns safe, valid image URL for rendering with requested size variant.
 * @param {Object|string} product - Product document or image URL
 * @param {'jpg_300'|'jpg_700'|'jpg_xl'|null} size - Optional requested size variant
 */
export const getProductImageUrl = (product, size = null) => {
  if (!product || !product.image) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // 1. Handle object representation (map stored in Firestore)
  if (typeof product.image === 'object') {
    // If requested specific format variant directly exists
    if (size && product.image[size]) return product.image[size];

    // Priority for variants based on requested size or fallbacks
    if (size === 'jpg_300' && product.image.jpg_300) return product.image.jpg_300;
    if (size === 'jpg_700' && product.image.jpg_700) return product.image.jpg_700;
    if (size === 'jpg_xl' && product.image.jpg_xl) return product.image.jpg_xl;

    const baseSource = product.image.secure_url || product.image.url || product.image.jpg_700 || product.image.jpg_300 || product.image.jpg_xl;
    if (baseSource) {
      return size ? convertImageSizes(baseSource)[size] || baseSource : baseSource;
    }

    return DEFAULT_PRODUCT_IMAGE;
  }

  // 2. Handle string representation
  if (typeof product.image === 'string') {
    const trimmed = product.image.trim();
    if (!trimmed) return DEFAULT_PRODUCT_IMAGE;

    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      if (size && trimmed.includes('cloudinary.com')) {
        return convertImageSizes(trimmed)[size] || trimmed;
      }
      return trimmed;
    }

    const cleanName = trimmed.replace(/^inventory[\\/]/, '');
    return `/public/img/inventory/${cleanName}`;
  }

  return DEFAULT_PRODUCT_IMAGE;
};
