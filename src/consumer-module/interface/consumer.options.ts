import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { DBDataValidator } from "./db.data.validator";

export const MAX_ROWS = 100000;
export type EntityHandler = (message: KafkaPayload) => any | any[];
export type SetNextHandler = (cosumer: ConsumerOptions) => ConsumerOptions;
export type SetValidatorHandler = (validator: DBDataValidator) => ConsumerOptions;

export interface ConsumerOptions {
  // 队列主题
  topic: string;
  // 消费组Id
  groupId: string;
  // 表名前缀
  ckTable: string;
  // 最大入库记录数, 如果不设置默认100000
  maxRow: number
  // 构建 clickhouse 入库数据闭包
  buildEntity: EntityHandler;
  // 即将入库前数据检查者
  setValidator: SetValidatorHandler
  validator: DBDataValidator;
  // 责任链设置
  setNext: SetNextHandler;
  next: ConsumerOptions;
}
