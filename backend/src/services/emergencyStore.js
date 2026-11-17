const fs = require('node:fs');
const path = require('node:path');

// Default initial synthetic incidents used ONLY when persistence file does not exist yet
const INITIAL_SEED_EMERGENCIES = [
  {
    emergencyId: 'EMG-0001',
    title: 'Severe Flash Flood Inundation',
    description: 'Rapidly rising water levels cutting off primary transport access in North Sector.',
    type: 'Flood',
    severity: 'Critical',
    locationId: 'LOC_0010',
    peopleAffected: 145,
    reportedAt: '2026-11-05T07:15:00.000Z',
    updatedAt: '2026-11-05T07:15:00.000Z',
    status: 'Reported'
  },
  {
    emergencyId: 'EMG-0002',
    title: 'Major Structural Fire in Industrial Warehouse',
    description: 'Active multiple-alarm fire with structural instability and chemical hazards.',
    type: 'Fire',
    severity: 'Critical',
    locationId: 'LOC_0054',
    peopleAffected: 88,
    reportedAt: '2026-11-05T07:45:00.000Z',
    updatedAt: '2026-11-05T07:45:00.000Z',
    status: 'Prioritized'
  },
  {
    emergencyId: 'EMG-0003',
    title: 'Mountain Pass Landslide Debris Flow',
    description: 'Rockslide blocked arterial transport route; several vehicles stranded.',
    type: 'Landslide',
    severity: 'High',
    locationId: 'LOC_0085',
    peopleAffected: 32,
    reportedAt: '2026-11-05T08:10:00.000Z',
    updatedAt: '2026-11-05T08:10:00.000Z',
    status: 'Responding'
  },
  {
    emergencyId: 'EMG-0004',
    title: 'Multi-Vehicle Pileup on Highway Sector',
    description: 'High-speed collision under heavy fog with reported injuries.',
    type: 'Road Accident',
    severity: 'Medium',
    locationId: 'LOC_0091',
    peopleAffected: 14,
    reportedAt: '2026-11-05T08:20:00.000Z',
    updatedAt: '2026-11-05T08:20:00.000Z',
    status: 'Reported'
  },
  {
    emergencyId: 'EMG-0005',
    title: 'Residential Façade Collapse',
    description: 'Partial exterior wall collapse following heavy rainfall; perimeter cleared.',
    type: 'Building Collapse',
    severity: 'Low',
    locationId: 'LOC_0048',
    peopleAffected: 6,
    reportedAt: '2026-11-05T08:35:00.000Z',
    updatedAt: '2026-11-05T08:35:00.000Z',
    status: 'Reported'
  },
  {
    emergencyId: 'EMG-0006',
    title: 'Substation Electrical Transformer Fire',
    description: 'Localized fire successfully contained by perimeter suppression system.',
    type: 'Fire',
    severity: 'High',
    locationId: 'LOC_0050',
    peopleAffected: 0,
    reportedAt: '2026-11-05T06:30:00.000Z',
    updatedAt: '2026-11-05T07:20:00.000Z',
    status: 'Resolved'
  }
];

class EmergencyStore {
  constructor(filePath, { autoSeed = true } = {}) {
    this.filePath = filePath;
    this.autoSeed = autoSeed;
    this.writeQueue = Promise.resolve();
    this.emergencies = new Map();
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
      // File does not exist
      if (this.autoSeed) {
        for (const item of INITIAL_SEED_EMERGENCIES) {
          this.emergencies.set(item.emergencyId, { ...item });
        }
        await this._saveToFile();
      } else {
        await this._saveToFile([]);
      }
    } else {
      // File exists - handle empty or populated
      const trimmed = rawData.trim();
      if (!trimmed) {
        this.emergencies.clear();
      } else {
        try {
          const parsed = JSON.parse(trimmed);
          if (!Array.isArray(parsed)) {
            console.warn(`[DisasterX EmergencyStore] Invalid JSON format in ${this.filePath}; expected array.`);
            this.emergencies.clear();
          } else {
            this.emergencies.clear();
            for (const item of parsed) {
              if (item && item.emergencyId && item.severity && item.status) {
                this.emergencies.set(item.emergencyId, { ...item });
              }
            }
          }
        } catch (parseError) {
          console.warn(`[DisasterX EmergencyStore] Failed to parse JSON from ${this.filePath}: ${parseError.message}`);
          this.emergencies.clear();
        }
      }
    }

    this.initialized = true;
  }

  getAll() {
    return Array.from(this.emergencies.values()).map((item) => ({ ...item }));
  }

  getById(emergencyId) {
    const item = this.emergencies.get(emergencyId);
    return item ? { ...item } : null;
  }

  async save(emergency) {
    this.emergencies.set(emergency.emergencyId, { ...emergency });
    await this._enqueueSave();
    return { ...emergency };
  }

  async delete(emergencyId) {
    const existed = this.emergencies.delete(emergencyId);
    if (existed) {
      await this._enqueueSave();
    }
    return existed;
  }

  async setAll(records) {
    this.emergencies.clear();
    for (const record of records) {
      if (record && record.emergencyId) {
        this.emergencies.set(record.emergencyId, { ...record });
      }
    }
    await this._enqueueSave();
  }

  _enqueueSave() {
    this.writeQueue = this.writeQueue
      .then(() => this._saveToFile())
      .catch((error) => {
        console.error(`[DisasterX EmergencyStore] Persistence save error: ${error.message}`);
      });
    return this.writeQueue;
  }

  async _saveToFile(recordsToSave = null) {
    const records = recordsToSave !== null
      ? recordsToSave
      : Array.from(this.emergencies.values());

    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const tempFile = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    const content = JSON.stringify(records, null, 2);

    await fs.promises.writeFile(tempFile, content, 'utf8');

    try {
      await fs.promises.rename(tempFile, this.filePath);
    } catch (renameError) {
      // Fallback for Windows cross-device or permission race
      try {
        await fs.promises.copyFile(tempFile, this.filePath);
        await fs.promises.unlink(tempFile);
      } catch (copyError) {
        console.error(`[DisasterX EmergencyStore] Atomic replace failed: ${copyError.message}`);
        throw renameError;
      }
    }
  }
}

module.exports = {
  EmergencyStore,
  INITIAL_SEED_EMERGENCIES
};

