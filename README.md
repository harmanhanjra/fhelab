# FHE Lab

**Encrypt once, compute on ciphertext, decrypt the result — fully-homomorphic encryption in your browser.**

An interactive single-page lab demonstrating a toy BFV-style homomorphic encryption scheme
over the polynomial ring ℤ[x]/(x^n + 1):

1. **Key generation** — public key for encryption, secret key for decryption, relinearisation parameters.
2. **Encryption** — encrypt a number; the ciphertext is a pair of degree-n polynomials.
3. **Homomorphic addition** — add two ciphertexts component-wise; decrypt to get the plaintext sum.
4. **Homomorphic multiplication** — tensor-product multiply two ciphertexts; the result is a degree-3
   ciphertext decoded with s²; decrypt to get the plaintext product.
5. **Scalar operations** — add or multiply a ciphertext by a plaintext constant.

Everything runs in the browser: vanilla JS + native BigInt, no build step, zero dependencies.

## Try it

Open `index.html` in any modern browser.

- **Keygen tab**: generate keys, inspect the public key pk₀ and Δ.
- **Encrypt tab**: type a value (0..t−1), encrypt it, see the ciphertext polynomial coefficients.
- **Compute tab**: encrypt a second value, press ⊕ (add) or ⊗ (multiply), see the result.
- **Decrypt tab**: press decrypt to recover the plaintext with the secret key.
- **Inside the math tab**: interactive demos of ring wraparound, the scale Δ, tensor products, and what happens with a wrong key.
- **Verify tab**: run the full 263-assertion verification harness in-browser.

## Run the tests

```
node tests/test_fhelab.js
```

263 assertions across 7 property groups (P1–P5) and 2 mutation gates (M1, M2),
verifying the harness is not vacuous.

## Repository layout

```
fhelab/
├── index.html              # Interactive UI (zero dependencies)
├── src/
│   └── fhe.js              # Core scheme: Ring, keygen, encrypt, decrypt, add, mul
├── tests/
│   └── test_fhelab.js      # Verification harness
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── WHY_THIS_PROJECT.md
│   └── RETROSPECTIVE.md
├── LICENSE                  # MIT
└── README.md
```

## License

MIT
