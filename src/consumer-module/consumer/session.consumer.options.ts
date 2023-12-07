import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { SessionEntity } from "../entity/session.entity";
import { SESSION_TABLE, SESSION_TOPIC } from "../constant/kafka.constant";
import { buildSessionEntity } from "../utils/session.utils";
import { BaseConsumerOptions } from "./base.consumer.options";

export class SessionConsumerOptions extends BaseConsumerOptions {
  public topic = SESSION_TOPIC;
  public groupId = `${this.topic}_group`;
  public ckTable = SESSION_TABLE;

  buildEntity(payload: KafkaPayload) : SessionEntity {
    return buildSessionEntity(payload)
  }
}
