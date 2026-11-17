const { BackendError } = require('./errors');
const { EmergencyPriorityQueue } = require('./emergencyPriorityQueue');
const {
  validateCreateEmergency,
  validateUpdateEmergency,
  validateStatusTransition
} = require('../validators/emergencyValidators');

class EmergencyService {
  constructor(store, workerClient) {
    this.store = store;
    this.workerClient = workerClient;
    this.priorityQueue = new EmergencyPriorityQueue();
    this.validLocationIdsCache = null;
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.store.init();
      this.rebuildPriorityQueue();
      this.initialized = true;
    }
  }

  rebuildPriorityQueue() {
    this.priorityQueue.clear();
    const all = this.store.getAll();
    for (const item of all) {
      if (item.status !== 'Resolved') {
        this.priorityQueue.enqueue(item);
      }
    }
  }

  async getValidLocationIds() {
    if (this.validLocationIdsCache) return this.validLocationIdsCache;

    if (!this.workerClient) {
      // In isolated unit tests without worker, fall back to empty or null
      return null;
    }

    try {
      const result = await this.workerClient.getLocations();
      const locations = result?.locations || [];
      this.validLocationIdsCache = new Set(locations.map((loc) => loc.id));
      return this.validLocationIdsCache;
    } catch (error) {
      console.warn(`[DisasterX EmergencyService] Worker locations fetch failed: ${error.message}`);
      return null;
    }
  }

  _attachPriorityRank(emergency) {
    if (!emergency) return null;
    if (emergency.status === 'Resolved') {
      return { ...emergency, priority: null };
    }

    const priorityItems = this.priorityQueue.toArray();
    const index = priorityItems.findIndex((item) => item.emergencyId === emergency.emergencyId);
    return {
      ...emergency,
      priority: index >= 0 ? index + 1 : null
    };
  }

  async getAllEmergencies({ status, severity, type, search } = {}) {
    await this.init();
    let items = this.store.getAll();

    // Map priority rank from active queue
    const priorityItems = this.priorityQueue.toArray();
    const rankById = new Map(priorityItems.map((item, idx) => [item.emergencyId, idx + 1]));

    items = items.map((item) => ({
      ...item,
      priority: rankById.get(item.emergencyId) || null
    }));

    if (status) {
      if (status.toLowerCase() === 'active') {
        items = items.filter((item) => item.status !== 'Resolved');
      } else {
        items = items.filter((item) => item.status.toLowerCase() === status.toLowerCase());
      }
    }

    if (severity) {
      items = items.filter((item) => item.severity.toLowerCase() === severity.toLowerCase());
    }

    if (type) {
      items = items.filter((item) => item.type.toLowerCase() === type.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((item) =>
        item.emergencyId.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.locationId.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return items;
  }

  async getActiveEmergencies() {
    await this.init();
    const priorityItems = this.priorityQueue.toArray();
    return priorityItems;
  }

  async getPriorityEmergencies() {
    await this.init();
    return this.priorityQueue.toArray();
  }

  async getEmergencyById(emergencyId) {
    await this.init();
    const emergency = this.store.getById(emergencyId);
    if (!emergency) {
      throw new BackendError(`Emergency with ID "${emergencyId}" was not found.`, {
        status: 404,
        code: 'EMERGENCY_NOT_FOUND'
      });
    }
    return this._attachPriorityRank(emergency);
  }

  async getStats() {
    await this.init();
    const all = this.store.getAll();
    const total = all.length;
    const resolved = all.filter((item) => item.status === 'Resolved').length;
    const active = total - resolved;
    const critical = all.filter((item) => item.status !== 'Resolved' && item.severity === 'Critical').length;

    return { total, active, critical, resolved };
  }

  generateNextId() {
    const all = this.store.getAll();
    let maxNum = 0;

    for (const item of all) {
      const match = /^EMG-(\d+)$/i.exec(item.emergencyId);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `EMG-${String(maxNum + 1).padStart(4, '0')}`;
  }

  async createEmergency(payload) {
    await this.init();
    const validLocations = await this.getValidLocationIds();
    const validated = validateCreateEmergency(payload, validLocations);

    const now = new Date().toISOString();
    const emergency = {
      emergencyId: this.generateNextId(),
      title: validated.title,
      description: validated.description,
      type: validated.type,
      severity: validated.severity,
      locationId: validated.locationId,
      peopleAffected: validated.peopleAffected,
      reportedAt: payload.reportedAt ? new Date(payload.reportedAt).toISOString() : now,
      updatedAt: now,
      status: validated.status || 'Reported'
    };

    if (emergency.status !== 'Resolved') {
      this.priorityQueue.enqueue(emergency);
    }

    await this.store.save(emergency);
    return this._attachPriorityRank(emergency);
  }

  async updateEmergency(emergencyId, updates) {
    await this.init();
    const existing = this.store.getById(emergencyId);
    if (!existing) {
      throw new BackendError(`Emergency with ID "${emergencyId}" was not found.`, {
        status: 404,
        code: 'EMERGENCY_NOT_FOUND'
      });
    }

    const validLocations = await this.getValidLocationIds();
    const validatedUpdates = validateUpdateEmergency(updates, validLocations);

    const updated = {
      ...existing,
      ...validatedUpdates,
      updatedAt: new Date().toISOString()
    };

    if (updated.status !== 'Resolved') {
      this.priorityQueue.update(updated);
    } else {
      this.priorityQueue.remove(emergencyId);
    }

    await this.store.save(updated);
    return this._attachPriorityRank(updated);
  }

  async updateEmergencyStatus(emergencyId, newStatus) {
    await this.init();
    const existing = this.store.getById(emergencyId);
    if (!existing) {
      throw new BackendError(`Emergency with ID "${emergencyId}" was not found.`, {
        status: 404,
        code: 'EMERGENCY_NOT_FOUND'
      });
    }

    const nextStatus = validateStatusTransition(existing.status, newStatus);
    const updated = {
      ...existing,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    if (nextStatus === 'Resolved') {
      this.priorityQueue.remove(emergencyId);
    } else {
      this.priorityQueue.update(updated);
    }

    await this.store.save(updated);
    return this._attachPriorityRank(updated);
  }
}

module.exports = { EmergencyService };

