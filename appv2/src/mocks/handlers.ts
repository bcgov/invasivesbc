//example ripped from https://raw.githubusercontent.com/vitest-dev/vitest/main/examples/react-testing-lib-msw/src/mocks/handlers.ts
import { HttpResponse, graphql, http } from 'msw'

// Mock Data
export const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  {
    userId: 2,
    id: 5,
    title: 'second post title',
    body: 'second post body',
  },
  {
    userId: 3,
    id: 6,
    title: 'third post title',
    body: 'third post body',
  },
]

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  http.get('http://localhost:3002/api/api-docs', () => {
    return HttpResponse.json(posts, { status: 200 })
  }),
]