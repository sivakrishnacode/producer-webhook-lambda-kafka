import { Injectable, Module, NestMiddleware } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Response, NextFunction } from 'express';
import CustomRequest from '../types/index';
import * as crypto from 'crypto';

@Injectable()
@Module({
  imports: [ConfigModule],
})
export class VerifyHmac implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: CustomRequest, res: Response, next: NextFunction) {
    console.log('------->>  Middleware Called');

    // console.log(JSON.parse(Buffer(req.originalBody).toString('utf-8')));

    // try {
    //   const generateHash = crypto
    //     .createHmac(
    //       'sha256',
    //       this.configService.get<string>('SHOPIFY_API_SECRET'),
    //     )
    //     .update(req.originalBody.toString(), 'utf-8')
    //     .digest('base64');

    //   const topic = req.headers['x-shopify-topic'];
    //   const shop = req.headers['x-shopify-shop-domain'];
    //   const hmac = req.headers['x-shopify-hmac-sha256'];

    //   console.log(generateHash);
    //   console.log(hmac);

    //   if (generateHash === hmac) {
    //     console.log(`--> Processed ${topic} webhook for ${shop}`);
    //     next();
    //   } else {
    //     return res.status(401).send();
    //   }
    // } catch (err) {
    //   console.log(err);
    //   return res.status(401).send();
    // }
    next();
  }
}
