import { KafkaPayload } from "@/shared/service/kafka/kafka.payload";
import { SessionEntity } from "../entity/session.entity";
import { isEmpty } from "@/shared/utils/obj.utils";
import { metricsVo } from "../vo/metrics.vo";
import { BaseVo } from "../vo/base.vo";
import { dateFormat, isToday } from "@/shared/utils/time.utils";
import { DATETIME_FORMAT } from "@/shared/constants/date.constant";
const query = require('querystring')
// 最大心跳秒
const MAX_SESSION_DURATION = 25

export function buildSessionEntity(payload: KafkaPayload): SessionEntity {
    const baseVo: BaseVo = query.parse(payload.body) as BaseVo
    const date = dateFormat(baseVo.session_time, DATETIME_FORMAT)
    let entity: SessionEntity = new SessionEntity()
    if (baseVo.begin_session == '1') {
      const metrics: metricsVo = JSON.parse(baseVo.metrics) as metricsVo
      entity.id = baseVo.session_id
      entity.carrier = metrics._carrier || ''
      entity.mccmnc = metrics._mccmnc || ''
      entity.is_new_user = isToday(payload.firstVisitTime)
      entity.app_version = metrics._app_version || ''
      entity.os_version = buildDbOsVersion(metrics._os_version, metrics._os)
      entity.ip = baseVo.ip || ''
      entity.device_id = baseVo.device_id || ''
      entity.device = metrics._device || ''
      entity.device_no = Number(baseVo.device_no)
      entity.device_type = metrics._device_type || ''
      entity.density = metrics._density || ''
      entity.locale = metrics._locale || ''
      entity.resolution = metrics._resolution || ''
      entity.os = metrics._os || ''
      entity.install_channel = metrics._channel || ''
      entity.scene = metrics._scene || ''
      entity.platform_version = metrics._platform_version || ''
      entity.user_id = baseVo.app_user_id || ''
      entity.start_time = date
      entity.duration = 1
    } else if (baseVo.end_session == '1' || baseVo.session_duration > 0) {
      entity.id = baseVo.session_id
      entity.duration = Math.min(Number(baseVo.session_duration), MAX_SESSION_DURATION)
      entity.device_no = Number(baseVo.device_no)
      // 保证时间一致，用于相同分区合并
      entity.start_time = date
    }
    return entity
}


// 适配多端SDK的日志上报差异，后续入库样式如：i16.0或a8.4
export function buildDbOsVersion(version: string , os: string) : string {
    if (!isEmpty(version) && !isEmpty(os)) {
      // 去除空格、ios、android 标识
      let lowerOsVersion = version.toLowerCase().replace(/ /g, '')
      lowerOsVersion = lowerOsVersion.replace('ios', '')
      lowerOsVersion = lowerOsVersion.replace('android', '')
      if (os.toLocaleLowerCase() == 'ios') {
        lowerOsVersion = 'i' + version
      } else if (os.toLocaleLowerCase() == 'android') {
        lowerOsVersion = 'a' + version
      }
      return lowerOsVersion
    }
    return ''
  }
