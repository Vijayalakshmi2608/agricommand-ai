/** Tiny module-level offline queue (localStorage-backed) shared by the
 *  offline banner and any component that enqueues an action. */

export interface QueuedAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  at: number;
}

interface OfflineState {
  isOnline: boolean;
  syncing: boolean;
  pending: number;
}

let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let syncing = false;
let queue: QueuedAction[] = load();

const listeners = new Set<() => void>();

function load(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem("agripulse-queue") || "[]");
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem("agripulse-queue", JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeOffline(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getOfflineState(): OfflineState {
  return { isOnline, syncing, pending: queue.length };
}

export function enqueueAction(type: string, payload: Record<string, unknown>): void {
  queue.push({
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `q-${Date.now()}`,
    type,
    payload,
    at: Date.now(),
  });
  save();
  emit();
}

/** Simulates background sync: clears the queue progressively. */
export function flushQueue(onProgress?: (remaining: number) => void): void {
  if (queue.length === 0) return;
  syncing = true;
  emit();
  const total = queue.length;
  let remaining = total;
  const iv = setInterval(() => {
    remaining -= 1;
    queue = queue.slice(1);
    save();
    onProgress?.(remaining);
    emit();
    if (remaining <= 0) {
      clearInterval(iv);
      syncing = false;
      emit();
    }
  }, 450);
}

export function setOnline(online: boolean): void {
  isOnline = online;
  if (online) flushQueue();
  emit();
}
