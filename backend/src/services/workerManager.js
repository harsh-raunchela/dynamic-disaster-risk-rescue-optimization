const { EventEmitter } = require('node:events');
const { randomUUID } = require('node:crypto');
const { existsSync } = require('node:fs');
const { spawn } = require('node:child_process');
const {
  WorkerProtocolError,
  WorkerTimeoutError,
  WorkerUnavailableError
} = require('./errors');

class WorkerManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.child = null;
    this.state = 'stopped';
    this.stdoutBuffer = '';
    this.stderrBuffer = '';
    // EventEmitter already exposes a `pending` method in this Node runtime.
    // Use an explicit map name to avoid shadowing inherited behavior.
    this.pendingRequests = new Map();
    this.startPromise = null;
    this.stopPromise = null;
    this.mutationQueue = Promise.resolve();
    this.hasStartedBefore = false;
    this.runtimeStateReset = false;
  }

  getStatus() {
    return {
      state: this.state,
      runtimeStateReset: this.runtimeStateReset,
      pendingRequestCount: this.pendingRequests.size
    };
  }

  async start() {
    if (this.state === 'ready') return;
    if (this.startPromise) return this.startPromise;

    if (!existsSync(this.config.workerExecutable)) {
      throw new WorkerUnavailableError(
        'C++ worker executable was not found. Build it before starting the backend.'
      );
    }

    if (this.hasStartedBefore) this.runtimeStateReset = true;
    this.state = 'starting';
    this.startPromise = new Promise((resolve, reject) => {
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        callback(value);
      };

      const child = spawn(this.config.workerExecutable, this.config.workerArgs, {
        cwd: this.config.repositoryRoot,
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.child = child;
      this.attachChild(child);

      child.once('error', (error) => {
        finish(reject, new WorkerUnavailableError(
          'Unable to launch the C++ worker.', { cause: error }
        ));
      });

      child.once('spawn', async () => {
        try {
          const response = await this.request(
            'health',
            {},
            { timeoutMs: this.config.workerStartupTimeoutMs, allowStarting: true }
          );
          this.state = 'ready';
          this.hasStartedBefore = true;
          this.emit('ready', response.result);
          finish(resolve);
        } catch (error) {
          this.stopChildImmediately();
          finish(reject, error);
        }
      });
    });

    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  attachChild(child) {
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => this.handleStdout(chunk));
    child.stderr.on('data', (chunk) => {
      this.stderrBuffer = (this.stderrBuffer + chunk).slice(-8192);
      this.emit('diagnostic', chunk);
    });

    child.on('exit', (code, signal) => {
      const wasStopping = this.state === 'stopping';
      this.child = null;
      this.state = 'stopped';
      this.rejectPending(new WorkerUnavailableError(
        wasStopping
          ? 'C++ worker stopped.'
          : `C++ worker exited unexpectedly (code ${code}, signal ${signal || 'none'}).`
      ));
      this.emit('exit', { code, signal, wasStopping });
    });
  }

  handleStdout(chunk) {
    this.stdoutBuffer += chunk;
    let newlineIndex = this.stdoutBuffer.indexOf('\n');

    while (newlineIndex >= 0) {
      const line = this.stdoutBuffer.slice(0, newlineIndex).replace(/\r$/, '');
      this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);
      this.handleResponseLine(line);
      newlineIndex = this.stdoutBuffer.indexOf('\n');
    }
  }

  handleResponseLine(line) {
    let response;
    try {
      response = JSON.parse(line);
    } catch (error) {
      this.handleProtocolFailure('Worker emitted malformed JSON.', error);
      return;
    }

    if (!response || typeof response !== 'object' ||
        typeof response.requestId !== 'string' ||
        typeof response.ok !== 'boolean') {
      this.handleProtocolFailure('Worker emitted an invalid response envelope.');
      return;
    }

    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) {
      this.handleProtocolFailure('Worker emitted a response for an unknown request ID.');
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.requestId);
    pending.resolve(response);
  }

  handleProtocolFailure(message, cause) {
    const error = new WorkerProtocolError(message, { cause });
    this.emit('protocolError', error);
    this.rejectPending(error);
  }

  request(operation, payload = {}, options = {}) {
    const timeoutMs = options.timeoutMs || this.config.workerTimeoutMs;
    const canUseWorker = this.child &&
      (this.state === 'ready' ||
        (options.allowStarting && this.state === 'starting') ||
        (options.allowStopping && this.state === 'stopping'));

    if (!canUseWorker || !this.child.stdin.writable) {
      return Promise.reject(new WorkerUnavailableError('C++ worker is unavailable.'));
    }

    const requestId = randomUUID();
    const message = JSON.stringify({ requestId, operation, ...payload }) + '\n';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new WorkerTimeoutError(`Worker request '${operation}' timed out.`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });
      this.child.stdin.write(message, (error) => {
        if (!error) return;
        const pending = this.pendingRequests.get(requestId);
        if (!pending) return;
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(requestId);
        reject(new WorkerUnavailableError('Unable to write to the C++ worker.', {
          cause: error
        }));
      });
    });
  }

  enqueueMutation(operation, payload) {
    const task = () => this.request(operation, payload);
    const next = this.mutationQueue.then(task, task);
    this.mutationQueue = next.catch(() => undefined);
    return next;
  }

  async restart() {
    const reset = this.hasStartedBefore;
    await this.stop();
    this.runtimeStateReset = reset;
    await this.start();
    return { runtimeStateReset: reset };
  }

  async stop() {
    if (this.stopPromise) return this.stopPromise;
    if (!this.child) {
      this.state = 'stopped';
      return;
    }

    this.state = 'stopping';
    const child = this.child;
    this.stopPromise = new Promise((resolve) => {
      const exitTimer = setTimeout(() => {
        if (this.child === child) child.kill();
      }, 3000);
      child.once('exit', () => {
        clearTimeout(exitTimer);
        resolve();
      });
    });

    try {
      await this.request('shutdown', {}, {
        timeoutMs: 3000,
        allowStopping: true
      });
    } catch (error) {
      this.stopChildImmediately();
    }

    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = null;
    }
  }

  stopChildImmediately() {
    if (this.child) this.child.kill();
  }

  rejectPending(error) {
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(error);
      this.pendingRequests.delete(requestId);
    }
  }
}

module.exports = { WorkerManager };
