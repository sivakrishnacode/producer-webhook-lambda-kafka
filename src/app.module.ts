import { Module } from '@nestjs/common';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../', '.env'),
      isGlobal: true,
    }),
    WebhooksModule,
  ],
})
export class AppModule {}
