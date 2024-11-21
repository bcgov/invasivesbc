import { Request } from 'express';

const commonResponses = {
  [401]: (req: Request) => ({
    message: 'Unauthorized Request',
    request: req.body,
    namespace: req.url
  }),
  [400]: (req: Request) => ({
    message: 'Invalid Request',
    request: req.body,
    namespace: req.url
  })
};

export default commonResponses;
