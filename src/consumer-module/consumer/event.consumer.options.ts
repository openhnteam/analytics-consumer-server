import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { BaseVo } from "../vo/base.vo";
import { dateFormat, isToday } from "@/shared/utils/time.utils";
import { EventEntity } from "../entity/event.entity";
import { eventVo } from "../vo/event.vo";
import { isEmpty } from "@/shared/utils/obj.utils";
import { EVENT_TABLE, EVENT_TOPIC } from "../constant/kafka.constant";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class EventConsumerOptions extends BaseConsumerOptions {
  public topic = EVENT_TOPIC
  public groupId = `${this.topic}_group`;
  public ckTable = EVENT_TABLE

  buildEntity(payload: KafkaPayload): EventEntity[] {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    //构建entity
    const events: eventVo[] = JSON.parse(baseVo.events)
    const eventEntitys: Array<EventEntity> = []
    events.forEach((element) => {
      if (!isEmpty(element.key) && element.key.length <= 128) {
        const entity: EventEntity = new EventEntity()
        entity.event_id = element.key
        entity.is_new_user = isToday(payload.firstVisitTime)
        entity.user_id = baseVo.app_user_id
        entity.device_id = baseVo.device_id
        entity.sid = baseVo.session_id
        entity.device_no = Number(baseVo.device_no)
        entity.create_time = dateFormat(payload.createdTime, DATETIME_FORMAT)
        entity.timestamp = dateFormat(baseVo.timestamp, DATETIME_FORMAT)
        const names: Array<string> = []
        const values: Array<string> = []
        const segmentation: Object = element.segmentation
        for (const key in segmentation) {
          if (isEmpty(key) || key.length > 128) {
            continue
          }
          const value = segmentation[key]
          const segValueBlackList = ['undefined', '', 'null']
          if (segValueBlackList.includes(value) || value.length > 512) {
            continue
          }
          names.push(key)
          values.push(String(value))
        }
        entity.string_seg_values = values
        entity.string_seg_names = names
        eventEntitys.push(entity)
      }
    })
    return eventEntitys
  }
}
