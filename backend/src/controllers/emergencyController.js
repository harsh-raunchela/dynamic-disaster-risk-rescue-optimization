function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response)).catch(next);
  };
}

function createEmergencyController(emergencyService) {
  return {
    getAll: asyncRoute(async (request, response) => {
      const emergencies = await emergencyService.getAllEmergencies(request.query);
      response.json({ ok: true, data: { emergencies } });
    }),

    getActive: asyncRoute(async (_request, response) => {
      const emergencies = await emergencyService.getActiveEmergencies();
      response.json({ ok: true, data: { emergencies } });
    }),

    getPriority: asyncRoute(async (_request, response) => {
      const emergencies = await emergencyService.getPriorityEmergencies();
      response.json({ ok: true, data: { emergencies } });
    }),

    getStats: asyncRoute(async (_request, response) => {
      const stats = await emergencyService.getStats();
      response.json({ ok: true, data: { stats } });
    }),

    getById: asyncRoute(async (request, response) => {
      const emergency = await emergencyService.getEmergencyById(request.params.emergencyId);
      response.json({ ok: true, data: { emergency } });
    }),

    create: asyncRoute(async (request, response) => {
      const emergency = await emergencyService.createEmergency(request.body);
      response.status(201).json({ ok: true, data: { emergency } });
    }),

    update: asyncRoute(async (request, response) => {
      const emergency = await emergencyService.updateEmergency(
        request.params.emergencyId,
        request.body
      );
      response.json({ ok: true, data: { emergency } });
    }),

    updateStatus: asyncRoute(async (request, response) => {
      const emergency = await emergencyService.updateEmergencyStatus(
        request.params.emergencyId,
        request.body?.status
      );
      response.json({ ok: true, data: { emergency } });
    })
  };
}

module.exports = { createEmergencyController };

