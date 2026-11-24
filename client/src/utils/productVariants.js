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
