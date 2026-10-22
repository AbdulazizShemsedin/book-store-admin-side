export interface DeviceHardwareInfo {
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

const SESSION_STORAGE_KEY = 'tewba_tester_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';

  try {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      // Random friendly anonymous tester ID, e.g. tester_x9a2_4bc1
      const randHex = Math.random().toString(36).substring(2, 8);
      const timestamp = Date.now().toString(36).substring(4);
      id = `tester_${randHex}_${timestamp}`;
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `tester_fallback_${Date.now()}`;
  }
}

export function detectDeviceHardware(): DeviceHardwareInfo {
  const sessionId = getOrCreateSessionId();

  if (typeof window === 'undefined') {
    return {
      sessionId,
      deviceType: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      viewportWidth: 1280,
      viewportHeight: 800,
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
    };
  }

  const ua = navigator.userAgent;

  // 1. Detect Device Type
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

  // 2. Detect OS
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/cros/i.test(ua)) os = 'ChromeOS';

  // 3. Detect Browser
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return {
    sessionId,
    deviceType,
    os,
    browser,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: window.screen?.width || window.innerWidth,
    screenHeight: window.screen?.height || window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
  };
}
