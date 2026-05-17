/* ── PRNG (used only for modules that have no real browser API) ── */
export function _seed(file, buffer) {
  let h = file.size;
  for (let i = 0; i < Math.min(file.name.length, 64); i++)
    h = (Math.imul(h, 31) + file.name.charCodeAt(i)) | 0;
  if (buffer && buffer.byteLength > 0) {
    const b = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1024));
    for (let i = 0; i < b.length; i += 4)
      h = (Math.imul(h, 31) + b[i]) | 0;
  }
  return (Math.abs(h ^ (file.lastModified | 0)) || 0xDEAD) >>> 0;
}

export function _prng(seed) {
  let s = seed === 0 ? 0xDEAD : seed;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };
}

export const _pad = (n) => String(n).padStart(2, '0');

export const _date = (r, y0 = 2018, sp = 7) => {
  const y = y0 + Math.floor(r() * sp),
    m = Math.ceil(r() * 12),
    d = Math.ceil(r() * 28),
    H = Math.floor(r() * 24),
    M = Math.floor(r() * 60),
    S = Math.floor(r() * 60);
  return `${y}-${_pad(m)}-${_pad(d)} ${_pad(H)}:${_pad(M)}:${_pad(S)}`;
};

export const getVerdict = (score, threshold = 65) => {
  if (score < 40) return 'error'; // Extreme case
  if (score < threshold) return 'warning';
  return 'clean';
};
