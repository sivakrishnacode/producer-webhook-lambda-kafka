import { Controller, Post, Req, Res } from '@nestjs/common';

import { WebhooksService } from './webhooks.service';
import { Request, Response } from 'express';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  // webhooks/app_uninstalled
  @Post('/app_uninstalled')
  async AppUninstallHandler(@Req() req: Request, @Res() res: Response) {
    return this.webhooksService.appUninstall(req, res);
  }

  @Post('/shop_update')
  async ShopUpdateHandler(@Req() req: Request, @Res() res: Response) {
    return this.webhooksService.shopUpdate(req, res);
  }
}
