import { createQueryClient, utils } from '@ixo/impactxclient-sdk';
import { QueryIidDocumentResponse } from '@ixo/impactxclient-sdk/types/codegen/ixo/iid/v1beta1/query';
import { DidResolution, QueryClientType } from './types';
import { renameKeyDeep, toDidCoreDatetime, updateObjectStrings } from './helpers';

const W3C_DID_CONTEXT = 'https://www.w3.org/ns/did/v1';
const IXO_IID_CONTEXT = 'https://w3id.org/ixo/ns/interchain-identifiers/v1';

require('dotenv').config();

export class IxoResolver {
  queryClient: QueryClientType;

  constructor() {
    if (!this.queryClient) this.init_query_client();
  }

  public static instance = new IxoResolver();

  async init_query_client() {
    this.queryClient = await createQueryClient(
      process.env.RPC_ENDPOINT || 'https://impacthub-rpc.lavenderfive.com/',
    );
  }

  async getResolver() {
    // check if queryClient not initiated yet redo it and await
    if (!this.queryClient) await this.init_query_client();
    // local scope reference mapping for resolve() to have access to queryClient
    const queryClient = this.queryClient;

    async function resolve(did, parsed, didResolver, options) {
      // console.log(parsed); // results below for parsed mapping
      // for did: did:x:zQ3shoiydFD6jdTdXLPProPZWL6igg9bCyaJY6zEKqQoNE96C#key
      // {
      //   did: 'did:x:zQ3shoiydFD6jdTdXLPProPZWL6igg9bCyaJY6zEKqQoNE96C',
      //   method: 'x',
      //   id: 'zQ3shoiydFD6jdTdXLPProPZWL6igg9bCyaJY6zEKqQoNE96C',
      //   didUrl: 'did:x:zQ3shoiydFD6jdTdXLPProPZWL6igg9bCyaJY6zEKqQoNE96C'
      // }

      const didResolution: DidResolution = {
        // '@context': 'https://w3id.org/did-resolution/v1',
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
          pattern: '^did:(?:x|ixo):.+$',
        },
        didDocument: null,
        didDocumentMetadata: {},
      };

      let didDoc: QueryIidDocumentResponse;

      try {
        didDoc = await (
          queryClient as QueryClientType
        ).ixo.iid.v1beta1.iidDocument({
          id: parsed.did,
        });
        if (!didDoc?.iidDocument) throw new Error('Empty did doc');
        didResolution.didResolutionMetadata.retrieved = new Date();
        didResolution.didResolutionMetadata.did = parsed;
      } catch (error) {
        console.error({ error });
        // if error return with resolution metadata not found
        didResolution.didResolutionMetadata = {
          error: 'notFound',
          retrieved: new Date(),
          message: `Can't resolve did: ${parsed.did}`,
          did: parsed,
        } as any;
        return didResolution;
      }

      // update did doc to replace all string tempaltes {id} with the id of the did doc
      updateObjectStrings(didDoc.iidDocument, '{id}', parsed.did);

      // Canonicalise chain proto field name `blockchainAccountID` to the
      // DID-compatible JSON casing `blockchainAccountId` (CAIP-10 / DID Core).
      renameKeyDeep(
        didDoc.iidDocument,
        'blockchainAccountID',
        'blockchainAccountId',
      );

      // Per W3C DID Core §6.3.1, the JSON-LD `@context` MUST start with
      // `https://www.w3.org/ns/did/v1` and MUST define every term used in the
      // document. We prepend the canonical W3C + IXO contexts, then append
      // any on-chain `context` entries the controller has set on the IID
      // document.
      didDoc.iidDocument['@context'] = [
        W3C_DID_CONTEXT,
        IXO_IID_CONTEXT,
        ...didDoc.iidDocument.context,
      ];
      delete didDoc.iidDocument.context;

      // Convert protobuf Timestamp to ISO 8601 strings WITHOUT sub-second
      // precision, as required by W3C DID Core §7.1.3 for didDocumentMetadata
      // `created` / `updated`.
      didDoc.iidDocument.metadata.created = toDidCoreDatetime(
        utils.proto.fromTimestamp(didDoc.iidDocument.metadata.created),
      ) as any;
      didDoc.iidDocument.metadata.updated = toDidCoreDatetime(
        utils.proto.fromTimestamp(didDoc.iidDocument.metadata.updated),
      ) as any;
      // assign metadata that returned on didDoc from registry to response metadata
      didResolution.didDocumentMetadata = Object.assign(
        {},
        didDoc.iidDocument.metadata,
      );

      // remove metadata that returned on didDoc from registry as assigned to response metadata
      delete didDoc.iidDocument.metadata;
      didResolution.didDocument = didDoc.iidDocument;

      return didResolution as any;
    }

    return { x: resolve, ixo: resolve };
  }
}
