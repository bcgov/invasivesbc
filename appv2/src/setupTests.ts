if (typeof window?.URL?.createObjectURL === 'undefined') {
  (window as any).URL.createObjectURL = () => {
    console.log('running setuptests - should be able to get this to only run once');
    // Do nothing
    // Mock this function for mapbox-gl to work
  };
}



import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())