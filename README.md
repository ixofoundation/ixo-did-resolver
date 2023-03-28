![DIF Logo](https://raw.githubusercontent.com/decentralized-identity/universal-resolver/master/docs/logo-dif.png)

# Universal Resolver Driver: did:x/ixo

![GitHub contributors](https://img.shields.io/github/contributors/ixofoundation/ixo-did-resolver)
![GitHub repo size](https://img.shields.io/github/repo-size/ixofoundation/ixo-did-resolver)

This is a [Universal Resolver](https://github.com/decentralized-identity/universal-resolver/) driver for **did:x/ixo** identifiers.

## Specifications

- [W3C Decentralized Identifiers](https://w3c.github.io/did-core/)
<!-- - [DID Method Spec](https://github.com/ibct-dev/lit-DID/blob/main/docs/did:lit-method-spec_eng_v0.1.0.md) -->

## Example DIDs

```
did:x:zQ3shoiydFD6jdTdXLPProPZWL6igg9bCyaJY6zEKqQoNE96C
```

## Development

Install NPM dependencies using yarn in the root directory: `yarn install`

Start development server: `yarn start`

By default it will be running on port `8080` - it should connect to the blockchain node and be ready to serve DIDs at that endpoint. Example:

```
curl http://localhost:8080/1.0/identifiers/did:dock:5CDsD8HZa6TeSfgmMcxAkbSXYWeob4jFQmtU6sxr4XWTZzUA
```

## Build and usage

1. To build the docker image

   ```
   docker image build -t ixo-did-resolver -f Dockerfile .
   ```

   The above will build the image with name `ixo-did-resolver` and tag `latest`.

1. To run the docker container

   ```
   docker container run --publish 8080:8080 --detach --name ixo-did-resolver ixo-did-resolver:latest
   ```

   The server will run at 8080 port in the docker container and the host’s port 8080 is mapped to the container's port 8080

1. To ssh into the docker container

   ```
   docker exec -it ixo-did-resolver /bin/sh
   ```

1. The server responds at `/1.0/identifiers/<DID with method, like did:x:...>`

## Driver Environment Variables

The driver recognizes the following environment variables:

### `RPC_ENDPOINT`

- The endpoint of node for JSON-RPC
- Default value(ixo chain): `https://impacthub-rpc.lavenderfive.com/`
- For testing pusposes you can use ixo's testnet(https://testnet.ixo.earth/rpc/) and devnet(https://devnet.ixo.earth/rpc/) chains.

This resolver was build following https://github.com/decentralized-identity/universal-resolver/blob/main/docs/driver-development.md

## 🙋 Find us elsewhere

[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/ixo) [![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/ixonetwork)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/ixoworld)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/ixo-blog)
