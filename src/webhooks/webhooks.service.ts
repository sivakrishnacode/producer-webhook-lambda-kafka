import { Inject, Injectable, Req, Res } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class WebhooksService {
  constructor(
    @Inject('WEBHOOK_SERVICE') private readonly webHookClient: ClientKafka,
  ) {}

  async appUninstall(@Req() req, @Res() res) {
    try {
      this.webHookClient.emit('app_uninstalled', req.body);

      console.log('app uninstall webhook called ');
      res.send({ data: 'appUnInstalled webhook responce' });
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async shopUpdate(@Req() req, @Res() res) {
    try {
      this.webHookClient.emit('shop_update', req.body);
      console.log('shop Update webhook called');
      res.send({ data: 'shopUpdate webhook responce' });
    } catch (error) {
      console.log(error);
    }
  }
}
