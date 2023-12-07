import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import {
  Consumer,
  Kafka,
  Producer,
  RecordMetadata,
  EachBatchPayload,
} from "kafkajs";
import { KafkaOptions } from "./kafka.options";
import { KafkaPayload } from "./kafka.payload";

export type MessageHandler = (
  topic: string,
  partition: number,
  offset: string,
  values: Array<string>
) => void;

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumerMap: Map<string, Consumer>;
  private producer: Producer;
  private readonly logger: Logger = new Logger(KafkaService.name);

  constructor(private kafkaOptions: KafkaOptions) {
    this.kafka = new Kafka({
      clientId: this.kafkaOptions.clientId,
      brokers: this.kafkaOptions.brokers,
    });
    this.producer = this.kafka.producer();
    this.consumerMap = new Map();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
    this.consumerMap.forEach((value: Consumer, key: string) => {
      value.disconnect();
    });
  }

  async sendMessage(topic: string, key: string, payload: KafkaPayload): Promise<boolean> {
    await this.producer.connect();
    const metadata = await this.producer
      .send({
        topic,
        messages: [{ key, value: JSON.stringify(payload) }],
      })
      .catch((error) => {
        this.logger.error(
          "【kafka product error】" +
          error +
          "【topic】" +
          topic +
          "【message】" +
          JSON.stringify(payload)
        );
      });
    if (Array.isArray(metadata) && metadata.length > 0) {
      const result: RecordMetadata = metadata[0];
      return result.errorCode === 0;
    } else {
      return false;
    }
  }

  async subscribe(
    topic: string,
    groupId: string,
    messageHandler: MessageHandler
  ) {
    try {
      const key = this.buildConsumerKey(topic, groupId)
      let consumer: Consumer = this.consumerMap.get(key);
      if (!consumer) {
        consumer = this.kafka.consumer({ groupId });
        //https://kafka.js.org/docs/1.11.0/consuming#from-beginning
        await consumer.subscribe({ topic, fromBeginning: true });
        this.consumerMap.set(key, consumer);
      }
      consumer.run({
        autoCommit: false,
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload;
          if (!batch.isEmpty()) {
            const messages: Array<string> = [];
            for (const message of batch.messages) {
              messages.push(message.value.toString());
            }
            const nextOffset = Number(batch.lastOffset()) + 1;
            await messageHandler(
              topic,
              batch.partition,
              nextOffset.toString(),
              messages
            );
          }
        },
      });
    } catch (error) {
      this.logger.error(
        "【kafka consumer error】" +
        error +
        "【topic】" +
        topic +
        "【groupId】" +
        groupId
      );
    }
  }

  async stopConsumer(topic: string, groupId: string): Promise<boolean> {
    try {
      const key = this.buildConsumerKey(topic, groupId)
      const consumer: Consumer = this.consumerMap.get(key);
      if (consumer) {
        await consumer.stop();
      }
      return true;
    } catch (error) {
      this.logger.error(
        "【kafka stop Consumer error】" +
        error +
        "【topic】" +
        topic +
        "【groupId】" +
        groupId
      );
      return false;
    }
  }

  async pauseConsumer(topic: string, groupId: string, partition: number): Promise<boolean> {
    try {
      const key = this.buildConsumerKey(topic, groupId)
      const consumer: Consumer = this.consumerMap.get(key);
      if (consumer) {
        await consumer.pause([{ topic, partitions: [partition] }]);
      }
      return true;
    } catch (error) {
      this.logger.error(
        "【kafka pause Consumer error】" +
        error +
        "【topic】" +
        topic +
        "【groupId】" +
        groupId
      );
      return false;
    }
  }

  async resumeConsumer(topic: string, groupId: string, partition: number): Promise<boolean> {
    try {
      const key = this.buildConsumerKey(topic, groupId)
      const consumer: Consumer = this.consumerMap.get(key);
      if (consumer) {
        await consumer.resume([{ topic, partitions: [partition] }]);
      }
      return true;
    } catch (error) {
      this.logger.error(
        "【kafka resume Consumer error】" +
        error +
        "【topic】" +
        topic +
        "【groupId】" +
        groupId
      );
    }
    return false;
  }

  async commitOffsets(
    topic: string,
    groupId: string,
    partition: number,
    offset: string
  ): Promise<boolean> {
    try {
      const key = this.buildConsumerKey(topic, groupId)
      const consumer: Consumer = this.consumerMap.get(key);
      if (consumer) {
        await consumer.commitOffsets([{ topic, partition, offset }]);
      }
      return true;
    } catch (error) {
      this.logger.error(
        "【kafka commitOffsets Consumer error】" +
        error +
        "【topic】" +
        topic +
        "【groupId】" +
        groupId
      );
      return false;
    }
  }

  buildConsumerKey(topic: string, groupId: string): string {
    return `${topic}${groupId}`
  }
}
