import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { BaseVo } from "../vo/base.vo";
import { bounceVo } from "../vo/bounce.vo";
import { bounceEntity } from "../entity/bounce.entity";
import { dateFormat, isToday } from "@/shared/utils/time.utils";
import { BOUNCE_TABLE, BOUNCE_TOPIC } from "../constant/kafka.constant";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class BounceConsumerOptions extends BaseConsumerOptions {
  public topic = BOUNCE_TOPIC
  public groupId = `${this.topic}_group`;
  public ckTable = BOUNCE_TABLE

  buildEntity(payload: KafkaPayload): bounceEntity[] {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    //构建entity
    const bounces: bounceVo[] = JSON.parse(baseVo.bounces)
    const bounceEntitys: bounceEntity[] = []
    bounces.forEach((element) => {
      const entity: bounceEntity = new bounceEntity()
      entity.sid = baseVo.session_id || ''
      entity.page = element.pageName || ''
      entity.page_url = element.pageUrl || ''
      entity.is_new_user = isToday(payload.firstVisitTime)
      entity.device_id = baseVo.device_id || ''
      entity.device_no = Number(baseVo.device_no)
      entity.user_id = baseVo.app_user_id || ''
      const time = dateFormat(payload.createdTime, DATETIME_FORMAT)
      entity.timestamp = time
      entity.create_time = time
      entity.status = element.status || 0
      bounceEntitys.push(entity)
    })
    return bounceEntitys;
  }
}
