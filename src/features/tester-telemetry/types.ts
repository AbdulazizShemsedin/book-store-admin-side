import { DeviceHardwareInfo } from './lib/device-info';

export interface TelemetryClick {
  timestamp: number;
  tag: string;
  label: string;
  x: number;
  y: number;
  isRage: boolean;
  isDead: boolean;
  route?: string;
}

export interface TelemetryTimeMetrics {
  totalDurationSeconds: number;
  activeReadingSeconds: number;
  backgroundAwaySeconds: number;
  tabSwitchCount: number;
}

export interface PerformanceVitals {
  currentFps: number;
  avgFps: number;
  usedJsHeapMb: number;
  totalJsHeapMb: number;
  jsHeapLimitMb: number;
  uiFreezesCount: number;
  maxFreezeDurationMs: number;
  storageQuotaMb: number;
  storageUsageMb: number;
}

export interface InputAndAccessibility {
  pointerType: 'fine' | 'coarse';
  canHover: boolean;
  prefersReducedMotion: boolean;
  forcedColorsHighContrast: boolean;
}

export interface FeaturesExplored {
  visitedDashboard: boolean;
  browsedBooks: boolean;
  viewedSeries: boolean;
  viewedCategories: boolean;
  viewedAuthors: boolean;
  viewedPublishers: boolean;
  usedSearch: boolean;
  usedThemeToggle: boolean;
}

export interface TelemetryPayload {
  hardware: DeviceHardwareInfo;
  time: TelemetryTimeMetrics;
  vitals?: PerformanceVitals;
  inputAndA11y?: InputAndAccessibility;
  clicks: TelemetryClick[];
  rageClicksCount: number;
  deadClicksCount: number;
  maxScrollDepthPercent: number;
  currentPath: string;
  pageAttention?: Record<string, number>; // path -> active seconds
  featuresExplored?: FeaturesExplored;
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
