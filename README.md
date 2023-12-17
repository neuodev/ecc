# ECDSA (SPEC256k1)

```ts
const a = 0n;
const b = 7n;
const g = new Point(
  BigInt(
    "55066263022277343669578718895168534326250603453777594175500187360389116729240"
  ),
  BigInt(
    "32670510020758816978083085130507043184471273380659243275938904335757337482424"
  )
);

// finite field
const mod =
  pow(2, 256) -
  pow(2, 32) -
  pow(2, 9) -
  pow(2, 8) -
  pow(2, 7) -
  pow(2, 6) -
  pow(2, 4) -
  pow(2, 0);

const secp256k1 = new Curve({ a, b, g, mod });
const p2g = g.add(g, mod);
const p20g = g.addn(g, mod, 20);
console.log(p2g, secp256k1.isValid(p2g)); // true
console.log(p20g, secp256k1.isValid(p20g)); // true
```
