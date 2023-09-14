import {
  Inject,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';

import { WebhooksController } from './webhooks.controller';

/* Middlewares */
import { VerifyHmac } from 'src/middleware/verify-hmac.middleware';

/* Services */
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WEBHOOK_SERVICE',
        transport: Transport.KAFKA,
        options: {
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
          consumer: {
            groupId: 'webhook-consumer',
          },
        },
      },
    ]),
  ],
  providers: [ClientKafka, WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule implements OnModuleInit {
  constructor(
    @Inject('WEBHOOK_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      // Wait for the Kafka producer to connect to the broker
      await this.kafkaClient.connect();
      console.log('Connected to Confluent Kafka');
    } catch (error) {
      console.error('Error connecting to Confluent Kafka:', error);
      // Handle the error gracefully, e.g., retry or handle accordingly
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyHmac).forRoutes(WebhooksController);
  }
}
