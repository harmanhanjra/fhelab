'use strict';
/**
 * FHE Lab — a toy BFV-style homomorphic encryption scheme over the ring
 * R = Z[x]/(x^n + 1).
 *
 * Educational implementation. NOT production/secure (see SECURITY.md): a tiny
 * ring degree n, small plaintext modulus t, and a toy PRNG demonstrate the
 * algebra of fully-homomorphic encryption (add + multiply on ciphertexts)
 * without any real security level.
 *
 * Design note for readability: all ciphertext ring arithmetic is carried over a
 * huge modulus (2^128) so intermediate products never wrap — this is
 * mathematically an integer/RLWE evaluation. The cryptographic modulus q only
 * sets the plaintext scale Δ = ⌊q/t⌋ and the public-key uniforms. Because we
 * skip modulus-raising/relinearization (which real BFV needs to control
 * ciphertext growth and keep keys linear), a multiplication returns a
 * *degree-2* ciphertext (c00, c01, c11), decoded with s².
 *
 *   Plaintext : m ∈ R_t
 *   Ciphertext: degree-1 (c0,c1) for fresh encryptions; degree-2 (c00,c01,c11)
 *               after a multiplication.
 *   Secret key s with small coefficients.
 *   Encryption : c0 = b·u + e0 + Δ·m ,  c1 = a·u + e1   (Δ = ⌊q/t⌋)
 *   Decrypt d1 : m = round((t/q)·(c0 + c1·s))    mod t
 *   Decrypt d2 : m = round((t²/q²)·(c00+c01·s+c11·s²)) mod t
 *   Add        : (c0+c0', c1+c1')
 *   Multiply   : tensor product → degree-2
 *
 * Zero dependencies — vanilla JS + native BigInt.
 */

const LARGE = (1n << 128n); // effectively-integer ring modulus; nothing wraps

/** Random integer in [0, m). Toy PRNG (Math.random) — see SECURITY.md. */
function rand(m) {
  return Math.floor(Math.random() * Number(m));
}
/** Random integer in [-b, b]. */
function randSmall(b) {
  return rand(2 * b + 1) - b;
}

/** Polynomial ring Z_LARGE[x]/(x^n + 1). Coefficients are BigInt. */
class Ring {
  constructor(n) {
    this.n = n;
  }
  norm(x) {
    return ((x % LARGE) + LARGE) % LARGE;
  }
  pad(c) {
    const out = new Array(this.n).fill(0n);
    for (let i = 0; i < Math.min(c.length, this.n); i++) out[i] = BigInt(c[i]);
    return out;
  }
  add(a, b) {
    return a.map((x, i) => x + b[i]);
  }
  sub(a, b) {
    return a.map((x, i) => x - b[i]);
  }
  scale(a, k) {
    return a.map((x) => x * BigInt(k));
  }
  /** Multiply mod (x^n + 1): alternating-sign cyclic convolution (exact ints). */
  mul(a, b) {
    const n = this.n, out = new Array(n).fill(0n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const k = i + j, v = a[i] * b[j];
        if (k < n) out[k] += v;
        else if (k < 2 * n) out[k - n] -= v; // x^n ≡ -1
        else out[k - 2 * n] += v;            // degree up to 2n-2
      }
    }
    return out;
  }
}

function smallRing(ring, B) {
  return ring.pad(Array.from({ length: ring.n }, () => BigInt(randSmall(B))));
}
function uniRing(ring, q) {
  return ring.pad(Array.from({ length: ring.n }, () => BigInt(rand(q))));
}

