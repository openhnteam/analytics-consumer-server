import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { BaseVo } from "../vo/base.vo";
import { LocationEntity } from "../entity/location.entity";
import { dateFormat, isToday } from "@/shared/utils/time.utils";
import { LOCATION_TABLE, SESSION_TOPIC } from "../constant/kafka.constant";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class LocationConsumerOptions extends BaseConsumerOptions {
  public topic = SESSION_TOPIC
  public groupId = `${this.topic}_location_group`;
  public ckTable = LOCATION_TABLE
  public maxRow = 100;

  buildEntity(payload: KafkaPayload) : LocationEntity {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    if (baseVo.begin_session !== '1') {
      return null
    }
    //构建entity
    const entity = new LocationEntity()
    entity.sid = baseVo.session_id || ''
    entity.is_new_user = isToday(payload.firstVisitTime)
    entity.device_id = baseVo.device_id || ''
    entity.device_no = Number(baseVo.device_no)
    entity.user_id = baseVo.app_user_id || ''
    entity.create_time = dateFormat(payload.createdTime, DATETIME_FORMAT)
    entity.timestamp = dateFormat(baseVo.timestamp, DATETIME_FORMAT)
    entity.ip = baseVo.ip
    return entity
  }
}
