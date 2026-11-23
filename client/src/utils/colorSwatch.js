const COLOR_MAP = {
  black: '#111111', white: '#ffffff', red: '#dc2626', blue: '#2563eb',
  navy: '#1e3a8a', green: '#16a34a', grey: '#6b7280', gray: '#6b7280',
  yellow: '#eab308', pink: '#ec4899', purple: '#9333ea', orange: '#f97316',
  brown: '#854d0e', beige: '#d6c5a5', cream: '#f5f0e6', gold: '#c49a36',
  silver: '#c0c0c0', 'off white': '#f5f5f0', burgundy: '#800020'
};

export const getColorSwatch = (label = '') => {
  const parts = label.toLowerCase().split(/\s*(?:\/|,|&|\band\b)\s*/).filter(Boolean);
  const colors = parts.map(part => COLOR_MAP[part] || '#d4d4d8');
  if (colors.length > 1) {
    const stops = colors.map((color, index) => `${color} ${index * 100 / colors.length}% ${(index + 1) * 100 / colors.length}%`).join(', ');
    return `linear-gradient(135deg, ${stops})`;
  }
  return colors[0] || '#d4d4d8';
};

