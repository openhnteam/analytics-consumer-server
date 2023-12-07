export class BaseVo {
  app_key: string;
  timestamp: number;
  sdk_version: string;
  sdk_name: string;
  app_user_id: string;
  device_id: string;
  begin_session?: string;
  end_session?: string;
  session_duration?: number;
  events?: string;
  pages?: string;
  bounces?: string;
  metrics?: string;
  checksum256: string;

  session_id: string;
  session_time: string;
  ip: string;
  device_no: string;
}
