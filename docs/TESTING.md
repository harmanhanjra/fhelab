# FHE Lab — Testing

## Test runner

```
node tests/test_fhelab.js
```

Expect: `263 assertions passed.` and exit code 0.

## Assertions (263 total)

| Group | Count | What |
|---|---|---|
| P1 | 1 | Ring multiplication mod (xⁿ+1): x·x³ wraps to −1 for n=4 |
| P2 | 6 | Encrypt/decrypt round-trip for values [0, 1, 5, 50, 99, 100] |
| P3 | 50 | Homomorphic add: Dec(Enc(a) ⊕ Enc(b)) = (a+b) mod t, 50 random pairs |
| P4 | 200 | Homomorphic mul: Dec(Enc(a) ⊗ Enc(b)) = (a·b) mod t, 200 random pairs |
| P5 | 2 | Scalar add and scalar mul on a fixed ciphertext |
| M1 | 1 | Ciphertext corruption (q/4 additive flip) changes decryption |
| M2 | 1 | Decrypting with a different key produces ≠ 13 |

Total: 6 + 50 + 200 + 2 + 1 + 1 + 1(P1) = **263**.

## Mutation gates (M1, M2) — non-vacuity

The harness is deliberately non-vacuous: it must be possible to *break* the scheme.
- **M1** adds q/4 to one ciphertext coefficient — since Δ = ⌊q/t⌋, this shifts the phase by t/4, guaranteeing a wrong rounding.
- **M2** generates a second independent key and decrypts the first ciphertext with it. With probability 1 (for these small parameters) the phase is dominated by the wrong s, yielding garbage.

If either M1 or M2 unexpectedly passes (i.e., the tampered decryption still equals the original), the harness would be vacuous — and a real protocol bug would be hidden.

## Running in the browser

The "Verify" tab in `index.html` runs a subset of the same assertions (5 rounds × 41 assertions = 205) in-browser using the inlined JS. This is useful for demos but does not replace the Node run.

## Reproducibility

Each assertion uses `Math.random()`, so results are probabilistic. With the toy parameters, the failure probability is astronomically small (noise norm grows as √n·B per operation; with n=8, B=3 and q=10¹⁸, the distance to the rounding threshold is ~10¹⁸, while the noise is ~10³). The 200-pair mul test is the longest; even with 2⁴⁰ independent noise samples the failure chance is well below 10⁻¹⁰⁰.
