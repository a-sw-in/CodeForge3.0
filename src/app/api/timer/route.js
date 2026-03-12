import { NextResponse } from 'next/server';
import { getTimerState } from '@/lib/timerState';

export async function GET() {
  try {
    // Get current server time
    const serverTime = new Date();
    
    // Get timer state
    const timerState = getTimerState();
    
    // If timer is not active, return not started state
    if (!timerState.isActive && !timerState.startTime) {
      return NextResponse.json({
        success: true,
        serverTime: serverTime.toISOString(),
        eventDate: null,
        timeRemaining: 0,
        eventStarted: false,
        timerActive: false,
        message: 'Timer not started yet',
      });
    }

    // Calculate end time (24 hours from start + accumulated pause time)
    const startTime = new Date(timerState.startTime).getTime();
    const endTime = startTime + (24 * 60 * 60 * 1000) + (timerState.accumulatedPauseTime || 0); // 24 hours + pause time
    const eventDate = new Date(endTime);
    
    // Calculate time remaining
    let timeRemaining;
    if (timerState.isPaused) {
      // When paused, use the saved pausedTimeRemaining value
      timeRemaining = timerState.pausedTimeRemaining || 0;
    } else {
      // When running, calculate from current time
      timeRemaining = endTime - serverTime.getTime();
    }
    
    return NextResponse.json({
      success: true,
      serverTime: serverTime.toISOString(),
      eventDate: eventDate.toISOString(),
      startTime: timerState.startTime,
      timeRemaining: Math.max(0, timeRemaining),
      eventStarted: timeRemaining <= 0,
      timerActive: timerState.isActive,
      isPaused: timerState.isPaused,
      hasEnded: timerState.hasEnded || timeRemaining <= 0,
    });
  } catch (error) {
    console.error('Timer API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server time' },
      { status: 500 }
    );
  }
}
