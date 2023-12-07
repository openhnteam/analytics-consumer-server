import { Logger } from "@nestjs/common";
import { ConsumerOptions, MAX_ROWS } from "../interface/consumer.options";
import { KafkaService } from "@/shared/service/kafka/kafka.service";
import { sleep } from "@/shared/utils/time.utils";
import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { isEmpty } from "@/shared/utils/obj.utils";
import { ClickhouseService } from "@/shared/service/clickhouse/clickhouse.service";
import { NextConsumer } from "../interface/next.consumer";
import { POLLING_INTERVAL } from "../constant/kafka.constant";

export class BaseConsumer implements NextConsumer {
  private logger = new Logger(BaseConsumer.name);
  private latestDate: number = new Date().valueOf(); //最新入库时间
  private dataMap: Map<string, Array<any>> = new Map(); //待入库数据
  private curPartition: number;
  private curOffset: string;
  private nextConsumer: NextConsumer | null = null;

  clickhouse: ClickhouseService;
  kafka: KafkaService;
  consumer: ConsumerOptions;

  constructor(
    clickhouse: ClickhouseService,
    kafka: KafkaService,
    consumer: ConsumerOptions
  ) {
    this.clickhouse = clickhouse;
    this.kafka = kafka;
    this.consumer = consumer;
  }

  async start(): Promise<void> {
    const { kafka, logger, curPartition } = this;
    const { topic, groupId } = this.consumer;
    const limit = this.consumer.maxRow || MAX_ROWS
    this.logger.log(`开始监听 kafka ${topic} 消息；消费组 ${groupId}`);
    await kafka.subscribe(
      topic,
      groupId,
      async (
        topic: string,
        partition: number,
        offset: string,
        values: Array<string>
      ) => {
        try {
          // 应用运行时，发现分区发生改变，为了保证数据不被重复消费，需清除数据
          if (curPartition != undefined && curPartition != partition) {
            this.clearData()
            return;
          }
          // 保存分区和最新的偏移
          this.curPartition = partition;
          this.curOffset = offset;

          let max = 0;
          for (let i = 0; i < values.length; i++) {
            const body: string = values[i];
            const payload: KafkaPayload = JSON.parse(body);
            const appId = payload.appId;
            if (!appId) {
              continue;
            }
            const length = this.pushDataToQueue(payload)
            max = Math.max(length, max);
          }
          if (max >= limit) {
            await this.addToDatabaseAndCommitKafkaOffset(false);
          }
        } catch (error) {
          logger.error(`消费 kafka ${topic} 异常 ${error}`);
        }
      }
    );
  }
  async addToDatabaseAndCommitKafkaOffset(fromCron: boolean): Promise<void> {
    //最新入库时间
    this.latestDate = new Date().valueOf();
    const { kafka, logger, curPartition, curOffset, dataMap } = this;
    const { topic, groupId } = this.consumer;
    if (curPartition == undefined || dataMap.size == 0) {
      return;
    }
    //暂停消费
    const pause = await kafka.pauseConsumer(topic, groupId, curPartition);
    if (!pause) {
      logger.error(`暂停消费 kafka ${topic} 失败`);
      return;
    }

    // 如果来自定时器，为了避免消费数据未处理完导致数据丢失问题，延时2秒再插入数据
    if (fromCron) {
      await sleep(2000);
    }
    try {
      await this.addToDatabase()
      // 1)移除缓存数据
      this.clearData()
      // 2)提交kafka偏移量
      await kafka.commitOffsets(topic, groupId, curPartition, curOffset);
      // 3) 启动kafka消费
      await kafka.resumeConsumer(topic, groupId, curPartition);
    } catch (error) {
      logger.error("批量入库出错" + error);
    }
  }

  async stop(): Promise<void> {
    this.logger.log(`结束监听 kafka ${this.consumer.topic} 消息`);
    const { topic, groupId } = this.consumer;
    await this.kafka.stopConsumer(topic, groupId);
  }

  async periodically() {
    const now: number = new Date().valueOf();
    if (now - this.latestDate >= POLLING_INTERVAL) {
      await this.addToDatabaseAndCommitKafkaOffset(true);
    }
  }

  next(consumer: NextConsumer): NextConsumer {
    this.nextConsumer = consumer;
    return consumer;
  }

  async addToDatabase() {
    const { ckTable, validator } = this.consumer;
    const { logger, dataMap } = this;
    for (const [key, value] of dataMap) {
      let entityList: Array<any> = value as Array<any>
      // 如果有数据入库前检验
      if (validator) {
        entityList = await validator.validAction(entityList)
      }
      const table = `${ckTable}_${key}`;
      const { success, error } = await this.clickhouse.insert(table, entityList);
      if (!success) {
        logger.error(`【批量入库失败】${table} error: ${error}`);
      }
    }
    if (this.nextConsumer) {
      await this.nextConsumer.addToDatabase();
    }
  }

  clearData() {
    this.curPartition = undefined;
    this.curOffset = undefined;
    this.dataMap.clear();
    if (this.nextConsumer) {
      this.nextConsumer.clearData()
    }
  }

  pushDataToQueue(payload: KafkaPayload): number {
    const { dataMap } = this;
    const { buildEntity } = this.consumer;
    const appId = payload.appId
    let datas: Array<any> = dataMap.get(appId) || [];
    const entity: any | any[] = buildEntity(payload);
    if (isEmpty(entity)) {
      return datas.length
    }
    if (Array.isArray(entity)) {
      datas = datas.concat(entity)
    } else {
      datas.push(entity);
    }
    this.dataMap.set(appId, datas)

    if (this.nextConsumer) {
      this.nextConsumer.pushDataToQueue(payload)
    }
    return datas.length
  }
}
