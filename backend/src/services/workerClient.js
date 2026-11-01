const { CppWorkerError } = require('./errors');
const { readPredictions } = require('./predictionReader');

class WorkerClient {
  constructor(manager, config) {
    this.manager = manager;
    this.config = config;
  }

  async send(operation, payload) {
    const response = await this.manager.request(operation, payload);
    if (!response.ok) throw new CppWorkerError(response.error);
    return response.result;
  }

  async health() {
    const result = await this.send('health');
    return { ...result, worker: this.manager.getStatus() };
  }

  async getLocations() {
    return this.send('get_locations');
  }

  async getRoads() {
    return this.send('get_roads');
  }

  async getRisks() {
    const [roadResult, predictions] = await Promise.all([
      this.getRoads(),
      readPredictions(this.config.riskPredictionsFile)
    ]);

    return {
      risks: roadResult.roads.map((road) => {
        const prediction = predictions.get(road.id);
        return {
          roadId: road.id,
          source: road.source,
          destination: road.destination,
          risk: road.risk,
          predictionConfidence: prediction?.predictionConfidence ?? null
        };
      })
    };
  }

  async planRoute(sourceLocationId, destinationLocationId) {
    return this.send('plan_route', { sourceLocationId, destinationLocationId });
  }

  async blockRoad(roadId) {
    const response = await this.manager.enqueueMutation('block_road', { roadId });
    if (!response.ok) throw new CppWorkerError(response.error);
    return response.result;
  }

  async unblockRoad(roadId) {
    const response = await this.manager.enqueueMutation('unblock_road', { roadId });
    if (!response.ok) throw new CppWorkerError(response.error);
    return response.result;
  }
}

module.exports = { WorkerClient };
