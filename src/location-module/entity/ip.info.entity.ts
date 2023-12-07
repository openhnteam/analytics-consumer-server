import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'

@Entity('ip_info')
export class ipInfoEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number
  @Column({ nullable: false, type: 'varchar', length: 40 })
  ip: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  country: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  countryId: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  isp: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  area: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  region: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  regionId: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  city: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  cityId: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  district: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  districtId: string
  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createTime: Date
  @Column({ default: 0 })
  del: number
}
