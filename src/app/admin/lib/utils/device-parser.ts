/**
 * Device Parser Utility
 * Extracts device, browser, and OS information from user agent string
 */

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceVendor: string;
  isMobile: boolean;
}

/**
 * Parse user agent string to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      deviceType: 'desktop',
      deviceVendor: 'Unknown',
      isMobile: false,
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect Browser
  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.includes('edg/')) {
    browser = 'Edge';
    browserVersion = extractVersion(ua, 'edg/');
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
    browserVersion = extractVersion(ua, 'chrome/');
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    browserVersion = extractVersion(ua, 'firefox/');
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    browserVersion = extractVersion(ua, 'version/');
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
    browserVersion = extractVersion(ua, ua.includes('opr/') ? 'opr/' : 'opera/');
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '';

  if (ua.includes('windows nt')) {
    os = 'Windows';
    const version = extractVersion(ua, 'windows nt ');
    osVersion = getWindowsVersion(version);
  } else if (ua.includes('mac os x')) {
    os = 'macOS';
    osVersion = extractVersion(ua, 'mac os x ').replace(/_/g, '.');
  } else if (ua.includes('android')) {
    os = 'Android';
    osVersion = extractVersion(ua, 'android ');
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os (\d+)_?(\d+)?_?(\d+)?/);
    if (match) {
      osVersion = [match[1], match[2], match[3]].filter(Boolean).join('.');
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Detect Device Type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let isMobile = false;

  if (ua.includes('mobile') || ua.includes('android')) {
    if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else {
      deviceType = 'mobile';
      isMobile = true;
    }
  } else if (ua.includes('ipad')) {
    deviceType = 'tablet';
  }

  // Detect Device Vendor
  let deviceVendor = 'Unknown';
  
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('macintosh')) {
    deviceVendor = 'Apple';
  } else if (ua.includes('samsung')) {
    deviceVendor = 'Samsung';
  } else if (ua.includes('huawei')) {
    deviceVendor = 'Huawei';
  } else if (ua.includes('xiaomi')) {
    deviceVendor = 'Xiaomi';
  } else if (ua.includes('oppo')) {
    deviceVendor = 'Oppo';
  } else if (ua.includes('vivo')) {
    deviceVendor = 'Vivo';
  } else if (ua.includes('pixel')) {
    deviceVendor = 'Google';
  } else if (ua.includes('windows')) {
    deviceVendor = 'PC';
  } else if (ua.includes('linux')) {
    deviceVendor = 'PC';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    deviceVendor,
    isMobile,
  };
}

/**
 * Extract version number from user agent string
 */
function extractVersion(ua: string, prefix: string): string {
  const index = ua.indexOf(prefix);
  if (index === -1) return '';
  
  const versionStart = index + prefix.length;
  const versionString = ua.substring(versionStart);
  const match = versionString.match(/^(\d+\.?\d*\.?\d*)/);
  
  return match ? match[1] : '';
}

/**
 * Map Windows NT version to friendly name
 */
function getWindowsVersion(ntVersion: string): string {
  const versionMap: Record<string, string> = {
    '10.0': '10/11',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.1': 'XP',
  };
  
  return versionMap[ntVersion] || ntVersion;
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(deviceInfo: DeviceInfo): string {
  const parts: string[] = [];

  // Browser
  if (deviceInfo.browser !== 'Unknown') {
    const browserPart = deviceInfo.browserVersion
      ? `${deviceInfo.browser} ${deviceInfo.browserVersion}`
      : deviceInfo.browser;
    parts.push(browserPart);
  }

  // OS
  if (deviceInfo.os !== 'Unknown') {
    const osPart = deviceInfo.osVersion
      ? `${deviceInfo.os} ${deviceInfo.osVersion}`
      : deviceInfo.os;
    parts.push(osPart);
  }

  // Device Type
  if (deviceInfo.deviceType !== 'desktop' || deviceInfo.deviceVendor !== 'Unknown') {
    if (deviceInfo.deviceVendor !== 'Unknown' && deviceInfo.deviceVendor !== 'PC') {
      parts.push(`${deviceInfo.deviceVendor} ${deviceInfo.deviceType}`);
    } else {
      parts.push(deviceInfo.deviceType);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : 'Unknown Device';
}

/**
 * Get device icon based on device type
 */
export function getDeviceIcon(deviceType: 'mobile' | 'tablet' | 'desktop'): string {
  const icons = {
    mobile: '📱',
    tablet: '📱',
    desktop: '💻',
  };
  
  return icons[deviceType] || '💻';
}
