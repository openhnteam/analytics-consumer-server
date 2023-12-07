import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  // 全局的日志
  app.useLogger(app.get(Logger));

  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get<number>("http.port"));
  console.log(`\nApplication is running on: ${await app.getUrl()}`);
}
bootstrap();
