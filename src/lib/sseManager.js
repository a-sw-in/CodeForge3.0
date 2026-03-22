// Shared broadcast system for SSE
let activeConnections = [];
let lastBroadcastedState = null;
let broadcastLog = [];

export function addConnection(controller) {
  activeConnections.push(controller);
  console.log(`[SSE] Client connected. Total: ${activeConnections.length}`);
  return () => {
    const idx = activeConnections.indexOf(controller);
    if (idx > -1) activeConnections.splice(idx, 1);
    console.log(`[SSE] Client disconnected. Total: ${activeConnections.length}`);
  };
}

export function broadcast(message) {
  broadcastLog.push({ timestamp: new Date().toISOString(), message });
  if (broadcastLog.length > 50) broadcastLog.shift();

  console.log(`[BROADCAST] Sending to ${activeConnections.length} clients:`, message);

  let successCount = 0;
  activeConnections.forEach((controller, index) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
      successCount++;
    } catch (error) {
      console.error(`[SSE] Error sending to client ${index}:`, error.message);
      activeConnections.splice(index, 1);
    }
  });

  console.log(`[BROADCAST] Successfully sent to ${successCount}/${activeConnections.length} clients`);
  return successCount;
}

export function getBroadcastLog() {
  return broadcastLog;
}

export function getActiveConnectionCount() {
  return activeConnections.length;
}
