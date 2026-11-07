/* Minimal AES-128 with tracing, for teaching. state = 16 bytes, column-major (state[r + 4c]). */
(function () {
  const xtime = a => ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
  function gmul(a, b) { let p = 0; for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xtime(a); b >>= 1; } return p; }
  // S-box: multiplicative inverse in GF(2^8) followed by affine transform
  const SBOX = new Array(256), INV = new Array(256);
  for (let x = 0; x < 256; x++) {
    let inv = 0;
    if (x) for (let y = 1; y < 256; y++) if (gmul(x, y) === 1) { inv = y; break; }
    let s = inv, r = inv;
    for (let i = 0; i < 4; i++) { r = ((r << 1) | (r >> 7)) & 0xff; s ^= r; }
    SBOX[x] = s ^ 0x63; INV[SBOX[x]] = x;
  }
  const RC = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

  function g(w, i) { const r = [w[1], w[2], w[3], w[0]].map(b => SBOX[b]); r[0] ^= RC[i]; return r; }
  function expandKey(key) { // key: 16 bytes -> 44 words
    const w = []; for (let i = 0; i < 4; i++) w.push(key.slice(4 * i, 4 * i + 4));
    for (let i = 4; i < 44; i++) {
      let t = w[i - 1];
      if (i % 4 === 0) t = g(t, i / 4);
      w.push(w[i - 4].map((b, j) => b ^ t[j]));
    }
    return w;
  }
  const subBytes = s => s.map(b => SBOX[b]);
  const shiftRows = s => { const o = s.slice(); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * c] = s[r + 4 * ((c + r) % 4)]; return o; };
  const invShiftRows = s => { const o = s.slice(); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * ((c + r) % 4)] = s[r + 4 * c]; return o; };
  function mixCol(a) { return [
    gmul(a[0], 2) ^ gmul(a[1], 3) ^ a[2] ^ a[3],
    a[0] ^ gmul(a[1], 2) ^ gmul(a[2], 3) ^ a[3],
    a[0] ^ a[1] ^ gmul(a[2], 2) ^ gmul(a[3], 3),
    gmul(a[0], 3) ^ a[1] ^ a[2] ^ gmul(a[3], 2)]; }
  const mixColumns = s => { const o = []; for (let c = 0; c < 4; c++) o.push(...mixCol(s.slice(4 * c, 4 * c + 4))); return o; };
  const roundKey = (w, r) => [].concat(w[4 * r], w[4 * r + 1], w[4 * r + 2], w[4 * r + 3]);
  const addRoundKey = (s, k) => s.map((b, i) => b ^ k[i]);

  function encryptTrace(pt, key) {
    const w = expandKey(key), trace = [];
    let s = addRoundKey(pt.slice(), roundKey(w, 0));
    trace.push({ round: 0, input: pt.slice(), key: roundKey(w, 0), out: s.slice() });
    for (let r = 1; r <= 10; r++) {
      const t = { round: r, start: s.slice() };
      s = subBytes(s); t.sub = s.slice();
      s = shiftRows(s); t.shift = s.slice();
      if (r < 10) { s = mixColumns(s); t.mix = s.slice(); }
      t.key = roundKey(w, r);
      s = addRoundKey(s, t.key); t.out = s.slice();
      trace.push(t);
    }
    return { w, trace, ct: s };
  }
  window.AES = { SBOX, INV, gmul, mixCol, shiftRows, invShiftRows, expandKey, encryptTrace, RC };
})();
