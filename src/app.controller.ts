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

    const wantsJsonLd = JSON_LD_TYPES.includes(matched as string);
    const responseContentType = wantsJsonLd
      ? 'application/did+ld+json'
      : 'application/did+json';

    const result = await this.appService.getDid(did);

    // For the plain DID JSON representation, strip the JSON-LD-only
    // `@context` entry from the DID document and reflect the actual
    // content type in the resolution metadata.
    if (!wantsJsonLd && result?.didDocument) {
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
