import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppService } from './app.service';

// Per W3C DID Core §6, a conformant resolver SHOULD support both DID JSON
// and DID JSON-LD, and MUST return `representationNotSupported` otherwise.
// We also accept the un-prefixed JSON / JSON-LD media types since clients
// (including the DIF Universal Resolver) commonly send `application/ld+json`.
const JSON_LD_TYPES = ['application/did+ld+json', 'application/ld+json'];
const JSON_TYPES = ['application/did+json', 'application/json'];
const SUPPORTED_ACCEPTS = [...JSON_LD_TYPES, ...JSON_TYPES];

@ApiTags('DID Resolution')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/1.0/identifiers/:did')
  async getDid(
    @Param('did') did: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // `req.accepts()` honours q-values and falls back to the first supported
    // type when no Accept header is present.
    const matched = req.accepts(SUPPORTED_ACCEPTS);

    if (!matched) {
      res
        .status(406)
        .header('Content-Type', 'application/did+ld+json');
      return {
        didResolutionMetadata: {
          error: 'representationNotSupported',
          message: `Unsupported Accept header: ${req.headers.accept ?? ''}`,
        },
        didDocument: null,
        didDocumentMetadata: {},
      };
    }

    // Only an EXPLICIT request for the DID-JSON representation
    // (`application/did+json`) is served without `@context`. The generic
    // `application/json` — which is what default HTTP clients send (axios sends
    // `application/json, text/plain, */*`; fetch sends `*/*`) — and a bare `*/*`
    // both default to JSON-LD, the canonical did:ixo representation. A JSON-LD
    // document is also valid JSON, so a non-opinionated `application/json` client
    // is well served, while JSON-LD consumers (e.g. Veramo credential
    // verification, which needs `@context` to expand `assertionMethod` /
    // `controller`) are never silently handed a context-less document.
    const wantsPlainDidJson = matched === 'application/did+json';
    const responseContentType = wantsPlainDidJson
      ? 'application/did+json'
      : 'application/did+ld+json';

    const result = await this.appService.getDid(did);

    // For the plain DID JSON representation, strip the JSON-LD-only
    // `@context` entry from the DID document and reflect the actual
    // content type in the resolution metadata.
    if (wantsPlainDidJson && result?.didDocument) {
      delete result.didDocument['@context'];
    }
    if (result?.didResolutionMetadata && result.didDocument) {
      result.didResolutionMetadata.contentType = responseContentType;
    }

    res.header('Content-Type', responseContentType);

    const error = result?.didResolutionMetadata?.error;
    if (error === 'notFound') {
      res.status(404);
    } else if (error === 'invalidDid') {
      res.status(400);
    } else if (error) {
      res.status(500);
    }

    return result;
  }
}
