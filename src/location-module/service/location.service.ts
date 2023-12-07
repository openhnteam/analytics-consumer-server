import { Injectable, Logger } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { BaseService } from '@/shared/service/base.service'
import { ipInfoEntity } from '../entity/ip.info.entity'
import { HttpService } from '@nestjs/axios'
import { isEmpty, isPrivateIP, isValidIP } from '@/shared/utils/obj.utils'
import { LocationEntity } from '@/consumer-module/entity/location.entity'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LocationService extends BaseService {
  private readonly logger = new Logger(LocationService.name);
  constructor(
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  async validAction(entityList: LocationEntity[]): Promise<LocationEntity[]> {
    if (isEmpty(entityList)) {
      return []
    }
    entityList = entityList.filter(item => !isEmpty(item.ip))
    //给ip去重，查询ip归属地
    const uniqueIPs = [...new Set(entityList.map((item) => item.ip))].filter((ip) => ip.trim() !== "") as string[]
    if (isEmpty(uniqueIPs)) {
      return []
    }
    const ipEntitys = await this.fetchCityInfo(uniqueIPs)
    const ipObj = ipEntitys.reduce((acc, cur) => {
      acc[cur.ip] = cur
      return acc
    }, {})
    for (const location of entityList) {
      const ip = location.ip
      if (isEmpty(ip)) {
        continue
      }
      const ipInfo = ipObj[`${ip}`]
      if (isEmpty(ipInfo)) {
        continue
      }
      location.country = ipInfo.country || ''
      location.prov = this.removeSuffix(ipInfo.region)
      location.city = this.removeSuffix(ipInfo.city)
    }
    return entityList
  }

  async fetchCityInfo(ips: string[]): Promise<ipInfoEntity[]> {
    //批量查询
    let uniqueIps = ips
    let list: ipInfoEntity[] = []
    const records = await this.entityManager.createQueryBuilder(ipInfoEntity, 'ip').where('ip.ip IN (:...ips)', { ips }).getMany()
    const sql = await this.entityManager.createQueryBuilder(ipInfoEntity, 'ip').where('ip.ip IN (:...ips)', { ips }).getSql()
    if (!isEmpty(records)) {
      list = list.concat(records)
      const recordIps = records.map((record) => record.ip)
      uniqueIps = ips.filter((ip) => !recordIps.includes(ip))
    }

    if (!isEmpty(uniqueIps)) {
      //批量请求归属地
      const tasks: Promise<ipInfoEntity | null>[] = uniqueIps.map((ip) => this.makeIpRequest(ip))
      let results = await Promise.all(tasks)
      results = results.filter((item) => !isEmpty(item))
      if (!isEmpty(results)) {
        list = list.concat(results)

        //批量入库
        await this.entityManager.createQueryBuilder().insert().into(ipInfoEntity).values(results).execute()
      }
    }
    return list
  }

  async makeIpRequest(ip: string): Promise<ipInfoEntity | undefined> {
    try {
      const appCode = process.env.IP_CODE || this.configService.get<string>("locationAppCode")
      if (isEmpty(appCode)) {
        return undefined
      }
      //如果不是一个ip地址或者内网ip，不请求归属地
      if (!isValidIP(ip)) {
        this.logger.error(`ip地址不合法:${ip}`)
        return undefined
      }
      if (isPrivateIP(ip)) {
        this.logger.error(`ip地址为内网地址:${ip}`)
        return undefined
      }
      const config = {
        headers: {
          Authorization: `APPCODE ${appCode}`
        }
      }
      const url = `https://api01.aliyun.venuscn.com/ip?ip=${ip}`
      const response = await this.httpService.get(url, config).toPromise()
      if (response.status != 200) {
        this.logger.error(`ip归属地查询失败: ${JSON.stringify(response)}`)
        return undefined
      }
      const responseData = response.data
      if (responseData.ret != 200) {
        this.logger.error(`ip归属地查询失败: ${JSON.stringify(response)}`)
        return undefined
      }
      const data = responseData.data
      if (isEmpty(data)) {
        return undefined
      }
      const entity = new ipInfoEntity()
      entity.ip = ip
      entity.area = data.area || ''
      entity.country = data.country || ''
      entity.countryId = data.country_id || ''
      entity.isp = data.isp || ''
      entity.region = data.region || ''
      entity.regionId = data.region_id || ''
      entity.city = data.city || ''
      entity.cityId = data.city_id || ''
      entity.district = data.district || ''
      entity.districtId = data.district_id || ''
      return entity
    } catch (error) {
      this.logger.error(`ip归属地查询异常:${ip}`, error.stack)
      return undefined
    }
  }

  removeSuffix(str: string): string {
    if (isEmpty(str)) return ''
    const suffixes = ['省', '市', '县', '区']
    for (const suffix of suffixes) {
      if (str.endsWith(suffix)) {
        return str.slice(0, str.length - suffix.length)
      }
    }
    return str
  }

}
