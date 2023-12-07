import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";

export type QueueHandler = (message: KafkaPayload) => number;
export type CommonHandler = () => void;

// 责任链
export interface NextConsumer {
    // 设置下一个响应者
    next(consumer: NextConsumer): NextConsumer;
    // 清除待入库数据
    clearData: CommonHandler;
    // 批量入数据库
    addToDatabase: CommonHandler;
    // kafka消息处理进缓存
    pushDataToQueue: QueueHandler;
}