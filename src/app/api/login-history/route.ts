import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface LoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'success' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
}

const MOCK_LOGS: LoginLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    ipAddress: '192.168.1.42',
    location: 'San Francisco, CA, USA',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success',
    riskLevel: 'low',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    ipAddress: '45.22.11.99',
    location: 'London, UK',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    status: 'success',
    riskLevel: 'medium',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    ipAddress: '103.44.22.11',
    location: 'Beijing, China',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    status: 'failed',
    riskLevel: 'high',
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    ipAddress: '192.168.1.42',
    location: 'San Francisco, CA, USA',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    status: 'success',
    riskLevel: 'low',
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    ipAddress: '88.134.42.11',
    location: 'Berlin, Germany',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    status: 'success',
    riskLevel: 'low',
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(), 
    ipAddress: '185.11.22.33',
    location: 'Moscow, Russia',
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    status: 'failed',
    riskLevel: 'high',
  },
];

export async function GET() {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ data: MOCK_LOGS });
  } catch {
    return NextResponse.json({ error: "Failed to fetch login history" }, { status: 500 });
  }
}
