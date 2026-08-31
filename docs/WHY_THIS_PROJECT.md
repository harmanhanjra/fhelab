# FHE Lab — Why this project

## The question

Can you encrypt two numbers, compute their product *on the ciphertexts*, and then decrypt — getting the product of the originals, but without the computation ever seeing the plaintexts?

This is the defining miracle of fully-homomorphic encryption (FHE), proved by Gentry in 2009: with the right algebraic noise structure, you can compose arbitrarily many adds and multiplies on ciphertexts and still decrypt to the right answer.

## Why build it yourself

Real FHE libraries (SEAL, OpenFHE, TFHE) are thousands of lines of C++ with NTTs, modulus switching, bootstrapping, and SIMD packing. They obscure the core insight under engineering.

This lab strips everything down to the core algebra:
- One ring: ℤ[x]/(xⁿ+1).
- One operation: the BFV round-trip — encrypt with Δ·m, add the secret-key noise, re-center by rounding.
- One multiplication: tensor product (degree-2 ciphertext) + s² decryption.

No NTT (the ring is so small O(n²) is faster). No modulus switching (we use an effectively-integer modulus so coefficients never wrap). No relinearization (we accept degree-2 ciphertexts and decode with s²).

## The audience

- CS students encountering FHE for the first time.
- Crypto engineers who want to see the noise budget in action.
- Anyone who wants to understand *why* homomorphic encryption is anything other than magic.

## Why a browser-based lab

Node CLI tests prove the math is correct. The browser UI makes it **visual**: you can watch the coefficients, see the noise grow, and observe what happens when you use a wrong key. The "Inspect" tab turns each algebraic step into an interactive demo.

## Why this niche (homomorphic encryption)

Prior cycles covered compression, CRDTs, memory allocation, differential privacy, Paillier (homomorphic additive), BFT, mempool/MEV, fork choice, zk-SNARKs, and MPC. FHE is the natural next step — it generalizes Paillier's additive homomorphism to full multiplication, opening the door to encrypted computation at scale.

It also connects to several adjacent themes:
- **MPC + FHE**: FHE is one half of modern MPC (the other is secret sharing).
- **Privacy-preserving computation**: encrypted ML inference, private search, trusted data marketplaces.
- **Verifiable computation**: FHE enables delegated computation where the server learns nothing about the input/output.

## Difficulty

Rating: **18/20**. The algebra is non-trivial (tensor product, degree-2 decryption), the noise analysis is the hard part (keeping phase noise below Δ/2), and the non-vacuity gates force a careful choice of mutation parameters. The code is only ~200 lines, but every line is doing real work.
