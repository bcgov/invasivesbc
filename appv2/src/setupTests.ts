if (typeof window?.URL?.createObjectURL === 'undefined') {
  (window as any).URL.createObjectURL = () => {
    console.log('running setuptests');
    // Do nothing
    // Mock this function for mapbox-gl to work
  };
}

import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())