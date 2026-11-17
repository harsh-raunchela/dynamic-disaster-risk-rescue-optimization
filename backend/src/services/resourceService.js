const { BackendError } = require('./errors');
const {
  VALID_RESOURCE_STATUSES,
  VALID_RESOURCE_TYPES,
  canDeleteResource,
  getAllowedStatusTransitions,
  validateCreateResource,
  validateUpdateResource,
  validateStatusTransition,
  validateDeletionAllowed
} = require('../validators/resourceValidators');

class ResourceService {
  constructor(store, workerClient) {
    this.store = store;
    this.workerClient = workerClient;
    this.validLocationIdsCache = null;
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.store.init();
      this.initialized = true;
    }
  }

  async getValidLocationIds() {
    if (this.validLocationIdsCache) return this.validLocationIdsCache;

    if (!this.workerClient) {
      return null;
    }

    try {
      const result = await this.workerClient.getLocations();
      const locations = result?.locations || [];
      this.validLocationIdsCache = new Set(locations.map((loc) => loc.id));
      return this.validLocationIdsCache;
    } catch (error) {
      console.warn(`[DisasterX ResourceService] Worker locations fetch failed: ${error.message}`);
      return null;
    }
  }

  generateNextId() {
    const all = this.store.getAll();
    let maxNum = 0;

    for (const item of all) {
      const match = /^RES-(\d+)$/i.exec(item.resourceId);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `RES-${String(maxNum + 1).padStart(4, '0')}`;
  }

  async getAllResources({ type, status, locationId, search } = {}) {
    await this.init();
    let items = this.store.getAll();

    if (type) {
      items = items.filter((item) => item.type.toLowerCase() === type.toLowerCase());
    }

    if (status) {
      items = items.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    if (locationId) {
      items = items.filter((item) => item.locationId.toLowerCase() === locationId.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((item) =>
        item.resourceId.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.locationId.toLowerCase().includes(q) ||
        (Array.isArray(item.capabilities) && item.capabilities.some((cap) => cap.toLowerCase().includes(q)))
      );
    }

    return items;
  }

  getResourceMetadata() {
    return {
      resourceTypes: [...VALID_RESOURCE_TYPES],
      resourceStatuses: [...VALID_RESOURCE_STATUSES]
    };
  }

  presentResource(resource) {
    return {
      ...resource,
      allowedStatusTransitions: getAllowedStatusTransitions(resource.status),
      canDelete: canDeleteResource(resource)
    };
  }

  async getAvailableResources({ type, locationId } = {}) {
    await this.init();
    let items = this.store.getAll().filter((item) => item.status === 'Available');

    if (type) {
      items = items.filter((item) => item.type.toLowerCase() === type.toLowerCase());
    }

    if (locationId) {
      items = items.filter((item) => item.locationId.toLowerCase() === locationId.toLowerCase());
    }

    return items;
  }

  async getResourceById(resourceId) {
    await this.init();
    const resource = this.store.getById(resourceId);
    if (!resource) {
      throw new BackendError(`Resource with ID "${resourceId}" was not found.`, {
        status: 404,
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    return resource;
  }

  async createResource(payload) {
    await this.init();
    const validLocations = await this.getValidLocationIds();
    const validated = validateCreateResource(payload, validLocations);

    const resourceId = payload?.resourceId ? payload.resourceId.trim() : this.generateNextId();

    if (this.store.getById(resourceId)) {
      throw new BackendError(`Resource with ID "${resourceId}" already exists.`, {
        status: 409,
        code: 'DUPLICATE_RESOURCE_ID'
      });
    }

    const now = new Date().toISOString();
    const resource = {
      resourceId,
      name: validated.name,
      type: validated.type,
      locationId: validated.locationId,
      capacity: validated.capacity,
      capabilities: validated.capabilities,
      status: validated.status || 'Available',
      contact: validated.contact,
      createdAt: now,
      updatedAt: now
    };

    await this.store.save(resource);
    return resource;
  }

  async updateResource(resourceId, updates) {
    await this.init();
    const existing = this.store.getById(resourceId);
    if (!existing) {
      throw new BackendError(`Resource with ID "${resourceId}" was not found.`, {
        status: 404,
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    const validLocations = await this.getValidLocationIds();
    const validatedUpdates = validateUpdateResource(updates, validLocations);

    const updated = {
      ...existing,
      ...validatedUpdates,
      updatedAt: new Date().toISOString()
    };

    await this.store.save(updated);
    return updated;
  }

  async updateResourceStatus(resourceId, newStatus) {
    await this.init();
    const existing = this.store.getById(resourceId);
    if (!existing) {
      throw new BackendError(`Resource with ID "${resourceId}" was not found.`, {
        status: 404,
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    const nextStatus = validateStatusTransition(existing.status, newStatus);
    const updated = {
      ...existing,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    await this.store.save(updated);
    return updated;
  }

  async deleteResource(resourceId) {
    await this.init();
    const existing = this.store.getById(resourceId);
    if (!existing) {
      throw new BackendError(`Resource with ID "${resourceId}" was not found.`, {
        status: 404,
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    validateDeletionAllowed(existing);

    await this.store.delete(resourceId);
    return { deleted: true, resourceId };
  }
}

module.exports = { ResourceService };

