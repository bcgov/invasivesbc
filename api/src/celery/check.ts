import { createClient } from 'celery-node';
import { AMQP_BROKER } from './config';
import { getLogger } from 'utils/logger';

/*
 A simple utility to connect to the broker and attempt task execution. run via `npm` script to check validate configuration.
 */

const defaultLog = getLogger('celery-client');

const client = createClient(
  AMQP_BROKER,
  AMQP_BROKER
);

defaultLog.info({ message: 'sending remote task request' });
client.sendTask('tasks.add', [10, 20]).get().then(result => {
  defaultLog.info({ message: 'received result: ' + result });
  if (result !== 30) {
    defaultLog.error({ message: 'unexpected result (expected 30)' });
  }
}).catch(e => {
  defaultLog.error({ message: 'remote task execution failure', error: e });
}).finally(() => {
  client.disconnect();
});
