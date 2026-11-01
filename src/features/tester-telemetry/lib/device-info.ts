export interface DeviceHardwareInfo {
  sessionId: string;
  customName?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  gpu: string;
  cpuCores: number;
  memoryGb: number;
  networkType: string;
  networkDownlink: string;
  batteryLevel?: number; // 0 - 100
  isCharging?: boolean;
  timezone: string;
  languages: string[];
  touchPoints: number;
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  displayPillName: string;
}

const SESSION_STORAGE_KEY = 'tewba_tester_session_id';
const CUSTOM_NAME_KEY = 'tewba_tester_custom_name';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';

  try {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      const randHex = Math.random().toString(36).substring(2, 7);
      const timestamp = Date.now().toString(36).substring(4);
      id = `tester_${randHex}_${timestamp}`;
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `tester_fallback_${Date.now()}`;
  }
}

export function getTesterCustomName(): string {
  if (typeof window === 'undefined') return '';
  try {
    // 1. Check URL query params: ?tester=Name or ?name=Name
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('tester') || params.get('name');
    if (paramName && paramName.trim()) {
      const clean = paramName.trim().substring(0, 32);
      localStorage.setItem(CUSTOM_NAME_KEY, clean);
      return clean;
    }
    // 2. Check localStorage
    return localStorage.getItem(CUSTOM_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setTesterCustomName(name: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
}

export function getGpuRenderer(): string {
  if (typeof window === 'undefined') return 'Standard GPU';
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return 'Standard GPU';

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const raw = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      if (typeof raw === 'string') {
        // Clean common verbose vendor strings
        let clean = raw
          .replace(/^ANGLE \([^,]+,\s*/i, '')
          .replace(/Direct3D.*$/i, '')
          .replace(/vs_\d+_\d+.*$/i, '')
          .replace(/[(),]/g, '')
          .trim();
        // Shorten long strings
        if (clean.includes('NVIDIA')) {
          clean = clean.replace(/.*(NVIDIA GeForce [^ ]+).*/i, '$1');
        } else if (clean.includes('Intel')) {
          clean = clean.replace(/.*(Intel[^ ]* [^ ]*).*/i, '$1');
        } else if (clean.includes('AMD') || clean.includes('Radeon')) {
          clean = clean.replace(/.*(AMD Radeon [^ ]+).*/i, '$1');
        } else if (clean.includes('Apple')) {
          clean = clean.replace(/.*(Apple M\d[^ ]*).*/i, '$1');
        }
        return clean.substring(0, 32) || raw.substring(0, 32);
      }
    }
  } catch {
    // WebGL disabled
  }
  return 'Standard GPU';
}

export function detectDeviceHardware(): DeviceHardwareInfo {
  const sessionId = getOrCreateSessionId();
  const customName = getTesterCustomName();

  if (typeof window === 'undefined') {
    return {
      sessionId,
      customName,
      deviceType: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      gpu: 'Standard GPU',
      cpuCores: 4,
      memoryGb: 8,
      networkType: 'WiFi',
      networkDownlink: 'Fast',
      timezone: 'UTC',
      languages: ['en'],
      touchPoints: 0,
      viewportWidth: 1280,
      viewportHeight: 800,
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      displayPillName: 'Desktop',
    };
  }

  const ua = navigator.userAgent;

  // 1. Device Type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(
    ua
  );
  const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
    ua
  );

  if (isTablet || (window.innerWidth >= 600 && window.innerWidth <= 1024 && 'ontouchstart' in window)) {
    deviceType = 'tablet';
  } else if (isMobile || window.innerWidth < 600) {
    deviceType = 'mobile';
  }

  // 2. OS
  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/cros/i.test(ua)) os = 'ChromeOS';

  // 3. Browser
  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  // 4. GPU, CPU, Memory
  const gpu = getGpuRenderer();
  const cpuCores = navigator.hardwareConcurrency || 0;
  const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0;

  // 5. Network Information API
  const navAny = navigator as unknown as {
    connection?: { effectiveType?: string; downlink?: number };
    mozConnection?: { effectiveType?: string; downlink?: number };
    webkitConnection?: { effectiveType?: string; downlink?: number };
  };
  const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection;
  const networkType = conn?.effectiveType ? String(conn.effectiveType).toUpperCase() : 'WiFi/LAN';
  const networkDownlink = conn?.downlink ? `${conn.downlink} Mbps` : 'Broadband';

  // 6. Timezone & Languages
  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    // fallback
  }
  const languages = navigator.languages ? [...navigator.languages] : [navigator.language || 'en'];
  const touchPoints = navigator.maxTouchPoints || 0;

  const res = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;

  // 7. Human-friendly Display Name for the Pill
  let displayPillName = '';
  if (customName) {
    displayPillName = `${customName} (${os} • ${res})`;
  } else {
    const gpuShort = gpu !== 'Standard GPU' ? gpu : '';
    const memShort = memoryGb > 0 ? `${memoryGb}GB` : '';
    const parts = [os, gpuShort, memShort, res].filter(Boolean);
    displayPillName = parts.slice(0, 3).join(' • ');
  }

  return {
    sessionId,
    customName,
    deviceType,
    os,
    browser,
    gpu,
    cpuCores,
    memoryGb,
    networkType,
    networkDownlink,
    timezone,
    languages,
    touchPoints,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: window.screen?.width || window.innerWidth,
    screenHeight: window.screen?.height || window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    displayPillName,
  };
}
