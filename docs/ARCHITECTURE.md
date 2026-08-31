# FHE Lab — Architecture

## 1. Ring: Z_LARGEX[x] / (x^n + 1)

Polynomial ring elements are represented as `Array<BigInt>` of length n. Coefficients are **not** reduced modulo a coefficient ring — they are large integers (up to ~128 bits) so products never overflow. This sidesteps real-BFV complications (modulus switching, relinearization) and keeps the loop body simple.

Key operation: `mul(a, b)`, cyclic convolution with the cyclotomic relation x^n ≡ −1:
- For k < n, coeff[k] += a[i]·b[j]
- For n ≤ k < 2n, coeff[k−n] −= a[i]·b[j]
- For k ≥ 2n, coeff[k−2n] += a[i]·b[j] (degree of convolution up to 2n−2)

This alternation encodes the ideal (x^n+1).

## 2. BFV-style scheme (toy, no relinearization)

### 2.1 Key generation
- **Secret key s**: small-coefficients ring element (bounded by B).
- **Public key pk = (pk0, pk1)** where:
  - a ← Uniform ring mod q
  - e ← Small ring
  - pk0 = −a·s − e
  - pk1 = a
  - Invariant: pk0 + s·pk1 = −e (small)

### 2.2 Encryption of plaintext m ∈ R_t
- u ← Small ring (toy simplification; real BFV uses uniform u)
- e0, e1 ← Small ring
- Δ = ⌊q/t⌋
- c0 = pk0·u + e0 + Δ·m
- c1 = pk1·u + e1

### 2.3 Decryption (degree-1)
- phase = c0 + c1·s = Δ·m + e0 − e·u + s·e1
- m̂ = round(t/q · phase) mod t

With toy parameters, e·u is small enough that the noise stays well under Δ/2.

### 2.4 Decryption (degree-2)
After multiplication, ciphertext is [c00, c01, c11].
- phase = c00 + c01·s + c11·s²
- m̂ = round(t²/q² · phase) mod t

The s² term absorbs the squared secret-key coefficients; noise stays bounded with large q.

## 3. Homomorphic operations

- **Addition**: componentwise on ciphertexts of the same degree.
  - (c0+c0', c1+c1')
- **Multiplication**: tensor product:
  - c00 = c0·d0
  - c01 = c0·d1 + c1·d0
  - c11 = c1·d1
  - Result is a degree-2 ciphertext; decryption uses s².
- **Scalar add/mul**: distribute Δ scaling of the plaintext value across c0.

## 4. UI / browser layer

- Inline copy of the core math for browser portability (no Node require).
- Three tabs: Try it, Inside the math, Verify it.
- Live pipeline: two plaintexts → encrypt → add+mul → decrypt, showing each phase.
- Inspect tab: ring wraparound demo, Δ scale, tensor product display, wrong-key demonstration.

## 5. Test harness

- Node script: imports `src/fhe.js`, runs 263 assertions.
- Two mutation gates (M1: corrupt ciphertext, M2: wrong secret key) prove non-vacuity.

## 6. Dependency graph

```
index.html ──┐
             │  (inlined subset for browser)
tests/test_fhelab.js ─── src/fhe.js ─── Node.js (BigInt, no polyfills)
```

Zero npm dependencies. The module uses CommonJS (`module.exports`).
