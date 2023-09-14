import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import CustomRequest from './types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    bodyParser.json({
      limit: '5mb',
      verify: function (req: CustomRequest, res, buf) {
        req.originalBody = buf;
      },
    }),
  );
  await app.listen(3001).then(() => {
    console.log('Producer-WebHook running on 3001');
  });
}
bootstrap();
