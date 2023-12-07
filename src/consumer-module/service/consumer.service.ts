import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { BaseConsumer } from "../consumer/base.consumer";
import { KafkaService } from "@/shared/service/kafka/kafka.service";
import { Interval } from "@nestjs/schedule";
import { ConsumerOptions } from "../interface/consumer.options";
import { ClickhouseService } from "@/shared/service/clickhouse/clickhouse.service";
import { LocationService } from "@/location-module/service/location.service";
import { UserConsumerOptions } from "../consumer/user.consumer.options";
import { SearchConsumerOptions } from "../consumer/search.consumer.options";
import { SessionConsumerOptions } from "../consumer/session.consumer.options";
import { EventConsumerOptions } from "../consumer/event.consumer.options";
import { PageConsumerOptions } from "../consumer/page.consumer.options";
import { LocationConsumerOptions } from "../consumer/location.consumer.options";
import { BounceConsumerOptions } from "../consumer/bounce.consumer.options";
import { BaseConsumerOptions } from "../consumer/base.consumer.options";
import { POLLING_INTERVAL } from "../constant/kafka.constant";

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumers: BaseConsumer[] = [];

  constructor(
    private readonly clickhouse: ClickhouseService,
    private readonly kafka: KafkaService,
    private readonly locationService: LocationService
  ) {}

  allConsumerOptions(): BaseConsumerOptions[] {
    const sessionOptions = new SessionConsumerOptions()
    const userOptions    = new UserConsumerOptions()
    const searchOptions  = new SearchConsumerOptions()
    sessionOptions.setNext(userOptions).setNext(searchOptions)
    return [
      sessionOptions, 
      new EventConsumerOptions(),
      new PageConsumerOptions(),
      new LocationConsumerOptions().setValidator(this.locationService),
      new BounceConsumerOptions(),
    ];
  }

  async onModuleInit() {
    const options = this.allConsumerOptions();
    const { clickhouse, kafka, consumers } = this;
    options.forEach((option) => {
      let consumer = new BaseConsumer(clickhouse, kafka, option);
      let curOption: ConsumerOptions = option.next
      let curConsumer = consumer
      while (curOption) {
        const nextConsumer = new BaseConsumer(clickhouse, kafka, curOption);
        curConsumer.next(nextConsumer)
        curOption = curOption.next
        curConsumer = nextConsumer
      }
      consumer.start();
      consumers.push(consumer)
    });
  }

  async onModuleDestroy() {
    const tasks = this.consumers.map((consumer) => consumer.stop())
    await Promise.all(tasks)
  }

  //每隔2分钟，周期性入库
  @Interval(POLLING_INTERVAL)
  async insertDataPeriodically() {
    const tasks = this.consumers.map((consumer) => consumer.periodically())
    await Promise.all(tasks)
  }
}
