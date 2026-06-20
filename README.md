![DIF Logo](https://raw.githubusercontent.com/decentralized-identity/universal-resolver/master/docs/logo-dif.png)

# Universal Resolver Driver: did:ixo / did:x

![GitHub contributors](https://img.shields.io/github/contributors/ixofoundation/ixo-did-resolver)
![GitHub repo size](https://img.shields.io/github/repo-size/ixofoundation/ixo-did-resolver)

A [Universal Resolver](https://github.com/decentralized-identity/universal-resolver/) driver that resolves **`did:ixo`** (and the legacy **`did:x`**) identifiers from the ixo blockchain into W3C DID documents.

It reads the on-chain IID document via the chain's RPC endpoint and returns a DID resolution result over HTTP, following the [Universal Resolver driver spec](https://github.com/decentralized-identity/universal-resolver/blob/main/docs/driver-development.md) and [W3C DID Core §7 (Resolution)](https://www.w3.org/TR/did-core/#did-resolution).

## API

### `GET /1.0/identifiers/:did`

Resolves a DID and returns a [DID resolution result](https://www.w3.org/TR/did-core/#did-resolution-metadata) (`didDocument`, `didResolutionMetadata`, `didDocumentMetadata`).

```bash
curl http://localhost:8080/1.0/identifiers/did:ixo:entity:54bede0aced5282b2401c58a048a731a
```

Status codes: `200` resolved · `400` `invalidDid` · `404` `notFound` · `406` `representationNotSupported` · `500` on internal error.

### Content negotiation

Per W3C DID Core §6, the driver serves both DID representations based on the request's `Accept` header:

| `Accept` | Response | `@context` |
| --- | --- | --- |
| `application/did+ld+json`, `application/ld+json` | DID JSON-LD | included |
| `application/json`, `*/*`, or no `Accept` header | DID JSON-LD (default) | included |
| `application/did+json` | DID JSON | omitted |
| anything else | `406 representationNotSupported` | — |

Only an **explicit** `application/did+json` request is served without `@context`. Generic clients (a bare `application/json`, `*/*`, or no header — the defaults sent by `fetch` and `axios`) receive the canonical JSON-LD representation, so JSON-LD consumers (e.g. verifiable-credential verification, which needs `@context` to expand `assertionMethod` / `controller`) are never handed a context-less document.

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `RPC_ENDPOINT` | ixo chain JSON-RPC endpoint the driver queries. | `https://impacthub.ixo.world/rpc/` (mainnet) |
| `PORT` | HTTP port the driver listens on. | `8080` |

ixo network RPC endpoints:

| Network | `RPC_ENDPOINT` |
| --- | --- |
| mainnet | `https://impacthub.ixo.world/rpc/` |
| testnet | `https://testnet.ixo.earth/rpc/` |
| devnet | `https://devnet.ixo.earth/rpc/` |

## Development

```bash
yarn install        # install dependencies
yarn start          # start the driver (default port 8080)
yarn start:dev      # start in watch mode
yarn build          # compile to dist/
yarn test           # run unit tests
```

Example against a running instance:

```bash
curl -H "Accept: application/did+ld+json" \
  http://localhost:8080/1.0/identifiers/did:ixo:entity:54bede0aced5282b2401c58a048a731a
```

## Docker

```bash
# build
docker image build -t ixo-did-resolver -f Dockerfile .

# run (maps host 8080 -> container 8080)
docker container run \
  --publish 8080:8080 \
  --env RPC_ENDPOINT=https://impacthub.ixo.world/rpc/ \
  --detach --name ixo-did-resolver \
  ixo-did-resolver:latest
```

## Example DIDs

```
did:ixo:entity:54bede0aced5282b2401c58a048a731a
did:ixo:ixo1rl9vhhxg0t7ywlh953gtthphg889v7d3e2gx7k
```

## Specifications

- [W3C Decentralized Identifiers (DID) Core](https://www.w3.org/TR/did-core/)
- [Universal Resolver driver development](https://github.com/decentralized-identity/universal-resolver/blob/main/docs/driver-development.md)

## License

Apache-2.0
