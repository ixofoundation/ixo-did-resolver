import { createQueryClient } from '@ixo/impactxclient-sdk';
import { IidDocument } from '@ixo/impactxclient-sdk/types/codegen/ixo/iid/v1beta1/iid';
import { IidMetadata } from '@ixo/impactxclient-sdk/types/codegen/ixo/iid/v1beta1/types';

export type QueryClientType = Awaited<ReturnType<typeof createQueryClient>>;

export type DidResolution = {
  didResolutionMetadata: Partial<DidResolutionMetadata>;
  didDocument: Omit<IidDocument, 'metadata'> | null;
  didDocumentMetadata: IidMetadata | {};
};

type ParsedDid = {
  did: string;
  method: string;
  id: string;
  didUrl: string;
};

type DidResolutionMetadata = {
  contentType: string;
  pattern: string;
  error: string;
  retrieved: Date;
  message: string;
  did: ParsedDid;
};
