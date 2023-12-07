import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { BaseVo } from "../vo/base.vo";
import { SEARCH_TABLE } from "../constant/kafka.constant";
import { buildSessionEntity } from "../utils/session.utils";
import { SessionEntity } from "../entity/session.entity";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class SearchConsumerOptions extends BaseConsumerOptions {
    public topic = ""
    public groupId = "";
    public ckTable = SEARCH_TABLE

    buildEntity(payload: KafkaPayload): SessionEntity {
        const baseVo: BaseVo = query.parse(payload.body) as BaseVo
        if (baseVo.begin_session !== '1') {
            return null
        }
        return buildSessionEntity(payload)  
    }
}
 