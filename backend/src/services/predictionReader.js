const fs = require('node:fs/promises');
const { BackendError } = require('./errors');

const expectedHeader = 'id,source,destination,predicted_risk,prediction_confidence';

async function readPredictions(filename) {
  let contents;
  try {
    contents = await fs.readFile(filename, 'utf8');
  } catch (error) {
    throw new BackendError('Risk prediction CSV is unavailable.', {
      status: 503,
      code: 'RISK_PREDICTIONS_UNAVAILABLE',
      cause: error
    });
  }

  const lines = contents.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.shift() !== expectedHeader) {
    throw new BackendError('Risk prediction CSV has an invalid header.', {
      status: 502,
      code: 'INVALID_RISK_PREDICTIONS'
    });
  }

  const predictions = new Map();
  for (const line of lines) {
    const fields = line.split(',');
    const confidence = Number(fields[4]);
    if (fields.length !== 5 || !fields[0] ||
        !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new BackendError('Risk prediction CSV has an invalid record.', {
        status: 502,
        code: 'INVALID_RISK_PREDICTIONS'
      });
    }
    predictions.set(fields[0], {
      source: fields[1],
      destination: fields[2],
      predictedRisk: fields[3],
      predictionConfidence: confidence
    });
  }

  return predictions;
}

module.exports = { readPredictions };
