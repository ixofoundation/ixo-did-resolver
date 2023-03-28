import { Injectable } from '@nestjs/common';
import { IxoResolver } from './resolver';
import { Resolver } from 'did-resolver';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to ixo did resolver!. You can resolve a did with path /1.0/identifiers/:did';
  }

  async getDid(did: string) {
    const resolver = new Resolver(await IxoResolver.instance.getResolver());

    const didResolution = await resolver.resolve(did);
    return didResolution;
  }
}
