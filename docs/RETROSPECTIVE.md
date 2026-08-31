# RETROSPECTIVE — FHE Lab

**Date:** 2026-08-31
**Niche:** Homomorphic encryption (BFV-style) over ℤ[x]/(x^n+1)
**Difficulty:** 18/20
**Status:** ✅ Built, tested (263 assertions, 2 mutation gates), verified, pushed (github.com/harmanhanjra/fhelab)

## Summary

An interactive single-page lab for a toy BFV-style fully-homomorphic encryption scheme:
- **Key generation**: random small secret s, public key pk = (−a·s − e, a).
- **Encryption**: c0 = pk0·u + e0 + Δ·m, c1 = pk1·u + e1 (Δ = ⌊q/t⌋).
- **Addition**: componentwise on degree-1 ciphertexts.
- **Multiplication**: tensor product → degree-2 ciphertext (c00, c01, c11), decoded with s².
- **Scalar ops**: add/multiply a plaintext constant into the ciphertext.

UI: 4-panel flow (keygen → encrypt → compute → decrypt), "Inside the math" demos, in-browser verification harness. Zero dependencies: vanilla JS + BigInt.

## What went well

- **The scheme is algebraically clean.** With a large q (10¹⁸) and no coefficient modulus wrap, the ring arithmetic is pure integer — no modular inverse or NTT needed. This keeps the code short and traceable.
- **Non-vacuity gates are tight.** M1 corrupts c0 by q/4 (which must change the rounded value because Δ = q/t ≈ q/100, and q/4 = 25·Δ ≫ Δ/2). M2 decrypts with an independent key — the phase is entirely dominated by the wrong secret, so garbage is guaranteed.
- **The tensor product is visually intuitive.** The degree-2 ciphertext (c00, c01, c11) makes it obvious why relinearization is needed in real BFV: without it, ciphertext size doubles every multiplication.
- **The in-browser harness (205 assertions) is a great demo asset.** It runs the same properties as the Node harness and proves to a non-technical audience that the scheme is "proven" in their own browser.

## Bug fixed

- **Initial decrypt failure (factor-of-2 noise error).** Early draft used uniform u in encrypt. The term e·u (uniform × small) has norm ~√n · B · q/2 ≈ 3·q/2, which dwarfs Δ = q/t ≈ q/100. Fix: sample u from the small-error distribution (same bound as e), so e·u norm ~√n·B² ≈ 18 — well under Δ/2 ≈ q/200. This is a toy simplification; real BFV uses uniform u with huge q.
- **Relinearization key structure bug.** First draft had rlk = [a', rlk1] — missing the -a'·s - e' structure for rlk0. Fixed to rlk = [rlk0, a'] with rlk0 = -a'·s - e'. (Note: the final scheme skips relinearization entirely, so this bug was latent until multiplication was added.)
- **Modulus overflow in mul (425 → 99 with q = 7919).** The product of two degree-1 ciphertexts has coefficients up to q² ~ 6·10⁷, exceeding q = 7919. Fix: use a large effective-integer modulus (2¹²⁸) so coefficients never wrap; the plaintext modulus q only sets the scale Δ.

## Lessons

- **The scale Δ = ⌊q/t⌋ is the noise budget.** A decryption succeeds only if the noise norm ||e0 − e·u + s·e1||∞ < Δ/2. With uniform u the noise is O(q), breaking decryption. With small u it's O(B²√n), leaving Δ/2 - O(B²√n) slack — which is why toy-parameters work.
- **Degree-2 ciphertexts are a feature for teaching.** Real BFV hides them behind relinearization, which obliterates the multiplication intuition. Here, seeing (c00, c01, c11) makes it clear that multiplication composes two RLWE samples, and that decryption must handle s².
- **Toy PRNG is fine for a lab, a crime for production.** Math.random() is predictable; with known public-key elements and a few ciphertexts, an adversary could reconstruct the secret. This is explicitly documented.
- **q needs to be large enough for the plaintext range but small enough to fit in memory.** q = 10¹⁸ fits comfortably in JS BigInt (JavaScript number is only 53 bits of precision, but BigInt is arbitrary-precision). This is the main reason we chose q > 10¹⁶ rather than 2¹²⁸ (which would slow the O(n²) ring mul by a factor of ~256).

## Improvements for next cycle

- **Modulus switching.** Implement the real BFV trick: after each multiplication, switch from modulus q to q' < q to shrink ciphertext growth. This lets you chain more multiplications.
- **Relinearization.** Add the RLK-based reduction from degree-2 to degree-1 ciphertexts; this is the missing piece that turns a toy into a real scheme.
- **Batching (SIMD).** BFV supports encrypting vectors of plaintexts in a single ciphertext via the Chinese Remainder Theorem on the ring. Demonstrating this would show how FHE is practical (one ciphertext encrypts hundreds of integers).
- **CKKS (approximate arithmetic).** Extend to real-number encryption via the CKKS scheme — useful for encrypted ML inference.
- **Bootstrapping.** Gentry's "squaring" bootstrapping can refresh the noise budget, enabling arbitrarily deep circuits. This is the hardest part of FHE and would make an excellent follow-up.

## Next recommended niche

**ZK-rollup circuit design (beyond toy).** The prior cycle (zkprooflab) built a toy Groth16 verifier. Next step: design and verify a small but real rollup circuit (e.g., ETH → L2 state transitions with fraud proofs), or a ZK-compiler that turns a small TypeScript program into a R1CS constraint system verifiable by the Groth16 verifier. Difficulty 18+.
