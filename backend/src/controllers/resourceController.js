function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response)).catch(next);
  };
}

function createResourceController(resourceService) {
  const present = (resource) => resourceService.presentResource(resource);

  return {
    getAll: asyncRoute(async (request, response) => {
      const resources = await resourceService.getAllResources(request.query);
      response.json({ ok: true, data: { resources: resources.map(present) } });
    }),

    getAvailable: asyncRoute(async (request, response) => {
      const resources = await resourceService.getAvailableResources(request.query);
      response.json({ ok: true, data: { resources: resources.map(present) } });
    }),

    getMetadata: asyncRoute(async (_request, response) => {
      response.json({ ok: true, data: resourceService.getResourceMetadata() });
    }),

    getById: asyncRoute(async (request, response) => {
      const resource = await resourceService.getResourceById(request.params.resourceId);
      response.json({ ok: true, data: { resource: present(resource) } });
    }),

    create: asyncRoute(async (request, response) => {
      const resource = await resourceService.createResource(request.body);
      response.status(201).json({ ok: true, data: { resource: present(resource) } });
    }),

    update: asyncRoute(async (request, response) => {
      const resource = await resourceService.updateResource(
        request.params.resourceId,
        request.body
      );
      response.json({ ok: true, data: { resource: present(resource) } });
    }),

    updateStatus: asyncRoute(async (request, response) => {
      const resource = await resourceService.updateResourceStatus(
        request.params.resourceId,
        request.body?.status
      );
      response.json({ ok: true, data: { resource: present(resource) } });
    }),

    delete: asyncRoute(async (request, response) => {
      const result = await resourceService.deleteResource(request.params.resourceId);
      response.json({ ok: true, data: result });
    })
  };
}

module.exports = { createResourceController };

