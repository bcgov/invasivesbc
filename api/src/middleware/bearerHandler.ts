import { MDC, MDCAsyncLocal } from 'mdc';
import { authenticate, InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from 'utils/logger';

const bearerHandler = async (req) => {
  const logger = getLogger('Error');
  try {
    let mdc = MDCAsyncLocal.getStore();
    if (!mdc) {
      mdc = new MDC();
      await MDCAsyncLocal.run(mdc, authenticate, <InvasivesRequest>req);
    } else {
      await authenticate(<InvasivesRequest>req);
    }
  } catch (e) {
    logger.error({ error: e });
    return false;
  }
  return true;
};
export default bearerHandler;
