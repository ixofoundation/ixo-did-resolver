import { createQueryClient, utils } from '@ixo/impactxclient-sdk';
import { QueryIidDocumentResponse } from '@ixo/impactxclient-sdk/types/codegen/ixo/iid/v1beta1/query';
import { DidResolution, QueryClientType } from './types';
import { updateObjectStrings } from './helpers';

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
        // if error return with resolution metadata not found
        didResolution.didResolutionMetadata = {
          error: 'invalidDid',
          retrieved: new Date(),
          message: `Can't resolve did: ${parsed.did}`,
          did: parsed,
        } as any;
        return didResolution;
      }

      // update did doc to replace all string tempaltes {id} with the id of the did doc
      updateObjectStrings(didDoc.iidDocument, '{id}', parsed.did);

      // replace context key with @context
      didDoc.iidDocument['@context'] = [
        // temporarily adding below context for other services till most services support object contexts
        'https://www.w3.org/ns/did/v1',
        ...didDoc.iidDocument.context,
      ];
      delete didDoc.iidDocument.context;

      // convert Timestamp to js dates
      didDoc.iidDocument.metadata.created = utils.proto.fromTimestamp(
        didDoc.iidDocument.metadata.created,
      ) as any;
      didDoc.iidDocument.metadata.updated = utils.proto.fromTimestamp(
        didDoc.iidDocument.metadata.updated,
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

export const didResolution: DidResolution = {
  // '@context': 'https://w3id.org/did-resolution/v1',
  didResolutionMetadata: {
    contentType: 'application/did+ld+json',
    pattern: '^did:(?x:|ixo:).+$',
  },
  didDocument: null,
  didDocumentMetadata: {},
};
