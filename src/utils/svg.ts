export function renderProgressRing(
  spotted: number,
  total: number,
  size: number,
  color: string,
): string {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? spotted / total : 0;
  const offset = circ * (1 - pct);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--w06)" stroke-width="3"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dashoffset .6s ease"/></svg>`;
}
