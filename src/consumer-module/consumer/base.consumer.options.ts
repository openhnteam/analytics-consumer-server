import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { ConsumerOptions } from "../interface/consumer.options";
import { DBDataValidator } from "../interface/db.data.validator";

export class BaseConsumerOptions implements ConsumerOptions {
    public topic: string;
    public groupId: string;
    public ckTable: string;
    public maxRow: number;
    public next: ConsumerOptions | null = null;
    public validator: DBDataValidator | null = null;

    buildEntity(payload: KafkaPayload) : any {
        return null
    }
  
    setNext(consumer: ConsumerOptions): ConsumerOptions {
        this.next = consumer
        return consumer
    }

    setValidator(validator: DBDataValidator) : ConsumerOptions {
        this.validator = validator
        return this
    }
}