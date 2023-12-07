export class EventEntity {
  event_id: string;
  device_id: string;
  user_id: string;
  sid: string;
  is_new_user: boolean;
  device_no: number;
  create_time: string;
  timestamp: string;
  string_seg_names: Array<string>;
  string_seg_values: Array<string>;
}
