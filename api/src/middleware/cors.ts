import { MDC, MDCAsyncLocal } from 'mdc';

const cors = (_: any, res: any, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization, responseType, Access-Control-Allow-Origin, If-None-Match, filterForSelectable'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // create a context if there isn't one
  let mdc = MDCAsyncLocal.getStore();
  if (!mdc) {
    mdc = new MDC();
    MDCAsyncLocal.run(mdc, next);
  } else {
    next();
  }
};
export default cors;
