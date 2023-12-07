import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'

@Entity('sts_location')
export class stsLocationEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number
  @Column({ nullable: false, type: 'varchar', length: 24 })
  appId: string
  @Column({ nullable: false, type: 'varchar', length: 10 })
  date: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  country: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  prov: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  city: string
  @Column({ nullable: false, type: 'varchar', length: 64 })
  district: string
  @Column({ nullable: false, default: 0 })
  uv: number
  @Column({ nullable: false, default: 0 })
  newUv: number
  @Column({ nullable: false, default: 0 })
  pv: number
  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  create_time: Date
  @Column({ default: 0 })
  del: number
}
