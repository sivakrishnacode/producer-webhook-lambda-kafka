import { Inject, Injectable, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { KafkaClient } from 'src/event-message/kafka-client';

@Injectable()
export class WebhooksService {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: KafkaClient,
  ) {}

  async appUninstall(@Req() req: Request, @Res() res: Response) {
    try {
      await this.kafkaClient
        .produce('app_uninstalled', req.body, 'my-string')
        .catch((err) => console.error(err));

      console.log('--->>> app_uninstalled Webhook Called');
      res.send({ data: 'app_uninstalled webhook responce' });
    } catch (error) {
      console.log(error);
    }
  }

  async shopUpdate(@Req() req: Request, @Res() res: Response) {
    try {
      await this.kafkaClient
        .produce('shop_update', req.body, 'my-string')
        .catch((err) => console.error(err));

      console.log('--->>> shop_update Webhook Called');
      res.send({ data: 'shop_update webhook responce' });
    } catch (error) {
      console.log(error);
    }
  }
}
