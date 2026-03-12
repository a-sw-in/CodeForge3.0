// Shared timer state
// In production, this should be replaced with a database solution

let timerState = {
  isActive: false,
  isPaused: false,
  startTime: null,
  pausedTime: null,
  pausedTimeRemaining: null, // Store exact time remaining when paused
  accumulatedPauseTime: 0,
  hasEnded: false,
};

export function getTimerState() {
  // Check if timer has ended (only when not paused)
  if (timerState.isActive && !timerState.isPaused && timerState.startTime) {
    const now = Date.now();
    const startTime = new Date(timerState.startTime).getTime();
    const endTime = startTime + (24 * 60 * 60 * 1000) + timerState.accumulatedPauseTime; // 24 hours + pause time
    
    if (now >= endTime) {
      timerState.isActive = false;
      timerState.hasEnded = true;
    }
  }
  
  return { ...timerState };
}

export function startTimer() {
  if (timerState.isActive && !timerState.isPaused) {
    throw new Error('Timer is already running');
  }
  
  timerState.isActive = true;
  timerState.isPaused = false;
  
  // If starting fresh
  if (!timerState.startTime) {
    timerState.startTime = new Date().toISOString();
    timerState.accumulatedPauseTime = 0;
  }
  
  timerState.hasEnded = false;
  
  return { ...timerState };
}

export function pauseTimer() {
  if (!timerState.isActive) {
    throw new Error('Timer is not running');
  }
  
  if (timerState.isPaused) {
    throw new Error('Timer is already paused');
  }
  
  // Calculate and save the exact time remaining when pausing
  const now = Date.now();
  const startTime = new Date(timerState.startTime).getTime();
  const endTime = startTime + (24 * 60 * 60 * 1000) + timerState.accumulatedPauseTime;
  const timeRemaining = endTime - now;
  
  timerState.isPaused = true;
  timerState.pausedTime = new Date().toISOString();
  timerState.pausedTimeRemaining = timeRemaining; // Save exact remaining time
  
  return { ...timerState };
}

export function resumeTimer() {
  if (!timerState.isPaused) {
    throw new Error('Timer is not paused');
  }
  timerState.pausedTimeRemaining = null; // Clear saved time
  
  // Calculate pause duration and add to accumulated pause time
  const pauseDuration = Date.now() - new Date(timerState.pausedTime).getTime();
  timerState.accumulatedPauseTime += pauseDuration;
  
  timerState.isPaused = false;
  timerState.pausedTime = null;
  
  return { ...timerState };
}

export function stopTimer() {
  if (!timerState.isActive) {
    throw new Error('Timer is not running');
  }
  
  // If stopping while paused, add the pause duration to accumulated time
  if (timerState.isPaused && timerState.pausedTime) {
    const pauseDuration = Date.now() - new Date(timerState.pausedTime).getTime();
    timerState.accumulatedPauseTime += pauseDuration;
  }
  
  timerState.isActive = false;
  timerState.isPaused = false;
  timerState.pausedTime = null;
  timerState.pausedTimeRemaining = null;
  
  return { ...timerState };
}

export function resetTimer() {
  timerState = {
    isActive: false,
    isPaused: false,
    startTime: null,
    pausedTimeRemaining: null,
    pausedTime: null,
    accumulatedPauseTime: 0,
    hasEnded: false,
  };
  
  return { ...timerState };
}
export function addTime(minutes) {
  if (!timerState.isActive) {
    throw new Error('Timer is not active');
  }
  
  const timeToAdd = minutes * 60 * 1000; // Convert minutes to milliseconds
  
  if (timerState.isPaused) {
    // If paused, add time to the saved remaining time
    timerState.pausedTimeRemaining = (timerState.pausedTimeRemaining || 0) + timeToAdd;
  } else {
    // If running, add to accumulated pause time (effectively adding time to end)
    timerState.accumulatedPauseTime += timeToAdd;
  }
  
  return { ...timerState };
}

export function subtractTime(minutes) {
  if (!timerState.isActive) {
    throw new Error('Timer is not active');
  }
  
  const timeToSubtract = minutes * 60 * 1000; // Convert minutes to milliseconds
  
  if (timerState.isPaused) {
    // If paused, subtract from the saved remaining time
    timerState.pausedTimeRemaining = Math.max(0, (timerState.pausedTimeRemaining || 0) - timeToSubtract);
  } else {
    // If running, subtract from accumulated pause time (effectively subtracting time from end)
    timerState.accumulatedPauseTime -= timeToSubtract;
  }
  
  return { ...timerState };
}