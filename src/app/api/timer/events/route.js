import { getTimerState } from '@/lib/timerState';
import { addConnection, broadcast, getActiveConnectionCount } from '@/lib/sseManager';

let lastBroadcastedState = null;

// Trigger broadcast for timer state change
export function broadcastTimerState() {
  const state = getTimerState();
  const stateKey = JSON.stringify(state);

  // Only broadcast if state actually changed
  if (stateKey === lastBroadcastedState) {
    console.log('[broadcastTimerState] State unchanged, skipping');
    return;
  }
  lastBroadcastedState = stateKey;

  const serverTime = new Date();
  const message = `data: ${JSON.stringify({
    serverTime: serverTime.toISOString(),
    timerState: state,
    timestamp: Date.now(),
  })}\n\n`;

  console.log('[broadcastTimerState] Broadcasting new state');
  broadcast(message);
}

export async function GET(request) {
  console.log('[SSE GET] New connection attempt');
  
  // Set up SSE headers
  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('[SSE] Stream started, sending initial state');
      
      // Send initial state
      const initialState = getTimerState();
      const serverTime = new Date();
      
      const initialMessage = `data: ${JSON.stringify({
        serverTime: serverTime.toISOString(),
        timerState: initialState,
        timestamp: Date.now(),
      })}\n\n`;

      try {
        controller.enqueue(new TextEncoder().encode(initialMessage));
        console.log('[SSE] Initial state sent');
      } catch (error) {
        console.error('[SSE] Error sending initial state:', error);
      }

      // Register this connection
      const disconnect = addConnection(controller);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          console.error('[SSE] Heartbeat error:', error);
          clearInterval(heartbeat);
          disconnect();
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        console.log('[SSE] Connection aborted');
        clearInterval(heartbeat);
        disconnect();
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
