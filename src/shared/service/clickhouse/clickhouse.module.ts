import { DynamicModule, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClickhouseService } from "./clickhouse.service";
import { NodeClickHouseClientConfigOptions } from "@clickhouse/client/dist/client";

@Global()
export class ClickhouseModule {
  static forRootAsync(): DynamicModule {
    return {
      module: ClickhouseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: ClickhouseService,
          useFactory: (configService: ConfigService) => {
            const options = {} as NodeClickHouseClientConfigOptions;
            const clickhouse = configService.get("clickhouse");
            options.username = clickhouse.username;
            options.password = clickhouse.password;
            options.host = clickhouse.host;
            options.database = clickhouse.database;
            options.request_timeout = 120000;
            return new ClickhouseService(options);
          },
          inject: [ConfigService],
        },
      ],
      exports: [ClickhouseService],
    };
  }
}
