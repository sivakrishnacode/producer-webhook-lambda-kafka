import { DynamicModule, Module, Provider } from '@nestjs/common';
import { KafkaClient } from './kafka-client';

@Module({})
export class EventMessageModule {
  static registerAsync(config: any): DynamicModule {
    const kafka = new KafkaClient(config);

    const kafkaProvider: Provider = {
      provide: 'KAFKA_CLIENT',
      useValue: kafka,
    };

    return {
      module: EventMessageModule,
      providers: [kafkaProvider],
      exports: [kafkaProvider],
      global: true,
    };
  }
}
