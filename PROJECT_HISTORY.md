# Project History

Records completed R&D cycles from the autonomous engine.

| Cycle | Niche | Repo | Date | Status | Lessons |
|-------|-------|------|------|--------|---------|
| 1 | LZ77+Huffman codec | compresslab | 2026-08-31 | ✅ Shipped | Canonical Huffman code assignment order (DEFLATE: advance code THEN assign) |
| 2 | CRDTs | crdtlab | 2026-08-31 | ✅ Shipped | Last-write-wins CRDT needs unique IDs |
| 3 | Memory allocation | malloclab | 2026-08-31 | ✅ Shipped | BFT consensus verification is a good next niche |
| 4 | Differential privacy | DiffPrivLab | 2026-08-31 | ✅ Shipped | Homomorphic encryption or zk-SNARK verifier |
| 5 | Paillier cryptosystem | paillier-lab | 2026-08-31 | ✅ Shipped | r^n not r^lambda for encryption randomness; gcd check required |
| 6 | BFT consensus verification | bftlab | 2026-08-29 | ✅ Shipped | Use n >= 7 for f_max=1; centralize vote tracking |
| 7 | Mempool × MEV prevention | mempoolab | 2026-08-30 | ✅ Shipped | MEV bounds; sandwich detection |
| 8 | Fork choice / reorg detection | forklab | 2026-08-30 | ✅ Shipped | Longest-chain + state-root verification |
| 9 | zk-SNARK (Groth16-style) verifier | zkprooflab | 2026-08-31 | ✅ Shipped | QAP: interpolate per variable across constraints (transpose), not per row |
| 10 | **MPC (Shamir + Beaver multiplication)** | **mpclab** | **2026-08-31** | **✅ Shipped** | **reconstructSecret must accept k<t shares to prove threshold property; M2 mutation gate on Beaver c-coefficient cascades 100%** |
| 11 | **Homomorphic encryption (BFV-style)** | **fhelab** | **2026-08-31** | **✅ Shipped** | **Toy u must be small-error (not uniform); large q prevents coefficient wrap in tensor product; degree-2 ciphertext needs s² decryption** |

## Niche Exclusion List
- LZ77+Huffman (compresslab)
- CRDTs (crdtlab)
- Memory allocation (malloclab)
- Differential privacy (DiffPrivLab)
- Paillier cryptosystem (paillier-lab)
- BFT consensus verification (bftlab)
- Blockchain mempool × MEV prevention (mempoolab)
- Fork choice / reorg detection (forklab)
- zk-SNARK (Groth16-style) verifier (zkprooflab)
- MPC / Shamir secret sharing + Beaver multiplication (mpclab)
- Homomorphic encryption / BFV (fhelab)

## Next Potential Niches
- ZK-rollup circuit design (beyond toy Groth16 verifier)
- CKKS (approximate arithmetic) homomorphic encryption
- Batching/SIMD in FHE: encrypt vectors of plaintexts per ciphertext
- Relinearization key for real BFV ciphertext product
- Bootstrapping (Gentry squaring) for unlimited-depth FHE
- Yao's garbled circuits (contrast additive Shamir with gate-circuit MPC)
- ZK-SNARK circuit compiler: TypeScript → R1CS → Groth16 verification
