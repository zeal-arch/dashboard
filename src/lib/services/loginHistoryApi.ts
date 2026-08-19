export interface LoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'success' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
}

export async function fetchLoginHistory(): Promise<LoginLog[]> {
  try {
    const response = await fetch("/api/login-history");
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch login history:", error);
    return [];
  }
}
