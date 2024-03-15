import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const server = setupServer(...handlers);

export const runServer = (server) => {
  beforeAll(() => {
    try {
      server.listen({ onUnhandledRequest: 'error' });
    } catch (e) {
      console.log('error', e);
    }
  });
  afterAll(() => {
    try {
      server.close();
    } catch (e) {
      console.log('error', e);
    }
  });
  afterEach(() => {
    try {
      server.resetHandlers();
    } catch (e) {
      console.log('error', e);
    }
  });
};

export const customServer = (overRides: any) => {
  const newHandlers = handlers.filter((handler) => {
    return !overRides.some((overRide: any) => {
      return handler['url']?.includes(overRide['url']);
    });
  });
  newHandlers.push(...overRides);
  return setupServer(...newHandlers);
};

export const overRideRunningServer = (server, overRideServer) => {
  try {
    server.close();
    server.resetHandlers();
  } catch (e) {
    console.log('error', e);
  }
  try {
    runServer(overRideServer);
  } catch (e) {
    console.log('error', e);
  }
};
