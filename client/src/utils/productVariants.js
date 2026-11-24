const normalize = (value) => String(value || '').trim().toLowerCase();

/** Return the image assigned to a color, or the first general image as fallback. */
export const getColorImageIndex = (product, color) => {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (!images.length) return 0;

  const imageColors = Array.isArray(product?.imageColors) ? product.imageColors : [];
  const selectedColor = normalize(color);
  const matchingIndex = selectedColor
    ? imageColors.findIndex((imageColor, index) => index < images.length && normalize(imageColor) === selectedColor)
    : -1;

  if (matchingIndex >= 0) return matchingIndex;

  const generalImageIndex = images.findIndex((_, index) => !normalize(imageColors[index]));
  return generalImageIndex >= 0 ? generalImageIndex : 0;
};

export const getVariantKey = (size, color) => JSON.stringify([
  normalize(size || 'Standard'),
  normalize(color || 'Default')
]);

export const isVariantAvailable = (product, size, color) => {
  if (product?.stock !== null && product?.stock !== undefined && Number(product.stock) <= 0) return false;
  const unavailable = Array.isArray(product?.unavailableVariants) ? product.unavailableVariants : [];
  return !unavailable.includes(getVariantKey(size, color));
};

export const getVariantOptions = (product) => ({
  sizes: Array.isArray(product?.sizes) && product.sizes.length ? product.sizes : ['Standard'],
  colors: Array.isArray(product?.colors) && product.colors.length ? product.colors : ['Default']
});

export const getFirstAvailableVariant = (product) => {
  const { sizes, colors } = getVariantOptions(product);
  for (const size of sizes) {
    for (const color of colors) {
      if (isVariantAvailable(product, size, color)) return { size, color };
    }
  }
  return { size: sizes[0], color: colors[0] };
};

export const hasAvailableVariant = (product) => {
  const { sizes, colors } = getVariantOptions(product);
  return sizes.some(size => colors.some(color => isVariantAvailable(product, size, color)));
};
