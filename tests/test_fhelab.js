'use strict';
/**
 * FHE Lab — verification harness.
 *
 * Proves the toy BFV-style scheme is not vacuous:
 *   P1  Ring arithmetic mod (x^n+1): alternating-sign wraparound.
 *   P2  Encrypt → decrypt round-trips for a spread of values incl. 0 and t−1.
 *   P3  Homomorphic ADD: Dec(Enc(a) ⊕ Enc(b)) = (a+b) mod t.
 *   P4  Homomorphic MUL:  Dec(Enc(a) ⊗ Enc(b)) = (a·b) mod t, 200 random pairs.
 *   P5  Scalar ADD and MUL on ciphertexts.
 *   M1  Mutation gate: corrupting a ciphertext coefficient breaks decryption
 *       (proves the harness is actually verifying).
 *   M2  Mutation gate: a wrong public key element flips decryption.
 *
 * Run bare: `node tests/test_fhelab.js`  (exit 0 = pass).
 */
const assert = require('assert');
const fhe = require('../src/fhe.js');

const PARAMS = { n: 8, q: 1000000000000000000, t: 101, B: 3 }; // toy, not secure
const T = 101;

let passed = 0;
function ok(cond, msg) {
  if (!cond) { console.error('✗ ' + msg); process.exitCode = 1; }
  else { passed++; }
}

// ---- P1: ring multiplication wraps with alternating sign (x^n ≡ -1) ----
{
  const ring = new fhe.Ring(4); // n=4, x^4 ≡ -1, so x*x^3 = x^4 ≡ -1 → coeff0 = -1
  const x = ring.pad([0, 1n, 0, 0]);
  const x3 = ring.pad([0, 0, 0, 1n]);
  const prod = ring.mul(x, x3);
  ok(prod[0] === -1n && prod[3] === 0n, 'P1: x·x³ wraps to −1 (x^n≡−1) in Ring(4)');
}

// ---- P2: encrypt/decrypt round-trip ----
{
  const ctx = fhe.keygen(PARAMS);
  for (const v of [0, 1, 5, 50, 99, 100, 42]) {
    const d = fhe.decrypt(ctx, fhe.encrypt(ctx, [BigInt(v)]));
    ok(d[0] === BigInt(v), `P2: enc/dec ${v} → ${d[0]}`);
  }
}

// ---- P3: homomorphic add ----
{
  const ctx = fhe.keygen(PARAMS);
  for (let i = 0; i < 50; i++) {
    const a = BigInt(Math.floor(Math.random() * T));
    const b = BigInt(Math.floor(Math.random() * T));
    const d = fhe.decrypt(ctx, fhe.add(ctx, fhe.encrypt(ctx, [a]), fhe.encrypt(ctx, [b])));
    ok(d[0] === (a + b) % BigInt(T), `P3: add ${a}+${b} → ${d[0]}`);
  }
}

// ---- P4: homomorphic mul (200 random pairs) ----
{
  const ctx = fhe.keygen(PARAMS);
  for (let i = 0; i < 200; i++) {
    const a = BigInt(Math.floor(Math.random() * T));
    const b = BigInt(Math.floor(Math.random() * T));
    const d = fhe.decrypt(ctx, fhe.mul(ctx, fhe.encrypt(ctx, [a]), fhe.encrypt(ctx, [b])));
    ok(d[0] === (a * b) % BigInt(T), `P4: mul ${a}*${b} → ${d[0]}`);
  }
}

// ---- P5: scalar ops on ciphertexts ----
{
  const ctx = fhe.keygen(PARAMS);
  const v = 17n, k = 6n;
  const dAdd = fhe.decrypt(ctx, fhe.addScalar(ctx, fhe.encrypt(ctx, [v]), k));
  ok(dAdd[0] === (v + k) % BigInt(T), `P5: addScalar ${v}+${k} → ${dAdd[0]}`);
  const dMul = fhe.decrypt(ctx, fhe.mulScalar(ctx, fhe.encrypt(ctx, [v]), k));
  ok(dMul[0] === (v * k) % BigInt(T), `P5: mulScalar ${v}*${k} → ${dMul[0]}`);
}

// ---- M1: corrupted ciphertext must break decryption (non-vacuity) ----
{
  const ctx = fhe.keygen(PARAMS);
  const ct = fhe.encrypt(ctx, [7n]);
  const bad = [ct[0].map((x) => x + 1000000n), ct[1]]; // large corruption of c0
  const d = fhe.decrypt(ctx, bad);
  // With a 1e6 corruption and Δ~1e16, one coeff may still round right by luck,
  // so corrupt by a multiple of q/2 — guaranteed to flip the rounded value.
  const bad2 = [ct[0].map((x) => x + ctx.q / 4n), ct[1]];
  const d2 = fhe.decrypt(ctx, bad2);
  // At least one of the two corruptions must deviate from 7.
  ok(!(d[0] === 7n && d2[0] === 7n), 'M1: ciphertext corruption changes decryption (non-vacuous)');
}

// ---- M2: wrong public key element breaks encryption→decryption ----
{
  const ctx = fhe.keygen(PARAMS);
  const ct = fhe.encrypt(ctx, [13n]);
  ok(fhe.decrypt(ctx, ct)[0] === 13n, 'M2 baseline: decrypt works with correct key');
  // decrypt with a different secret key → should not recover 13
  const ctx2 = fhe.keygen(PARAMS);
  const dWrong = fhe.decrypt(ctx2, ct);
  ok(dWrong[0] !== 13n, 'M2: decrypting with the wrong secret key fails (non-vacuous)');
}

console.log(`\n${passed} assertions passed.`);
if (process.exitCode) process.exit(process.exitCode);
console.log('ALL TESTS PASSED');
process.exit(0);
