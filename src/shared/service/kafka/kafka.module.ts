import { DynamicModule, Global } from "@nestjs/common";
import { KafkaService } from "./kafka.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
export class KafkaModule {
  static forRootAsync(): DynamicModule {
    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: KafkaService,
          useFactory: (configService: ConfigService) => {
            return new KafkaService(configService.get("kafka"));
          },
          inject: [ConfigService],
        },
      ],
      exports: [KafkaService],
    };
  }
}
