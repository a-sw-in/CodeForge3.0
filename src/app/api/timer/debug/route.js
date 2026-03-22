import { NextResponse } from 'next/server';
import { getActiveConnectionCount, getBroadcastLog } from '@/lib/sseManager';

export async function GET() {
  return NextResponse.json({
    activeConnections: getActiveConnectionCount(),
    recentBroadcasts: getBroadcastLog(),
    timestamp: new Date().toISOString(),
  });
}
