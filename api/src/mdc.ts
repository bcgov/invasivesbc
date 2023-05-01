import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'crypto';

export class MDC {
  constructor() {
    this.request = {
      ID: randomUUID().toString(),
      startTime: new Date().getTime(),
      user: null,
      execTime: null,
      method: null,
      url: null
    };
    this.additionalContext = {};
  }

  request: {
    ID: string;
    startTime: number;
    execTime: number | null;
    user: string | null;
    method: string | null;
    url: string | null;
  };

  additionalContext: {
    [key: string]: any;
  };
}

const MDCAsyncLocal = new AsyncLocalStorage<MDC>();

export { MDCAsyncLocal };
