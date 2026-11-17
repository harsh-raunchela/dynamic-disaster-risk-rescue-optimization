const { BackendError } = require('../services/errors');

const VALID_RESOURCE_TYPES = Object.freeze([
  'Ambulance',
  'Rescue Team',
  'Fire Unit',
  'Relief Unit'
]);

const VALID_RESOURCE_STATUSES = Object.freeze([
  'Available',
  'Allocated',
  'Dispatched',
  'En Route',
  'On Scene',
  'Returning',
  'Maintenance'
]);

const ACTIVE_OPERATIONAL_STATUSES = Object.freeze([
  'Allocated',
  'Dispatched',
  'En Route',
  'On Scene'
]);

const STATUS_TRANSITIONS = Object.freeze({
  Available: ['Available', 'Allocated', 'Dispatched', 'Maintenance'],
  Allocated: ['Allocated', 'Dispatched', 'Available', 'Maintenance'],
  Dispatched: ['Dispatched', 'En Route', 'Available', 'Maintenance'],
  'En Route': ['En Route', 'On Scene', 'Returning', 'Available', 'Maintenance'],
  'On Scene': ['On Scene', 'Returning', 'Available', 'Maintenance'],
  Returning: ['Returning', 'Available', 'Maintenance'],
  Maintenance: ['Maintenance', 'Available']
});

function validateName(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 120) {
    throw new BackendError('Resource name is required and must be between 1 and 120 characters.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return value.trim();
}

function validateType(value) {
  if (typeof value !== 'string' || !VALID_RESOURCE_TYPES.includes(value.trim())) {
    throw new BackendError(
      `Invalid resource type "${value}". Permitted types: ${VALID_RESOURCE_TYPES.join(', ')}.`,
      { status: 400, code: 'INVALID_RESOURCE_TYPE' }
    );
  }
  return value.trim();
}

function validateLocationId(value, validLocationIds = null) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 100) {
    throw new BackendError('Location ID is required and must be a valid identifier.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  const locationId = value.trim();
  if (validLocationIds && !validLocationIds.has(locationId)) {
    throw new BackendError(
      `Location ID "${locationId}" does not exist in the disaster network.`,
      { status: 404, code: 'INVALID_LOCATION_ID' }
    );
  }
  return locationId;
}

function validateCapacity(value) {
  if (value === undefined || value === null) {
    throw new BackendError('Capacity is required and must be a positive integer.', {
      status: 400,
      code: 'INVALID_CAPACITY'
    });
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new BackendError('Capacity must be a positive integer greater than or equal to 1.', {
      status: 400,
      code: 'INVALID_CAPACITY'
    });
  }
  return num;
}

function validateCapabilities(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new BackendError('Capabilities must be an array of operation strings.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return value.map((item) => {
    if (typeof item !== 'string' || item.trim() === '' || item.trim().length > 80) {
      throw new BackendError('Each capability must be a short non-empty string.', {
        status: 400,
        code: 'INVALID_INPUT'
      });
    }
    return item.trim();
  });
}

function validateStatus(value) {
  if (typeof value !== 'string' || !VALID_RESOURCE_STATUSES.includes(value.trim())) {
    throw new BackendError(
      `Invalid resource status "${value}". Permitted statuses: ${VALID_RESOURCE_STATUSES.join(', ')}.`,
      { status: 400, code: 'INVALID_INPUT' }
    );
  }
  return value.trim();
}

function validateContact(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    if (value.length > 200) {
      throw new BackendError('Contact string cannot exceed 200 characters.', {
        status: 400,
        code: 'INVALID_INPUT'
      });
    }
    return value.trim();
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const contactObj = {};
    if (value.name !== undefined) {
      if (typeof value.name !== 'string' || value.name.length > 100) {
        throw new BackendError('Contact name must be a string up to 100 characters.', {
          status: 400,
          code: 'INVALID_INPUT'
        });
      }
      contactObj.name = value.name.trim();
    }
    if (value.phone !== undefined) {
      if (typeof value.phone !== 'string' || value.phone.length > 50) {
        throw new BackendError('Contact phone must be a string up to 50 characters.', {
          status: 400,
          code: 'INVALID_INPUT'
        });
      }
      contactObj.phone = value.phone.trim();
    }
    if (value.radioChannel !== undefined) {
      if (typeof value.radioChannel !== 'string' || value.radioChannel.length > 50) {
        throw new BackendError('Contact radioChannel must be a string up to 50 characters.', {
          status: 400,
          code: 'INVALID_INPUT'
        });
      }
      contactObj.radioChannel = value.radioChannel.trim();
    }
    return contactObj;
  }
  throw new BackendError('Contact information must be a string or object.', {
    status: 400,
    code: 'INVALID_INPUT'
  });
}

function validateStatusTransition(currentStatus, nextStatus) {
  const next = validateStatus(nextStatus);
  const current = currentStatus || 'Available';

  const allowed = STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new BackendError(
      `Invalid status transition from "${current}" to "${next}".`,
      { status: 400, code: 'INVALID_STATUS_TRANSITION' }
    );
  }

  return next;
}

function getAllowedStatusTransitions(currentStatus) {
  const current = currentStatus || 'Available';
  return [...(STATUS_TRANSITIONS[current] || [])];
}

function canDeleteResource(resource) {
  return !ACTIVE_OPERATIONAL_STATUSES.includes(resource?.status || 'Available');
}

function validateDeletionAllowed(resource) {
  if (!resource) return;
  const status = resource.status || 'Available';
  if (!canDeleteResource(resource)) {
    throw new BackendError(
      `Cannot delete resource "${resource.resourceId}" while it is currently in operational status "${status}".`,
      { status: 409, code: 'RESOURCE_IN_OPERATION' }
    );
  }
}

function validateCreateResource(body, validLocationIds = null) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BackendError('Request body must be a JSON object.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  return {
    name: validateName(body.name),
    type: validateType(body.type),
    locationId: validateLocationId(body.locationId, validLocationIds),
    capacity: validateCapacity(body.capacity),
    capabilities: validateCapabilities(body.capabilities),
    status: body.status !== undefined ? validateStatus(body.status) : 'Available',
    contact: validateContact(body.contact)
  };
}

function validateUpdateResource(body, validLocationIds = null) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BackendError('Request body must be a JSON object.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  const updates = {};
  if (body.name !== undefined) updates.name = validateName(body.name);
  if (body.type !== undefined) updates.type = validateType(body.type);
  if (body.locationId !== undefined) updates.locationId = validateLocationId(body.locationId, validLocationIds);
  if (body.capacity !== undefined) updates.capacity = validateCapacity(body.capacity);
  if (body.capabilities !== undefined) updates.capabilities = validateCapabilities(body.capabilities);
  if (body.contact !== undefined) updates.contact = validateContact(body.contact);

  if (Object.keys(updates).length === 0) {
    throw new BackendError('At least one editable field must be provided for update.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  return updates;
}

module.exports = {
  VALID_RESOURCE_TYPES,
  VALID_RESOURCE_STATUSES,
  ACTIVE_OPERATIONAL_STATUSES,
  STATUS_TRANSITIONS,
  validateName,
  validateType,
  validateLocationId,
  validateCapacity,
  validateCapabilities,
  validateStatus,
  validateContact,
  validateStatusTransition,
  getAllowedStatusTransitions,
  canDeleteResource,
  validateDeletionAllowed,
  validateCreateResource,
  validateUpdateResource
};
