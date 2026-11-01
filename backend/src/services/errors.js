class BackendError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

class WorkerUnavailableError extends BackendError {
  constructor(message, options = {}) {
    super(message, { status: 503, code: 'WORKER_UNAVAILABLE', ...options });
  }
}

class WorkerTimeoutError extends BackendError {
  constructor(message, options = {}) {
    super(message, { status: 504, code: 'WORKER_TIMEOUT', ...options });
  }
}

class WorkerProtocolError extends BackendError {
  constructor(message, options = {}) {
    super(message, { status: 502, code: 'INVALID_WORKER_RESPONSE', ...options });
  }
}

class CppWorkerError extends BackendError {
  constructor(workerError, options = {}) {
    const code = workerError?.code || 'WORKER_OPERATION_FAILED';
    const statusByCode = {
      INVALID_LOCATION_ID: 404,
      INVALID_ROAD_ID: 404,
      NO_ROUTE: 409,
      INVALID_REQUEST: 400,
      INVALID_OPERATION: 400,
      MALFORMED_JSON: 400,
      NOT_READY: 503
    };

    super(workerError?.message || 'C++ worker operation failed.', {
      status: statusByCode[code] || 502,
      code,
      ...options
    });
  }
}

module.exports = {
  BackendError,
  WorkerUnavailableError,
  WorkerTimeoutError,
  WorkerProtocolError,
  CppWorkerError
};
