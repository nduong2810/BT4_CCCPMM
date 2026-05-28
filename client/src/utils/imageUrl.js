const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

const getServerBaseUrl = () => {
  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  return rawBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

const normalizeImagePath = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return PLACEHOLDER_IMAGE;

  const cleanPath = imagePath.trim();
  if (!cleanPath) return PLACEHOLDER_IMAGE;

  if (/^(https?:)?\/\//i.test(cleanPath) || /^(data|blob):/i.test(cleanPath)) {
    return cleanPath;
  }

  if (cleanPath.startsWith('/')) {
    return `${getServerBaseUrl()}${cleanPath}`;
  }

  return `${getServerBaseUrl()}/${cleanPath}`;
};

export const getProductImageUrl = (productOrImage) => {
  if (typeof productOrImage === 'string') {
    return normalizeImagePath(productOrImage);
  }

  const image = productOrImage?.images?.[0] || productOrImage?.image || productOrImage?.thumbnail;
  return normalizeImagePath(image);
};

export { PLACEHOLDER_IMAGE };
