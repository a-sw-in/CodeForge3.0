import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuthServer';
import { getTimerState, startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer, addTime, subtractTime } from '@/lib/timerState';
import { broadcastTimerState } from '@/app/api/timer/events/route';

// GET - Fetch timer status
export async function GET() {
  try {
    const timer = getTimerState();

    return NextResponse.json({
      success: true,
      timer,
    });
  } catch (error) {
    console.error('Timer status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer status' },
      { status: 500 }
    );
  }
}

// POST - Control timer (start/stop/reset)
export async function POST(request) {
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let timer;
    let message;

    switch (action) {
      case 'start':
        try {
          timer = startTimer();
          message = 'Timer started successfully';
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      case 'pause':
        try {
          timer = pauseTimer();
          message = 'Timer paused successfully';
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      case 'resume':
        try {
          timer = resumeTimer();
          message = 'Timer resumed successfully';
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      case 'stop':
        try {
          timer = stopTimer();
          message = 'Timer stopped successfully';
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      case 'reset':
        timer = resetTimer();
        message = 'Timer reset successfully';
        break;

      case 'addTime':
        try {
          const { minutes: addMinutes } = body;
          if (!addMinutes || addMinutes <= 0) {
            return NextResponse.json(
              { error: 'Invalid minutes value. Must be greater than 0' },
              { status: 400 }
            );
          }
          timer = addTime(addMinutes);
          message = `Added ${addMinutes} minute(s) successfully`;
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      case 'subtractTime':
        try {
          const { minutes: subtractMinutes } = body;
          if (!subtractMinutes || subtractMinutes <= 0) {
            return NextResponse.json(
              { error: 'Invalid minutes value. Must be greater than 0' },
              { status: 400 }
            );
          }
          timer = subtractTime(subtractMinutes);
          message = `Subtracted ${subtractMinutes} minute(s) successfully`;
        } catch (err) {
          return NextResponse.json(
            { error: err.message },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, pause, resume, stop, reset, addTime, or subtractTime' },
          { status: 400 }
        );
    }

    // Broadcast state change to all SSE clients
    broadcastTimerState();

    return NextResponse.json({
      success: true,
      message,
      timer,
    });
  } catch (error) {
    console.error('Timer control error:', error);
    return NextResponse.json(
      { error: 'Failed to control timer' },
      { status: 500 }
    );
  }
}
