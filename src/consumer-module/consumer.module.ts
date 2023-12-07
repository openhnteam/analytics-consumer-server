import { Module } from "@nestjs/common";
import { ConsumerService } from "./service/consumer.service";
import { LocationModule } from "@/location-module/location.module";

@Module({
  imports: [LocationModule],
  controllers: [],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
