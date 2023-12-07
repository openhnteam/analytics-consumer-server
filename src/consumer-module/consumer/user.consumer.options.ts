import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { userEntity } from "../entity/user.entity";
import { BaseVo } from "../vo/base.vo";
import { metricsVo } from "../vo/metrics.vo";
import { dateFormat } from "@/shared/utils/time.utils";
import { USER_TABLE } from "../constant/kafka.constant";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
import { BaseConsumerOptions } from "./base.consumer.options";
const query = require('querystring')

export class UserConsumerOptions extends BaseConsumerOptions {
  public topic = ""
  public groupId = "";
  public ckTable = USER_TABLE

  buildEntity(payload: KafkaPayload): userEntity {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    if (baseVo.begin_session !== '1') {
      return null
    }
    const first_visit_time = dateFormat(payload.firstVisitTime, DATETIME_FORMAT)
    const lastDate = dateFormat(baseVo.session_time, DATETIME_FORMAT)
    const entity: userEntity = new userEntity()
    const metrics: metricsVo = JSON.parse(baseVo.metrics) as metricsVo
    entity.app_version = metrics._app_version || ''
    entity.os_version = metrics._os_version || ''
    entity.device = metrics._device || ''
    entity.device_type = metrics._device_type || ''
    entity.density = metrics._density || ''
    entity.locale = metrics._locale || ''
    entity.resolution = metrics._resolution || ''
    entity.os = metrics._os || ''
    entity.carrier = metrics._carrier || ''
    entity.mccmnc = metrics._mccmnc || ''
    entity.install_channel = payload.installChannel || ''
    entity.scene = metrics._scene || ''
    entity.ip = baseVo.ip || ''
    entity.device_id = baseVo.device_id || ''
    entity.device_no = Number(baseVo.device_no)
    entity.user_id = baseVo.app_user_id || ''
    entity.last_visit_time = lastDate
    entity.first_visit_time = first_visit_time
    return entity
  }
}
