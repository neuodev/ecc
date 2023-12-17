# ECDSA (SECP256k1)

### Generate private public key pairs

```ts
// generate new key pair
const keys = Keypair.new();
console.log(keys.asHex());
// {
//   pk: '0xa5740fa052b5b62b57226d827f5d2072c0e9e1f140c0d005f2e913b09141f45d',
//   pubkey: [
//     '0xae71d35e6afe3854b963f2af11d45f342cc48da22257c7008c6531abd180986e',
//     '0xeeb30e1d8cab27d4303cca598273223ff5e58cd16b32685a150d7314ef8c2122'
//   ]
// }
console.log(secp256k1.isValid(keys.pubkey)); // true
```

Create keypair from existing private key

```ts
const keys = Keypair.new(
  "0xb8eaf6de4d59fb7afb0de727ec6dd5c386abfc43052e4792cf05b265658a26a9"
);

asset(keys.isValid(keys.pubkey));
```
