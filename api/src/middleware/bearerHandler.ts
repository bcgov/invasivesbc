import { Request } from 'express';
import { MDC, MDCAsyncLocal } from 'mdc';
import { authenticate, InvasivesRequest } from 'utils/auth-utils';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import verifyUserRole from 'utils/validateRole';

const bearerHandler = async (req: Request) => {
  try {
    let mdc = MDCAsyncLocal.getStore();
    if (!mdc) {
      mdc = new MDC();
      await MDCAsyncLocal.run(mdc, authenticate, <InvasivesRequest>req);
    } else {
      await authenticate(<InvasivesRequest>req);
    }
  } catch (e) {
    new LoggerHandler('bearerHandler').error(e);
    return false;
  }
  return verifyUserRole(req as InvasivesRequest);
};
export default bearerHandler;
