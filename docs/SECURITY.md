# FHE Lab — Security

## ⚠️ NOT SECURE — educational toy only

This is a proof-of-concept implementation. **Do not use this for any real cryptographic purpose.** The following design choices are intentional simplifications for exposition but are security fatalities in production.

## Parameter insecurity

| Parameter | Toy value | Real-world value | Gap |
|---|---|---|---|
| n (ring degree) | 8 | ≥ 4096 | 2⁸ vs 2⁴⁰⁹⁶ |
| q (coefficient modulus) | 10¹⁸ | 2^400+ | 60-bit vs 400-bit |
| t (plaintext modulus) | 101 | small (≤ 2¹⁶) | same order; this is OK |
| B (noise bound) | 3 | 1–4 | same order |
| Δ = ⌊q/t⌋ | ~10¹⁶ | ~2⁴⁰⁰ | massive |

With n = 8 and q = 10¹⁸, the LWE/RLWE instance is trivially solvable by lattice reduction (BKZ with block size ≥ n). A ciphertext can be decrypted by any third party.

## No relinearization

Real BFV requires a relinearization key to bring the degree of ciphertext products back to degree 1 after each multiplication. Without it, ciphertext size grows exponentially with circuit depth. This toy scheme uses the degree-2 ciphertext directly; it does not attempt to scale beyond one multiplication.

## Toy PRNG

The code uses `Math.random()`, which is not cryptographically secure. A real implementation uses `crypto.getRandomValues()`. With `Math.random()`, an observer who sees a keygen output can (in principle) predict future randomness.

## No noise budget tracking

Real FHE tracks "noise budget" — each homomorphic operation adds noise; when it exceeds a threshold, decryption fails. This lab does not track noise because with toy parameters the noise is always within budget. A production implementation must monitor the norm of the noise vector and abort before decryption failure or key exposure.

## No CPA/CCA security proof

This scheme is CPA-secure (semantically secure under chosen-plaintext attack) in the idealized LWE assumption with proper parameters. This toy instance has not been formally proven secure for any n; it is insecure by construction.

## Known-side-channel risks

- No constant-time multiplication or comparison.
- Polynomial arithmetic is O(n²) with early exits in the `smallRing` sampler.
- No cache-timing or power-analysis protections.

## Recommendations for real use

If you want a real FHE implementation, use a well-audited library such as:
- [OpenFHE](https://github.com/openfheorg/openfhe) (C++, supports BFV/BGV/BFVrns)
- [Microsoft SEAL](https://github.com/microsoft/SEAL) (C++, BFV/BGV/CKKS)
- [TFHE-ts](https://github.com/anthropike/tfhe-ts) (TypeScript)
- [TenSEAL](https://github.com/OpenMined/TenSEAL) (Python, C++ backend)

## This lab's purpose

The point is **pedagogical**: to show the algebra — how the RLWE structure lets you add and multiply ciphertexts while keeping the plaintext hidden. The noise-bounded ring arithmetic, the scale factor Δ, and the degree-2 tensor product are all visible here; in production, these are wrapped in heavy machinery (modulus switching, bootstrapping, batching, key switching) that obscures the core insight.
