import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LocationService } from './service/location.service'
import { ipInfoEntity } from './entity/ip.info.entity'
import { HttpModule } from '@nestjs/axios'
import { stsLocationEntity } from './entity/sts.localtion.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ipInfoEntity, stsLocationEntity]), HttpModule],
  controllers: [],
  providers: [LocationService],
  exports: [LocationService]
})
export class LocationModule {}
