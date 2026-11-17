const { BackendError } = require('../services/errors');

const VALID_TYPES = Object.freeze([
  'Flood',
  'Fire',
  'Earthquake',
  'Landslide',
  'Road Accident',
  'Building Collapse',
  'Other'
]);

const VALID_SEVERITIES = Object.freeze([
  'Critical',
  'High',
  'Medium',
  'Low'
]);

const VALID_STATUSES = Object.freeze([
  'Reported',
  'Prioritized',
  'Assigned',
  'Responding',
  'Resolved'
]);

const STATUS_TRANSITIONS = Object.freeze({
  Reported: ['Reported', 'Prioritized', 'Assigned', 'Responding', 'Resolved'],
  Prioritized: ['Prioritized', 'Assigned', 'Responding', 'Resolved'],
  Assigned: ['Assigned', 'Responding', 'Resolved'],
  Responding: ['Responding', 'Resolved'],
  Resolved: ['Resolved']
});

function validateTitle(value) {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > 150) {
    throw new BackendError('Incident title is required and must be between 1 and 150 characters.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return value.trim();
}

function validateDescription(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' || value.length > 1000) {
    throw new BackendError('Description must be a string up to 1000 characters.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return value.trim();
}

function validateType(value) {
  if (typeof value !== 'string' || !VALID_TYPES.includes(value.trim())) {
    throw new BackendError(
      `Invalid emergency type "${value}". Permitted types: ${VALID_TYPES.join(', ')}.`,
      { status: 400, code: 'INVALID_EMERGENCY_TYPE' }
    );
  }
  return value.trim();
}

function validateSeverity(value) {
  if (typeof value !== 'string' || !VALID_SEVERITIES.includes(value.trim())) {
    throw new BackendError(
      `Invalid severity "${value}". Permitted severities: ${VALID_SEVERITIES.join(', ')}.`,
      { status: 400, code: 'INVALID_SEVERITY' }
    );
  }
  return value.trim();
}

function validatePeopleAffected(value) {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(num) || num < 0) {
    throw new BackendError('People affected must be a non-negative integer.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }
  return num;
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

function validateStatus(value) {
  if (typeof value !== 'string' || !VALID_STATUSES.includes(value.trim())) {
    throw new BackendError(
      `Invalid emergency status "${value}". Permitted statuses: ${VALID_STATUSES.join(', ')}.`,
      { status: 400, code: 'INVALID_INPUT' }
    );
  }
  return value.trim();
}

function validateStatusTransition(currentStatus, nextStatus) {
  const next = validateStatus(nextStatus);
  const current = currentStatus || 'Reported';

  if (current === 'Resolved' && next !== 'Resolved') {
    throw new BackendError(
      `Cannot transition resolved emergency back to "${next}". Resolution is a terminal state.`,
      { status: 400, code: 'INVALID_STATUS_TRANSITION' }
    );
  }

  const allowed = STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new BackendError(
      `Invalid status transition from "${current}" to "${next}".`,
      { status: 400, code: 'INVALID_STATUS_TRANSITION' }
    );
  }

  return next;
}

function validateCreateEmergency(body, validLocationIds = null) {
  if (!body || typeof body !== 'object') {
    throw new BackendError('Request body must be a JSON object.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  return {
    title: validateTitle(body.title),
    description: validateDescription(body.description),
    type: validateType(body.type),
    severity: validateSeverity(body.severity),
    locationId: validateLocationId(body.locationId, validLocationIds),
    peopleAffected: validatePeopleAffected(body.peopleAffected),
    status: body.status ? validateStatus(body.status) : 'Reported'
  };
}

function validateUpdateEmergency(body, validLocationIds = null) {
  if (!body || typeof body !== 'object') {
    throw new BackendError('Request body must be a JSON object.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  const updates = {};
  if (body.title !== undefined) updates.title = validateTitle(body.title);
  if (body.description !== undefined) updates.description = validateDescription(body.description);
  if (body.type !== undefined) updates.type = validateType(body.type);
  if (body.severity !== undefined) updates.severity = validateSeverity(body.severity);
  if (body.locationId !== undefined) updates.locationId = validateLocationId(body.locationId, validLocationIds);
  if (body.peopleAffected !== undefined) updates.peopleAffected = validatePeopleAffected(body.peopleAffected);

  if (Object.keys(updates).length === 0) {
    throw new BackendError('At least one editable field must be provided for update.', {
      status: 400,
      code: 'INVALID_INPUT'
    });
  }

  return updates;
}

module.exports = {
  VALID_TYPES,
  VALID_SEVERITIES,
  VALID_STATUSES,
  STATUS_TRANSITIONS,
  validateTitle,
  validateDescription,
  validateType,
  validateSeverity,
  validateLocationId,
  validatePeopleAffected,
  validateStatus,
  validateStatusTransition,
  validateCreateEmergency,
  validateUpdateEmergency
};

