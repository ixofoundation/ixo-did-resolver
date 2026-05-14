import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

@ApiTags('DID Resolution')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/1.0/identifiers/:did')
  @Header('Content-Type', 'application/did+ld+json')
  async getDid(
    @Param('did') did: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.appService.getDid(did);

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
