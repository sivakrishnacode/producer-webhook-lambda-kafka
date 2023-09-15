import { Inject, Injectable, Req, Res } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaClient } from 'src/clients/kafka-client';
import KafkaMessageType from 'src/types/kafka-message-type';

@Injectable()
export class WebhooksService {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: KafkaClient,
  ) {}

  async appUninstall(@Req() req, @Res() res) {
    try {
      console.log(req.body);

      await this.kafkaClient.produce('app_uninstalled', req.body, 'my-string');

      console.log('app uninstall webhook called ');
      res.send({ data: 'appUnInstalled webhook responce' });
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async shopUpdate(@Req() req, @Res() res) {
    try {
      // this.webHookClient.emit('shop_update', req.body);
      console.log('shop Update webhook called');
      res.send({ data: 'shopUpdate webhook responce' });
    } catch (error) {
      console.log(error);
    }
  }
}
