import { DeviceHardwareInfo } from './lib/device-info';

export interface TelemetryClick {
  timestamp: number;
  tag: string;
  label: string;
  x: number;
  y: number;
  isRage: boolean;
  isDead: boolean;
}

export interface TelemetryTimeMetrics {
  totalDurationSeconds: number;
  activeReadingSeconds: number;
  backgroundAwaySeconds: number;
  tabSwitchCount: number;
}

export interface TelemetryPayload {
  hardware: DeviceHardwareInfo;
  time: TelemetryTimeMetrics;
  clicks: TelemetryClick[];
  rageClicksCount: number;
  deadClicksCount: number;
  maxScrollDepthPercent: number;
  currentPath: string;
}

export interface AdminMessage {
  id: string;
  text: string;
  sentAt: string;
}

export interface TesterSessionRow {
  session_id: string;
  device_type: string;
  os: string;
  browser: string;
  last_updated: string;
  telemetry: TelemetryPayload;
  admin_message?: AdminMessage | null;
}
