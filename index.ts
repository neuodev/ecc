// ref: https://sefiks.com/2018/02/16/elegant-signatures-with-elliptic-curve-cryptography/
// ref: https://www.youtube.com/watch?v=2n1Z6jmzvxs&list=PLsS_1RYmYQQEun1MTwmvbXurqHIJrFJ0e&index=12
// y^2 = x^3 + ax + b (weierstrass equation)
// add: P(x1, y1) + Q(x2, y2) = R(x3, y3)
// B = (y2 - y1) / (x2 - x1)
// x3 = B^2 - x1 - x2
// y3 = B(x1-x3) - y1
import { modPow } from "bigint-mod-arith";
import { randomBytes } from "crypto";

type Hex = `0x${string}`;
type Numeric = number | bigint | `${number}` | Hex;

function pow(a: number | bigint, b: number | bigint): bigint {
  return BigInt(a) ** BigInt(b);
}

function random(): bigint {
  const hex = randomBytes(32).toString("hex");
  return BigInt(`0x${hex}`);
}

function toHex(val: Numeric): Hex {
  return `0x${BigInt(val).toString(16)}`;
}

class Point {
  constructor(public readonly x: bigint, public readonly y: bigint) {}
}

class EllipticCurve {
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

  public add(base: Point, other: Point): Point {
    const beta = this.betaOf(base, other, this.mod);
    // x3 = B^2 - x1 - x2
    const x = (pow(beta, 2) - base.x - other.x) % this.mod;
    // y3 = B(x1-x3) - y1
    const y = (beta * (base.x - x) - base.y) % this.mod;
    return new Point(x, y);
  }

  public doubleAdd(k: Numeric, g: Point = this.g) {
    let target: Point = g;
    const kbin = k.toString(2);

    for (let i = 1; i < kbin.length; i++) {
      const bit = kbin.slice(i, i + 1);
      target = this.add(target, target);
      if (bit === "1") target = this.add(target, g);
    }

    return target;
  }

  private betaOf(base: Point, other: Point, mod: Numeric): bigint {
    const isSamePoint = base.x === other.x && base.y === other.y;
    if (isSamePoint)
      return (
        (3n * pow(base.x, 2) + this.a) * modPow(2n * base.y, -1, BigInt(mod))
      );
    return (other.y - base.y) * modPow(other.x - base.x, -1, BigInt(mod));
  }
}

class Secp256k1 extends EllipticCurve {
  constructor() {
    super({
      a: 0,
      b: 7,
      g: new Point(
        BigInt(
          "55066263022277343669578718895168534326250603453777594175500187360389116729240"
        ),
        BigInt(
          "32670510020758816978083085130507043184471273380659243275938904335757337482424"
        )
      ),
      mod:
        pow(2, 256) -
        pow(2, 32) -
        pow(2, 9) -
        pow(2, 8) -
        pow(2, 7) -
        pow(2, 6) -
        pow(2, 4) -
        pow(2, 0),
    });
  }
}

const secp256k1 = new Secp256k1();

class Keypair {
  constructor(public readonly pk: bigint, public readonly pubkey: Point) {}

  static new(pk: Numeric = random()) {
    const pubkey = secp256k1.doubleAdd(BigInt(pk));
    return new Keypair(BigInt(pk), pubkey);
  }

  public asHex(): { pk: Hex; pubkey: [Hex, Hex] } {
    return {
      pk: toHex(this.pk),
      pubkey: [toHex(this.pubkey.x), toHex(this.pubkey.y)],
    };
  }
}

const keys = Keypair.new();
console.log(keys, keys.asHex(), secp256k1.isValid(keys.pubkey));

const oldKeys = Keypair.new(
  "0xb8eaf6de4d59fb7afb0de727ec6dd5c386abfc43052e4792cf05b265658a26a9"
);

console.log(oldKeys.asHex(), secp256k1.isValid(oldKeys.pubkey));
