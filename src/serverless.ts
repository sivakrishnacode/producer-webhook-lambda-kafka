import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import CustomRequest from './types';

let server: Handler;
async function bootstrap(): Promise<Handler> {
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
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
