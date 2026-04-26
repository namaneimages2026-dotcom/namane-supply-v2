const hashCode = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const toQrDataUrl = async (value: string) => {
  const size = 21;
  const cell = 8;
  const seed = hashCode(value);
  let squares = "";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const bit = ((x * 73 + y * 97 + seed) % 7) < 3;
      if (bit) squares += `<rect x='${x * cell}' y='${y * cell}' width='${cell}' height='${cell}' fill='#0f172a'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size * cell} ${size * cell}'><rect width='100%' height='100%' fill='#f8fafc'/>${squares}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
