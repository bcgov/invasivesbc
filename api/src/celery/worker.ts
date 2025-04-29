import { createWorker } from 'celery-node';
import { AMQP_BROKER } from './config';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('worker');

const worker = createWorker(
  AMQP_BROKER,
  AMQP_BROKER
);

// demo task
worker.register('tasks.add', (a: number, b: number) => a + b);

worker.start().then(() => {
  defaultLog.info({ message: 'Worker startup' });
}).catch(e => {
  defaultLog.error({ message: 'Worker error caught', error: e });
});