/** keygen(params) → context: secret key + public key (Δ, constants). */
function keygen(params) {
  const n = params.n, q = BigInt(params.q), t = BigInt(params.t), B = params.B;
  const ring = new Ring(n);              // effective-integer ring
  const Delta = q / t;

  const s = smallRing(ring, B);          // secret key
  const a = uniRing(ring, q);            // uniform mod q
  const e = smallRing(ring, B);
  const pk0 = ring.sub(ring.scale(ring.mul(a, s), -1), e); // -a·s - e
  const pk = [pk0, a];                   // pk0 + s·pk1 = -e (small)

  return { n, q, t, B, ring, Delta, s, pk, noise: { a, e } };
}

/** Encrypt plaintext m (coeffs < t, BigInt) → degree-1 ciphertext [c0, c1]. */
function encrypt(ctx, m) {
  const { ring, pk, t, Delta, B } = ctx;
  const u = smallRing(ring, B);
  const e0 = smallRing(ring, B);
  const e1 = smallRing(ring, B);
  const mm = ring.pad(Array.from(m, (x) => ((BigInt(x) % t) + t) % t));
  const scaled = ring.scale(mm, Delta);
  const c0 = ring.add(ring.add(ring.mul(pk[0], u), e0), scaled);
  const c1 = ring.add(ring.mul(pk[1], u), e1);
  return [c0, c1];
}

/**
 * Decrypt any ciphertext → plaintext coeffs (mod t).
 * Degree-1: phase = c0 + c1·s,          decode round(t/q · phase).
 * Degree-2: phase = c00 + c01·s + c11·s², decode round(t²/q² · phase).
 */
function decrypt(ctx, ct) {
  const { ring, s, t, q } = ctx;
  let phase, scale;
  if (ct.length === 2) {
    phase = ring.add(ct[0], ring.mul(s, ct[1]));
    scale = [t, q];                      // (t/q)
  } else {
    const s2 = ring.mul(s, s);
    phase = ring.add(ring.add(ct[0], ring.mul(s, ct[1])), ring.mul(s2, ct[2]));
    scale = [t * t, q * q];              // (t²/q²)
  }
  return phase.map((x) => {
    const num = x * scale[0] + scale[1] / 2n;
    const r = num / scale[1];
    return ((r % t) + t) % t;
  });
}

/** Homomorphic addition (both degree-1) → degree-1. */
function add(ctx, ct1, ct2) {
  const { ring } = ctx;
  if (ct1.length !== 2 || ct2.length !== 2) {
    throw new Error('add: toy supports degree-1 operands only');
  }
  return [ring.add(ct1[0], ct2[0]), ring.add(ct1[1], ct2[1])];
}

/** Homomorphic scalar addition: ct + m (degree-1). */
function addScalar(ctx, ct, m) {
  const { ring, t, Delta } = ctx;
  const enc = ring.scale(ring.pad([BigInt(m)]), Delta);
  return [ring.add(ct[0], enc), ct[1]];
}

/** Homomorphic scalar multiplication: ct * m (degree-1). */
function mulScalar(ctx, ct, m) {
  const { ring } = ctx;
  return [ring.scale(ct[0], m), ring.scale(ct[1], m)];
}

/**
 * Homomorphic multiplication (both degree-1) → degree-2 tensor ciphertext.
 * phase₂ = c00 + c01·s + c11·s² ≈ Δ²·(m1·m2).
 */
function mul(ctx, ct1, ct2) {
  const { ring } = ctx;
  if (ct1.length !== 2 || ct2.length !== 2) {
    throw new Error('mul: toy supports degree-1 operands only');
  }
  const c00 = ring.mul(ct1[0], ct2[0]);
  const c01 = ring.add(ring.mul(ct1[0], ct2[1]), ring.mul(ct1[1], ct2[0]));
  const c11 = ring.mul(ct1[1], ct2[1]);
  return [c00, c01, c11];
}

/** Encode a scalar integer as a plaintext (coefficient 0 = value). */
function encodeInt(v) {
  return [BigInt(v)];
}

module.exports = {
  Ring, rand, randSmall, LARGE,
  keygen, encrypt, decrypt, add, addScalar, mulScalar, mul, encodeInt,
};
