# FHE Lab — Project Spec

**Niche:** Fully-homomorphic encryption (FHE) — the BFV (Brakerski–Fan–Vercauteren) scheme over the cyclotomic ring ℤ[x]/(x^n+1).

**Goal:** Build an interactive, zero-dependency lab that lets a user encrypt values, perform add/multiply on ciphertexts, and decrypt the result — without ever exposing the plaintext values to the computation engine.

## Scope

### In scope
- Polynomial ring arithmetic over ℤ[x]/(x^n+1).
- Toy BFV scheme: keygen, encrypt, decrypt (degree-1 and degree-2).
- Homomorphic addition of two ciphertexts.
- Homomorphic multiplication of two ciphertexts (tensor product → degree-2 ciphertext).
- Scalar addition and scalar multiplication on ciphertexts.
- Interactive single-page UI (vanilla JS + BigInt, no build).
- Verification harness with non-vacuity mutation gates.
- Documentation: spec, architecture, security, testing, why, retrospective.

### Out of scope (intentionally)
- Relinearization — the toy scheme returns a degree-2 ciphertext after multiplication; the decoder handles s². (Real BFV uses a relin key and modulus-raising to control ciphertext growth.)
- Modulus switching / bootstrapping.
- Real security parameters (q ~2^k for k ≥ 4096, NTT, polynomial compression).
- Production-ready PRNG — uses Math.random (documented as toy).
- Secure key distribution or side-channel resistance.
- Multi-variable or vector Ciphertext-Policy ABE / threshold decryption.

## Parameters (toy, not secure)
- n = 8 (ring degree, power of two)
- q = 10^18 (effective integer modulus; no wrap in ring arithmetic)
- t = 101 (plaintext modulus)
- B = 3 (error bound for secret key and noise)
- Δ = ⌊q/t⌋ = 9900990099009901 (plaintext scale)

## Interface

### Programmatic (src/fhe.js)
- `keygen(params)` → context object
- `encrypt(ctx, m)` → ciphertext degree-1 `[c0, c1]`
- `decrypt(ctx, ct)` → plaintext `[m]`
- `add(ctx, ct1, ct2)` → degree-1
- `mul(ctx, ct1, ct2)` → degree-2 `[c00, c01, c11]`
- `addScalar(ctx, ct, m)` → degree-1
- `mulScalar(ctx, ct, m)` → degree-1

### UI (index.html)
- 4-panel interactive flow (keygen → encrypt → compute → decrypt)
- "Inside the math" tab (ring wraparound demo, Δ explanation, tensor product, wrong-key demo)
- "Verify" tab (runs the 263-assertion harness in-browser)
- Live pipeline (encrypt two values, add+mul, decrypt both)

## Test plan
- P1: ring multiplication mod (x^n+1) with alternating sign
- P2: encrypt/decrypt round-trip for representative values (0, 1, 5, 50, 99, 100)
- P3: homomorphic add (50 random pairs, expect (a+b) mod t)
- P4: homomorphic mul (200 random pairs, expect (a·b) mod t)
- P5: scalar add and scalar mul on ciphertexts
- M1: tamper a ciphertext coefficient → decryption must change
- M2: decrypt with a different secret key → decryption must change
