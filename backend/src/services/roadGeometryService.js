const { readFile } = require('node:fs/promises');
const { BackendError } = require('./errors');

function isCoordinatePair(value) {
  return Array.isArray(value) && value.length === 2 &&
    Number.isFinite(value[0]) && Number.isFinite(value[1]) &&
    value[0] >= -90 && value[0] <= 90 &&
    value[1] >= -180 && value[1] <= 180;
}

function validateGeometry(roadId, coordinates) {
  return typeof roadId === 'string' && roadId.length > 0 &&
    Array.isArray(coordinates) && coordinates.length >= 2 &&
    coordinates.every(isCoordinatePair);
}

class RoadGeometryService {
  constructor(geometryFile) {
    this.geometryFile = geometryFile;
    this.geometryByRoadId = null;
    this.loadPromise = null;
  }

  async init() {
    if (this.geometryByRoadId) return;
    if (!this.loadPromise) {
      this.loadPromise = this.load();
    }
    return this.loadPromise;
  }

  async load() {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(this.geometryFile, 'utf8'));
    } catch (cause) {
      throw new BackendError('Road geometry data could not be loaded.', {
        status: 503,
        code: 'ROAD_GEOMETRY_UNAVAILABLE',
        cause
      });
    }

    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new BackendError('Road geometry data has an invalid top-level format.', {
        status: 500,
        code: 'INVALID_ROAD_GEOMETRY_DATA'
      });
    }

    const entries = Object.entries(parsed);
    if (entries.length === 0 || entries.some(([roadId, coordinates]) => !validateGeometry(roadId, coordinates))) {
      throw new BackendError('Road geometry data contains an invalid road ID or coordinate array.', {
        status: 500,
        code: 'INVALID_ROAD_GEOMETRY_DATA'
      });
    }

    this.geometryByRoadId = new Map(entries);
  }

  async getAll() {
    await this.init();
    return [...this.geometryByRoadId].map(([roadId, coordinates]) => ({ roadId, coordinates }));
  }

  async getOne(roadId) {
    await this.init();
    const coordinates = this.geometryByRoadId.get(roadId);
    if (!coordinates) {
      throw new BackendError(`Road geometry for ID "${roadId}" was not found.`, {
        status: 404,
        code: 'ROAD_GEOMETRY_NOT_FOUND'
      });
    }
    return { roadId, coordinates };
  }

  async getMany(roadIds) {
    await this.init();
    const missingRoadIds = roadIds.filter((roadId) => !this.geometryByRoadId.has(roadId));
    if (missingRoadIds.length) {
      throw new BackendError(`Road geometry for ID "${missingRoadIds[0]}" was not found.`, {
        status: 404,
        code: 'ROAD_GEOMETRY_NOT_FOUND'
      });
    }
    return roadIds.map((roadId) => ({ roadId, coordinates: this.geometryByRoadId.get(roadId) }));
  }
}

module.exports = { RoadGeometryService, validateGeometry };
