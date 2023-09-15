import {
  Inject,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
} from '@nestjs/common';

import { WebhooksController } from './webhooks.controller';

/* Middlewares */
import { VerifyHmac } from 'src/middleware/verify-hmac.middleware';

/* Services */
import { WebhooksService } from './webhooks.service';
import { KafkaClient } from 'src/event-message/kafka-client';
import { EventMessageModule } from 'src/event-message/EventMessageModule';

@Module({
  imports: [
    EventMessageModule.registerAsync({
      client: {
        clientId: 'webhook',
        brokers: ['pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092'],
        ssl: true,
        sasl: {
          mechanism: 'plain',
          username: 'YEIDWF6YKYBM5NXB',
          password:
            'Y5WdrZL5ZLRK4uYxvGSXEw3qG418pdB3dI6Sr/NkZ3732S4s/AYq9giZbjHcCE8t',
        },
      },
    }),
  ],
  providers: [WebhooksService, KafkaClient],
  controllers: [WebhooksController],
})
export class WebhooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyHmac).forRoutes(WebhooksController);
  }
}
