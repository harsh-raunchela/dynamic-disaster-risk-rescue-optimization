/**
 * Deterministic Emergency Priority Queue for DisasterX Phase 3.6.
 *
 * Design Decision Documentation:
 * The existing C++ EmergencyPriorityQueue.h models a minimal linked-list queue for
 * synthetic {id, locationId, severity (int), peopleAffected, reportedTime}.
 * In this Phase 3.6 architecture, emergencies require rich operational attributes
 * (title, description, incident type, status lifecycle, updatedAt, and calculated priority rank)
 * and must be synchronized with REST CRUD operations and JSON persistence.
 *
 * Integrating emergency entity management directly into the C++ JSONL worker
 * would couple persistent state to a worker process designed as a query engine,
 * complicating process recovery and IPC serialization.
 *
 * Therefore, the active Emergency Priority Queue is implemented in the Node.js backend
 * as a high-performance, deterministic priority queue with O(log N) operations,
 * ensuring:
 * 1. Higher-severity emergencies appear first (Critical > High > Medium > Low).
 * 2. Older emergencies appear first when severity is equal (timestamp ordering).
 * 3. Deterministic tie-breaking on emergencyId.
 * 4. Resolved emergencies are excluded from the active priority queue.
 * 5. Instant priority updates on severity or status changes.
 * 6. No duplicate queue entries.
 */

const SEVERITY_RANKS = Object.freeze({
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
});

/**
 * Returns negative if a has higher priority than b,
 * positive if b has higher priority than a,
 * 0 if strictly equal.
 */
function compareEmergencies(a, b) {
  const rankA = SEVERITY_RANKS[a.severity] || 0;
  const rankB = SEVERITY_RANKS[b.severity] || 0;

  if (rankA !== rankB) {
    return rankB - rankA; // Higher rank first
  }

  const timeA = new Date(a.reportedAt).getTime();
  const timeB = new Date(b.reportedAt).getTime();

  if (timeA !== timeB) {
    return timeA - timeB; // Older timestamp first
  }

  return (a.emergencyId || '').localeCompare(b.emergencyId || '');
}

class EmergencyPriorityQueue {
  constructor() {
    this.heap = [];
    this.indexById = new Map();
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  has(emergencyId) {
    return this.indexById.has(emergencyId);
  }

  peek() {
    return this.heap.length > 0 ? { ...this.heap[0] } : null;
  }

  enqueue(emergency) {
    if (!emergency || !emergency.emergencyId) {
      throw new Error('Emergency with a valid emergencyId is required to enqueue.');
    }

    if (emergency.status === 'Resolved') {
      return false; // Resolved emergencies do not enter the active priority queue
    }

    if (this.indexById.has(emergency.emergencyId)) {
      return this.update(emergency);
    }

    const item = { ...emergency };
    this.heap.push(item);
    const index = this.heap.length - 1;
    this.indexById.set(item.emergencyId, index);
    this._bubbleUp(index);
    return true;
  }

  dequeue() {
    if (this.heap.length === 0) return null;

    const top = this.heap[0];
    const last = this.heap.pop();
    this.indexById.delete(top.emergencyId);

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.indexById.set(last.emergencyId, 0);
      this._sinkDown(0);
    }

    return top;
  }

  remove(emergencyId) {
    const index = this.indexById.get(emergencyId);
    if (index === undefined) return false;

    const last = this.heap.pop();
    this.indexById.delete(emergencyId);

    if (index < this.heap.length && last) {
      this.heap[index] = last;
      this.indexById.set(last.emergencyId, index);
      this._bubbleUp(index);
      this._sinkDown(index);
    }

    return true;
  }

  update(emergency) {
    if (!emergency || !emergency.emergencyId) return false;

    if (emergency.status === 'Resolved') {
      return this.remove(emergency.emergencyId);
    }

    const index = this.indexById.get(emergency.emergencyId);
    if (index === undefined) {
      return this.enqueue(emergency);
    }

    this.heap[index] = { ...emergency };
    this._bubbleUp(index);
    this._sinkDown(index);
    return true;
  }

  /**
   * Returns all items currently in the queue in deterministic priority order.
   */
  toArray() {
    // Clone and sort deterministically so callers get the exact priority sequence
    return [...this.heap].sort(compareEmergencies).map((item, index) => ({
      ...item,
      priority: index + 1
    }));
  }

  clear() {
    this.heap = [];
    this.indexById.clear();
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
    this.indexById.set(this.heap[i].emergencyId, i);
    this.indexById.set(this.heap[j].emergencyId, j);
  }

  _bubbleUp(index) {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (compareEmergencies(this.heap[current], this.heap[parent]) < 0) {
        this._swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    let current = index;

    while (true) {
      let candidate = current;
      const left = 2 * current + 1;
      const right = 2 * current + 2;

      if (left < length && compareEmergencies(this.heap[left], this.heap[candidate]) < 0) {
        candidate = left;
      }

      if (right < length && compareEmergencies(this.heap[right], this.heap[candidate]) < 0) {
        candidate = right;
      }

      if (candidate !== current) {
        this._swap(current, candidate);
        current = candidate;
      } else {
        break;
      }
    }
  }
}

module.exports = {
  EmergencyPriorityQueue,
  compareEmergencies,
  SEVERITY_RANKS
};

