const fs = require('node:fs');
const path = require('node:path');

// Default initial synthetic resources used ONLY when persistence file does not exist yet
const INITIAL_SEED_RESOURCES = [
  {
    resourceId: 'RES-0001',
    name: 'Rapid Response Ambulance Alpha',
    type: 'Ambulance',
    locationId: 'LOC_0001',
    capacity: 4,
    capabilities: ['Trauma Care', 'Advanced Life Support', 'Patient Transport'],
    status: 'Available',
    contact: { name: 'Captain Miller', phone: '555-0192', radioChannel: 'TAC-1' },
    createdAt: '2026-11-05T06:00:00.000Z',
    updatedAt: '2026-11-05T06:00:00.000Z'
  },
  {
    resourceId: 'RES-0002',
    name: 'Urban Search & Rescue Team 1',
    type: 'Rescue Team',
    locationId: 'LOC_0010',
    capacity: 8,
    capabilities: ['Structural Collapse Extrication', 'Rope Rescue', 'Canine Search'],
    status: 'Available',
    contact: { name: 'Lieutenant Gomez', phone: '555-0244', radioChannel: 'RESCUE-4' },
    createdAt: '2026-11-05T06:15:00.000Z',
    updatedAt: '2026-11-05T06:15:00.000Z'
  },
  {
    resourceId: 'RES-0003',
    name: 'Heavy Pumper Fire Engine 7',
    type: 'Fire Unit',
    locationId: 'LOC_0054',
    capacity: 6,
    capabilities: ['Structural Fire Suppression', 'Foam Injection', 'Hazmat Containment'],
    status: 'Available',
    contact: { name: 'Chief Davis', phone: '555-0381', radioChannel: 'FIRE-CMD' },
    createdAt: '2026-11-05T06:30:00.000Z',
    updatedAt: '2026-11-05T06:30:00.000Z'
  },
  {
    resourceId: 'RES-0004',
    name: 'Mobile Disaster Relief Depot A',
    type: 'Relief Unit',
    locationId: 'LOC_0085',
    capacity: 50,
    capabilities: ['Water Purification', 'Emergency Ration Distribution', 'Blanket Logistics'],
    status: 'Available',
    contact: { name: 'Director Harris', phone: '555-0422', radioChannel: 'LOG-2' },
    createdAt: '2026-11-05T06:45:00.000Z',
    updatedAt: '2026-11-05T06:45:00.000Z'
  },
  {
    resourceId: 'RES-0005',
    name: 'Medic Unit Delta',
    type: 'Ambulance',
    locationId: 'LOC_0091',
    capacity: 2,
    capabilities: ['Basic Life Support'],
    status: 'Maintenance',
    contact: { name: 'Dispatch Office', phone: '555-0500', radioChannel: 'TAC-9' },
    createdAt: '2026-11-05T07:00:00.000Z',
    updatedAt: '2026-11-05T07:00:00.000Z'
  }
];

class ResourceStore {
  constructor(filePath, { autoSeed = true } = {}) {
    this.filePath = filePath;
    this.autoSeed = autoSeed;
    this.writeQueue = Promise.resolve();
    this.resources = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    let rawData = null;
    try {
      rawData = await fs.promises.readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    if (rawData === null) {
      if (this.autoSeed) {
        for (const item of INITIAL_SEED_RESOURCES) {
          this.resources.set(item.resourceId, { ...item });
        }
        await this._saveToFile();
      } else {
        await this._saveToFile([]);
      }
    } else {
      const trimmed = rawData.trim();
      if (!trimmed) {
        this.resources.clear();
      } else {
        try {
          const parsed = JSON.parse(trimmed);
          if (!Array.isArray(parsed)) {
            console.warn(`[DisasterX ResourceStore] Invalid JSON format in ${this.filePath}; expected array.`);
            this.resources.clear();
          } else {
            this.resources.clear();
            for (const item of parsed) {
              if (item && item.resourceId && item.type && item.status) {
                this.resources.set(item.resourceId, { ...item });
              }
            }
          }
        } catch (parseError) {
          console.warn(`[DisasterX ResourceStore] Failed to parse JSON from ${this.filePath}: ${parseError.message}`);
          this.resources.clear();
        }
      }
    }

    this.initialized = true;
  }

  getAll() {
    return Array.from(this.resources.values()).map((item) => ({ ...item }));
  }

  getById(resourceId) {
    const item = this.resources.get(resourceId);
    return item ? { ...item } : null;
  }

  async save(resource) {
    this.resources.set(resource.resourceId, { ...resource });
    await this._enqueueSave();
    return { ...resource };
  }

  async delete(resourceId) {
    const existed = this.resources.delete(resourceId);
    if (existed) {
      await this._enqueueSave();
    }
    return existed;
  }

  async setAll(records) {
    this.resources.clear();
    for (const record of records) {
      if (record && record.resourceId) {
        this.resources.set(record.resourceId, { ...record });
      }
    }
    await this._enqueueSave();
  }

  _enqueueSave() {
    this.writeQueue = this.writeQueue
      .then(() => this._saveToFile())
      .catch((error) => {
        console.error(`[DisasterX ResourceStore] Persistence save error: ${error.message}`);
      });
    return this.writeQueue;
  }

  async _saveToFile(recordsToSave = null) {
    const records = recordsToSave !== null
      ? recordsToSave
      : Array.from(this.resources.values());

    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const tempFile = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    const content = JSON.stringify(records, null, 2);

    await fs.promises.writeFile(tempFile, content, 'utf8');

    try {
      await fs.promises.rename(tempFile, this.filePath);
    } catch (renameError) {
      try {
        await fs.promises.copyFile(tempFile, this.filePath);
        await fs.promises.unlink(tempFile);
      } catch (copyError) {
        console.error(`[DisasterX ResourceStore] Atomic replace failed: ${copyError.message}`);
        throw renameError;
      }
    }
  }
}

module.exports = {
  ResourceStore,
  INITIAL_SEED_RESOURCES
};

