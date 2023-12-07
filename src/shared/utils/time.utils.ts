import dayjs from 'dayjs'
import { isEmpty } from './obj.utils'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(tz)
dayjs.extend(utc)

export function sleep(ms) {
  return new Promise((resolve: any) =>
    setTimeout(() => {
      resolve()
    }, ms)
  )
}

export function curTs(): number {
  return dayjs().valueOf()
}

export function dateFormat(timestamp: string | number, format: string): string {
  return dayjs(Number(timestamp)).format(format)
}

export function isToday(timestamp: number | string): boolean {
  if (isEmpty(timestamp)) {
    return false
  }
  const today = dayjs().startOf('day')
  return dayjs(Number(timestamp)).isSame(today, 'd')
}

