// ref: https://sefiks.com/2018/02/16/elegant-signatures-with-elliptic-curve-cryptography/
// ref: https://www.youtube.com/watch?v=2n1Z6jmzvxs&list=PLsS_1RYmYQQEun1MTwmvbXurqHIJrFJ0e&index=12
// y^2 = x^3 + ax + b (weierstrass equation)
// add: P(x1, y1) + Q(x2, y2) = R(x3, y3)
// B = (y2 - y1) / (x2 - x1)
// x3 = B^2 - x1 - x2
// y3 = B(x1-x3) - y1
import { modPow } from "bigint-mod-arith";

type Numeric = number | bigint | `${number}`;

function pow(
  a: number | bigint,
  b: number | bigint,
  p?: number | bigint
): bigint {
  const c = BigInt(a) ** BigInt(b);
  if (!p) return c;
  return c % BigInt(p);
}

class Point {
  constructor(public readonly x: bigint, public readonly y: bigint) {}

  public add(other: Point, mod: bigint = 7n): Point {
    const beta = this.betaOf(other, mod);
    // x3 = B^2 - x1 - x2
    const x = (pow(beta, 2) - this.x - other.x) % mod;
    // y3 = B(x1-x3) - y1
    const y = (beta * (this.x - x) - this.y) % mod;
    return new Point(x, y);
  }

  public addn(g: Point, mod: bigint, n: number | bigint) {
    let temp = g;
    for (let i = 0; i < n; i++) {
      temp = temp.add(g, mod);
    }
    return temp;
  }

  private betaOf(other: Point, mod: bigint): bigint {
    const isSamePoint = this.x === other.x && this.y === other.y;
    if (isSamePoint)
      return (3n * pow(this.x, 2) + a) * modPow(2n * this.y, -1, mod);
    return (other.y - this.y) * modPow(other.x - this.x, -1, mod);
  }
}

class Curve {
  readonly a: bigint;
  readonly b: bigint;
  readonly g: Point;
  readonly mod: bigint;

  constructor({
    a,
    b,
    g,
    mod,
  }: {
    a: Numeric;
    b: Numeric;
    mod: Numeric;
    g: Point;
  }) {
    this.a = BigInt(a);
    this.b = BigInt(b);
    this.mod = BigInt(mod);
    this.g = g;
  }

  public isValid(p: Point): boolean {
    return (
      modPow(p.y, 2, this.mod) ===
      (modPow(p.x, 3, this.mod) + this.a * p.x + this.b) % this.mod
    );
  }
}

// curve: secp256k1
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
const order = BigInt(
  "115792089237316195423570985008687907852837564279074904382605163141518161494337"
);

const c = new Point(0n, 1n);
const d = new Point(3n, 4n);
const secp256k1 = new Curve({ a, b, g, mod });
const p2g = g.add(g, mod);
const p20g = g.addn(g, mod, 20);

console.log(p2g, secp256k1.isValid(p2g));
console.log(p20g, secp256k1.isValid(p20g));
