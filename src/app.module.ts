import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { LoggerModule } from "nestjs-pino";
import { KafkaModule } from "@/shared/service/kafka/kafka.module";
import { ScheduleModule } from "@nestjs/schedule";
import { getLogConfig } from "./config/logger.config";
import { ConsumerModule } from "./consumer-module/consumer.module";
import { ClickhouseModule } from "./shared/service/clickhouse/clickhouse.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "./typeorm/snake-naming.strategy";

@Module({
  imports: [
    // 配置文件注入
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // 定时任务
    ScheduleModule.forRoot(),
    // 日志模块注入
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getLogConfig,
    }),
    // typeorm module 注入
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const result = config.get('mysql')
        result.driver = require(result.driver || 'mysql2')
        result.autoLoadEntities = true
        result.namingStrategy = new SnakeNamingStrategy()
        result.username = result.username
        result.password = result.password
        result.host = result.host
        return result
      },
      inject: [ConfigService]
    }),
    // kafka 模块
    KafkaModule.forRootAsync(),
    // clickhouse
    ClickhouseModule.forRootAsync(),
    ConsumerModule,
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule {}
