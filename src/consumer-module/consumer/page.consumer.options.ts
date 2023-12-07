import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { curTs, dateFormat, isToday } from "@/shared/utils/time.utils";
import { BaseVo } from "../vo/base.vo";
import { pageVo } from "../vo/page.vo";
import { PageEntity } from "../entity/page.entity";
import { PAGE_TABLE, PAGE_TOPIC } from "../constant/kafka.constant";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class PageConsumerOptions extends BaseConsumerOptions {
  public topic = PAGE_TOPIC
  public groupId = `${this.topic}_group`;
  public ckTable = PAGE_TABLE

  buildEntity(payload: KafkaPayload) : PageEntity[] {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    //构建entity
    const pages: pageVo[] = JSON.parse(baseVo.pages)
    const pagesEntity: PageEntity[] = []
    pages.forEach((element) => {
      const entity: PageEntity = new PageEntity()
      entity.sid = baseVo.session_id || ''
      entity.page = element.pageName || ''
      entity.page_url = element.pageUrl || ''
      entity.is_new_user = isToday(payload.firstVisitTime)
      entity.device_id = baseVo.device_id || ''
      entity.device_no = Number(baseVo.device_no)
      entity.user_id = baseVo.app_user_id || ''
      const nowTs = curTs()
      const startTime = element.startTime || nowTs
      const endTime = element.endTime || nowTs
      entity.timestamp = dateFormat(payload.createdTime, DATETIME_FORMAT)
      entity.create_time = dateFormat(startTime, DATETIME_FORMAT)
      entity.duration = Math.max(0, endTime - startTime)
      pagesEntity.push(entity)
    })
    return pagesEntity
  }
}
