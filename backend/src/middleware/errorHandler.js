const { BackendError } = require('../services/errors');

function notFoundHandler(_request, _response, next) {
  next(new BackendError('API endpoint was not found.', {
    status: 404,
    code: 'NOT_FOUND'
  }));
}

function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return;

  if (error?.type === 'entity.too.large') {
    response.status(413).json({
      ok: false,
      error: { code: 'REQUEST_TOO_LARGE', message: 'Request body exceeds 32 KB.' }
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      ok: false,
      error: { code: 'MALFORMED_JSON', message: 'Request body must be valid JSON.' }
    });
    return;
  }

  const status = error instanceof BackendError ? error.status : 500;
  const code = error instanceof BackendError ? error.code : 'INTERNAL_ERROR';
  const message = error instanceof BackendError
    ? error.message
    : 'Unexpected backend error.';

  if (status >= 500) {
    console.error(`[DisasterX backend] ${code}: ${error?.stack || message}`);
  }

  response.status(status).json({ ok: false, error: { code, message } });
}

module.exports = { notFoundHandler, errorHandler };
